import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv('DATABASE_URL')

MAX_RETRIES = 5
RETRY_DELAY = 2

def create_engine_with_retry():
    for attempt in range(MAX_RETRIES):
        try:
            engine = create_engine(DATABASE_URL)

            with engine.connect() as conn:
                print("Connected to the database successfully.")
            return engine
        except Exception as e:
            print(f"DB connection failed (attempt {attempt + 1}/{MAX_RETRIES})")
            time.sleep(RETRY_DELAY)
    raise Exception("Could not connect to the database after retries.")

engine = create_engine_with_retry()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()