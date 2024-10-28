import httpx
from app.core.config import settings


async def get_stock_quote(symbol: str):
    url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={settings.FINNHUB_API_KEY}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def search_stocks(query: str):
    url = f"https://finnhub.io/api/v1/search?q={query}&token={settings.FINNHUB_API_KEY}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def get_company_profile(symbol: str):
    url = f"https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={settings.FINNHUB_API_KEY}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def get_price_target(symbol: str):
    url = f"https://finnhub.io/api/v1/stock/price-target?symbol={symbol}&token={settings.FINNHUB_API_KEY}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


async def get_recommendation_trends(symbol: str):
    url = f"https://finnhub.io/api/v1/stock/recommendation?symbol={symbol}&token={settings.FINNHUB_API_KEY}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
