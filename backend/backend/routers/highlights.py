from fastapi import APIRouter, HTTPException, Request
from backend.redis_client import redis_client
import json

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