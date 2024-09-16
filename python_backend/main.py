import os
from functools import lru_cache
from fastapi import FastAPI, Header, HTTPException, Depends, Request
import finnhub
import time
from collections import deque
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

API_KEY = os.environ.get('APP_API_KEY')
FINNHUB_KEY = os.environ.get('FINNHUB_KEY')

if not FINNHUB_KEY:
    raise ValueError("Finnhub API key is missing in environment variables.")


RATE_LIMIT = 30
rate_limit_queue = deque()


def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


@lru_cache()
def get_finnhub_client():
    return finnhub.Client(api_key=FINNHUB_KEY)


def rate_limit():
    current_time = time.time()

    # Remove old timestamps
    while rate_limit_queue and rate_limit_queue[0] < current_time - 1:
        rate_limit_queue.popleft()

    if len(rate_limit_queue) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    rate_limit_queue.append(current_time)


# Enable CORS to allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the CSC 478 Group 6 Stock Tracker Backend API"}


@app.get("/market_status")
async def market_status(
        request: Request,
        api_key: str = Depends(verify_api_key)
):
    rate_limit()
    client = get_finnhub_client()
    return client.market_status(exchange='US')


@app.get("/company_profile/{ticker}")
async def company_profile(
        ticker: str,
        request: Request,
        api_key: str = Depends(verify_api_key)
):
    rate_limit()
    client = get_finnhub_client()
    return client.company_profile2(symbol=ticker)


@app.get("/quote/{ticker}")
async def quote(
        ticker: str,
        request: Request,
        api_key: str = Depends(verify_api_key)
):
    rate_limit()
    client = get_finnhub_client()
    return client.quote(symbol=ticker)


if __name__ == "__main__":
    client = get_finnhub_client()
    print(client.market_status(exchange='US'))
