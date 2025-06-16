import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { token } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                message: userMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const botResponse = response.data.message;
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                text: 'Sorry, I encountered an error. Please try again.', 
                sender: 'bot',
                error: true 
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                <div className="messages">
                    {messages.length === 0 ? (
                        <div className="welcome-message">
                            <h2>Welcome to Health Chat</h2>
                            <p>Ask me any health-related questions, and I'll do my best to help you.</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div 
                                key={index} 
                                className={`message ${message.sender} ${message.error ? 'error' : ''}`}
                            >
                                <div className="message-content">
                                    {message.text}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat; 