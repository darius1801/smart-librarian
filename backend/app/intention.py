import os

from openai import OpenAI


INTENT_MODEL = "gpt-5-nano"

BOOK_RECOMMENDATION = "BOOK_RECOMMENDATION"
BOOK_INFO = "BOOK_INFO"
OTHER = "OTHER"


def classify_user_intent(message):
    

    if message is None:
        return OTHER

    cleaned_message = message.strip()

    if cleaned_message == "":
        return OTHER


    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        print(
            "Eroare: OPENAI_API_KEY nu exista "
            "pentru intent classifier."
        )

        return OTHER

    if api_key.strip() == "":
        print(
            "Eroare: OPENAI_API_KEY este goala "
            "pentru intent classifier."
        )

        return OTHER

    openai_client = OpenAI()

    instructions = (
        "Clasifica mesajul utilizatorului pentru aplicatia "
        "Smart Librarian. "
        "Aplicatia este specializata numai in carti. "
        "\n\n"
        "Ai exact trei categorii:"
        "\n"
        "BOOK_RECOMMENDATION = utilizatorul cere o recomandare "
        "de carte, descrie ce fel de carte cauta, spune teme, "
        "genuri, atmosfera sau preferinte de lectura."
        "\n"
        "BOOK_INFO = utilizatorul cere informatii despre o carte "
        "sau despre un titlu concret."
        "\n"
        "OTHER = mesajul nu este despre recomandari de carti "
        "si nu cere informatii despre o carte."
        "\n\n"
        "Exemple:"
        "\n"
        "Vreau ceva despre magie si prietenie "
        "-> BOOK_RECOMMENDATION"
        "\n"
        "Ce imi recomanzi daca iubesc povestile fantastice? "
        "-> BOOK_RECOMMENDATION"
        "\n"
        "Ce este 1984? "
        "-> BOOK_INFO"
        "\n"
        "Spune-mi despre The Hobbit. "
        "-> BOOK_INFO"
        "\n"
        "Care este vremea azi? "
        "-> OTHER"
        "\n"
        "Scrie-mi cod Python. "
        "-> OTHER"
        "\n"
        "Cat face 25 ori 18? "
        "-> OTHER"
        "\n\n"
        "Raspunde NUMAI cu unul dintre aceste trei texte:"
        "\n"
        "BOOK_RECOMMENDATION"
        "\n"
        "BOOK_INFO"
        "\n"
        "OTHER"
        "\n"
        "Nu adauga explicatii."
    )


    try:
        response = openai_client.responses.create(
            model=INTENT_MODEL,
            instructions=instructions,
            input=cleaned_message
        )

    except Exception as error:
        print()
        print("Eroare la clasificarea intentiei:")
        print(error)

        return OTHER

    intent = response.output_text

    if intent is None:
        return OTHER

    cleaned_intent = intent.strip().upper()


    if cleaned_intent == BOOK_RECOMMENDATION:
        return BOOK_RECOMMENDATION

    if cleaned_intent == BOOK_INFO:
        return BOOK_INFO

    if cleaned_intent == OTHER:
        return OTHER

    print(
        "Intent necunoscut primit de la model:",
        cleaned_intent
    )

    return OTHER