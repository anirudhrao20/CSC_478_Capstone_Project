from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.portfolio import Portfolio, Stock, Transaction
from app.schemas.portfolio import (
    PortfolioCreate, 
    Portfolio as PortfolioSchema,
    StockCreate,
    Stock as StockSchema,
    TransactionCreate
)
from app.core.finnhub_client import get_stock_quote

router = APIRouter()

@router.get("/me", response_model=PortfolioSchema)
async def get_user_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.post("/", response_model=PortfolioSchema)
async def create_portfolio(
    portfolio: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_portfolio = Portfolio(
        name=portfolio.name,
        user_id=current_user.id
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)

    # Add stocks to portfolio
    for stock_data in portfolio.stocks:
        # Verify stock exists by fetching quote
        quote = await get_stock_quote(stock_data.symbol)
        if not quote or quote.get('error'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stock symbol: {stock_data.symbol}"
            )
        
        db_stock = Stock(
            symbol=stock_data.symbol,
            quantity=stock_data.quantity,
            portfolio_id=db_portfolio.id
        )
        db.add(db_stock)
    
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

@router.get("/", response_model=List[PortfolioSchema])
async def read_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()

@router.get("/{portfolio_id}", response_model=PortfolioSchema)
async def read_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    
    if portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    return portfolio

@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    
    if portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio deleted"}

@router.post("/{portfolio_id}/stocks", response_model=StockSchema)
async def add_stock_to_portfolio(
    portfolio_id: int,
    stock: StockCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Verify stock exists by fetching quote
    quote = await get_stock_quote(stock.symbol)
    if quote.get('error'):
        raise HTTPException(status_code=400, detail="Invalid stock symbol")
    
    # Check if stock already exists in portfolio
    existing_stock = db.query(Stock).filter(
        Stock.portfolio_id == portfolio_id,
        Stock.symbol == stock.symbol
    ).first()
    
    if existing_stock:
        # Update existing stock quantity
        existing_stock.quantity += stock.quantity
        db_stock = existing_stock
    else:
        # Create new stock entry
        db_stock = Stock(
            symbol=stock.symbol,
            quantity=stock.quantity,
            portfolio_id=portfolio_id
        )
        db.add(db_stock)
    
    db.commit()
    db.refresh(db_stock)
    return db_stock

@router.delete("/{portfolio_id}/stocks/{stock_id}")
async def remove_stock_from_portfolio(
    portfolio_id: int,
    stock_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # First verify the portfolio belongs to the user
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Then find and delete the stock
    stock = db.query(Stock).filter(
        Stock.id == stock_id,
        Stock.portfolio_id == portfolio_id
    ).first()
    
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    db.delete(stock)
    db.commit()
    
    return {"message": "Stock removed from portfolio"}

@router.post("/{portfolio_id}/transaction")
async def add_transaction(
    portfolio_id: int,
    transaction: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Verify stock exists
    quote = await get_stock_quote(transaction.symbol)
    if quote.get('error'):
        raise HTTPException(status_code=400, detail="Invalid stock symbol")
    
    # Get existing stock record if it exists
    existing_stock = db.query(Stock).filter(
        Stock.portfolio_id == portfolio_id,
        Stock.symbol == transaction.symbol
    ).first()
    
    if transaction.type == "SELL":
        current_holdings = existing_stock.quantity if existing_stock else 0
        if current_holdings < transaction.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient holdings. Current: {current_holdings}, Requested: {transaction.quantity}"
            )
        
        # Update or remove stock
        if existing_stock:
            new_quantity = existing_stock.quantity - transaction.quantity
            if new_quantity <= 0:
                db.delete(existing_stock)
            else:
                existing_stock.quantity = new_quantity
        
        # Create sell transaction with negative quantity
        transaction.quantity = -transaction.quantity
    else:  # BUY
        if existing_stock:
            existing_stock.quantity += transaction.quantity
        else:
            new_stock = Stock(
                portfolio_id=portfolio_id,
                symbol=transaction.symbol,
                quantity=transaction.quantity
            )
            db.add(new_stock)
    
    # Record the transaction
    db_transaction = Transaction(
        portfolio_id=portfolio_id,
        symbol=transaction.symbol,
        quantity=transaction.quantity,
        price=quote['c'],
        type=transaction.type
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction
