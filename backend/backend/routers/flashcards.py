from fastapi import APIRouter, HTTPException, Request, Depends, Response
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.redis_client import redis_client
import json
from backend.schemas import FlashcardUpdateRequest, FlashcardListOut
from backend.services.auth_service import validate_user, extend_user_session
from backend.models import Flashcard

router = APIRouter(prefix="/flashcards", tags=["flashcards"])

@router.get("/", response_model=FlashcardListOut)
def get_flashcards(request: Request, response: Response, db: Session = Depends(get_db)):
    user_id = validate_user(request, db)
    if user_id:
        #user is authenticated and logged in
        flashcards = db.query(Flashcard).filter(Flashcard.user_id == user_id).all()
        extend_user_session(request, response)
        return {"flashcards": flashcards}

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
def update_flashcard(flashcard_id: int, payload: FlashcardUpdateRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    user_id = validate_user(request, db)
    if user_id:
        #user is authenticated and logged in
        flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id, Flashcard.user_id == user_id).first()
        if not flashcard:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        if payload.known is not None:
            flashcard.known = payload.known
        if payload.definition is not None:
            flashcard.definition = payload.definition
        db.commit()
        extend_user_session(request, response)
        return {"status": "success"}

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
    
    if payload.known is not None:
        flashcard_to_update["known"] = payload.known
    if payload.definition is not None:
        flashcard_to_update["definition"] = payload.definition
    
    ttl = redis_client.ttl(session_id)
    if ttl <= 0:
        raise HTTPException(status_code=404, detail="Flashcards session expired")
    redis_client.set(session_id, json.dumps(session), ex=ttl)

    return {"status": "success"}

@router.delete("/{flashcard_id}")
def delete_flashcard(flashcard_id: int, request: Request, response: Response, db: Session = Depends(get_db)):
    user_id = validate_user(request, db)
    if user_id:
        #user is authenticated and logged in
        flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id, Flashcard.user_id == user_id).first()
        if not flashcard:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        db.delete(flashcard)
        db.commit()
        extend_user_session(request, response)
        return {"status": "success"}
    
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
    
    flashcard_to_delete = next((f for f in flashcards if f["id"] == flashcard_id), None)
    if not flashcard_to_delete:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    flashcards.remove(flashcard_to_delete)
    
    ttl = redis_client.ttl(session_id)
    if ttl <= 0:
        raise HTTPException(status_code=404, detail="Flashcards session expired")
    redis_client.set(session_id, json.dumps(session), ex=ttl)

    return {"status": "success"}