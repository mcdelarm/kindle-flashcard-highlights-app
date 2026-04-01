import re
from datetime import datetime

def parse_clippings(file_text: str):
    entries = file_text.split("==========")
    books = {}
    next_book_id = 0
    next_item_id = 0

    for entry in entries:
        entry = entry.strip().replace("\ufeff", "")
        if not entry:
            continue

        lines = [l.strip() for l in entry.split("\n") if l.strip()]
        if len(lines) < 3:
            continue

        # First line contains book title, author
        book_line = lines[0]
        author_match = re.search(r"\(([^)]+)\)$", book_line)
        author = author_match.group(1).strip() if author_match else "Unknown"
        book_part = re.sub(r"\([^)]+\)$", "", book_line).strip()
        book_title = re.sub(r"^\{[^}]+\}Fmt\d+", "", book_part).strip()
        if not book_title:
            book_title = book_part

        # Second line contains the metadata: type, location, date
        metadata_line = lines[1]
        if "Highlight" not in metadata_line:
            continue
        loc_match = re.search(r"Location (\d+)(?:-\d+)?", metadata_line)
        location = str(int(loc_match.group(1))) if loc_match else None

        date_match = re.search(r"Added on (.*)$", metadata_line)
        added_date = None
        if date_match:
            try:
                added_date = datetime.strptime(
                    date_match.group(1), "%A, %B %d, %Y %I:%M:%S %p"
                )
            except ValueError:
                # Could not parse date
                pass

        # Last line contains the highlight text
        content = lines[2].strip().replace("\ufeff", "")
        if len(content) < 5:
            continue

        if book_title not in books:
            books[book_title] = {
                "id": next_book_id,
                "author": author,
                "items": [],
            }
            next_book_id += 1

        books[book_title]["items"].append(
            {
                "id": next_item_id,
                "location": location,
                "date": added_date.isoformat() if added_date else None,
                "text": content,
            }
        )
        next_item_id += 1

    return books