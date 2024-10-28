from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy.sql import func


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="portfolios")
    stocks = relationship("Stock", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")

    @property
    def holdings(self):
        # Group transactions by symbol and calculate net position
        holdings = {}
        for transaction in self.transactions:
            if transaction.symbol not in holdings:
                holdings[transaction.symbol] = 0
            holdings[transaction.symbol] += transaction.quantity

        # Filter out positions with zero quantity
        return {k: v for k, v in holdings.items() if v > 0}


class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    quantity = Column(Float)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))

    portfolio = relationship("Portfolio", back_populates="stocks")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    symbol = Column(String, index=True)
    quantity = Column(Float)  # Positive for buys, negative for sells
    price = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    type = Column(String)  # "BUY" or "SELL"

    portfolio = relationship("Portfolio", back_populates="transactions")
