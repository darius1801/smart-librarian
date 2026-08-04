import os

import chromadb
from openai import OpenAI


CHROMA_DATABASE_PATH = "backend/chroma_data"
COLLECTION_NAME = "book_summaries"
EMBEDDING_MODEL = "text-embedding-3-small"
NUMBER_OF_RESULTS = 3


def main():
    
    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        print("Error: OpenAI API key not found in environment variables.")
        return


    user_question = input(
        "Write what kind of book you are looking for: "
    )

    user_question = user_question.strip()

    if user_question == "":
        print("Error: The question cannot be empty.")
        return

    print()
    print("User's question:")
    print(user_question)


    # Create the embedding for the user's question using OpenAI's API.

    print()
    print("Creating the embedding for the question.")

    openai_client = OpenAI()

    try:
        embedding_response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=user_question
        )

    except Exception as error:
        print("An error occurred while creating the embedding.")
        print(error)
        return

    question_embedding = embedding_response.data[0].embedding

    print("The embedding for the question has been created.")
    print("Number of values:", len(question_embedding))


    # Open the ChromaDB collection and search for the most relevant books.
    
    chroma_client = chromadb.PersistentClient(
        path=CHROMA_DATABASE_PATH
    )

    try:
        collection = chroma_client.get_collection(
            name=COLLECTION_NAME
        )

    except Exception as error:
        print("Error: Could not open the collection.")
        print(error)
        return

    print("The collection has been opened.")
    print("Existing books:", collection.count())

    if collection.count() == 0:
        print("The collection is empty.")
        return

    # Search for the most relevant books in the collection using the question embedding.
    
    print()
    print(
        "Searching for the first",
        NUMBER_OF_RESULTS,
        "relevant books."
    )

    try:
        results = collection.query(
            query_embeddings=[question_embedding],
            n_results=NUMBER_OF_RESULTS
        )

    except Exception as error:
        print("An error occurred while searching in ChromaDB.")
        print(error)
        return

    # Extract the lists from the results.
    
    result_ids = results["ids"][0]
    result_documents = results["documents"][0]
    result_metadatas = results["metadatas"][0]
    result_distances = results["distances"][0]

    if len(result_ids) == 0:
        print("No results found.")
        return


    print()
    print("RESULTS")
    
    result_number = 1

    for position in range(len(result_ids)):
        book_id = result_ids[position]
        document = result_documents[position]
        metadata = result_metadatas[position]
        distance = result_distances[position]

        print()
        print("Result", result_number)
        print()
        print("ID:", book_id)
        print("Title:", metadata["title"])
        print("Author:", metadata["author"])
        print("Genres:", metadata["genres"])
        print("Themes:", metadata["themes"])
        print("Distance:", distance)

        print()
        print("Stored Document:")
        print(document)

        result_number = result_number + 1

    print()
    print("Search completed.")
   


if __name__ == "__main__":
    main()