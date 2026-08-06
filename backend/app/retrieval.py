import os

import chromadb
from openai import OpenAI


CHROMA_DATABASE_PATH = "backend/chroma_data"
COLLECTION_NAME = "book_summaries"
EMBEDDING_MODEL = "text-embedding-3-small"
DEFAULT_NUMBER_OF_RESULTS = 3


def search_books(
    user_question,
    number_of_results=DEFAULT_NUMBER_OF_RESULTS
):

    if user_question is None:
        print("Error: Question not provided.")
        return []

    cleaned_question = user_question.strip()

    if cleaned_question == "":
        print("Error: Question cannot be empty.")
        return []


    if number_of_results <= 0:
        print(
            "Error: number_of_results must be "
            "a positive integer."
        )
        return []

    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        print("Error: OPENAI_API_KEY environment variable is not set.")
        return []

    if api_key.strip() == "":
        print("Error: OPENAI_API_KEY environment variable is empty.")
        return []


    openai_client = OpenAI()

    try:
        embedding_response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=cleaned_question
        )

    except Exception as error:
        print("Error creating question embedding.")
        print(error)
        return []

    question_embedding = (
        embedding_response.data[0].embedding
    )


    chroma_client = chromadb.PersistentClient(
        path=CHROMA_DATABASE_PATH
    )

    try:
        collection = chroma_client.get_collection(
            name=COLLECTION_NAME
        )

    except Exception as error:
        print("Error: ChromaDB collection not found.")
        print("Run ingest_books.py first.")
        print(error)
        return []

    number_of_books_in_collection = collection.count()

    if number_of_books_in_collection == 0:
        print("Error: ChromaDB collection is empty.")
        return []

    if number_of_results > number_of_books_in_collection:
        number_of_results = number_of_books_in_collection

    try:
        query_results = collection.query(
            query_embeddings=[question_embedding],
            n_results=number_of_results
        )

    except Exception as error:
        print("Error searching in ChromaDB.")
        print(error)
        return []


    result_ids = query_results["ids"][0]
    result_documents = query_results["documents"][0]
    result_metadatas = query_results["metadatas"][0]
    result_distances = query_results["distances"][0]


    found_books = []

    for position in range(len(result_ids)):
        book_id = result_ids[position]
        document = result_documents[position]
        metadata = result_metadatas[position]
        distance = result_distances[position]

        book_result = {
            "id": book_id,
            "title": metadata["title"],
            "author": metadata["author"],
            "genres": metadata["genres"],
            "themes": metadata["themes"],
            "document": document,
            "distance": distance
        }

        found_books.append(book_result)

    return found_books