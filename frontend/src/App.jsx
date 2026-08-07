import {
    useEffect,
    useState,
    useRef
} from "react";

import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import ChatInput from "./components/ChatInput";
import MessageList from "./components/MessageList";
import SettingsModal from "./components/Settings";

import "./App.css";


const API_BASE_URL = "http://127.0.0.1:8000";

const CHATS_STORAGE_KEY =
    "smartLibrarianChats";

const SETTINGS_STORAGE_KEY =
    "smartLibrarianSettings";
 
const DEFAULT_SETTINGS = {
    ttsVoice: "coral",
    saveHistory: true
};

function loadChatsFromStorage() {
    
    const savedChats = localStorage.getItem(
        CHATS_STORAGE_KEY
    );

    if (savedChats === null) {
        return [];
    }

    try {
        const parsedChats = JSON.parse(
            savedChats
        );

        if (Array.isArray(parsedChats) === false) {
            return [];
        }

        return parsedChats;

    } catch (error) {
        console.error(
            "Nu am putut citi istoricul conversatiilor.",
            error
        );

        return [];
    }
}


function createChatTitle(firstMessage) {
    

    const cleanedMessage =
        firstMessage.trim();

    const words =
        cleanedMessage.split(" ");

    const titleWords = [];

    let wordIndex = 0;

    while (
        wordIndex < words.length
        && wordIndex < 6
    ) {
        titleWords.push(
            words[wordIndex]
        );

        wordIndex =
            wordIndex + 1;
    }

    let title =
        titleWords.join(" ");

    if (words.length > 6) {
        title =
            title + "...";
    }

    return title;
}

function loadSettingsFromStorage() {
    const savedSettings =
        localStorage.getItem(
            SETTINGS_STORAGE_KEY
        );

    if (savedSettings === null) {
        return DEFAULT_SETTINGS;
    }


    try {
        const parsedSettings =
            JSON.parse(
                savedSettings
            );


        const loadedSettings = {
            ttsVoice:
                parsedSettings.ttsVoice
                || DEFAULT_SETTINGS.ttsVoice,

            saveHistory:
                parsedSettings.saveHistory
                !== false
        };


        return loadedSettings;

    } catch (error) {
        console.error(
            "Nu am putut citi setarile salvate.",
            error
        );

        return DEFAULT_SETTINGS;
    }
}


function App() {
    const [message, setMessage] =
        useState("");

    
    const [chats, setChats] =
        useState(
            loadChatsFromStorage
        );

    
    const [
        activeChatId,
        setActiveChatId
    ] = useState(null);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    const [
        isLoading,
        setIsLoading
    ] = useState(false);

    const [
        audioUrls,
        setAudioUrls
    ] = useState({});

    const [
        imageUrls,
        setImageUrls
    ] = useState({});

    const [
        audioLoadingIndex,
        setAudioLoadingIndex
    ] = useState(null);

    const [
        imageLoadingIndex,
        setImageLoadingIndex
    ] = useState(null);

    const [
        settings,
        setSettings
    ] = useState(loadSettingsFromStorage);


    const [
        settingsOpen,
        setSettingsOpen
    ] =     useState(false);


    const [
        isRecording,
        setIsRecording
    ] = useState(false);


    const [
        isTranscribing,
        setIsTranscribing
    ] = useState(false);

    const mediaRecorderRef =
    useRef(null);

    const mediaStreamRef =
        useRef(null);

    const audioChunksRef =
        useRef([]);

   
    useEffect(
        function () {
            if (settings.saveHistory === true) {
                localStorage.setItem(
                    CHATS_STORAGE_KEY,
                    JSON.stringify(chats)
                );
            } else {
                localStorage.removeItem(
                    CHATS_STORAGE_KEY
                );
            }
        },
        [
            chats,
            settings.saveHistory
        ]
    );


    useEffect(
        function () {
            localStorage.setItem(
                SETTINGS_STORAGE_KEY,
                JSON.stringify(settings)
            );
        },
        [settings]
    );

   
    let activeChat = null;

    for (const chat of chats) {
        if (chat.id === activeChatId) {
            activeChat = chat;
            break;
        }
    }


    let messages = [];

    if (activeChat !== null) {
        messages =
            activeChat.messages;
    }


    function handleMessageChange(event) {
        setMessage(
            event.target.value
        );
    }


    function handleExampleClick(
        exampleText
    ) {
        setMessage(
            exampleText
        );

        setErrorMessage("");
    }


    function releaseGeneratedFiles() {
    
        const audioIndexes =
            Object.keys(
                audioUrls
            );

        for (
            const audioIndex
            of audioIndexes
        ) {
            URL.revokeObjectURL(
                audioUrls[audioIndex]
            );
        }

        const imageIndexes =
            Object.keys(
                imageUrls
            );

        for (
            const imageIndex
            of imageIndexes
        ) {
            URL.revokeObjectURL(
                imageUrls[imageIndex]
            );
        }
    }


    function resetGeneratedMedia() {
        releaseGeneratedFiles();

        setAudioUrls({});
        setImageUrls({});

        setAudioLoadingIndex(null);
        setImageLoadingIndex(null);
    }


    function handleNewChat() {
      
        resetGeneratedMedia();

        setActiveChatId(null);

        setMessage("");

        setErrorMessage("");
    }


    function handleChatSelect(chatId) {
      
        resetGeneratedMedia();

        setActiveChatId(
            chatId
        );

        setMessage("");

        setErrorMessage("");
    }


    async function handleSubmit(event) {
        event.preventDefault();

        const cleanedMessage =
            message.trim();

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


        let currentChatId =
            activeChatId;


        if (currentChatId === null) {
           
            const newChatId =
                Date.now();

            const currentTime =
                Date.now();

            const newChat = {
                id: newChatId,

                title: createChatTitle(
                    cleanedMessage
                ),

                messages: [
                    userChatMessage
                ],

                createdAt: currentTime,
                updatedAt: currentTime
            };

          
            setChats(
                function (currentChats) {
                    return [
                        newChat,
                        ...currentChats
                    ];
                }
            );

            currentChatId =
                newChatId;

            setActiveChatId(
                newChatId
            );

        } else {
          
            setChats(
                function (currentChats) {
                    const updatedChats = [];

                    for (
                        const chat
                        of currentChats
                    ) {
                        if (
                            chat.id
                            === currentChatId
                        ) {
                            const updatedMessages =
                                chat.messages.slice();

                            updatedMessages.push(
                                userChatMessage
                            );

                            const updatedChat = {
                                ...chat,

                                messages:
                                    updatedMessages,

                                updatedAt:
                                    Date.now()
                            };

                            updatedChats.push(
                                updatedChat
                            );
                        } else {
                            updatedChats.push(
                                chat
                            );
                        }
                    }

                    return updatedChats;
                }
            );
        }

        setMessage("");


        try {
            const response =
                await fetch(
                    API_BASE_URL
                        + "/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message:
                                cleanedMessage
                        })
                    }
                );


            if (
                response.ok
                === false
            ) {
                throw new Error(
                    "Backendul a returnat o eroare."
                );
            }


            const responseData =
                await response.json();


            const assistantChatMessage = {
                sender: "assistant",
                text: responseData.answer
            };


            setChats(
                function (currentChats) {
                    const updatedChats = [];

                    for (
                        const chat
                        of currentChats
                    ) {
                        if (
                            chat.id
                            === currentChatId
                        ) {
                            const updatedMessages =
                                chat.messages.slice();

                            updatedMessages.push(
                                assistantChatMessage
                            );

                            const updatedChat = {
                                ...chat,

                                messages:
                                    updatedMessages,

                                updatedAt:
                                    Date.now()
                            };

                            updatedChats.push(
                                updatedChat
                            );
                        } else {
                            updatedChats.push(
                                chat
                            );
                        }
                    }

                    return updatedChats;
                }
            );

        } catch (error) {
            console.error(
                error
            );

            setErrorMessage(
                "Nu am putut comunica cu backendul. "
                + "Verifica daca FastAPI este pornit."
            );

        } finally {
            setIsLoading(false);
        }
    }

    async function sendAudioForTranscription(
        audioBlob
    ) {
        setIsTranscribing(true);
        setErrorMessage("");


        try {
           
            const formData =
                new FormData();


            formData.append(
                "audio_file",
                audioBlob,
                "voice_input.webm"
            );


            const response =
                await fetch(
                    API_BASE_URL
                    + "/api/transcribe",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            if (response.ok === false) {
                throw new Error(
                    "Backendul nu a putut "
                    + "transcrie fisierul."
                );
            }


            const responseData =
                await response.json();


            const transcriptionText =
                responseData.text;


            if (
                transcriptionText === undefined
                || transcriptionText.trim() === ""
            ) {
                throw new Error(
                    "Transcrierea primita este goala."
                );
            }

            setMessage(
                transcriptionText
            );

        } catch (error) {
            console.error(
                error
            );


            setErrorMessage(
                "Nu am putut transcrie mesajul vocal. "
                + "Incearca din nou."
            );

        } finally {
            setIsTranscribing(false);
        }
}

    async function handleMicrophoneClick() {

    if (isRecording === true) {
        if (
            mediaRecorderRef.current
            !== null
        ) {
            mediaRecorderRef.current.stop();
        }

        return;
    }


    setErrorMessage("");


    try {
      
        const mediaStream =
            await navigator.mediaDevices
                .getUserMedia({
                    audio: true
                });


        mediaStreamRef.current =
            mediaStream;


        const webmIsSupported =
            MediaRecorder.isTypeSupported(
                "audio/webm"
            );


        if (webmIsSupported === false) {

            const tracks =
                mediaStream.getTracks();

            for (const track of tracks) {
                track.stop();
            }


            throw new Error(
                "Browserul nu suporta "
                + "inregistrarea audio WebM."
            );
        }


        const mediaRecorder =
            new MediaRecorder(
                mediaStream,
                {
                    mimeType:
                        "audio/webm"
                }
            );


        mediaRecorderRef.current =
            mediaRecorder;

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable =
            function (event) {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(
                        event.data
                    );
                }
            };

        mediaRecorder.onstop =
            async function () {

                const audioBlob =
                    new Blob(
                        audioChunksRef.current,
                        {
                            type: "audio/webm"
                        }
                    );

                const tracks =
                    mediaStream.getTracks();


                for (const track of tracks) {
                    track.stop();
                }


                mediaStreamRef.current =
                    null;

                mediaRecorderRef.current =
                    null;


                setIsRecording(false);

                await sendAudioForTranscription(
                    audioBlob
                );
            };

        mediaRecorder.start();

        setIsRecording(true);


    } catch (error) {
        console.error(
            error
        );


        setIsRecording(false);


        setErrorMessage(
            "Nu am putut folosi microfonul. "
            + "Verifica permisiunea browserului."
        );
    }
}


    async function handleAudioClick(
        messageIndex,
        messageText
    ) {
        setErrorMessage("");

        setAudioLoadingIndex(
            messageIndex
        );


        try {
            const response =
                await fetch(
                    API_BASE_URL
                        + "/api/tts",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            text: messageText,
                            voice: settings.ttsVoice
                        })
                    }
                );


            if (
                response.ok
                === false
            ) {
                throw new Error(
                    "Nu am putut genera audio."
                );
            }


            const audioBlob =
                await response.blob();


            const audioUrl =
                URL.createObjectURL(
                    audioBlob
                );


            const updatedAudioUrls =
                Object.assign(
                    {},
                    audioUrls
                );


            if (
                updatedAudioUrls[
                    messageIndex
                ] !== undefined
            ) {
                URL.revokeObjectURL(
                    updatedAudioUrls[
                        messageIndex
                    ]
                );
            }


            updatedAudioUrls[
                messageIndex
            ] = audioUrl;


            setAudioUrls(
                updatedAudioUrls
            );

        } catch (error) {
            console.error(
                error
            );

            setErrorMessage(
                "Nu am putut genera fisierul audio."
            );

        } finally {
            setAudioLoadingIndex(
                null
            );
        }
    }


    async function handleImageClick(
        messageIndex,
        messageText
    ) {
        setErrorMessage("");

        setImageLoadingIndex(
            messageIndex
        );


        try {
            const response =
                await fetch(
                    API_BASE_URL
                        + "/api/generate-image",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            text:
                                messageText
                        })
                    }
                );


            if (
                response.ok
                === false
            ) {
                throw new Error(
                    "Nu am putut genera imaginea."
                );
            }


            const imageBlob =
                await response.blob();


            const imageUrl =
                URL.createObjectURL(
                    imageBlob
                );


            const updatedImageUrls =
                Object.assign(
                    {},
                    imageUrls
                );


            if (
                updatedImageUrls[
                    messageIndex
                ] !== undefined
            ) {
                URL.revokeObjectURL(
                    updatedImageUrls[
                        messageIndex
                    ]
                );
            }


            updatedImageUrls[
                messageIndex
            ] = imageUrl;


            setImageUrls(
                updatedImageUrls
            );

        } catch (error) {
            console.error(
                error
            );

            setErrorMessage(
                "Nu am putut genera imaginea. "
                + "Verifica terminalul backendului."
            );

        } finally {
            setImageLoadingIndex(
                null
            );
        }
    }

    function handleOpenSettings() {
        setSettingsOpen(true);
    }


    function handleCloseSettings() {
        setSettingsOpen(false);
    }


    function handleVoiceChange(newVoice) {
        setSettings(
            function (currentSettings) {
                return {
                    ...currentSettings,
                    ttsVoice: newVoice
                };
            }
        );
    }


    function handleSaveHistoryChange(
        shouldSaveHistory
    ) {
        setSettings(
            function (currentSettings) {
                return {
                    ...currentSettings,
                    saveHistory:
                        shouldSaveHistory
                };
            }
        );
    }


    function handleClearHistory() {
        resetGeneratedMedia();

        setChats([]);

        setActiveChatId(null);

        setMessage("");

        setErrorMessage("");

        localStorage.removeItem(
            CHATS_STORAGE_KEY
        );
    }

    const applicationIsBusy =
    isLoading
    || isRecording
    || isTranscribing;

    const conversationStarted =
        activeChat !== null;


    return (
        <main className="app">
            <Sidebar
                chats={chats}
                activeChatId={
                    activeChatId
                }
                onNewChat={
                    handleNewChat
                }
                onChatSelect={
                    handleChatSelect
                }
                onSettingsClick={
                    handleOpenSettings
                }
                isLoading={
                    applicationIsBusy
                }
            />

            <section className="main-area">
                <header className="top-bar">
                    <div className="top-bar-status">
                        <span className="status-dot">
                        </span>

                        <span>
                            {activeChat !== null
                                ? activeChat.title
                                : "Smart Librarian"}
                        </span>
                    </div>

                    <span className="top-bar-badge">
                        RAG + AI
                    </span>
                </header>

                <div className="content-area">
                    {conversationStarted
                        === false
                        ? (
                            <WelcomeScreen
                                onExampleClick={
                                    handleExampleClick
                                }
                            />
                        )
                        : (
                            <MessageList
                                messages={
                                    messages
                                }
                                isLoading={
                                    isLoading
                                }
                                audioUrls={
                                    audioUrls
                                }
                                imageUrls={
                                    imageUrls
                                }
                                audioLoadingIndex={
                                    audioLoadingIndex
                                }
                                imageLoadingIndex={
                                    imageLoadingIndex
                                }
                                onAudioClick={
                                    handleAudioClick
                                }
                                onImageClick={
                                    handleImageClick
                                }
                            />
                        )
                    }
                </div>

                <ChatInput
                    message={
                        message
                    }
                    onMessageChange={
                        handleMessageChange
                    }
                    onSubmit={
                        handleSubmit
                    }
                    onMicrophoneClick={
                        handleMicrophoneClick
                    }
                    isLoading={
                        isLoading
                    }
                    isRecording={
                        isRecording
                    }
                    isTranscribing={
                        isTranscribing
                    }
                    errorMessage={
                        errorMessage
                    }
                />
            </section>


            <SettingsModal
                isOpen={
                    settingsOpen
                }
                ttsVoice={
                    settings.ttsVoice
                }
                saveHistory={
                    settings.saveHistory
                }
                onVoiceChange={
                    handleVoiceChange
                }
                onSaveHistoryChange={
                    handleSaveHistoryChange
                }
                onClearHistory={
                    handleClearHistory
                }
                onClose={
                    handleCloseSettings
                }
            />
        </main>
    );
}


export default App;