from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class GenerateRequest(BaseModel):
    importSessionId: str
    deselectedBooks: list[str]
    deselectedItems: list[int]

class HighlightUpdateRequest(BaseModel):
    starred: bool

class FlashcardUpdateRequest(BaseModel):
    known: bool

class AuthCrendentialsRequest(BaseModel):
    email: str
    password: str

class BookOut(BaseModel):
    id: int
    title: str
    author: str

    class Config:
        from_attributes = True

class HighlightOut(BaseModel):
    id: int
    text: str
    location: Optional[str]
    date: Optional[datetime]
    starred: bool
    book: BookOut

    class Config:
        from_attributes = True

class FlashcardOut(BaseModel):
    id: int
    stem: str
    word: str
    definition: str
    context: Optional[str]
    part_of_speech: str
    known: bool
    book: BookOut

    class Config:
        from_attributes = True

class HighlightListOut(BaseModel):
    highlights: List[HighlightOut]

class FlashcardListOut(BaseModel):
    flashcards: List[FlashcardOut]