import {
    LoaderCircle,
    Mic,
    Send,
    Square
} from "lucide-react";


function ChatInput({
    message,
    onMessageChange,
    onSubmit,
    onMicrophoneClick,
    isLoading,
    isRecording,
    isTranscribing,
    errorMessage
}) {
    let helperText = (
        "Smart Librarian este specializat "
        + "in recomandari si informatii despre carti."
    );


    if (isRecording === true) {
        helperText = (
            "Inregistrarea este activa. "
            + "Apasa butonul Stop cand ai terminat."
        );
    }


    if (isTranscribing === true) {
        helperText = (
            "Transcriu mesajul vocal..."
        );
    }


    return (
        <div className="composer-wrapper">
            {errorMessage !== "" && (
                <div className="composer-error">
                    {errorMessage}
                </div>
            )}


            <form
                className="composer"
                onSubmit={onSubmit}
            >
                <textarea
                    value={message}
                    onChange={onMessageChange}
                    placeholder="Spune-mi ce fel de carte cauti..."
                    rows="1"
                    disabled={
                        isLoading
                        || isRecording
                        || isTranscribing
                    }
                />


                <div className="composer-actions">
                    <button
                        type="button"
                        className={
                            isRecording
                                ? "icon-button microphone-button recording"
                                : "icon-button microphone-button"
                        }
                        onClick={onMicrophoneClick}
                        disabled={
                            isLoading
                            || isTranscribing
                        }
                        title={
                            isRecording
                                ? "Opreste inregistrarea"
                                : "Porneste microfonul"
                        }
                    >
                        {isRecording === true
                            ? (
                                <Square size={17} />
                            )
                            : isTranscribing === true
                                ? (
                                    <LoaderCircle
                                        size={19}
                                        className="spin-icon"
                                    />
                                )
                                : (
                                    <Mic size={19} />
                                )
                        }
                    </button>


                    <button
                        type="submit"
                        className="send-icon-button"
                        disabled={
                            isLoading
                            || isRecording
                            || isTranscribing
                        }
                        title="Trimite"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>


            <p className="composer-helper">
                {helperText}
            </p>
        </div>
    );
}


export default ChatInput;