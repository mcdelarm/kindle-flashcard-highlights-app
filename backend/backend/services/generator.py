from backend.models import Flashcard, Highlight, Book
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from backend.services.auth_service import get_or_create_book
import spacy
from nltk.corpus import wordnet as wn
import re

nlp = spacy.load("en_core_web_sm")

SPACY_TO_WN = {
    "NOUN": wn.NOUN,
    "PROPN": wn.NOUN,
    "VERB": wn.VERB,
    "AUX": wn.VERB,
    "ADJ": wn.ADJ,
    "ADV": wn.ADV,
}

WN_TO_STRING = {
    wn.NOUN: "noun",
    wn.VERB: "verb",
    wn.ADJ: "adjective",
    wn.ADV: "adverb",
}

def fetch_part_of_speech(word, sentence):
    sentence = re.sub(r'[\u2014\u2013\u2012]', ' — ', sentence)
    doc = nlp(sentence)
    for token in doc:
        if token.text.lower() == word.lower():
            wn_pos = SPACY_TO_WN.get(token.pos_)
            if wn_pos:
                return wn_pos
    return None

def fetch_definition(pos, stem, lang="eng"):
    pos_attempts = [pos, wn.NOUN, wn.VERB, wn.ADJ, wn.ADV]
    for pos_try in pos_attempts:
        synsets = wn.synsets(stem, pos=pos_try, lang=lang)
        if synsets:
            return pos_try, synsets[0].definition()
    return None, None


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
                        pos_wn = fetch_part_of_speech(item['word'], item['context'])
                        if not pos_wn:
                            continue
                        pos_wn, definition = fetch_definition(pos_wn, item['stem'])
                        if not definition or not pos_wn:
                            continue
                        existing_flashcard = db.query(Flashcard).filter(
                            Flashcard.user_id == user_id,
                            Flashcard.stem == item.get("stem"),
                            Flashcard.definition == definition,
                            Flashcard.part_of_speech == WN_TO_STRING[pos_wn]
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
                            part_of_speech=WN_TO_STRING[pos_wn],
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
                print(f"Processing item {item['stem']}")
                if type == "flashcards":
                    #need to add a definition for the stem
                    pos_wn = fetch_part_of_speech(item['word'], item['context'])
                    if not pos_wn:
                        print(f"Skipping {item['stem']} due to unknown part of speech")
                        continue
                    pos_wn, definition = fetch_definition(pos_wn, item['stem'])
                    if not definition or not pos_wn:
                        print(f"Skipping {item['stem']} due to missing definition for part of speech {pos_wn}")
                        continue
                    item['definition'] = definition
                    item['part_of_speech'] = WN_TO_STRING[pos_wn]
                    item["known"] = False
                else:
                    #highlight items
                    item['starred'] = False
                book = {"title": book_title, "author": book_data.get("author"), "id": book_data.get("id")}
                item['book'] = book
                selected_items.append(item)
            
    return selected_items