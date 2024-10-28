from pydantic import BaseModel
from typing import List
from datetime import datetime

class StockBase(BaseModel):
    symbol: str
    quantity: float

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int
    portfolio_id: int

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    symbol: str
    quantity: float
    type: str  # "BUY" or "SELL"

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    portfolio_id: int
    price: float
    timestamp: datetime

    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    name: str

class PortfolioCreate(PortfolioBase):
    stocks: List[StockCreate]

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    stocks: List[Stock]
    transactions: List[Transaction]

    class Config:
        from_attributes = True

