from fastapi import APIRouter, HTTPException, Request
from backend.redis_client import redis_client
import json
from backend.schemas import FlashcardUpdateRequest

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

@router.patch("/{flashcard_id}")
def update_flashcard(flashcard_id: int, payload: FlashcardUpdateRequest, request: Request):
    session_id = request.cookies.get("flashcards_session_id")
    if not session_id:
        raise HTTPException(status_code=404, detail="No flashcards session found")
    
    session_data = redis_client.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Flashcards session expired or not found")
    
    session = json.loads(session_data)
    flashcards = session.get("data")
    if flashcards is None:
        raise HTTPException(status_code=404, detail="No flashcards data found in session")
    
    flashcard_to_update = next((f for f in flashcards if f["id"] == flashcard_id), None)
    if not flashcard_to_update:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    flashcard_to_update["known"] = payload.known
    
    ttl = redis_client.ttl(session_id)
    if ttl <= 0:
        raise HTTPException(status_code=404, detail="Flashcards session expired")
    redis_client.set(session_id, json.dumps(session), ex=ttl)

    return {"status": "success"}