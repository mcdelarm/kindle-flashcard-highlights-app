
import requests
from nltk import pos_tag, word_tokenize

POS_MAP = {
    "NN": "noun", "NNS": "noun", "NNP": "noun", "NNPS": "noun",
    "VB": "verb", "VBD": "verb", "VBG": "verb", "VBN": "verb", "VBP": "verb", "VBZ": "verb",
    "JJ": "adjective", "JJR": "adjective", "JJS": "adjective",
    "RB": "adverb", "RBR": "adverb", "RBS": "adverb",
    "PRP": "pronoun", "PRP$": "pronoun", "WP": "pronoun", "WP$": "pronoun",
    "IN": "preposition", "CC": "conjunction", "UH": "interjection"
}

def fetch_part_of_speech(word, sentence):
    tokens = word_tokenize(sentence)
    tags = pos_tag(tokens)
    for t, tag in tags:
        if t.lower() == word.lower():
            return POS_MAP.get(tag, "unknown")
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
                if type == "flashcards":
                    #need to add a definition for the stem
                    part_of_speech = fetch_part_of_speech(item['word'], item['text'])
                    if not part_of_speech or part_of_speech == "unknown":
                        continue
                    item['part_of_speech'] = part_of_speech
                    definition = fetch_definition(item['part_of_speech'], item['stem'], item['lang'])
                    if not definition:
                        continue
                    item['definition'] = definition
                item['book_title'] = book_title
                item['author'] = book_data.get("author")
                selected_items.append(item)
            
    return selected_items
