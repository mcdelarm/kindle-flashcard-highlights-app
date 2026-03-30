from fastapi import APIRouter, HTTPException, Request
from backend.redis_client import redis_client
import json
from backend.schemas import HighlightUpdateRequest

router = APIRouter(prefix="/highlights", tags=["highlights"])

@router.get("/")
def get_highlights(request: Request):
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
def update_highlight(highlight_id: int, payload: HighlightUpdateRequest, request: Request):
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
def delete_highlight(highlight_id: int, request: Request):
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