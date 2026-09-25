import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../api/chatApi";
import "./ChatWidget.css";

const STORAGE_KEY = "nexcart_ai_chat_history";

let messageCounter = 0;

function createMessageId(prefix) {
    messageCounter += 1;
    return `${prefix}-${messageCounter}`;
}

function getTimestamp() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const INITIAL_MESSAGES = [
    {
        id: "welcome-1",
        sender: "assistant",
        text: "👋 Hi there! I'm **NEXCART AI**, your personal shopping assistant.\n\nHow can I help you today? You can ask about products, track orders, or check our delivery policies.",
        timestamp: "Just now",
    },
];

const QUICK_SUGGESTIONS = [
    { label: "🚚 Delivery policies", query: "What are your delivery times and shipping costs?" },
    { label: "📦 Track an order", query: "How do I track my order?" },
    { label: "💳 Payment methods", query: "What payment options are accepted?" },
    { label: "🔄 Returns & refunds", query: "What is your return and refund policy?" },
    { label: "🛍️ Featured products", query: "Can you recommend popular products?" },
];

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
        } catch {
            return INITIAL_MESSAGES;
        }
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Save history in session storage
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch {
            // Ignore storage quota errors
        }
    }, [messages]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isLoading]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 150);
        }
    }, [isOpen]);

    async function handleSend(textToSend) {
        const text = (textToSend || input).trim();
        if (!text || isLoading) return;

        const userMsg = {
            id: createMessageId("user"),
            sender: "user",
            text,
            timestamp: getTimestamp(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await sendChatMessage(text);
            const aiMsg = {
                id: createMessageId("ai"),
                sender: "assistant",
                text: data.response || "I'm sorry, I could not generate a response.",
                timestamp: getTimestamp(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
            setErrorMessage(err.message || "Failed to connect to AI Assistant. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleClearChat() {
        setMessages(INITIAL_MESSAGES);
        setErrorMessage("");
        sessionStorage.removeItem(STORAGE_KEY);
    }

    // Helper to format basic markdown-like bold and bullet lines
    function renderFormattedText(text) {
        const lines = text.split("\n");
        return lines.map((line, lineIndex) => {
            // Process bold formatting **bold**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            const formattedParts = parts.map((part, partIndex) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });

            return (
                <span key={lineIndex} className="chat-line">
                    {formattedParts}
                    {lineIndex < lines.length - 1 && <br />}
                </span>
            );
        });
    }

    return (
        <div className="chat-widget-container" id="nexcart-chat-widget">
            {/* =====================================================
                CHAT WINDOW
            ===================================================== */}
            {isOpen && (
                <div className="chat-window" role="dialog" aria-label="AI Shopping Assistant">
                    {/* HEADER */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar-wrapper">
                                <span className="chat-avatar-icon">🤖</span>
                                <span className="chat-online-badge" title="Online"></span>
                            </div>
                            <div className="chat-header-titles">
                                <h3 className="chat-title">NEXCART AI</h3>
                                <p className="chat-subtitle">Smart Shopping Assistant</p>
                            </div>
                        </div>

                        <div className="chat-header-actions">
                            <button
                                type="button"
                                className="chat-header-btn"
                                onClick={handleClearChat}
                                title="Reset conversation"
                                aria-label="Clear chat"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="chat-header-btn chat-close-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close chat"
                                aria-label="Close chat window"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* QUICK SUGGESTIONS CHIPS */}
                    <div className="chat-suggestions-bar">
                        {QUICK_SUGGESTIONS.map((item, index) => (
                            <button
                                key={index}
                                type="button"
                                className="chat-suggestion-chip"
                                onClick={() => handleSend(item.query)}
                                disabled={isLoading}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* MESSAGES BODY */}
                    <div className="chat-messages" id="chat-messages-container">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chat-message-row ${msg.sender === "user" ? "user-row" : "assistant-row"}`}
                            >
                                {msg.sender === "assistant" && (
                                    <div className="message-avatar">🤖</div>
                                )}
                                <div className="message-content-wrapper">
                                    <div className="message-bubble">
                                        {renderFormattedText(msg.text)}
                                    </div>
                                    <span className="message-timestamp">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}

                        {/* TYPING INDICATOR */}
                        {isLoading && (
                            <div className="chat-message-row assistant-row">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content-wrapper">
                                    <div className="message-bubble typing-bubble">
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                        <span className="typing-dot"></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ERROR ALERT */}
                        {errorMessage && (
                            <div className="chat-error-banner">
                                <span>⚠️ {errorMessage}</span>
                                <button
                                    type="button"
                                    onClick={() => handleSend(messages[messages.length - 1]?.text)}
                                    className="chat-retry-btn"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT FORM */}
                    <form
                        className="chat-input-bar"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            className="chat-input-field"
                            placeholder="Ask about products, orders, shipping..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            maxLength={500}
                        />
                        <button
                            type="submit"
                            className="chat-send-btn"
                            disabled={!input.trim() || isLoading}
                            title="Send message"
                            aria-label="Send message"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* =====================================================
                FLOATING TOGGLE BUTTON
            ===================================================== */}
            <button
                type="button"
                id="nexcart-chat-toggle-btn"
                className={`chat-toggle-button ${isOpen ? "is-open" : ""}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close AI Chat" : "Open AI Assistant"}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <>
                        <div className="chat-toggle-icon">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                        </div>
                        <span className="chat-toggle-badge">AI</span>
                        <span className="chat-toggle-pulse"></span>
                    </>
                )}
            </button>
        </div>
    );
}
