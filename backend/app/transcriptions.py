import os
from pathlib import Path

from openai import OpenAI


TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe"

TEMP_AUDIO_FOLDER_PATH = Path(
    "backend/generated_audio"
)

ALLOWED_AUDIO_EXTENSIONS = [
    ".webm",
    ".wav",
    ".mp3",
    ".m4a",
    ".mp4",
    ".mpeg",
    ".mpga"
]


def transcribe_audio_bytes(
    audio_bytes,
    original_filename
):

    if audio_bytes is None:
        raise ValueError(
            "Fisierul audio nu a fost primit."
        )

    if len(audio_bytes) == 0:
        raise ValueError(
            "Fisierul audio este gol."
        )

    if original_filename is None:
        raise ValueError(
            "Numele fisierului audio nu a fost primit."
        )

    file_extension = Path(
        original_filename
    ).suffix.lower()


    if file_extension not in ALLOWED_AUDIO_EXTENSIONS:
        raise ValueError(
            "Formatul fisierului audio nu este suportat."
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


    TEMP_AUDIO_FOLDER_PATH.mkdir(
        parents=True,
        exist_ok=True
    )


    temporary_file_path = (
        TEMP_AUDIO_FOLDER_PATH
        / (
            "user_voice_input"
            + file_extension
        )
    )

    temporary_file = open(
        temporary_file_path,
        mode="wb"
    )

    temporary_file.write(
        audio_bytes
    )

    temporary_file.close()


    try:
        openai_client = OpenAI()


        audio_file = open(
            temporary_file_path,
            mode="rb"
        )


        transcription = (
            openai_client.audio.transcriptions.create(
                model=TRANSCRIPTION_MODEL,
                file=audio_file
            )
        )


        audio_file.close()

        transcription_text = (
            transcription.text
        )

        if transcription_text is None:
            raise RuntimeError(
                "OpenAI nu a returnat text transcris."
            )


        cleaned_text = (
            transcription_text.strip()
        )

        if cleaned_text == "":
            raise RuntimeError(
                "Transcrierea primita este goala."
            )


        return cleaned_text


    finally:

        if temporary_file_path.exists():
            temporary_file_path.unlink()