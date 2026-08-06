import { useState } from "react";

import "./App.css";


const API_BASE_URL = "http://127.0.0.1:8000";


const SAMPLE_QUESTIONS = [
    "Vreau o carte despre libertate si control social.",
    "Ce imi recomanzi daca iubesc povestile fantastice?",
    "Vreau o poveste despre razboi, trauma si prietenie.",
    "Caut o carte despre supravietuire si stiinta."
];


function App() {
    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        {
            sender: "assistant",
            text: (
                "Buna! Sunt Smart Librarian. " +
                "Descrie temele sau tipul de poveste care iti plac, " +
                "iar eu iti voi recomanda o carte."
            )
        }
    ]);

    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /*
    audioUrls pastreaza adresele locale pentru fisierele audio.

    Exemplu:
    {
        2: "blob:http://localhost:5173/..."
    }

    Cifra 2 reprezinta pozitia mesajului.
    */
    const [audioUrls, setAudioUrls] = useState({});

    /*
    imageUrls functioneaza la fel, dar pentru imagini.
    */
    const [imageUrls, setImageUrls] = useState({});

    /*
    Retinem pentru ce mesaj se genereaza momentan audio
    sau imagine.
    */
    const [
        audioLoadingIndex,
        setAudioLoadingIndex
    ] = useState(null);

    const [
        imageLoadingIndex,
        setImageLoadingIndex
    ] = useState(null);


    function handleMessageChange(event) {
        setMessage(event.target.value);
    }


    function handleExampleClick(question) {
        setMessage(question);
        setErrorMessage("");
    }


    function releaseGeneratedFiles() {
        /*
        Eliberam adresele temporare create de browser.
        */

        const audioIndexes = Object.keys(
            audioUrls
        );

        for (const audioIndex of audioIndexes) {
            URL.revokeObjectURL(
                audioUrls[audioIndex]
            );
        }

        const imageIndexes = Object.keys(
            imageUrls
        );

        for (const imageIndex of imageIndexes) {
            URL.revokeObjectURL(
                imageUrls[imageIndex]
            );
        }
    }


    function clearConversation() {
        releaseGeneratedFiles();

        setMessages([
            {
                sender: "assistant",
                text: (
                    "Conversatia a fost resetata. " +
                    "Spune-mi ce fel de carte cauti."
                )
            }
        ]);

        setMessage("");
        setErrorMessage("");
        setAudioUrls({});
        setImageUrls({});
        setAudioLoadingIndex(null);
        setImageLoadingIndex(null);
    }


    async function handleSubmit(event) {
        event.preventDefault();

        const cleanedMessage = message.trim();

        if (cleanedMessage === "") {
            setErrorMessage(
                "Te rog sa introduci o intrebare."
            );

            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        const userChatMessage = {
            sender: "user",
            text: cleanedMessage
        };

        const messagesAfterUser = messages.slice();

        messagesAfterUser.push(
            userChatMessage
        );

        setMessages(messagesAfterUser);
        setMessage("");

        try {
            const response = await fetch(
                API_BASE_URL + "/api/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: cleanedMessage
                    })
                }
            );

            if (response.ok === false) {
                throw new Error(
                    "Backendul a returnat o eroare."
                );
            }

            const responseData = await response.json();

            const assistantChatMessage = {
                sender: "assistant",
                text: responseData.answer
            };

            const messagesAfterAssistant =
                messagesAfterUser.slice();

            messagesAfterAssistant.push(
                assistantChatMessage
            );

            setMessages(
                messagesAfterAssistant
            );

        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Nu am putut comunica cu backendul. " +
                "Verifica daca serverul FastAPI este pornit."
            );

        } finally {
            setIsLoading(false);
        }
    }


    async function handleAudioClick(
        messageIndex,
        messageText
    ) {
        setErrorMessage("");
        setAudioLoadingIndex(messageIndex);

        try {
            const response = await fetch(
                API_BASE_URL + "/api/tts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text: messageText
                    })
                }
            );

            if (response.ok === false) {
                throw new Error(
                    "Backendul nu a putut genera audio."
                );
            }

            /*
            Raspunsul nu este JSON.
            Este un fisier audio binar.
            */
            const audioBlob = await response.blob();

            /*
            Cream o adresa temporara pe care elementul
            audio din browser o poate folosi.
            */
            const audioUrl = URL.createObjectURL(
                audioBlob
            );

            const updatedAudioUrls = Object.assign(
                {},
                audioUrls
            );

            /*
            Daca exista deja un audio pentru acest mesaj,
            eliberam URL-ul vechi.
            */
            if (
                updatedAudioUrls[messageIndex]
                !== undefined
            ) {
                URL.revokeObjectURL(
                    updatedAudioUrls[messageIndex]
                );
            }

            updatedAudioUrls[messageIndex] =
                audioUrl;

            setAudioUrls(
                updatedAudioUrls
            );

        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Nu am putut genera fisierul audio."
            );

        } finally {
            setAudioLoadingIndex(null);
        }
    }


    async function handleImageClick(
        messageIndex,
        messageText
    ) {
        setErrorMessage("");
        setImageLoadingIndex(messageIndex);

        try {
            const response = await fetch(
                API_BASE_URL
                + "/api/generate-image",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text: messageText
                    })
                }
            );

            if (response.ok === false) {
                throw new Error(
                    "Backendul nu a putut genera imaginea."
                );
            }

            /*
            Raspunsul este fisierul PNG.
            */
            const imageBlob = await response.blob();

            const imageUrl = URL.createObjectURL(
                imageBlob
            );

            const updatedImageUrls = Object.assign(
                {},
                imageUrls
            );

            if (
                updatedImageUrls[messageIndex]
                !== undefined
            ) {
                URL.revokeObjectURL(
                    updatedImageUrls[messageIndex]
                );
            }

            updatedImageUrls[messageIndex] =
                imageUrl;

            setImageUrls(
                updatedImageUrls
            );

        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Nu am putut genera imaginea. " +
                "Verifica terminalul backendului."
            );

        } finally {
            setImageLoadingIndex(null);
        }
    }


    return (
        <main className="application-page">
            <section className="application-shell">
                <aside className="sidebar">
                    <div>
                        <div className="brand-area">
                            <div className="brand-icon">
                                📚
                            </div>

                            <div>
                                <p className="brand-label">
                                    AI BOOK ASSISTANT
                                </p>

                                <h1>Smart Librarian</h1>
                            </div>
                        </div>

                        <p className="sidebar-description">
                            Descopera carti pe baza temelor,
                            genurilor si povestilor care te
                            intereseaza.
                        </p>
                    </div>

                    <div className="technology-section">
                        <p className="section-label">
                            TEHNOLOGII
                        </p>

                        <div className="technology-list">
                            <span>React</span>
                            <span>FastAPI</span>
                            <span>OpenAI</span>
                            <span>ChromaDB</span>
                        </div>
                    </div>

                    <div className="example-section">
                        <p className="section-label">
                            EXEMPLE DE INTREBARI
                        </p>

                        <div className="example-list">
                            {SAMPLE_QUESTIONS.map(
                                function (question, index) {
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className="example-button"
                                            onClick={function () {
                                                handleExampleClick(
                                                    question
                                                );
                                            }}
                                            disabled={isLoading}
                                        >
                                            <span>
                                                {question}
                                            </span>

                                            <span
                                                className="example-arrow"
                                            >
                                                →
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    <p className="sidebar-footer">
                        RAG + Tool Calling
                    </p>
                </aside>

                <section className="chat-panel">
                    <header className="chat-header">
                        <div>
                            <p className="chat-header-label">
                                CONVERSATIE
                            </p>

                            <h2>
                                Recomandari personalizate
                            </h2>
                        </div>

                        <button
                            type="button"
                            className="clear-button"
                            onClick={clearConversation}
                            disabled={isLoading}
                        >
                            Conversatie noua
                        </button>
                    </header>

                    <section className="messages-container">
                        {messages.map(
                            function (
                                chatMessage,
                                index
                            ) {
                                const messageClassName =
                                    chatMessage.sender ===
                                    "user"
                                        ? "message-row user-row"
                                        : "message-row assistant-row";

                                const bubbleClassName =
                                    chatMessage.sender ===
                                    "user"
                                        ? "message-bubble user-bubble"
                                        : "message-bubble assistant-bubble";

                                const senderName =
                                    chatMessage.sender ===
                                    "user"
                                        ? "TU"
                                        : "SMART LIBRARIAN";

                                const canGenerateMedia =
                                    chatMessage.sender
                                        === "assistant"
                                    && index > 0;

                                return (
                                    <article
                                        key={index}
                                        className={
                                            messageClassName
                                        }
                                    >
                                        <div
                                            className={
                                                bubbleClassName
                                            }
                                        >
                                            <p className="sender-name">
                                                {senderName}
                                            </p>

                                            <p className="message-text">
                                                {chatMessage.text}
                                            </p>

                                            {canGenerateMedia === true && (
                                                <div className="message-actions">
                                                    <button
                                                        type="button"
                                                        className="message-action-button"
                                                        disabled={
                                                            audioLoadingIndex
                                                            !== null
                                                        }
                                                        onClick={
                                                            function () {
                                                                handleAudioClick(
                                                                    index,
                                                                    chatMessage.text
                                                                );
                                                            }
                                                        }
                                                    >
                                                        {
                                                            audioLoadingIndex
                                                            === index
                                                                ? "Se genereaza audio..."
                                                                : "Asculta raspunsul"
                                                        }
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="message-action-button"
                                                        disabled={
                                                            imageLoadingIndex
                                                            !== null
                                                        }
                                                        onClick={
                                                            function () {
                                                                handleImageClick(
                                                                    index,
                                                                    chatMessage.text
                                                                );
                                                            }
                                                        }
                                                    >
                                                        {
                                                            imageLoadingIndex
                                                            === index
                                                                ? "Se genereaza imaginea..."
                                                                : "Genereaza imagine"
                                                        }
                                                    </button>
                                                </div>
                                            )}

                                            {
                                                audioUrls[index]
                                                !== undefined
                                                && (
                                                    <audio
                                                        className="audio-player"
                                                        controls
                                                        src={
                                                            audioUrls[index]
                                                        }
                                                    >
                                                        Browserul nu poate reda
                                                        fisierul audio.
                                                    </audio>
                                                )
                                            }

                                            {
                                                imageUrls[index]
                                                !== undefined
                                                && (
                                                    <div className="generated-image-container">
                                                        <p className="generated-image-label">
                                                            ILUSTRATIE GENERATA
                                                        </p>

                                                        <img
                                                            className="generated-book-image"
                                                            src={
                                                                imageUrls[index]
                                                            }
                                                            alt="Ilustratie generata pentru cartea recomandata"
                                                        />
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </article>
                                );
                            }
                        )}

                        {isLoading === true && (
                            <article className="message-row assistant-row">
                                <div className="message-bubble assistant-bubble loading-bubble">
                                    <p className="sender-name">
                                        SMART LIBRARIAN
                                    </p>

                                    <div className="loading-content">
                                        <span className="loading-dot">
                                        </span>

                                        <span className="loading-dot">
                                        </span>

                                        <span className="loading-dot">
                                        </span>

                                        <span>
                                            Caut o recomandare...
                                        </span>
                                    </div>
                                </div>
                            </article>
                        )}
                    </section>

                    <footer className="composer-area">
                        {errorMessage !== "" && (
                            <div className="error-message">
                                {errorMessage}
                            </div>
                        )}

                        <form
                            className="message-form"
                            onSubmit={handleSubmit}
                        >
                            <label
                                htmlFor="book-question"
                                className="visually-hidden"
                            >
                                Intrebarea despre carte
                            </label>

                            <textarea
                                id="book-question"
                                value={message}
                                onChange={handleMessageChange}
                                placeholder="Descrie ce fel de carte cauti..."
                                rows="3"
                                disabled={isLoading}
                            />

                            <button
                                type="submit"
                                className="send-button"
                                disabled={isLoading}
                            >
                                {isLoading === true
                                    ? "Se proceseaza"
                                    : "Trimite"}
                            </button>
                        </form>

                        <p className="composer-note">
                            Audio si imaginile sunt generate
                            numai atunci cand apesi butoanele.
                        </p>
                    </footer>
                </section>
            </section>
        </main>
    );
}


export default App;