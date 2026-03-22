from backend.redis_client import redis_client
from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import json
import re
from datetime import datetime

router = APIRouter(prefix="/uploads", tags=["uploads"])


def parse_clippings(file_text: str):
    entries = file_text.split("==========")
    parsed = []

    for entry in entries:
        entry = entry.strip().replace("\ufeff", "")
        if not entry:
            continue

        lines = [l.strip() for l in entry.split("\n") if l.strip()]
        if len(lines) < 3:
            continue

        # First line contains book title, author
        book_line = lines[0]
        author_match = re.search(r"\(([^)]+)\)$", book_line)
        author = author_match.group(1).strip() if author_match else "Unknown"
        book_part = re.sub(r"\([^)]+\)$", "", book_line).strip()
        book_title = re.sub(r"^\{[^}]+\}Fmt\d+", "", book_part).strip()
        if not book_title:
            book_title = book_part

        # Second line contains the metadata: type, location, date
        metadata_line = lines[1]
        if "Highlight" not in metadata_line:
            continue
        loc_match = re.search(r"Location (\d+)(?:-\d+)?", metadata_line)
        location = int(loc_match.group(1)) if loc_match else None

        date_match = re.search(r"Added on (.*)$", metadata_line)
        added_date = None
        if date_match:
            try:
                added_date = datetime.strptime(
                    date_match.group(1), "%A, %B %d, %Y %I:%M:%S %p"
                )
            except ValueError:
                # Could not parse date
                pass

        # Last line contains the highlight text
        content = lines[2].strip().replace("\ufeff", "")
        if len(content) < 5:
            continue

        parsed.append(
            {
                "book": book_title,
                "author": author,
                "location": location,
                "date": added_date.isoformat() if added_date else None,
                "text": content,
            }
        )

    return parsed


def store_session(data: dict):
    session_id = str(uuid.uuid4())

    redis_client.setex(session_id, 3600, json.dumps(data))

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

    session_id = store_session({"type": "clippings", "data": parsed_text})

    return {"session_id": session_id}

@router.post("/vocab")
async def upload_vocab(file: UploadFile = File(...)):
    return


@router.get("/{session_id}")
def get_upload_session(session_id: str):
    session_data = redis_client.get(session_id)

    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    
    session = json.loads(session_data)

    response = {
        'session_id': session_id,
        'type': session.get('type'),
        'data': session.get('data')

    }
    return response