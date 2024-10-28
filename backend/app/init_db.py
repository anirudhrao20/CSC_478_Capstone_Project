from app.core.database import Base, engine, SessionLocal
from app.models import User, Portfolio, Stock, Transaction
from app.core.security import get_password_hash


def init_db():
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create test user
        test_user = User(
            email="test@example.com",
            username="test",
            hashed_password=get_password_hash("tester")
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        # Create portfolio for test user
        portfolio = Portfolio(
            name="My Portfolio",
            user_id=test_user.id
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        # Add some test stocks and transactions
        test_stocks = [
            Stock(symbol="AAPL", quantity=10, portfolio_id=portfolio.id),
            Stock(symbol="GOOGL", quantity=5, portfolio_id=portfolio.id),
            Stock(symbol="MSFT", quantity=15, portfolio_id=portfolio.id)
        ]
        for stock in test_stocks:
            db.add(stock)
            # Add corresponding buy transaction
            transaction = Transaction(
                portfolio_id=portfolio.id,
                symbol=stock.symbol,
                quantity=stock.quantity,
                price=0.0,  # You might want to fetch real prices here
                type="BUY"
            )
            db.add(transaction)

        db.commit()
        print("Test data created successfully!")

    except Exception as e:
        print(f"Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
