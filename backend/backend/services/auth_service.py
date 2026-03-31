
from backend.models import Flashcard, Highlight, Book
from sqlalchemy.exc import IntegrityError
from datetime import datetime

def get_or_create_book(book_data, db):
    title = book_data.get("title").strip()
    author = book_data.get("author").strip()

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

          book = get_or_create_book(book_data, db)

          existing_flashcard = db.query(Flashcard).filter(
              Flashcard.user_id == user_id,
              Flashcard.stem == item.get("stem"),
              Flashcard.definition == item.get("definition"),
              Flashcard.part_of_speech == item.get("part_of_speech")
          ).first()

          if existing_flashcard:
              existing_flashcard.known = False
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
              known=False
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

          book = get_or_create_book(book_data, db)

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
              starred=False
          )
          db.add(highlight)
      db.commit()
    except IntegrityError:
      db.rollback()
      raise