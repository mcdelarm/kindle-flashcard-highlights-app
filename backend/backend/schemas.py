from pydantic import BaseModel

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