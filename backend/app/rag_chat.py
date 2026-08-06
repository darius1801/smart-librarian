import os

from openai import OpenAI

from backend.app.retrieval import search_books


CHAT_MODEL = "gpt-4o-mini"
NUMBER_OF_RETRIEVED_BOOKS = 3


def build_books_context(books):
  
    context_text = ""

    book_number = 1

    for book in books:
        context_text = (
            context_text
            + "BOOK NUMBER: "
            + str(book_number)
            + "\n"
        )

        context_text = (
            context_text
            + "Title: "
            + book["title"]
            + "\n"
        )

        context_text = (
            context_text
            + "Author: "
            + book["author"]
            + "\n"
        )

        context_text = (
            context_text
            + "Genres: "
            + book["genres"]
            + "\n"
        )

        context_text = (
            context_text
            + "Themes: "
            + book["themes"]
            + "\n"
        )

        context_text = (
            context_text
            + "Description:\n"
            + book["document"]
            + "\n"
        )

        context_text = (
            context_text
            + "\n"
        )

        book_number = book_number + 1

    return context_text


def recommend_book(user_question):
   
    if user_question is None:
        return "Error: Question not provided."

    cleaned_question = user_question.strip()

    if cleaned_question == "":
        return "Error: Question cannot be empty."


    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        return "Error: OPENAI_API_KEY environment variable is not set."

    
    retrieved_books = search_books(
        user_question=cleaned_question,
        number_of_results=NUMBER_OF_RETRIEVED_BOOKS
    )

    if len(retrieved_books) == 0:
        return (
            "Error: No relevant books found "
            "for your request."
        )


    books_context = build_books_context(
        books=retrieved_books
    )

    instructions = (
        "Esti Smart Librarian, un asistent care recomanda carti. "
        "Trebuie sa raspunzi in limba romana. "
        "Foloseste numai cartile primite in context. "
        "Nu recomanda o carte care nu exista in context. "
        "Alege o singura carte care se potriveste cel mai bine "
        "cererii utilizatorului. "
        "Mentioneaza titlul exact si autorul. "
        "Explica in 2 sau 3 propozitii de ce se potriveste. "
        "Nu inventa informatii despre carte. "
        "Nu oferi inca rezumatul complet. "
        "Nu mentiona ChromaDB, embeddings sau procesul intern."
    )


    input_text = (
        "CEREREA UTILIZATORULUI:\n"
        + cleaned_question
        + "\n\n"
        + "CARTILE DISPONIBILE:\n\n"
        + books_context
    )

   #Sending the request to the GPT model to generate a recommendation.

    openai_client = OpenAI()

    try:
        response = openai_client.responses.create(
            model=CHAT_MODEL,
            instructions=instructions,
            input=input_text
        )

    except Exception as error:
        print("Error: Failed to generate recommendation.")
        print(error)

        return (
            "Error: Failed to generate recommendation."
            "Check the terminal for details."
        )

    # Extract the text response from the model's output.

    recommendation = response.output_text

    if recommendation is None:
        return "Error: Model did not return a text response."

    if recommendation.strip() == "":
        return "Error: Model returned an empty response."

    return recommendation