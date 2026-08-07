import os
from pathlib import Path

from openai import OpenAI


TTS_MODEL = "gpt-4o-mini-tts"

DEFAULT_TTS_VOICE = "coral"

ALLOWED_TTS_VOICES = [
    "coral",
    "marin",
    "cedar",
    "nova"
]


AUDIO_FOLDER_PATH = Path(
    "backend/generated_audio"
)

AUDIO_FILE_PATH = (
    AUDIO_FOLDER_PATH
    / "smart_librarian_recommendation.mp3"
)


def create_audio_file(text, voice=DEFAULT_TTS_VOICE):
   
    if text is None:
        raise ValueError(
            "Textul pentru audio nu a fost primit."
        )

    cleaned_text = text.strip()

    if cleaned_text == "":
        raise ValueError(
            "Textul pentru audio nu poate fi gol."
        )


    if voice is None:
        cleaned_voice = DEFAULT_TTS_VOICE
    else:
        cleaned_voice = voice.strip().lower()


    if cleaned_voice not in ALLOWED_TTS_VOICES:
        raise ValueError(
            "Vocea TTS primita nu este permisa."
        )


    api_key = os.getenv(
        "OPENAI_API_KEY"
    )

    if api_key is None:
        raise RuntimeError(
            "Variabila OPENAI_API_KEY nu exista."
        )

    if api_key.strip() == "":
        raise RuntimeError(
            "Variabila OPENAI_API_KEY este goala."
        )


    AUDIO_FOLDER_PATH.mkdir(
        parents=True,
        exist_ok=True
    )


    openai_client = OpenAI()


    with (
        openai_client.audio.speech
        .with_streaming_response.create(
            model=TTS_MODEL,
            voice=cleaned_voice,
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


    return AUDIO_FILE_PATH