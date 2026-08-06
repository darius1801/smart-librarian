from fastapi import FastAPI
from pydantic import BaseModel

from backend.app.tool_chat import recommend_book_with_summary


app = FastAPI(
    title="Smart Librarian API",
    description=(
        "API pentru recomandarea cartilor "
        "folosind RAG si OpenAI tool calling."
    ),
    version="1.0.0"
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str


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