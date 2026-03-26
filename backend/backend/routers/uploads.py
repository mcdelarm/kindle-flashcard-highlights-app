from backend.redis_client import redis_client
from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
import json
import sqlite3
import tempfile
import re
from datetime import datetime
import os

router = APIRouter(prefix="/uploads", tags=["uploads"])


def parse_clippings(file_text: str):
    entries = file_text.split("==========")
    books = {}
    next_book_id = 0
    next_item_id = 0

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

        if book_title not in books:
            books[book_title] = {
                "id": next_book_id,
                "author": author,
                "items": [],
            }
            next_book_id += 1

        books[book_title]["items"].append(
            {
                "id": next_item_id,
                "location": location,
                "date": added_date.isoformat() if added_date else None,
                "text": content,
            }
        )
        next_item_id += 1

    return books


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
    if not file.filename.endswith(".db"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only .db files are allowed."
        )

    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        temp_filename = tmp_file.name
        tmp_file.write(await file.read())

    try:
        conn = sqlite3.connect(temp_filename)
        cursor = conn.cursor()

        query = """
            SELECT
                b.title AS book_title,
                b.authors,
                w.stem,
                w.word,
                w.lang,
                l.usage
            FROM Lookups l
            JOIN Words w ON l.word_key = w.id
            JOIN Book_Info b ON l.book_key = b.id
            WHERE length(w.stem) > 2
            AND l.usage LIKE '%' || w.word || '%'
            GROUP BY b.id, w.stem
            ORDER BY b.id;
            """

        cursor.execute(query)
        rows = cursor.fetchall()

        books = {}
        next_book_id = 0
        next_item_id = 0

        for book_title, authors, stem, word, lang, usage in rows:
            stem = re.sub(r"[^A-Za-z]", "", stem).lower()
            if book_title not in books:
                books[book_title] = {
                    "id": next_book_id,
                    "author": authors,
                    "items": [],
                }
                next_book_id += 1

            books[book_title]["items"].append(
                {
                    "id": next_item_id,
                    "stem": stem,
                    "word": word,
                    "lang": lang,
                    "text": usage,
                }
            )
            next_item_id += 1

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing vocab database: {str(e)}"
        )
    finally:
        conn.close()
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

    session_id = store_session({"type": "vocab", "data": books})

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
