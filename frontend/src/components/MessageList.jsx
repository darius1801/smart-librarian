import {
    Image,
    LoaderCircle,
    Sparkles,
    Volume2
} from "lucide-react";


function MessageList({
    messages,
    isLoading,
    audioUrls,
    imageUrls,
    audioLoadingIndex,
    imageLoadingIndex,
    onAudioClick,
    onImageClick
}) {
    return (
        <section className="messages-area">
            <div className="messages-column">
                {messages.map(
                    function (chatMessage, index) {
                        const isUser =
                            chatMessage.sender === "user";

                        const canGenerateMedia =
                            chatMessage.sender === "assistant";

                        return (
                            <article
                                key={index}
                                className={
                                    isUser
                                        ? "chat-message user-message"
                                        : "chat-message assistant-message"
                                }
                            >
                                {!isUser && (
                                    <div className="assistant-avatar">
                                        <Sparkles size={17} />
                                    </div>
                                )}

                                <div className="message-content">
                                    <p className="message-author">
                                        {isUser
                                            ? "Tu"
                                            : "Smart Librarian"}
                                    </p>

                                    <p className="message-text">
                                        {chatMessage.text}
                                    </p>

                                    {canGenerateMedia && (
                                        <div className="message-tools">
                                            <button
                                                type="button"
                                                onClick={function () {
                                                    onAudioClick(
                                                        index,
                                                        chatMessage.text
                                                    );
                                                }}
                                                disabled={
                                                    audioLoadingIndex !== null
                                                }
                                            >
                                                {audioLoadingIndex === index
                                                    ? (
                                                        <LoaderCircle
                                                            size={15}
                                                            className="spin-icon"
                                                        />
                                                    )
                                                    : (
                                                        <Volume2 size={15} />
                                                    )
                                                }

                                                <span>
                                                    {audioLoadingIndex === index
                                                        ? "Pregatesc audio..."
                                                        : "Asculta"}
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={function () {
                                                    onImageClick(
                                                        index,
                                                        chatMessage.text
                                                    );
                                                }}
                                                disabled={
                                                    imageLoadingIndex !== null
                                                }
                                            >
                                                {imageLoadingIndex === index
                                                    ? (
                                                        <LoaderCircle
                                                            size={15}
                                                            className="spin-icon"
                                                        />
                                                    )
                                                    : (
                                                        <Image size={15} />
                                                    )
                                                }

                                                <span>
                                                    {imageLoadingIndex === index
                                                        ? "Creez imaginea..."
                                                        : "Vizualizeaza"}
                                                </span>
                                            </button>
                                        </div>
                                    )}

                                    {audioUrls[index] !== undefined && (
                                        <audio
                                            className="audio-player"
                                            controls
                                            src={audioUrls[index]}
                                        >
                                            Browserul nu poate reda audio.
                                        </audio>
                                    )}

                                    {imageUrls[index] !== undefined && (
                                        <div className="book-visual-container">
                                            <img
                                                src={imageUrls[index]}
                                                alt="Ilustratie AI inspirata de cartea recomandata"
                                            />

                                            <span>
                                                Poza generata cu AI
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    }
                )}

                {isLoading && (
                    <article className="chat-message assistant-message">
                        <div className="assistant-avatar">
                            <Sparkles size={17} />
                        </div>

                        <div className="message-content">
                            <p className="message-author">
                                Smart Librarian
                            </p>

                            <div className="thinking-state">
                                <span>
                                </span>

                                <span>
                                </span>

                                <span>
                                </span>

                                <p>
                                    Caut o carte potrivita...
                                </p>
                            </div>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}


export default MessageList;