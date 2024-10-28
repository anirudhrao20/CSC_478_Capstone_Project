from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.finnhub_client import get_stock_quote, search_stocks
from app.models.user import User
from app.models.watchlist import Watchlist
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItem
import httpx
from app.core.config import settings

router = APIRouter()

@router.get("/quote/{symbol}")
async def get_quote(symbol: str):
    try:
        quote = await get_stock_quote(symbol)
        if quote.get('error'):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stock not found"
            )
        return quote
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/search")
async def search_stock(q: str):
    try:
        results = await search_stocks(q)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/watchlist", response_model=WatchlistItem)
async def add_to_watchlist(
    item: WatchlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify stock exists
    quote = await get_stock_quote(item.symbol)
    if quote.get('error'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stock symbol"
        )
    
    # Check if already in watchlist
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.symbol == item.symbol
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock already in watchlist"
        )
    
    watchlist_item = Watchlist(
        user_id=current_user.id,
        symbol=item.symbol
    )
    db.add(watchlist_item)
    db.commit()
    db.refresh(watchlist_item)
    return watchlist_item

@router.get("/watchlist", response_model=list[WatchlistItem])
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()

@router.delete("/watchlist/{symbol}")
async def remove_from_watchlist(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    watchlist_item = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.symbol == symbol
    ).first()
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found in watchlist"
        )
    
    db.delete(watchlist_item)
    db.commit()
    return {"message": "Stock removed from watchlist"}

@router.get("/market-news")
async def get_market_news(
    current_user: User = Depends(get_current_user)
):
    try:
        url = f"https://finnhub.io/api/v1/news?category=general&token={settings.FINNHUB_API_KEY}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch market news: {str(e)}"
        )
