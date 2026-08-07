import {
    BookOpen,
    LogIn,
    MessageSquare,
    Plus,
    Settings
} from "lucide-react";


function Sidebar({
    chats,
    activeChatId,
    onNewChat,
    onChatSelect,
    onSettingsClick,
    isLoading
}) {
    

    const sortedChats = chats.slice();

    sortedChats.sort(
        function (firstChat, secondChat) {
            return (
                secondChat.updatedAt
                - firstChat.updatedAt
            );
        }
    );


    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <BookOpen size={22} />
                    </div>

                    <div>
                        <p className="brand-small">
                            AI BOOK ASSISTANT
                        </p>

                        <h1>
                            Smart Librarian
                        </h1>
                    </div>
                </div>

                <button
                    type="button"
                    className="new-chat-button"
                    onClick={onNewChat}
                    disabled={isLoading}
                >
                    <Plus size={18} />

                    <span>
                        New chat
                    </span>
                </button>

                <div className="recent-section">
                    <p className="sidebar-section-title">
                        RECENT
                    </p>

                    {sortedChats.length === 0 ? (
                        <div className="empty-history">
                            <MessageSquare size={17} />

                            <span>
                                Conversatiile tale vor
                                aparea aici.
                            </span>
                        </div>
                    ) : (
                        <div className="recent-list">
                            {sortedChats.map(
                                function (chat) {
                                    const isActive =
                                        chat.id
                                        === activeChatId;

                                    const buttonClassName =
                                        isActive
                                            ? "recent-chat-button active-chat"
                                            : "recent-chat-button";

                                    return (
                                        <button
                                            key={chat.id}
                                            type="button"
                                            className={
                                                buttonClassName
                                            }
                                            disabled={
                                                isLoading
                                            }
                                            onClick={
                                                function () {
                                                    onChatSelect(
                                                        chat.id
                                                    );
                                                }
                                            }
                                        >
                                            <MessageSquare
                                                size={15}
                                                className="recent-chat-icon"
                                            />

                                            <span className="recent-chat-title">
                                                {chat.title}
                                            </span>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="sidebar-bottom">
                <button
                    type="button"
                    className="sidebar-menu-button"
                    onClick={onSettingsClick}
                >
                    <Settings size={18} />

                    <span>
                        Settings
                    </span>
                </button>

                <button
                    type="button"
                    className="account-button"
                    disabled
                    title="Va fi implementat in Pasul 5"
                >
                    <div className="account-avatar">
                        G
                    </div>

                    <div className="account-info">
                        <span className="account-name">
                            Guest
                        </span>

                        <span className="account-description">
                            Sign in
                        </span>
                    </div>

                    <LogIn
                        size={17}
                        className="account-login-icon"
                    />
                </button>
            </div>
        </aside>
    );
}


export default Sidebar;