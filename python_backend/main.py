import os
from functools import lru_cache
from fastapi import FastAPI, Header, HTTPException, Depends, Request
import finnhub
import time
from collections import deque
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse, RedirectResponse

# FastAPI app initialization
app = FastAPI(
    title="Stock Tracker API",
    description="A backend API for tracking stocks, managing watchlists, and portfolios",
    version="1.0.0",
)

# Environment variables
API_KEY = os.environ.get('APP_API_KEY')
FINNHUB_KEY = os.environ.get('FINNHUB_KEY')
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key")

if not FINNHUB_KEY:
    raise ValueError("Finnhub API key is missing in environment variables.")

# Constants
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
RATE_LIMIT = 30

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./stock_tracker.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Rate limiting
rate_limit_queue = deque()


# Database Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    watchlists = relationship("Watchlist", back_populates="owner")
    portfolios = relationship("Portfolio", back_populates="owner")


class Watchlist(Base):
    __tablename__ = "watchlists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="watchlists")
    stocks = relationship("WatchlistStock", back_populates="watchlist")


class WatchlistStock(Base):
    __tablename__ = "watchlist_stocks"
    id = Column(Integer, primary_key=True, index=True)
    watchlist_id = Column(Integer, ForeignKey("watchlists.id"))
    ticker = Column(String, index=True)
    watchlist = relationship("Watchlist", back_populates="stocks")


class Portfolio(Base):
    __tablename__ = "portfolios"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="portfolios")
    holdings = relationship("PortfolioHolding", back_populates="portfolio")


class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    ticker = Column(String, index=True)
    quantity = Column(Float)
    average_price = Column(Float)
    portfolio = relationship("Portfolio", back_populates="holdings")


# Create tables
Base.metadata.create_all(bind=engine)


# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True


class WatchlistCreate(BaseModel):
    name: str


class WatchlistResponse(BaseModel):
    id: int
    name: str
    stocks: List[str]

    class Config:
        orm_mode = True


class PortfolioCreate(BaseModel):
    name: str


class PortfolioHoldingResponse(BaseModel):
    ticker: str
    quantity: float
    average_price: float


class PortfolioResponse(BaseModel):
    id: int
    name: str
    holdings: List[PortfolioHoldingResponse]

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


# Authentication
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def authenticate_user(db, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    db.close()
    if user is None:
        raise credentials_exception
    return user


# Helper functions
@lru_cache()
def get_finnhub_client():
    return finnhub.Client(api_key=FINNHUB_KEY)


def rate_limit():
    current_time = time.time()
    while rate_limit_queue and rate_limit_queue[0] < current_time - 1:
        rate_limit_queue.popleft()
    if len(rate_limit_queue) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    rate_limit_queue.append(current_time)


# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Stock Tracker API",
        version="1.0.0",
        description="A backend API for tracking stocks, managing watchlists, and portfolios",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# Endpoints
@app.get("/", tags=["Root"])
async def read_root():
    """
    Welcome endpoint for the Stock Tracker API.
    """
    return {"message": "Welcome to the CSC 478 Group 6 Stock Tracker Backend API"}


@app.post("/users", response_model=UserResponse, tags=["Users"])
async def create_user(user: UserCreate):
    """
    Create a new user account.
    """
    db = SessionLocal()
    db_user = User(username=user.username, email=user.email, hashed_password=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    return db_user


@app.post("/token", response_model=Token, tags=["Authentication"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user and provide access token.
    """
    db = SessionLocal()
    user = authenticate_user(db, form_data.username, form_data.password)
    db.close()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/watchlists", response_model=WatchlistResponse, tags=["Watchlists"])
async def create_watchlist(watchlist: WatchlistCreate, current_user: User = Depends(get_current_user)):
    """
    Create a new watchlist for the authenticated user.
    """
    db = SessionLocal()
    db_watchlist = Watchlist(name=watchlist.name, user_id=current_user.id)
    db.add(db_watchlist)
    db.commit()
    db.refresh(db_watchlist)
    db.close()
    return db_watchlist


@app.post("/watchlists/{watchlist_id}/add_stock", tags=["Watchlists"])
async def add_stock_to_watchlist(watchlist_id: int, ticker: str, current_user: User = Depends(get_current_user)):
    """
    Add a stock to the specified watchlist.
    """
    db = SessionLocal()
    watchlist = db.query(Watchlist).filter(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id).first()
    if not watchlist:
        db.close()
        raise HTTPException(status_code=404, detail="Watchlist not found")
    db_stock = WatchlistStock(watchlist_id=watchlist_id, ticker=ticker)
    db.add(db_stock)
    db.commit()
    db.close()
    return {"message": "Stock added to watchlist"}


@app.post("/portfolios", response_model=PortfolioResponse, tags=["Portfolios"])
async def create_portfolio(portfolio: PortfolioCreate, current_user: User = Depends(get_current_user)):
    """
    Create a new portfolio for the authenticated user.
    """
    db = SessionLocal()
    db_portfolio = Portfolio(name=portfolio.name, user_id=current_user.id)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    db.close()
    return db_portfolio


@app.post("/portfolios/{portfolio_id}/add_holding", tags=["Portfolios"])
async def add_holding_to_portfolio(portfolio_id: int, ticker: str, quantity: float, average_price: float,
                                   current_user: User = Depends(get_current_user)):
    """
    Add a holding to the specified portfolio.
    """
    db = SessionLocal()
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id).first()
    if not portfolio:
        db.close()
        raise HTTPException(status_code=404, detail="Portfolio not found")
    db_holding = PortfolioHolding(portfolio_id=portfolio_id, ticker=ticker, quantity=quantity,
                                  average_price=average_price)
    db.add(db_holding)
    db.commit()
    db.close()
    return {"message": "Holding added to portfolio"}


@app.get("/market_status", tags=["Market Data"])
async def market_status(request: Request):
    """
    Get the current market status for US exchanges.
    """
    rate_limit()
    client = get_finnhub_client()
    return client.market_status(exchange='US')


@app.get("/company_profile/{ticker}", tags=["Market Data"])
async def company_profile(ticker: str, request: Request):
    """
    Get company profile information for the specified ticker.
    """
    rate_limit()
    client = get_finnhub_client()
    return client.company_profile2(symbol=ticker)


@app.get("/quote/{ticker}", tags=["Market Data"])
async def quote(ticker: str, request: Request):
    """
    Get real-time quote data for the specified ticker.
    """
    rate_limit()
    client = get_finnhub_client()
    return client.quote(symbol=ticker)


@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_json():
    return JSONResponse(content=app.openapi())


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return RedirectResponse(url="https://csc478-capstone-group6.apidocumentation.com/reference")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
