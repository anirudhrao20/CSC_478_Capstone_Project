from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.core.database import database
from app.routes import auth, users, portfolio, stocks, analytics

app = FastAPI(title="CSC 478 Capstone Group 6 API")

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# CORS configuration - Allow all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(portfolio.router, prefix="/portfolios", tags=["portfolios"])
app.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])


@app.get("/")
async def root():
    return {"message": "Welcome to Stock Portfolio API"}

@app.get("/scalar-docs")
async def get_scalar_docs():
    static_file_path = "app/static/scalar-docs.html"
    if not os.path.exists(static_file_path):
        raise HTTPException(status_code=404, detail="Documentation not found")
    return FileResponse(static_file_path)
