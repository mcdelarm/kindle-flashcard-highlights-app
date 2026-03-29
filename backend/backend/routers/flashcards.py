from fastapi import APIRouter, HTTPException, Request
from backend.redis_client import redis_client
import json

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

@router.get("/")
def get_flashcards(request: Request):
    session_id = request.cookies.get("flashcards_session_id")
    if not session_id:
        raise HTTPException(status_code=404, detail="No flashcards session found")
    session_data = redis_client.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Flashcards session expired or not found")
    flashcards = json.loads(session_data).get("data")
    if flashcards is None:
        raise HTTPException(status_code=404, detail="No flashcards data found in session")
    return {"flashcards": flashcards}