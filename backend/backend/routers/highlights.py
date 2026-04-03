from fastapi import APIRouter, HTTPException, Request, Depends, Response
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.redis_client import redis_client
import json
from backend.schemas import HighlightUpdateRequest, HighlightListOut
from backend.services.auth_service import validate_user, extend_user_session
from backend.models import Highlight

router = APIRouter(prefix="/highlights", tags=["highlights"])

@router.get("/", response_model=HighlightListOut)
def get_highlights(request: Request, response: Response, db: Session = Depends(get_db)):
    user_id = validate_user(request, db)
    if user_id:
        #user is authenticated and logged in
        highlights = db.query(Highlight).filter(Highlight.user_id == user_id).all()
        extend_user_session(request, response)
        return {"highlights": highlights}

    session_id = request.cookies.get("highlights_session_id")
    if not session_id:
        raise HTTPException(status_code=404, detail="No highlights session found")
    session_data = redis_client.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Highlights session expired or not found")
    highlights = json.loads(session_data).get("data")
    if highlights is None:
        raise HTTPException(status_code=404, detail="No highlights data found in session")
    return {"highlights": highlights}

@router.patch("/{highlight_id}")
def update_highlight(highlight_id: int, payload: HighlightUpdateRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    user_id = validate_user(request, db)
    if user_id:
        #user is authenticated and logged in
        highlight = db.query(Highlight).filter(Highlight.id == highlight_id, Highlight.user_id == user_id).first()
        if not highlight:
            raise HTTPException(status_code=404, detail="Highlight not found")
        highlight.starred = payload.starred
        db.commit()
        extend_user_session(request, response)
        return {"status": "success"}

    session_id = request.cookies.get("highlights_session_id")
    if not session_id:
        raise HTTPException(status_code=404, detail="No highlights session found")
    
    session_data = redis_client.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Highlights session expired or not found")
    
    session = json.loads(session_data)
    highlights = session.get("data")
    if highlights is None:
        raise HTTPException(status_code=404, detail="No highlights data found in session")
    
    highlight_to_update = next((h for h in highlights if h["id"] == highlight_id), None)
    if not highlight_to_update:
        raise HTTPException(status_code=404, detail="Highlight not found")
    
    highlight_to_update["starred"] = payload.starred
    
    ttl = redis_client.ttl(session_id)
    if ttl <= 0:
        raise HTTPException(status_code=404, detail="Highlights session expired")
    redis_client.set(session_id, json.dumps(session), ex=ttl)

    return {"status": "success"}

@router.delete("/{highlight_id}")
def delete_highlight(highlight_id: int, request: Request, response: Response, db: Session = Depends(get_db)):
    user_id = validate_user(request, db)
    if user_id:
        #user is authenticated and logged in
        highlight = db.query(Highlight).filter(Highlight.id == highlight_id, Highlight.user_id == user_id).first()
        if not highlight:
            raise HTTPException(status_code=404, detail="Highlight not found")
        db.delete(highlight)
        db.commit()
        extend_user_session(request, response)
        return {"status": "success"}

    session_id = request.cookies.get("highlights_session_id")
    if not session_id:
        raise HTTPException(status_code=404, detail="No highlights session found")
    
    session_data = redis_client.get(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Highlights session expired or not found")
    
    session = json.loads(session_data)
    highlights = session.get("data")
    if highlights is None:
        raise HTTPException(status_code=404, detail="No highlights data found in session")
    
    highlight_to_delete = next((h for h in highlights if h["id"] == highlight_id), None)
    if not highlight_to_delete:
        raise HTTPException(status_code=404, detail="Highlight not found")
    
    highlights.remove(highlight_to_delete)
    
    ttl = redis_client.ttl(session_id)
    if ttl <= 0:
        raise HTTPException(status_code=404, detail="Highlights session expired")
    redis_client.set(session_id, json.dumps(session), ex=ttl)

    return {"status": "success"}