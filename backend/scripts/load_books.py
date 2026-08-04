import json
import os

import chromadb
from openai import OpenAI

BOOKS_FILE_PATH = "backend/data/books.json"
CHROMA_DATABASE_PATH = "backend/chroma_data"
COLLECTION_NAME = "book_summaries"
EMBEDDING_MODEL = "text-embedding-3-small"


def main():
    
    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        print("Error: OpenAI API key not found in environment variables.")
        return


    print()
    print("Opening the books file:")
    print(BOOKS_FILE_PATH)

    try:
        books_file = open(
            BOOKS_FILE_PATH,
            mode="r",
            encoding="utf-8"
        )

        books = json.load(books_file)

        books_file.close()

    except FileNotFoundError:
        print()
        print("Error: The books.json file was not found.")
        return

    except json.JSONDecodeError as error:
        print()
        print("Error: The JSON file has an invalid format.")
        return

   
    print("Number of books found:", len(books))

    if len(books) == 0:
        print("Error: The list of books is empty.")
        return


    print()
    print("Creating the OpenAI client.")

    openai_client = OpenAI()


    print("Creating the ChromaDB client.")

    chroma_client = chromadb.PersistentClient(
        path=CHROMA_DATABASE_PATH
    )


    print("Creating or opening the collection:")
    print(COLLECTION_NAME)

    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME
    )


    print()
    print("Starting the book processing.")
    print()

    number_of_processed_books = 0

    for book in books:
        book_id = book["id"]
        title = book["title"]
        author = book["author"]
        genres = book["genres"]
        themes = book["themes"]
        short_summary = book["short_summary"]

        print("Processing the book:")
        print(title)

        # Creating the text for the document that will be used for embedding.
        genres_text = ""

        for genre in genres:
            if genres_text == "":
                genres_text = genre
            else:
                genres_text = genres_text + ", " + genre

        
        themes_text = ""

        for theme in themes:
            if themes_text == "":
                themes_text = theme
            else:
                themes_text = themes_text + ", " + theme

        # Creating the document text that will be used for embedding.
        document_text = (
            "Title: " + title + "\n"
            "Author: " + author + "\n"
            "Genres: " + genres_text + "\n"
            "Themes: " + themes_text + "\n"
            "Summary: " + short_summary
        )

        print("Creating the embedding for the book.")

        try:
            embedding_response = openai_client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=document_text
            )

        except Exception as error:
            print("An error occurred while creating the embedding.")
            print(error)
            return

        book_embedding = embedding_response.data[0].embedding

        print("Embedding created.")
        print("Number of values:", len(book_embedding))

    
        metadata = {
            "title": title,
            "author": author,
            "genres": genres_text,
            "themes": themes_text
        }

        # save in db
        collection.upsert(
            ids=[book_id],
            documents=[document_text],
            metadatas=[metadata],
            embeddings=[book_embedding]
        )

        number_of_processed_books = number_of_processed_books + 1

        print("The book has been saved in ChromaDB.")
        print(
            "Progress:",
            number_of_processed_books,
            "out of",
            len(books)
        )

    print()
    print("The loading process has finished.")
    print("Books processed:", number_of_processed_books)
    print("Books in collection:", collection.count())
    print("Collection:", COLLECTION_NAME)
    print("ChromaDB Location:", CHROMA_DATABASE_PATH)



if __name__ == "__main__":
    main()