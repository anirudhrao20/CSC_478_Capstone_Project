from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User


def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        test_user = db.query(User).filter(
            (User.username == "testuser") |
            (User.email == "test@example.com")
        ).first()

        if test_user:
            print("Test user already exists")
            return

        # Create test user
        test_user = User(
            username="test",
            email="test@example.com",
            hashed_password=get_password_hash("")
        )
        db.add(test_user)
        db.commit()
        print("Test user created successfully")
        print("Username: test")
        print("Email: test@example.com")
        print("Password: tester")

    finally:
        db.close()


if __name__ == "__main__":
    create_test_user()
