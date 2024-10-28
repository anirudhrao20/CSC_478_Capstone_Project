from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.models.portfolio import Portfolio, Stock
from app.core.finnhub_client import get_stock_quote
from typing import List, Dict
import asyncio

router = APIRouter()


@router.get("/portfolio-summary/{portfolio_id}")
async def get_portfolio_summary(
        portfolio_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    # Get current prices for all stocks
    total_value = 0
    stock_values = []

    for stock in portfolio.stocks:
        quote = await get_stock_quote(stock.symbol)
        current_price = quote['c']
        value = current_price * stock.quantity
        total_value += value
        stock_values.append({
            "symbol": stock.symbol,
            "quantity": stock.quantity,
            "current_price": current_price,
            "value": value,
            "percentage": 0  # Will be calculated after total is known
        })

    # Calculate percentages
    for stock in stock_values:
        stock["percentage"] = (stock["value"] / total_value) * 100 if total_value > 0 else 0

    return {
        "total_value": total_value,
        "stocks": stock_values
    }


@router.get("/portfolio-performance")
async def get_portfolio_performance(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()

    total_value = 0
    portfolio_values = []

    for portfolio in portfolios:
        portfolio_value = 0
        for stock in portfolio.stocks:
            quote = await get_stock_quote(stock.symbol)
            value = quote['c'] * stock.quantity
            portfolio_value += value

        total_value += portfolio_value
        portfolio_values.append({
            "name": portfolio.name,
            "value": portfolio_value
        })

    return {
        "total_value": total_value,
        "portfolios": portfolio_values
    }
