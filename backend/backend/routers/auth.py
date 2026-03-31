from fastapi import APIRouter, HTTPException, Request, Depends, Response
from backend.redis_client import redis_client
from backend.schemas import AuthCrendentialsRequest
from backend.database import get_db
from backend.models import User
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.routers.uploads import store_session
from backend.services.auth_service import (
    convert_session_to_flashcards,
    convert_session_to_highlights,
)
import json
from pwdlib import PasswordHash

router = APIRouter(prefix="/auth", tags=["auth"])

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return password_hash.verify(password, hashed_password)
    except Exception:
        return False


def check_existing_user_session(request: Request):
    existing_user_session = request.cookies.get("user_session_id")
    if existing_user_session:
        existing_session_data = redis_client.get(existing_user_session)
        if existing_session_data:
            existing_session = json.loads(existing_session_data)
            existing_user_id = existing_session.get("user_id")
            if existing_user_id:
                return True
    return False


def convert_sessions_to_db(request: Request, user_id: int, db: Session):
    # Check to see if user has generated sessions for flashcards or highlights, if so convert those sessions to flashcard and highligh model and user
    if request.cookies.get("flashcards_session_id"):
        flashcards_session_id = request.cookies.get("flashcards_session_id")
        flashcards_session_data = redis_client.get(flashcards_session_id)
        if flashcards_session_data:
            flashcards_session = json.loads(flashcards_session_data)
            session_data = flashcards_session.get("data")
            if session_data:
                convert_session_to_flashcards(session_data, user_id, db)
                redis_client.delete(flashcards_session_id)

    if request.cookies.get("highlights_session_id"):
        highlights_session_id = request.cookies.get("highlights_session_id")
        highlights_session_data = redis_client.get(highlights_session_id)
        if highlights_session_data:
            highlights_session = json.loads(highlights_session_data)
            session_data = highlights_session.get("data")
            if session_data:
                convert_session_to_highlights(session_data, user_id, db)
                redis_client.delete(highlights_session_id)


@router.post("/signup")
def signup(
    payload: AuthCrendentialsRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    # First need to check if user already exists, if so return error
    if check_existing_user_session(request):
        raise HTTPException(
            status_code=409,
            detail="A user is already logged in. Please log out before signing up for a new account.",
        )
    normalized_email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    hashed_password = hash_password(payload.password)

    new_user = User(email=normalized_email, hashed_password=hashed_password)

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )
    
    convert_sessions_to_db(request, new_user.id, db)
    response.delete_cookie(key="flashcards_session_id")
    response.delete_cookie(key="highlights_session_id")

    session_id = store_session({"user_id": new_user.id}, hours=24 * 7)
    response.set_cookie(
        key="user_session_id",
        value=session_id,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",  # Set to "strict" later in production
    )

    return {
        "status": "success",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
        },
    }


@router.post("/login")
def login(
    payload: AuthCrendentialsRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    if check_existing_user_session(request):
        raise HTTPException(
            status_code=409,
            detail="A user is already logged in. Please log out before logging in to a new account.",
        )
    normalized_email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="Invalid email or password")

    if not verify_password(payload.password, existing_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    convert_sessions_to_db(request, existing_user.id, db)
    response.delete_cookie(key="flashcards_session_id")
    response.delete_cookie(key="highlights_session_id")

    session_id = store_session({"user_id": existing_user.id}, hours=24 * 7)
    response.set_cookie(
        key="user_session_id",
        value=session_id,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",  # Set to "strict" later in production
    )

    return {
        "status": "success",
        "user": {
            "id": existing_user.id,
            "email": existing_user.email,
        },
    }

@router.post("/logout")
def logout(request: Request, response: Response):
    session_id = request.cookies.get("user_session_id")
    if session_id:
        redis_client.delete(session_id)
    response.delete_cookie(key="user_session_id")
    return {"status": "success", "message": "Logged out successfully"}



@router.get("/me")
def get_current_user(
    request: Request, response: Response, db: Session = Depends(get_db)
):
    session_id = request.cookies.get("user_session_id")
    if not session_id:
        raise HTTPException(status_code=404, detail="No user session found")

    session_data = redis_client.get(session_id)
    if not session_data:
        response.delete_cookie(key="user_session_id")
        raise HTTPException(status_code=404, detail="User session expired or not found")

    session = json.loads(session_data)
    user_id = session.get("user_id")
    if not user_id:
        response.delete_cookie(key="user_session_id")
        raise HTTPException(status_code=404, detail="Invalid user session data")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        response.delete_cookie(key="user_session_id")
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user": {
            "id": user.id,
            "email": user.email,
        }
    }
