import base64
import os
from pathlib import Path

from openai import OpenAI


IMAGE_MODEL = "gpt-image-2"

IMAGE_FOLDER_PATH = Path(
    "backend/generated_images"
)

IMAGE_FILE_PATH = (
    IMAGE_FOLDER_PATH
    / "smart_librarian_book_image.png"
)


def create_book_image(recommendation_text):
    """
    Genereaza o imagine inspirata de recomandarea unei carti.

    Parametru:
        recommendation_text:
            Recomandarea si rezumatul cartii.

    Returneaza:
        Calea catre fisierul PNG generat.
    """

    # ---------------------------------------------------------
    # PASUL 1: Verificam textul primit.
    # ---------------------------------------------------------

    if recommendation_text is None:
        raise ValueError(
            "Textul pentru imagine nu a fost primit."
        )

    cleaned_text = recommendation_text.strip()

    if cleaned_text == "":
        raise ValueError(
            "Textul pentru imagine nu poate fi gol."
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
    # PASUL 3: Cream folderul pentru imagini.
    # ---------------------------------------------------------

    IMAGE_FOLDER_PATH.mkdir(
        parents=True,
        exist_ok=True
    )

    # ---------------------------------------------------------
    # PASUL 4: Construim promptul pentru imagine.
    # ---------------------------------------------------------

    image_prompt = (
        "Creeaza o ilustratie originala si atmosferica "
        "inspirata de recomandarea de carte de mai jos. "
        "Imaginea trebuie sa reprezinte temele, decorul si "
        "atmosfera povestii. "
        "Nu reproduce o coperta oficiala existenta. "
        "Nu include titlul cartii, numele autorului, logo-uri, "
        "watermark-uri sau text lizibil. "
        "Foloseste o compozitie patrata si un stil de "
        "ilustratie digitala potrivit pentru o aplicatie "
        "moderna despre carti."
        "\n\n"
        "RECOMANDAREA CARTII:"
        "\n"
        + cleaned_text
    )

    # ---------------------------------------------------------
    # PASUL 5: Cream clientul OpenAI.
    # ---------------------------------------------------------

    openai_client = OpenAI()

    # ---------------------------------------------------------
    # PASUL 6: Cerem generarea imaginii.
    # ---------------------------------------------------------

    image_result = openai_client.images.generate(
        model=IMAGE_MODEL,
        prompt=image_prompt,
        size="1024x1024",
        quality="low"
    )

    # ---------------------------------------------------------
    # PASUL 7: Verificam raspunsul primit.
    # ---------------------------------------------------------

    if len(image_result.data) == 0:
        raise RuntimeError(
            "OpenAI nu a returnat nicio imagine."
        )

    image_base64 = image_result.data[0].b64_json

    if image_base64 is None:
        raise RuntimeError(
            "Imaginea primita nu contine date Base64."
        )

    # ---------------------------------------------------------
    # PASUL 8: Transformam Base64 in bytes.
    # ---------------------------------------------------------

    image_bytes = base64.b64decode(
        image_base64
    )

    # ---------------------------------------------------------
    # PASUL 9: Salvam imaginea local.
    # ---------------------------------------------------------

    image_file = open(
        IMAGE_FILE_PATH,
        mode="wb"
    )

    image_file.write(
        image_bytes
    )

    image_file.close()

    # ---------------------------------------------------------
    # PASUL 10: Returnam calea imaginii.
    # ---------------------------------------------------------

    return IMAGE_FILE_PATH