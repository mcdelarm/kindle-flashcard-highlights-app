from fastapi import FastAPI

from backend.database import Base, engine
from backend.routers import uploads

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(uploads.router)