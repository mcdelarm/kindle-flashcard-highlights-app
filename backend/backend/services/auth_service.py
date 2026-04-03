
from backend.models import Flashcard, Highlight, Book, User
from backend.redis_client import redis_client
from sqlalchemy.exc import IntegrityError
from datetime import datetime
import json

def get_or_create_book(title, author, db):
    title = title.strip()
    author = author.strip()

    book = db.query(Book).filter_by(title=title, author=author).first()

    if book:
        return book
    
    book = Book(title=title, author=author)
    db.add(book)

    try:
        db.flush()
        return book
    except IntegrityError:
        db.rollback()
        return db.query(Book).filter_by(title=title, author=author).first()

def convert_session_to_flashcards(session_data, user_id, db):
    try:
      for item in session_data:
          book_data = item.get("book")
          if not book_data:
              continue

          book = get_or_create_book(book_data.get("title"), book_data.get("author"), db)

          existing_flashcard = db.query(Flashcard).filter(
              Flashcard.user_id == user_id,
              Flashcard.stem == item.get("stem"),
              Flashcard.definition == item.get("definition"),
              Flashcard.part_of_speech == item.get("part_of_speech")
          ).first()

          if existing_flashcard:
              existing_flashcard.known = item.get("known", False)
              existing_flashcard.book_id = book.id
              existing_flashcard.context = item.get("context")
              existing_flashcard.word = item.get("word")
              existing_flashcard.created_at = datetime.utcnow()
              continue
          
          flashcard = Flashcard(
              user_id=user_id,
              book_id=book.id,
              stem=item.get("stem"),
              word=item.get("word"),
              definition=item.get("definition"),
              context=item.get("context"),
              part_of_speech=item.get("part_of_speech"),
              known=item.get("known", False)
          )
          db.add(flashcard)
      db.commit()
    except IntegrityError:
      db.rollback()
      raise

def convert_session_to_highlights(session_data, user_id, db):
    try:
      for item in session_data:
          book_data = item.get("book")
          if not book_data:
              continue

          book = get_or_create_book(book_data.get("title"), book_data.get("author"), db)

          existing_highlight = db.query(Highlight).filter(
              Highlight.user_id == user_id,
              Highlight.text == item.get("text"),
              Highlight.book_id == book.id,
              Highlight.location == str(item.get("location"))
          ).first()

          if existing_highlight:
              continue
          
          highlight = Highlight(
              user_id=user_id,
              book_id=book.id,
              text=item.get("text"),
              location=str(item.get("location")),
              starred=item.get("starred", False),
              date=item.get("date")
          )
          db.add(highlight)
      db.commit()
    except IntegrityError:
      db.rollback()
      raise

def validate_user(request, db):
    user_session_id = request.cookies.get("user_session_id")
    if user_session_id:
        user_session_data = redis_client.get(user_session_id)
        if user_session_data:
            user_session = json.loads(user_session_data)
            user_id = user_session.get("user_id")
            if user_id:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    return user_id
    return None

def extend_user_session(request, response):
    user_session_id = request.cookies.get("user_session_id")
    if not user_session_id:
        return
    user_session_data = redis_client.get(user_session_id)
    if user_session_data:
        redis_client.expire(user_session_id, 3600 * 24 * 7)  # Extend session by 1 week
        response.set_cookie(
            key="user_session_id",
            value=user_session_id,
            max_age=3600 * 24 * 7,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",  # Set to "strict" later in production
    )
    return