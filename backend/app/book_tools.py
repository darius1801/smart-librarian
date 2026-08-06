import json


def get_summary_by_title(title):
   
    
    if title is None:
        return "Error: title cannot be None."

    searched_title = title.strip()

    if searched_title == "":
        return "Error: title cannot be empty."

    # Open the JSON file and load its content.
    try:
        books_file = open(
            "backend/data/books.json",
            mode="r",
            encoding="utf-8"
        )

        books = json.load(books_file)

        books_file.close()

    except FileNotFoundError:
        return (
            "Error: file book_summaries.json "
            "not found."
        )

    except json.JSONDecodeError:
        return (
            "Error: file book_summaries.json "
            "does not contain valid JSON."
        )

    for book in books:
        book_title = book["title"]

        # Comparing titles in a case-insensitive manner.
        if book_title.lower() == searched_title.lower():
            full_summary = book["full_summary"]

            return full_summary

    return (
        "Error: no complete summary found "
        "for the title: " + searched_title
    )