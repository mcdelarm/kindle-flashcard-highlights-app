from backend.models import Flashcard, Highlight, Book
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from backend.services.auth_service import get_or_create_book
import requests
import spacy

nlp = spacy.load("en_core_web_sm")

POS_MAP = {
    "NOUN": "noun",
    "PROPN": "noun",      # proper noun
    "VERB": "verb",
    "AUX": "verb",        # auxiliary verbs (is, have, etc.)
    "ADJ": "adjective",
    "ADV": "adverb",
    "PRON": "pronoun",
    "ADP": "preposition", # includes "of", "in", etc.
    "CCONJ": "conjunction",
    "SCONJ": "conjunction",
    "INTJ": "interjection",
    "NUM": "number",
    "DET": "determiner",
    "PART": "particle",
}

def fetch_part_of_speech(word, sentence):
    doc = nlp(sentence)
    for token in doc:
        if token.text.lower() == word.lower():
            return POS_MAP.get(token.pos_, "unknown")
    return None

def fetch_definition(pos, stem, lang):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/{lang}/{stem}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        for entry in data:
            meanings = entry.get("meanings", [])
            for meaning in meanings:
                if meaning.get("partOfSpeech") == pos:
                    definitions = meaning.get("definitions", [])
                    if definitions:
                        return definitions[0].get("definition")
    except requests.RequestException:
        return None
    return None


def convert_import_to_db(books, session_type, user_id, deselected_books, deselected_items, db):
    deselected_books = set(deselected_books)
    deselected_items = set(deselected_items)

    try:
        for book_title, book_data in books.items():
            if book_title in deselected_books:
                continue

            book = get_or_create_book(book_title, book_data.get("author"), db)

            for item in book_data.get("items"):
                if item["id"] in deselected_items:
                    continue
                else:
                    if session_type == "flashcards":
                        part_of_speech = fetch_part_of_speech(item['word'], item['context'])
                        if not part_of_speech or part_of_speech == "unknown":
                            continue
                        definition = fetch_definition(part_of_speech, item['stem'], item['lang'])
                        if not definition:
                            continue
                        existing_flashcard = db.query(Flashcard).filter(
                            Flashcard.user_id == user_id,
                            Flashcard.stem == item.get("stem"),
                            Flashcard.definition == definition,
                            Flashcard.part_of_speech == part_of_speech
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
                            definition=definition,
                            context=item.get("context"),
                            part_of_speech=part_of_speech,
                            known=False
                        )
                        db.add(flashcard)
                    else:
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

def generate_items_from_books(books, type, deselected_books, deselected_items):
    deselected_books = set(deselected_books)
    deselected_items = set(deselected_items)

    selected_items = []

    for book_title, book_data in books.items():
        if book_title in deselected_books:
            continue

        for item in book_data.get("items"):
            if item["id"] in deselected_items:
                continue
            else:
                if type == "flashcards":
                    #need to add a definition for the stem
                    part_of_speech = fetch_part_of_speech(item['word'], item['context'])
                    if not part_of_speech or part_of_speech == "unknown":
                        continue
                    item['part_of_speech'] = part_of_speech
                    definition = fetch_definition(item['part_of_speech'], item['stem'], item['lang'])
                    if not definition:
                        continue
                    item['definition'] = definition
                    item["known"] = False
                else:
                    #highlight items
                    item['starred'] = False
                    item['location'] = str(item.get("location"))
                book = {"title": book_title, "author": book_data.get("author"), "id": book_data.get("id")}
                item['book'] = book
                selected_items.append(item)
            
    return selected_items