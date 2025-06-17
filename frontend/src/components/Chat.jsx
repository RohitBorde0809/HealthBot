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

    const handleTranslate = async (index, textToTranslate) => {
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            // Mark the message as translating to show loading state or disable button
            if (newMessages[index].sender === 'bot') {
                newMessages[index] = { ...newMessages[index], isTranslating: true, translationError: null };
            }
            return newMessages;
        });

        try {
            console.log('Sending translation request for text:', textToTranslate.substring(0, 100) + '...');
            const response = await axios.post('http://localhost:5000/api/chat/translate', {
                text: textToTranslate
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Translation response:', response.data);

            if (!response.data || !response.data.translatedText) {
                throw new Error('Invalid translation response format');
            }

            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                if (newMessages[index].sender === 'bot') {
                    newMessages[index] = {
                        ...newMessages[index],
                        translatedText: response.data.translatedText,
                        showTranslated: true, // Display translated text by default after translation
                        isTranslating: false,
                        translationError: null
                    };
                }
                return newMessages;
            });

        } catch (error) {
            console.error('Translation error:', error);
            let errorMessage = 'Failed to translate.';
            
            if (error.response) {
                // Handle specific error cases
                if (error.response.status === 403) {
                    errorMessage = 'Translation service is not properly configured. Please contact support.';
                } else if (error.response.status === 429) {
                    errorMessage = 'Translation quota exceeded. Please try again later.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                if (newMessages[index].sender === 'bot') {
                    newMessages[index] = {
                        ...newMessages[index],
                        isTranslating: false,
                        translationError: errorMessage
                    };
                }
                return newMessages;
            });
        }
    };

    const toggleTranslation = (index) => {
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            if (newMessages[index].sender === 'bot' && newMessages[index].translatedText) {
                newMessages[index] = {
                    ...newMessages[index],
                    showTranslated: !newMessages[index].showTranslated
                };
            }
            return newMessages;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        
        // Add user message to the UI immediately
        setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
        setLoading(true);

        try {
            // Prepare the full conversation history
            const conversationHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.originalText || msg.text
            }));
            
            // Add the new user message
            conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            console.log('Sending conversation history:', conversationHistory);

            const response = await axios.post('http://localhost:5000/api/chat', {
                messages: conversationHistory
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: false // Explicitly set to false
            });

            console.log('Received response:', response.data);

            if (!response.data || !response.data.choices || !response.data.choices[0]) {
                throw new Error('Invalid response format from server');
            }

            const botResponse = response.data.choices[0].message.content;
            setMessages(prev => [...prev, { text: botResponse, originalText: botResponse, sender: 'bot' }]);
        } catch (error) {
            console.error('Chat error:', error);
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            
            if (error.response) {
                console.error('Error response:', error.response.data);
                errorMessage = error.response.data.message || errorMessage;
                
                if (error.response.status === 401) {
                    errorMessage = 'Your session has expired. Please log in again.';
                } else if (error.response.status === 429) {
                    errorMessage = 'Too many requests. Please wait a moment before trying again.';
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                console.error('Error setting up request:', error.message);
            }
            
            setMessages(prev => [...prev, { 
                text: errorMessage, 
                originalText: errorMessage,
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
                                    {message.sender === 'bot' && message.showTranslated && message.translatedText ?
                                        message.translatedText : message.text}
                                </div>
                                {message.sender === 'bot' && !message.error && (
                                    <div className="message-actions">
                                        {!message.translatedText && !message.translationError && (
                                            <button 
                                                onClick={() => handleTranslate(index, message.text)} 
                                                disabled={message.isTranslating}
                                                className="translate-button"
                                            >
                                                {message.isTranslating ? 'Translating...' : 'Translate to Marathi'}
                                            </button>
                                        )}
                                        {message.translatedText && (
                                            <button 
                                                onClick={() => toggleTranslation(index)}
                                                className="toggle-translation-button"
                                            >
                                                {message.showTranslated ? 'Show Original' : 'Show Marathi'}
                                            </button>
                                        )}
                                        {message.translationError && (
                                            <div className="translation-error">
                                                <span>{message.translationError}</span>
                                                <button 
                                                    onClick={() => handleTranslate(index, message.text)}
                                                    className="retry-translation-button"
                                                >
                                                    Retry Translation
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
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