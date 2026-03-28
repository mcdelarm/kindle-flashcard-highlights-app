from backend.redis_client import redis_client
from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import json
import tempfile
import os
from backend.schemas import GenerateRequest
from backend.services.clippings_parser import parse_clippings
from backend.services.vocab_parser import parse_vocab
from backend.services.generator import generate_items_from_books

router = APIRouter(prefix="/uploads", tags=["uploads"])

def store_session(data: dict, hours: int = 1):
    session_id = str(uuid.uuid4())

    redis_client.setex(session_id, hours * 3600, json.dumps(data))

    return session_id

def update_session(session_id: str, data: dict, hours: int = 1):
    redis_client.setex(session_id, hours * 3600, json.dumps(data))
    return session_id

@router.post("/clippings")
async def upload_clippings(file: UploadFile = File(...)):
    if not file.filename.endswith(".txt"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only .txt files are allowed."
        )

    file_text = (await file.read()).decode("utf-8")

    try:
        parsed_text = parse_clippings(file_text)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error parsing clippings: {str(e)}"
        )

    session_id = store_session({"type": "highlights", "data": parsed_text})

    return {"session_id": session_id}


@router.post("/vocab")
async def upload_vocab(file: UploadFile = File(...)):
    if not file.filename.endswith(".db"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only .db files are allowed."
        )

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        temp_filename = tmp_file.name
        tmp_file.write(await file.read())

    try:
        books = parse_vocab(temp_filename)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing vocab database: {str(e)}"
        )
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    session_id = store_session({"type": "flashcards", "data": books})

    return {"session_id": session_id}


@router.get("/{session_id}")
def get_upload_session(session_id: str):
    session_data = redis_client.get(session_id)

    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    session = json.loads(session_data)

    response = {
        "session_id": session_id,
        "type": session.get("type"),
        "data": session.get("data"),
    }
    return response

@router.post("/generate")
def generate_items(request: GenerateRequest):
    import_session_data = redis_client.get(request.importSessionId)
    if not import_session_data:
        raise HTTPException(status_code=404, detail="Import session not found or expired")
    
    import_session = json.loads(import_session_data)
    books = import_session.get("data")
    type = import_session.get("type")

    if not books or not type:
        raise HTTPException(status_code=400, detail="No import data found in session")
    
    selected_items = generate_items_from_books(books, type, request.deselectedBooks, request.deselectedItems)

    if not selected_items:
        raise HTTPException(status_code=400, detail="No items selected for generation")

    
    if request.generatedSessionId:
        session_id = update_session(request.generatedSessionId, {"type": type, "data": selected_items}, hours=12)
    else:
        session_id = store_session({"type": type, "data": selected_items}, hours=12)
    
    return {"session_id": session_id}