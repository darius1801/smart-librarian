import json
import os

from openai import OpenAI

from backend.app.book_tools import get_summary_by_title
from backend.app.rag_chat import build_books_context
from backend.app.retrieval import search_books
from backend.app.safety import contains_inappropriate_language

from backend.app.intention import (
    BOOK_INFO,
    BOOK_RECOMMENDATION,
    OTHER,
    classify_user_intent
)


CHAT_MODEL = "gpt-4o-mini"
NUMBER_OF_RETRIEVED_BOOKS = 3


BOOK_SUMMARY_TOOLS = [
    {
        "type": "function",
        "name": "get_summary_by_title",
        "description": (
            "Returneaza rezumatul complet al unei carti "
            "folosind titlul exact al cartii."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": (
                        "Titlul exact al cartii, "
                        "asa cum apare in context."
                    )
                }
            },
            "required": [
                "title"
            ],
            "additionalProperties": False
        },
        "strict": True
    }
]


def recommend_book_with_summary(user_question):
    

    if user_question is None:
        return "Eroare: intrebarea nu a fost primita."

    cleaned_question = user_question.strip()


    if cleaned_question == "":
        return "Eroare: intrebarea nu poate fi goala."


    contains_bad_language = contains_inappropriate_language(
        cleaned_question
    )

    if contains_bad_language is True:
        print()
        print("Mesajul a fost blocat local.")
        print("Nu apelam embeddings API.")
        print("Nu apelam modelul GPT.")

        return (
            "Te rog sa reformulezi mesajul folosind "
            "un limbaj respectuos. "
            "Pot sa te ajut cu recomandari de carti."
        )


    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        return "Eroare: variabila OPENAI_API_KEY nu exista."

    if api_key.strip() == "":
        return "Eroare: variabila OPENAI_API_KEY este goala."


    print()
    print("Clasificam intentia utilizatorului.")

    user_intent = classify_user_intent(
        cleaned_question
    )

    print(
        "Intent detectat:",
        user_intent
    )


    if user_intent == OTHER:
        print()
        print(
            "Mesajul nu este relevant "
            "pentru Smart Librarian."
        )

        print(
            "Nu apelam RAG-ul."
        )

        return (
            "Sunt specializat in recomandari si informatii "
            "despre carti, asa ca nu te pot ajuta cu "
            "intrebarea aceasta.\n\n"
            "Spune-mi ce genuri, teme sau tipuri de povesti "
            "iti plac si iti voi cauta o carte potrivita."
        )


    retrieved_books = search_books(
        user_question=cleaned_question,
        number_of_results=NUMBER_OF_RETRIEVED_BOOKS
    )

    if len(retrieved_books) == 0:
        return (
            "Error: No relevant books found "
            "for your request."
        )

    print()
    print("Relevant books retrieved via RAG:")

    for book in retrieved_books:
        print("-", book["title"])

  
    books_context = build_books_context(
        books=retrieved_books
    )

    input_text = (
        "CEREREA UTILIZATORULUI:\n"
        + cleaned_question
        + "\n\n"
        + "CARTILE DISPONIBILE:\n\n"
        + books_context
    )

    input_list = [
        {
            "role": "user",
            "content": input_text
        }
    ]

    if user_intent == BOOK_RECOMMENDATION:

        selection_instructions = (
            "Esti Smart Librarian, un asistent "
            "specializat in carti. "
            "Utilizatorul cere o recomandare. "
            "Analizeaza cererea si cartile din context. "
            "Alege o singura carte dintre cartile disponibile. "
            "Nu alege o carte care nu apare in context. "
            "Foloseste exact titlul cartii din context. "
            "Dupa ce ai ales cartea, apeleaza tool-ul "
            "get_summary_by_title folosind titlul exact. "
            "Nu inventa titluri. "
            "Nu oferi raspunsul final inainte "
            "de apelarea tool-ului."
        )

    elif user_intent == BOOK_INFO:

        selection_instructions = (
            "Esti Smart Librarian, un asistent "
            "specializat in carti. "
            "Utilizatorul cere informatii despre o carte. "
            "Identifica dintre cartile din context "
            "titlul despre care intreaba utilizatorul. "
            "Foloseste numai cartile din context. "
            "Foloseste exact titlul cartii. "
            "Apeleaza tool-ul get_summary_by_title "
            "pentru acel titlu. "
            "Nu inventa titluri. "
            "Nu oferi raspunsul final inainte "
            "de apelarea tool-ului."
        )

    openai_client = OpenAI()

    print()
    print("Sending the request to the GPT model to generate a recommendation.")
    print("The model will select a book and call the tool to get the complete summary.")

    try:
        first_response = openai_client.responses.create(
            model=CHAT_MODEL,
            instructions=selection_instructions,
            input=input_list,
            tools=BOOK_SUMMARY_TOOLS,
            tool_choice={
                "type": "function",
                "name": "get_summary_by_title"
            }
        )

    except Exception as error:
        print()
        print("An error occurred while sending the first request to OpenAI.")
        print(error)

        return (
            "Error: Could not generate recommendation. "
            "Check the terminal for details."
        )

    input_list = input_list + first_response.output

    tool_was_called = False

    for response_item in first_response.output:

        if response_item.type == "function_call":

            if response_item.name == "get_summary_by_title":

                tool_was_called = True
                print(response_item.name)

                try:
                    tool_arguments = json.loads(
                        response_item.arguments
                    )

                except json.JSONDecodeError as error:
                    print("Tools arguments could not be interpreted as JSON.")
                    print(error)

                    return (
                        "Error: Could not interpret the arguments "
                        "received for the tool."
                    )
    
                if "title" not in tool_arguments:
                    return (
                        "Error: The model called the tool, "
                        "but did not send the title."
                    )

                selected_title = tool_arguments["title"]

                print()
                print("Selected title received from the model:")
                print(selected_title)

                print()
                print("get_summary_by_title")

                full_summary = get_summary_by_title(
                    selected_title
                )


                tool_output = (
                    "Titlu selectat: "
                    + selected_title
                    + "\n\n"
                    + "Rezumat complet:\n"
                    + full_summary
                )

                input_list.append(
                    {
                        "type": "function_call_output",
                        "call_id": response_item.call_id,
                        "output": tool_output
                    }
                )


    if tool_was_called is False:
        return (
            "Modelul nu a apelat tool-ul "
            "get_summary_by_title."
        )

    if user_intent == BOOK_RECOMMENDATION:

        final_instructions = (
            "Construieste raspunsul final in limba romana. "
            "Utilizatorul a cerut o recomandare de carte. "
            "Recomanda cartea aleasa si explica in "
            "2 sau 3 propozitii de ce se potriveste. "
            "Apoi afiseaza rezumatul complet primit "
            "de la tool. "
            "Foloseste titlul exact. "
            "Nu inventa informatii. "
            "Nu folosi Markdown. "
            "Nu mentiona tool-ul, ChromaDB, embeddings "
            "sau procesul intern."
        )

    elif user_intent == BOOK_INFO:

        final_instructions = (
            "Construieste raspunsul final in limba romana. "
            "Utilizatorul a cerut informatii despre o carte. "
            "Raspunde direct despre cartea identificata. "
            "Mentioneaza titlul si autorul daca sunt disponibili. "
            "Apoi prezinta rezumatul complet primit de la tool. "
            "Nu spune 'Iti recomand' daca utilizatorul "
            "nu a cerut o recomandare. "
            "Nu inventa informatii. "
            "Nu folosi Markdown. "
            "Nu mentiona tool-ul, ChromaDB, embeddings "
            "sau procesul intern."
        )


    try:
        final_response = openai_client.responses.create(
            model=CHAT_MODEL,
            instructions=final_instructions,
            input=input_list,
            tools=BOOK_SUMMARY_TOOLS,
            tool_choice="none"
        )

    except Exception as error:
        print()
        print("A aparut o eroare la cererea finala OpenAI.")
        print(error)

        return (
            "Tool worked but could not generate the final response."
        )

    final_answer = final_response.output_text

    if final_answer is None:
        return "Modelul nu a returnat un raspuns final."


    return final_answer