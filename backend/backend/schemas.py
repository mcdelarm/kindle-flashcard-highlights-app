from pydantic import BaseModel

class GenerateRequest(BaseModel):
    importSessionId: str
    deselectedBooks: list[str]
    deselectedItems: list[int]
    generatedSessionId: str | None = None