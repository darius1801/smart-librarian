from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.app.tool_chat import recommend_book_with_summary
from backend.app.text_to_speech import create_audio_file
from backend.app.image import create_book_image

app = FastAPI(
    title="Smart Librarian API",
    description=(
        "API pentru recomandarea cartilor "
        "folosind RAG si OpenAI tool calling."
    ),
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=[
        "GET",
        "POST"
    ],
    allow_headers=[
        "Content-Type"
    ]
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str

class TextToSpeechRequest(BaseModel):
    text: str    

class ImageGenerationRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {
        "message": "Smart Librarian API functioneaza."
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


@app.post(
    "/api/chat",
    response_model=ChatResponse
)
def chat(chat_request: ChatRequest):
    user_message = chat_request.message

    answer = recommend_book_with_summary(
        user_question=user_message
    )

    response_data = {
        "answer": answer
    }

    return response_data

@app.post("/api/tts")
def text_to_speech(
    speech_request: TextToSpeechRequest
):
    """
    Primeste text si returneaza
    un fisier audio MP3.
    """

    text = speech_request.text

    try:
        audio_file_path = create_audio_file(
            text=text
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print()
        print("Eroare la generarea audio:")
        print(error)

        raise HTTPException(
            status_code=500,
            detail=(
                "Nu am putut genera "
                "fisierul audio."
            )
        )

    return FileResponse(
        path=audio_file_path,
        media_type="audio/mpeg",
        filename=(
            "smart-librarian-recommendation.mp3"
        )
    )

@app.post("/api/generate-image")
def generate_book_image(
    image_request: ImageGenerationRequest
):
    """
    Primeste recomandarea unei carti si returneaza
    o imagine PNG inspirata de aceasta.
    """

    recommendation_text = image_request.text

    try:
        image_file_path = create_book_image(
            recommendation_text=recommendation_text
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print()
        print("Eroare la generarea imaginii:")
        print(error)

        raise HTTPException(
            status_code=500,
            detail=(
                "Nu am putut genera imaginea."
            )
        )

    return FileResponse(
        path=image_file_path,
        media_type="image/png",
        filename="smart-librarian-book-image.png"
    )