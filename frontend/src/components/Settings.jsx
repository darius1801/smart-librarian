import {
    History,
    Settings,
    Trash2,
    Volume2,
    X
} from "lucide-react";

import { useState } from "react";


function SettingsModal({
    isOpen,
    ttsVoice,
    saveHistory,
    onVoiceChange,
    onSaveHistoryChange,
    onClearHistory,
    onClose
}) {
    const [
        showClearConfirmation,
        setShowClearConfirmation
    ] = useState(false);


    if (isOpen === false) {
        return null;
    }


    function handleClose() {
        setShowClearConfirmation(false);

        onClose();
    }


    function handleClearButtonClick() {
        setShowClearConfirmation(true);
    }


    function handleCancelClear() {
        setShowClearConfirmation(false);
    }


    function handleConfirmClear() {
        onClearHistory();

        setShowClearConfirmation(false);
    }


    return (
        <div className="settings-overlay">
            <section
                className="settings-modal"
                role="dialog"
                aria-modal="true"
            >
                <header className="settings-header">
                    <div className="settings-title-area">
                        <div className="settings-title-icon">
                            <Settings size={19} />
                        </div>

                        <div>
                            <p className="settings-label">
                                SMART LIBRARIAN
                            </p>

                            <h2>
                                Settings
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="settings-close-button"
                        onClick={handleClose}
                        title="Inchide"
                    >
                        <X size={19} />
                    </button>
                </header>


                <div className="settings-content">

                    {/* AUDIO */}

                    <section className="settings-section">
                        <div className="settings-section-heading">
                            <Volume2 size={18} />

                            <div>
                                <h3>
                                    Audio
                                </h3>

                                <p>
                                    Personalizeaza vocea folosita
                                    pentru citirea recomandarilor.
                                </p>
                            </div>
                        </div>

                        <div className="setting-control-row">
                            <div>
                                <label htmlFor="tts-voice">
                                    Voce
                                </label>

                                <p className="setting-description">
                                    Se aplica atunci cand apesi
                                    butonul Asculta.
                                </p>
                            </div>

                            <select
                                id="tts-voice"
                                value={ttsVoice}
                                onChange={
                                    function (event) {
                                        onVoiceChange(
                                            event.target.value
                                        );
                                    }
                                }
                            >
                                <option value="coral">
                                    Coral
                                </option>

                                <option value="marin">
                                    Marin
                                </option>

                                <option value="cedar">
                                    Cedar
                                </option>

                                <option value="nova">
                                    Nova
                                </option>
                            </select>
                        </div>
                    </section>


                    {/* HISTORY */}

                    <section className="settings-section">
                        <div className="settings-section-heading">
                            <History size={18} />

                            <div>
                                <h3>
                                    Istoric
                                </h3>

                                <p>
                                    Controleaza salvarea
                                    conversatiilor pe acest browser.
                                </p>
                            </div>
                        </div>

                        <label className="history-setting-row">
                            <div>
                                <span className="setting-name">
                                    Salveaza istoricul
                                </span>

                                <p className="setting-description">
                                    Conversatiile vor ramane
                                    disponibile dupa refresh.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={saveHistory}
                                onChange={
                                    function (event) {
                                        onSaveHistoryChange(
                                            event.target.checked
                                        );
                                    }
                                }
                            />
                        </label>
                    </section>


                    {/* DATA */}

                    <section className="settings-section danger-section">
                        <div className="settings-section-heading">
                            <Trash2 size={18} />

                            <div>
                                <h3>
                                    Date locale
                                </h3>

                                <p>
                                    Gestioneaza conversatiile salvate
                                    pe acest browser.
                                </p>
                            </div>
                        </div>

                        {showClearConfirmation === false ? (
                            <div className="setting-control-row">
                                <div>
                                    <span className="setting-name">
                                        Sterge istoricul
                                    </span>

                                    <p className="setting-description">
                                        Toate conversatiile salvate
                                        vor fi eliminate.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="clear-history-button"
                                    onClick={
                                        handleClearButtonClick
                                    }
                                >
                                    Sterge istoricul
                                </button>
                            </div>
                        ) : (
                            <div className="clear-confirmation">
                                <div>
                                    <strong>
                                        Esti sigur?
                                    </strong>

                                    <p>
                                        Conversatiile vor fi sterse.
                                        Aceasta actiune nu poate fi
                                        anulata.
                                    </p>
                                </div>

                                <div className="confirmation-buttons">
                                    <button
                                        type="button"
                                        className="cancel-clear-button"
                                        onClick={
                                            handleCancelClear
                                        }
                                    >
                                        Anuleaza
                                    </button>

                                    <button
                                        type="button"
                                        className="confirm-clear-button"
                                        onClick={
                                            handleConfirmClear
                                        }
                                    >
                                        Sterge
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>


                <footer className="settings-footer">
                    <p>
                        Setarile sunt salvate local in browser.
                    </p>

                    <button
                        type="button"
                        className="settings-done-button"
                        onClick={handleClose}
                    >
                        Gata
                    </button>
                </footer>
            </section>
        </div>
    );
}


export default SettingsModal;