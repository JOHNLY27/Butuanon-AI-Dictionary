from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

def create_db_engine():
    # 1. Try configured DATABASE_URL
    try:
        eng = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        with eng.connect() as conn:
            print("Successfully connected to primary database.")
            return eng
    except Exception as e:
        print(f"Primary DATABASE_URL connection failed: {e}")

    # 2. Fallback to local SQLite database
    print("Using local SQLite fallback database: dictionary.db")
    sqlite_url = "sqlite:///./dictionary.db"
    eng = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    return eng

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

