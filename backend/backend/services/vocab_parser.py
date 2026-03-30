import sqlite3
import re

def parse_vocab(db_path: str):
    conn = sqlite3.connect(db_path)
    try:
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
                    "context": usage,
                }
            )
            next_item_id += 1

        return books

    finally:
        conn.close()
