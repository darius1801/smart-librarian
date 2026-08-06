import os
from pathlib import Path

from openai import OpenAI


TTS_MODEL = "gpt-4o-mini-tts"
TTS_VOICE = "coral"

AUDIO_FOLDER_PATH = Path(
    "backend/generated_audio"
)

AUDIO_FILE_PATH = (
    AUDIO_FOLDER_PATH
    / "smart_librarian_recommendation.mp3"
)


def create_audio_file(text):
    """
    Transforma un text intr-un fisier audio MP3.

    Parametru:
        text:
            Textul care trebuie citit.

    Returneaza:
        Calea catre fisierul audio generat.
    """

    # ---------------------------------------------------------
    # PASUL 1: Verificam textul.
    # ---------------------------------------------------------

    if text is None:
        raise ValueError(
            "Textul pentru audio nu a fost primit."
        )

    cleaned_text = text.strip()

    if cleaned_text == "":
        raise ValueError(
            "Textul pentru audio nu poate fi gol."
        )

    # ---------------------------------------------------------
    # PASUL 2: Verificam cheia OpenAI.
    # ---------------------------------------------------------

    api_key = os.getenv("OPENAI_API_KEY")

    if api_key is None:
        raise RuntimeError(
            "Variabila OPENAI_API_KEY nu exista."
        )

    if api_key.strip() == "":
        raise RuntimeError(
            "Variabila OPENAI_API_KEY este goala."
        )

    # ---------------------------------------------------------
    # PASUL 3: Cream folderul audio.
    # ---------------------------------------------------------

    AUDIO_FOLDER_PATH.mkdir(
        parents=True,
        exist_ok=True
    )

    # ---------------------------------------------------------
    # PASUL 4: Cream clientul OpenAI.
    # ---------------------------------------------------------

    openai_client = OpenAI()

    # ---------------------------------------------------------
    # PASUL 5: Generam fisierul audio.
    # ---------------------------------------------------------

    with (
        openai_client.audio.speech
        .with_streaming_response.create(
            model=TTS_MODEL,
            voice=TTS_VOICE,
            input=cleaned_text,
            instructions=(
                "Vorbeste clar, calm si prietenos. "
                "Citeste textul in limba romana, "
                "cu un ritm natural."
            )
        )
    ) as response:
        response.stream_to_file(
            AUDIO_FILE_PATH
        )

    # ---------------------------------------------------------
    # PASUL 6: Returnam calea fisierului.
    # ---------------------------------------------------------

    return AUDIO_FILE_PATH