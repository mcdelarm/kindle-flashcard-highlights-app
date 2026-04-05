from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
  __tablename__ = 'users'

  id = Column(Integer, primary_key=True, index=True)
  email = Column(String(150), unique=True, nullable=False)
  hashed_password = Column(Text, nullable=False)
  created_at = Column(TIMESTAMP, default=datetime.utcnow)
  flashcards = relationship('Flashcard', back_populates='owner', cascade='all, delete')
  highlights = relationship('Highlight', back_populates='owner', cascade='all, delete')


class Book(Base):
  __tablename__ = 'books'
  __table_args__ = (UniqueConstraint('title', 'author', name='uq_books_title_author'),)

  id = Column(Integer, primary_key=True, index=True)
  title = Column(String(255), nullable=False)
  author = Column(String(255), nullable=False)
  created_at = Column(TIMESTAMP, default=datetime.utcnow)


class Flashcard(Base):
  __tablename__ = 'flashcards'
  __table_args__ = (UniqueConstraint('user_id', 'part_of_speech', 'stem', 'definition', name='uq_user_stem_def_pos'),)

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
  book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'))
  stem = Column(String(255), nullable=False)
  word = Column(String(255), nullable=False)
  definition = Column(Text, nullable=True)
  context = Column(Text, nullable=True)
  created_at = Column(TIMESTAMP, default=datetime.utcnow)
  known = Column(Boolean, default=False) 
  part_of_speech = Column(String(50), nullable=False)
  owner = relationship('User', back_populates='flashcards')
  book = relationship('Book')


class Highlight(Base):
  __tablename__ = 'highlights'
  __table_args__ = (UniqueConstraint('user_id', 'text', 'book_id', 'location', name='uq_user_text_location_book'),)

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
  book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'))
  text = Column(Text, nullable=False)
  location = Column(String(255), nullable=True)
  date = Column(TIMESTAMP, default=datetime.utcnow)
  starred = Column(Boolean, default=False) 
  owner = relationship('User', back_populates='highlights')
  book = relationship('Book')