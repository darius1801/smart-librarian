# Smart Librarian

Smart Librarian is a chatbot project for book recommendations.

The main idea is simple: the user describes what kind of book they are looking for, the application performs a semantic search in the local book database, selects a recommendation, and then uses a separate tool to retrieve the full summary of the book.

The project uses React for the frontend and FastAPI for the backend.

## What the application can do

* recommend books based on themes, genres, or preferences;
* answer questions about books available in the library, for example `What is 1984?`;
* reject questions that are unrelated to books;
* use RAG with ChromaDB for semantic search;
* use tool calling for `get_summary_by_title()`;
* locally block certain messages containing inappropriate language;
* convert responses into audio;
* generate an image inspired by the recommended book;
* record the user's voice and convert audio into text;
* store conversations in `localStorage`;
* provide New Chat, Recent Chats, and Settings functionality;
* allow the user to choose the Text-to-Speech voice.

The application is designed for desktop use. A mobile version and a login/register system have not been implemented.

---

## Technologies used

### Backend

* Python
* FastAPI
* OpenAI API
* ChromaDB

### Frontend

* React
* Vite
* JavaScript
* CSS
* lucide-react for icons

### Models used in the project

* `text-embedding-3-small` - embeddings for semantic search;
* `gpt-4o-mini` - book recommendation and main response generation;
* `gpt-5-nano` - user intent classification;
* `gpt-4o-mini-tts` - Text to Speech;
* `gpt-4o-mini-transcribe` - Speech to Text;
* `gpt-image-2` - image generation.

If the models are changed later in the code, this list should be updated.

---

## Main project structure

```text
smart-librarian/
|
|-- backend/
|   |-- app/
|   |   |-- main.py
|   |   |-- retrieval.py
|   |   |-- rag_chat.py
|   |   |-- tool_chat.py
|   |   |-- book_tools.py
|   |   |-- safety.py
|   |   |-- intent_classifier.py
|   |   |-- tts_service.py
|   |   |-- image_service.py
|   |   |-- transcription_service.py
|   |
|   |-- data/
|   |   |-- book_summaries.json
|   |
|   |-- scripts/
|       |-- test files
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Sidebar.jsx
|   |   |   |-- WelcomeScreen.jsx
|   |   |   |-- ChatInput.jsx
|   |   |   |-- MessageList.jsx
|   |   |   |-- Settings.jsx / SettingsModal.jsx
|   |   |
|   |   |-- App.jsx
|   |   |-- App.css
|   |   |-- index.css
|   |   |-- main.jsx
|   |
|   |-- package.json
|   |-- package-lock.json
|
|-- .env
|-- .gitignore
|-- requirements.txt
|-- README.md
```

The name of the Settings component must match the import used in `App.jsx`. In the current version, it can be `Settings.jsx` if the import is `./components/Settings`.

---

# Backend - what each file does

## `backend/app/main.py`

This is the main entry point of the FastAPI backend.

The following object is created here:

```python
app = FastAPI(...)
```

The endpoints used by React are also defined in this file.

The most important ones are:

* `GET /health` - checks whether the backend is running;
* `POST /api/chat` - sends a question to the chatbot;
* `POST /api/tts` - converts text into audio;
* `POST /api/generate-image` - generates an image;
* `POST /api/transcribe` - converts an audio recording into text.

This file also contains simple Pydantic classes for requests and responses, for example:

* `ChatRequest` - receives the user's message;
* `ChatResponse` - returns the chatbot response and information about whether media can be generated;
* `TextToSpeechRequest` - receives the text and selected voice for TTS;
* `ImageGenerationRequest` - receives the text used for image generation;
* `TranscriptionResponse` - returns the text obtained through Speech to Text.

`main.py` also configures CORS so that the React frontend running on port 5173 can communicate with FastAPI running on port 8000.

## `backend/app/retrieval.py`

This file handles semantic search in ChromaDB.

The main function is:

```python
search_books(...)
```

The flow is:

```text
user question
        |
        v
OpenAI embeddings
        |
        v
vector representation of the question
        |
        v
ChromaDB
        |
        v
most similar books
```

The embedding model used in the project is `text-embedding-3-small`.

## `backend/app/rag_chat.py`

This file contains the logic used to build the RAG context.

The important function is:

```python
build_books_context(...)
```

It transforms the books retrieved from ChromaDB into text that can be sent to the model.

The file also contains the simple RAG-based recommendation version used during development.

## `backend/app/book_tools.py`

This file contains the tool required by the project:

```python
get_summary_by_title(title)
```

The function reads `book_summaries.json`, searches for the exact book title, and returns the complete summary.

This function is registered as a tool for the OpenAI model in `tool_chat.py`.

## `backend/app/tool_chat.py`

This is one of the most important files in the project.

It connects:

* the safety filter;
* the intent classifier;
* RAG;
* the GPT model;
* tool calling;
* the complete book summary.

The main flow is approximately:

```text
user message
      |
      v
safety filter
      |
      v
intent classifier
      |
      +---- OTHER ----> polite refusal
      |
      v
retrieval from ChromaDB
      |
      v
RAG context
      |
      v
OpenAI
      |
      v
get_summary_by_title()
      |
      v
final response
```

The intents used are:

```text
BOOK_RECOMMENDATION
BOOK_INFO
OTHER
```

`BOOK_RECOMMENDATION` is used for recommendation requests.

`BOOK_INFO` is used for questions such as `What is 1984?`.

`OTHER` is used for topics such as weather, mathematics, programming, etc.

There is also a version that returns metadata for the API, such as `can_generate_media`, so that the audio and image buttons are not displayed for off-topic responses.

## `backend/app/intent_classifier.py`

This file classifies the user's message into one of three categories:

```text
BOOK_RECOMMENDATION
BOOK_INFO
OTHER
```

A small model is used for this classification because the task is relatively simple.

Examples:

```text
I want something about magic.
-> BOOK_RECOMMENDATION

What is Dune?
-> BOOK_INFO

What is the weather today?
-> OTHER
```

## `backend/app/safety.py`

This file contains the local filter for inappropriate language.

An important aspect is that the filter runs before the message reaches the model.

If a blocked word is detected, the application returns a polite response without performing retrieval or sending the main request to the model.

## `backend/app/tts_service.py`

This file handles Text to Speech.

It receives:

```text
text + voice
```

and generates an MP3 file in:

```text
backend/generated_audio/
```

From Settings, the user can select one of the voices included in the project, such as Coral, Marin, Cedar, or Nova.

The generated audio folder is ignored by Git.

## `backend/app/image_service.py`

This file handles the generation of an illustration inspired by the book.

The frontend sends the response about the book, the backend builds a prompt, and then uses the image generation model.

The image is stored temporarily/locally in:

```text
backend/generated_images/
```

The folder is ignored by Git.

## `backend/app/transcription_service.py`

This file handles Speech to Text.

React records the user's microphone input and sends the audio file to FastAPI. This service then sends the file to the transcription model.

The result is the text that appears in the composer.

The audio file used for transcription is temporary and is deleted after processing.

---

# Important scripts

## `backend/scripts/ingest_books.py`

This script reads the books from:

```text
backend/data/book_summaries.json
```

generates embeddings, and stores them in ChromaDB.

This script must be run during the initial project setup or if the Chroma database is deleted.

## `backend/scripts/search_books.py`

A simple script used for directly testing semantic search.

## `backend/scripts/chat_cli.py`

Allows the chatbot to be used directly from the terminal without React.

It is useful for testing the backend independently from the frontend.

## `test_*.py` scripts

These scripts were used during development to independently test:

* the summary tool;
* retrieval;
* the safety filter;
* the intent classifier;
* other backend components.

---

# Frontend - what each component does

## `frontend/src/App.jsx`

This is the main React component.

The main application state is stored here:

* the message in the composer;
* the list of chats;
* the active chat;
* loading state;
* generated audio and images;
* Speech to Text;
* Settings.

The `fetch()` calls to FastAPI are also handled here.

Conversations are stored in `localStorage` for Guest Mode.

## `Sidebar.jsx`

Contains the menu on the left side.

It includes:

* Smart Librarian;
* New Chat;
* Recent Chats;
* Settings;
* Guest Mode.

When an older chat is selected, `Sidebar` sends its ID to `App.jsx`.

## `WelcomeScreen.jsx`

This is the screen displayed when there is no active chat.

It contains:

* the Smart Librarian greeting;
* the application description;
* example questions;
* suggestion cards for topics such as magic, dystopia, war, or survival.

## `ChatInput.jsx`

This is the area where the user writes a message.

It contains:

* textarea;
* Send button;
* microphone button;
* recording and transcription states.

Commands:

```text
Enter          -> send message
Shift + Enter  -> new line
```

## `MessageList.jsx`

Displays the conversation messages.

For valid book-related responses, it can display:

* `Listen` button;
* `Visualize` button;
* audio player;
* generated image.

Auto-scroll to the latest message is also handled here.

## `Settings.jsx` / `SettingsModal.jsx`

Contains the Settings modal.

Current settings include:

* Text-to-Speech voice;
* enabling/disabling chat history storage;
* deleting local chat history.

The settings are stored separately in `localStorage`.

## `App.css`

Contains the application styles.

The design is made for desktop and uses a dark theme with purple accents.

There is currently no mobile version of the project.

---

# How a normal request works

Example:

```text
I want a book about freedom and social control.
```

Flow:

```text
React
  |
  v
POST /api/chat
  |
  v
FastAPI
  |
  v
Safety Filter
  |
  v
Intent Classifier
  |
  v
OpenAI Embeddings
  |
  v
ChromaDB
  |
  v
Top relevant books
  |
  v
GPT + RAG context
  |
  v
Tool call: get_summary_by_title()
  |
  v
Complete summary
  |
  v
Final response
  |
  v
React
```

---

# Project installation

The commands below are intended for Windows PowerShell.

## 1. Open the project

In the terminal, you should be inside the folder:

```text
smart-librarian
```

Example:

```powershell
cd "C:\path\to\smart-librarian"
```

## 2. Create a virtual environment

If `.venv` does not already exist:

```powershell
py -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Install Python dependencies

```powershell
py -m pip install -r requirements.txt
```

`requirements.txt` should contain at least the dependencies used by the backend, for example:

```text
openai
chromadb
fastapi
uvicorn
python-multipart
```

## 4. Create the `.env` file

The project root must contain:

```text
.env
```

with the following variable:

```text
OPENAI_API_KEY=your_openai_api_key
```

Do not upload `.env` to Git.

The file should be included in `.gitignore`.

## 5. Install the frontend

From the project root:

```powershell
cd frontend
npm.cmd install
```

Then return to the project root:

```powershell
cd ..
```

---

# Initializing ChromaDB

During the first run, embeddings must be created for the books stored in the JSON file.

From the project root, with `.venv` activated:

```powershell
py -m backend.scripts.ingest_books
```

This command creates the local Chroma database in:

```text
backend/chroma_data/
```

The folder is ignored by Git.

If the Chroma database is deleted, run the ingestion command again.

---

# Running the application

You need two terminals.

## Terminal 1 - Backend

From the project root:

```powershell
.\.venv\Scripts\Activate.ps1
```

Start FastAPI:

```powershell
py -m uvicorn backend.app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Swagger / endpoint documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Terminal 2 - Frontend

From the project root:

```powershell
cd frontend
npm.cmd run dev
```

Vite will display the application address, usually:

```text
http://localhost:5173
```

Open this address in your browser.

---

# Short version for running the project

If the project is already installed and ChromaDB has been initialized:

### Backend terminal

```powershell
.\.venv\Scripts\Activate.ps1
py -m uvicorn backend.app.main:app --reload
```

### Frontend terminal

```powershell
cd frontend
npm.cmd run dev
```

Then open:

```text
http://localhost:5173
```

---

# Running only from the terminal

The chatbot can also be tested without React:

```powershell
.\.venv\Scripts\Activate.ps1
py -m backend.scripts.chat_cli
```

To exit:

```text
exit
```

or:

```text
quit
```

---

# Frontend build

To verify that the frontend compiles correctly:

```powershell
cd frontend
npm.cmd run build
```

If everything is correct, Vite creates:

```text
frontend/dist/
```

This folder should not be uploaded to Git.

---

# Example questions

```text
I want a book about freedom and social control.
```

```text
What would you recommend if I love fantasy stories?
```

```text
I want something about magic, friendship, and adventure.
```

```text
I want a story about war, trauma, and friendship.
```

```text
I want a book about survival and science.
```

```text
What is 1984?
```

```text
Tell me about Dune.
```

Off-topic example:

```text
What is the weather today?
```

Smart Librarian should explain that it can only help with books.

---

# Speech to Text

For voice input:

1. press the microphone button;
2. allow the browser to access the microphone;
3. speak;
4. press Stop;
5. wait for the transcription;
6. the text will appear in the composer;
7. review the text and press Send.

If the microphone does not work, check the browser permissions for `localhost`.

---

# Text to Speech

After receiving a valid response about a book, press:

```text
Listen
```

The backend generates an audio file and React displays the audio player.

The voice can be changed from Settings.

---

# Image Generation

After receiving a valid response about a book, press:

```text
Visualize
```

The application generates an illustration inspired by the book and displays it below the response.

Image generation may take longer than generating a text response.

---

# Local data

The application works in Guest Mode.

Chat history is stored in the browser using:

```text
localStorage
```

The main keys are:

```text
smartLibrarianChats
smartLibrarianSettings
```

From Settings, the user can:

* disable chat history storage;
* delete all local conversations;
* change the TTS voice.

There is no account database and there is no login/register system in the current version.

---

# Files and folders that should not be uploaded to Git

`.gitignore` should ignore at least:

```text
.env
.venv/
backend/chroma_data/
backend/generated_audio/
backend/generated_images/
frontend/node_modules/
frontend/dist/
__pycache__/
```

---

# Common issues

## `npm` does not work in PowerShell

For this project, use:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

instead of the standard `npm` commands.

## The frontend says it cannot communicate with the backend

Check whether the following command is running:

```powershell
py -m uvicorn backend.app.main:app --reload
```

and try opening:

```text
http://127.0.0.1:8000/health
```

## Books cannot be found / ChromaDB issue

Run again:

```powershell
py -m backend.scripts.ingest_books
```

## API key error

Check whether `.env` exists and whether the `OPENAI_API_KEY` variable is set.

Do not place the key directly in the source code and do not upload `.env` to Git.

## The microphone does not work

Check the microphone permission in the browser and make sure you are using the application through `localhost`.

---

# In short

The main part of the project is:

```text
RAG with ChromaDB
+
OpenAI embeddings
+
GPT
+
tool calling with get_summary_by_title()
```

On top of this core functionality, the following features were added:

```text
React UI
Chat History
Settings
Intent Classification
Safety Filter
Text to Speech
Speech to Text
Image Generation
```

The goal of the project is not only for it to work, but also for its architecture and workflow to be easy to explain.

The most important flow to remember is:

```text
User -> React -> FastAPI -> Safety -> Intent -> Embeddings -> ChromaDB -> GPT -> Tool -> Response
```
