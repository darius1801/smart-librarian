# Smart Librarian

Smart Librarian este un proiect de chatbot pentru recomandari de carti.

Ideea principala este simpla: utilizatorul spune ce fel de carte cauta, aplicatia cauta semantic in baza locala de carti, alege o recomandare si apoi foloseste un tool separat pentru a lua rezumatul complet al cartii.

Proiectul foloseste React pentru frontend si FastAPI pentru backend.

## Ce poate face aplicatia

- recomanda carti dupa teme, genuri sau preferinte;
- raspunde la intrebari despre cartile din biblioteca, de exemplu `Ce este 1984?`;
- refuza intrebarile care nu au legatura cu cartile;
- foloseste RAG cu ChromaDB pentru cautare semantica;
- foloseste tool calling pentru `get_summary_by_title()`;
- blocheaza local unele mesaje cu limbaj nepotrivit;
- poate transforma raspunsul in audio;
- poate genera o imagine inspirata de cartea recomandata;
- poate inregistra vocea utilizatorului si transforma audio in text;
- pastreaza conversatiile in `localStorage`;
- are New Chat, Recent Chats si Settings;
- permite alegerea vocii pentru Text to Speech.

Aplicatia este gandita pentru desktop. Nu am implementat varianta pentru telefon si nici sistem de login/register.

---

## Tehnologii folosite

### Backend

- Python
- FastAPI
- OpenAI API
- ChromaDB

### Frontend

- React
- Vite
- JavaScript
- CSS
- lucide-react pentru iconuri

### Modele folosite in proiect

- `text-embedding-3-small` - embeddings pentru cautarea semantica;
- `gpt-4o-mini` - recomandarea si raspunsul principal;
- `gpt-5-nano` - clasificarea intentiei utilizatorului;
- `gpt-4o-mini-tts` - Text to Speech;
- `gpt-4o-mini-transcribe` - Speech to Text;
- `gpt-image-2` - generarea imaginilor.

Daca modelele sunt schimbate ulterior in cod, aceasta lista trebuie actualizata.

---

## Structura principala a proiectului

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
|       |-- fisierele de test
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

Numele componentei Settings trebuie sa corespunda importului din `App.jsx`. In versiunea curenta poate fi `Settings.jsx` daca importul este `./components/Settings`.

---

# Backend - ce face fiecare fisier

## `backend/app/main.py`

Acesta este punctul principal al backendului FastAPI.

Aici este creat obiectul:

```python
app = FastAPI(...)
```

Tot aici sunt definite endpointurile folosite de React.

Cele mai importante sunt:

- `GET /health` - verifica daca backendul functioneaza;
- `POST /api/chat` - trimite o intrebare catre chatbot;
- `POST /api/tts` - transforma textul in audio;
- `POST /api/generate-image` - genereaza o imagine;
- `POST /api/transcribe` - transforma o inregistrare audio in text.

In acest fisier exista si clase Pydantic simple pentru requesturi si raspunsuri, de exemplu:

- `ChatRequest` - primeste mesajul utilizatorului;
- `ChatResponse` - returneaza raspunsul chatbotului si informatia daca pot fi generate media;
- `TextToSpeechRequest` - primeste textul si vocea pentru TTS;
- `ImageGenerationRequest` - primeste textul folosit pentru generarea imaginii;
- `TranscriptionResponse` - returneaza textul obtinut din Speech to Text.

`main.py` configureaza si CORS pentru ca frontendul React de pe portul 5173 sa poata comunica cu FastAPI de pe portul 8000.

## `backend/app/retrieval.py`

Aici se face cautarea semantica in ChromaDB.

Functia principala este:

```python
search_books(...)
```

Flow-ul este:

```text
intrebarea utilizatorului
        |
        v
OpenAI embeddings
        |
        v
vector pentru intrebare
        |
        v
ChromaDB
        |
        v
cele mai apropiate carti
```

Modelul de embeddings folosit in proiect este `text-embedding-3-small`.

## `backend/app/rag_chat.py`

Contine logica folosita pentru construirea contextului RAG.

Functia importanta este:

```python
build_books_context(...)
```

Ea transforma cartile recuperate din ChromaDB intr-un text care poate fi trimis modelului.

Fisierul contine si varianta simpla de recomandare prin RAG folosita in timpul dezvoltarii.

## `backend/app/book_tools.py`

Contine tool-ul cerut in proiect:

```python
get_summary_by_title(title)
```

Functia citeste `book_summaries.json`, cauta titlul exact si returneaza rezumatul complet.

Aceasta functie este inregistrata ca tool pentru modelul OpenAI in `tool_chat.py`.

## `backend/app/tool_chat.py`

Acesta este unul dintre cele mai importante fisiere din proiect.

Aici se leaga:

- safety filter;
- intent classifier;
- RAG;
- modelul GPT;
- tool calling;
- rezumatul complet.

Flow-ul principal este aproximativ:

```text
mesaj utilizator
      |
      v
safety filter
      |
      v
intent classifier
      |
      +---- OTHER ----> refuz politicos
      |
      v
retrieval din ChromaDB
      |
      v
context RAG
      |
      v
OpenAI
      |
      v
get_summary_by_title()
      |
      v
raspuns final
```

Intentiile folosite sunt:

```text
BOOK_RECOMMENDATION
BOOK_INFO
OTHER
```

`BOOK_RECOMMENDATION` este pentru cereri de recomandare.

`BOOK_INFO` este pentru intrebari de tipul `Ce este 1984?`.

`OTHER` este pentru lucruri precum vreme, matematica, programare etc.

Exista si o varianta care returneaza metadata pentru API, de exemplu `can_generate_media`, astfel incat butoanele pentru audio si imagine sa nu apara la raspunsurile off-topic.

## `backend/app/intent_classifier.py`

Acest fisier clasifica mesajul utilizatorului in una dintre cele trei categorii:

```text
BOOK_RECOMMENDATION
BOOK_INFO
OTHER
```

Pentru aceasta clasificare este folosit un model mic, deoarece taskul este simplu.

Exemple:

```text
Vreau ceva despre magie.
-> BOOK_RECOMMENDATION

Ce este Dune?
-> BOOK_INFO

Care este vremea azi?
-> OTHER
```

## `backend/app/safety.py`

Contine filtrul local pentru limbaj nepotrivit.

Important este ca filtrul ruleaza inainte ca mesajul sa ajunga la model.

Daca este detectat un cuvant blocat, aplicatia returneaza un raspuns politicos fara sa faca retrieval sau requestul principal catre model.

## `backend/app/tts_service.py`

Se ocupa de Text to Speech.

Primeste:

```text
text + voice
```

si genereaza un fisier MP3 in:

```text
backend/generated_audio/
```

Din Settings utilizatorul poate alege una dintre vocile puse in proiect, de exemplu Coral, Marin, Cedar sau Nova.

Folderul cu audio generat este ignorat de Git.

## `backend/app/image_service.py`

Se ocupa de generarea unei ilustratii inspirate de carte.

Frontendul trimite raspunsul despre carte, backendul construieste un prompt si foloseste modelul de image generation.

Imaginea este salvata temporar/local in:

```text
backend/generated_images/
```

Folderul este ignorat de Git.

## `backend/app/transcription_service.py`

Se ocupa de Speech to Text.

React inregistreaza microfonul, trimite fisierul audio la FastAPI, iar acest serviciu trimite fisierul catre modelul de transcriere.

Rezultatul este textul care apare in composer.

Fisierul audio folosit pentru transcriere este temporar si este sters dupa procesare.

---

# Scripturi importante

## `backend/scripts/ingest_books.py`

Citeste cartile din:

```text
backend/data/book_summaries.json
```

genereaza embeddings si le salveaza in ChromaDB.

Acest script trebuie rulat la prima configurare a proiectului sau daca baza Chroma este stearsa.

## `backend/scripts/search_books.py`

Script simplu pentru testarea directa a cautarii semantice.

## `backend/scripts/chat_cli.py`

Permite folosirea chatbotului direct din terminal, fara React.

Este util pentru testarea backendului separat de frontend.

## Scripturile `test_*.py`

Au fost folosite pe parcursul dezvoltarii pentru a testa separat:

- tool-ul de rezumat;
- retrieval-ul;
- safety filter;
- intent classifier;
- alte componente backend.

---

# Frontend - ce face fiecare componenta

## `frontend/src/App.jsx`

Este componenta principala React.

Aici este pastrat state-ul principal al aplicatiei:

- mesajul din composer;
- lista de chat-uri;
- chat-ul activ;
- loading state;
- audio si imagini generate;
- Speech to Text;
- Settings.

Tot aici sunt apelurile `fetch()` catre FastAPI.

Conversațiile sunt pastrate in `localStorage` pentru modul Guest.

## `Sidebar.jsx`

Contine meniul din stanga.

Include:

- Smart Librarian;
- New Chat;
- Recent Chats;
- Settings;
- Guest Mode.

Cand este selectat un chat vechi, `Sidebar` trimite ID-ul catre `App.jsx`.

## `WelcomeScreen.jsx`

Este ecranul afisat atunci cand nu exista un chat activ.

Contine:

- salutul Smart Librarian;
- descrierea aplicatiei;
- exemple de intrebari;
- cardurile cu sugestii precum magie, distopie, razboi sau supravietuire.

## `ChatInput.jsx`

Este zona unde utilizatorul scrie mesajul.

Contine:

- textarea;
- buton Send;
- buton pentru microfon;
- starile de recording si transcription.

Comenzi:

```text
Enter          -> trimite mesajul
Shift + Enter  -> rand nou
```

## `MessageList.jsx`

Afiseaza mesajele conversatiei.

Pentru raspunsurile valide despre carti poate afisa:

- buton `Asculta`;
- buton `Vizualizeaza`;
- player audio;
- imaginea generata.

Tot aici se face si auto-scroll catre ultimul mesaj.

## `Settings.jsx` / `SettingsModal.jsx`

Contine modalul Settings.

Setarile actuale includ:

- vocea pentru Text to Speech;
- activarea/dezactivarea salvarii istoricului;
- stergerea istoricului local.

Setarile sunt salvate separat in `localStorage`.

## `App.css`

Contine stilurile aplicatiei.

Designul este facut pentru desktop si foloseste o tema dark cu accente mov.

Nu exista varianta mobile in proiect.

---

# Cum functioneaza un request normal

Exemplu:

```text
Vreau o carte despre libertate si control social.
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
Top carti relevante
  |
  v
GPT + context RAG
  |
  v
Tool call: get_summary_by_title()
  |
  v
Rezumat complet
  |
  v
Raspuns final
  |
  v
React
```

---

# Instalarea proiectului

Comenzile de mai jos sunt pentru Windows PowerShell.

## 1. Deschide proiectul

Din terminal trebuie sa fii in folderul:

```text
smart-librarian
```

Exemplu:

```powershell
cd "C:\cale\catre\smart-librarian"
```

## 2. Creeaza virtual environment

Daca `.venv` nu exista deja:

```powershell
py -m venv .venv
```

Activeaza-l:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Instaleaza dependintele Python

```powershell
py -m pip install -r requirements.txt
```

`requirements.txt` trebuie sa contina cel putin dependintele folosite de backend, de exemplu:

```text
openai
chromadb
fastapi
uvicorn
python-multipart
```

## 4. Creeaza fisierul `.env`

In radacina proiectului trebuie sa existe:

```text
.env
```

cu variabila:

```text
OPENAI_API_KEY=cheia_ta_openai
```

Nu urca `.env` pe Git.

Fisierul trebuie sa fie inclus in `.gitignore`.

## 5. Instaleaza frontendul

Din radacina proiectului:

```powershell
cd frontend
npm.cmd install
```

Apoi revino in proiect:

```powershell
cd ..
```

---

# Initializarea ChromaDB

La prima rulare trebuie create embeddings pentru cartile din JSON.

Din radacina proiectului, cu `.venv` activ:

```powershell
py -m backend.scripts.ingest_books
```

Aceasta comanda creeaza baza locala Chroma in:

```text
backend/chroma_data/
```

Folderul este ignorat de Git.

Daca baza Chroma este stearsa, ruleaza din nou comanda de ingestie.

---

# Cum se ruleaza aplicatia

Ai nevoie de doua terminale.

## Terminal 1 - Backend

Din radacina proiectului:

```powershell
.\.venv\Scripts\Activate.ps1
```

Porneste FastAPI:

```powershell
py -m uvicorn backend.app.main:app --reload
```

Backendul va fi disponibil la:

```text
http://127.0.0.1:8000
```

Swagger / documentatia endpointurilor:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Terminal 2 - Frontend

Din radacina proiectului:

```powershell
cd frontend
npm.cmd run dev
```

Vite va afisa adresa aplicatiei, in mod normal:

```text
http://localhost:5173
```

Deschide aceasta adresa in browser.

---

# Varianta scurta pentru rulare

Daca proiectul este deja instalat si ChromaDB este initializat:

### Terminal backend

```powershell
.\.venv\Scripts\Activate.ps1
py -m uvicorn backend.app.main:app --reload
```

### Terminal frontend

```powershell
cd frontend
npm.cmd run dev
```

Apoi:

```text
http://localhost:5173
```

---

# Rulare doar din terminal

Chatbotul poate fi testat si fara React:

```powershell
.\.venv\Scripts\Activate.ps1
py -m backend.scripts.chat_cli
```

Pentru iesire:

```text
exit
```

sau:

```text
quit
```

---

# Build frontend

Pentru a verifica daca frontendul se compileaza corect:

```powershell
cd frontend
npm.cmd run build
```

Daca totul este corect, Vite creeaza:

```text
frontend/dist/
```

Acest folder nu trebuie urcat pe Git.

---

# Exemple de intrebari

```text
Vreau o carte despre libertate si control social.
```

```text
Ce imi recomanzi daca iubesc povestile fantastice?
```

```text
Vreau ceva despre magie, prietenie si aventura.
```

```text
Vreau o poveste despre razboi, trauma si prietenie.
```

```text
Vreau o carte despre supravietuire si stiinta.
```

```text
Ce este 1984?
```

```text
Povesteste-mi despre Dune.
```

Exemplu off-topic:

```text
Care este vremea azi?
```

Smart Librarian ar trebui sa explice ca poate ajuta doar cu carti.

---

# Speech to Text

Pentru input vocal:

1. apasa butonul cu microfon;
2. permite browserului accesul la microfon;
3. vorbeste;
4. apasa Stop;
5. asteapta transcrierea;
6. textul apare in composer;
7. verifica textul si apasa Send.

Daca microfonul nu functioneaza, verifica permisiunile browserului pentru `localhost`.

---

# Text to Speech

Dupa un raspuns valid despre o carte, apasa:

```text
Asculta
```

Backendul genereaza un fisier audio, iar React afiseaza playerul.

Vocea poate fi schimbata din Settings.

---

# Image Generation

Dupa un raspuns valid despre o carte, apasa:

```text
Vizualizeaza
```

Aplicatia genereaza o ilustratie inspirata de carte si o afiseaza sub raspuns.

Generarea imaginii poate dura mai mult decat un raspuns text.

---

# Date locale

Aplicatia functioneaza in Guest Mode.

Istoricul chatului este salvat in browser folosind:

```text
localStorage
```

Cheile principale sunt:

```text
smartLibrarianChats
smartLibrarianSettings
```

Din Settings se poate:

- opri salvarea istoricului;
- sterge toate conversatiile locale;
- schimba vocea TTS.

Nu exista baza de date pentru conturi si nu exista login/register in versiunea curenta.

---

# Fisiere si foldere care nu trebuie urcate pe Git

`.gitignore` ar trebui sa ignore cel putin:

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

# Probleme comune

## `npm` nu functioneaza in PowerShell

Pe acest proiect folosim:

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
```

in loc de comenzile `npm` simple.

## Frontendul spune ca nu poate comunica cu backendul

Verifica daca ruleaza:

```powershell
py -m uvicorn backend.app.main:app --reload
```

si incearca:

```text
http://127.0.0.1:8000/health
```

## Nu gaseste carti / ChromaDB

Ruleaza din nou:

```powershell
py -m backend.scripts.ingest_books
```

## Eroare legata de API key

Verifica daca exista `.env` si daca variabila `OPENAI_API_KEY` este setata.

Nu pune cheia direct in cod si nu urca `.env` pe Git.

## Microfonul nu merge

Verifica permisiunea pentru microfon in browser si asigura-te ca folosesti aplicatia prin `localhost`.

---

# Pe scurt

Partea principala a proiectului este:

```text
RAG cu ChromaDB
+
OpenAI embeddings
+
GPT
+
tool calling cu get_summary_by_title()
```

Peste aceasta parte au fost adaugate:

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

Scopul proiectului nu este doar sa functioneze, ci sa poata fi explicat. Cel mai important flow de retinut este:

```text
User -> React -> FastAPI -> Safety -> Intent -> Embeddings -> ChromaDB -> GPT -> Tool -> Raspuns
```

