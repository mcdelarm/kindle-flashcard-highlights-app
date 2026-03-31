
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
                print(f"Processing item {item['id']} of type {type} from book '{book_title}'")
                if type == "flashcards":
                    #need to add a definition for the stem
                    part_of_speech = fetch_part_of_speech(item['word'], item['context'])
                    if not part_of_speech or part_of_speech == "unknown":
                        print(f"Could not determine part of speech for word '{item['word']}'")
                        continue
                    item['part_of_speech'] = part_of_speech
                    definition = fetch_definition(item['part_of_speech'], item['stem'], item['lang'])
                    if not definition:
                        print(f"Could not fetch definition for word '{item['stem']}' with part of speech '{item['part_of_speech']}'")
                        continue
                    item['definition'] = definition
                    item["known"] = False
                else:
                    #highlight items
                    item['starred'] = False
                book = {"title": book_title, "author": book_data.get("author"), "id": book_data.get("id")}
                item['book'] = book
                selected_items.append(item)
            
    return selected_items
