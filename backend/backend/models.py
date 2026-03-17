from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
  __tablename__ = 'users'

  id = Column(Integer, primary_key=True, index=True)
  username = Column(String(50), unique=True, nullable=False)
  email = Column(String(150), unique=True, nullable=False)
  hashed_password = Column(Text, nullable=False)
  created_at = Column(TIMESTAMP, default=datetime.utcnow)

  flashcards = relationship('Flashcard', back_populates='owner', cascade='all, delete')
  highlights = relationship('Highlight', back_populates='owner', cascade='all, delete')
  books = relationship('Book', back_populates='owner', cascade='all, delete')

class Book(Base):
  __tablename__ = 'books'

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
  title = Column(String(255), nullable=False)
  author = Column(String(255), nullable=True)
  created_at = Column(TIMESTAMP, default=datetime.utcnow)

  owner = relationship('User', back_populates='books')
  flashcards = relationship('Flashcard', back_populates='book', cascade='all, delete')
  highlights = relationship('Highlight', back_populates='book', cascade='all, delete')

class Flashcard(Base):
  __tablename__ = 'flashcards'

  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
  word = Column(String(255), nullable=False)
  definition = Column(Text, nullable=False)
  context_sentence = Column(Text, nullable=True)
  created_at = Column(TIMESTAMP, default=datetime.utcnow)
  book_id = Column(Integer, ForeignKey('books.id', ondelete='CASCADE'))

  owner = relationship('User', back_populates='flashcards')
  book = relationship('Book', back_populates='flashcards')
