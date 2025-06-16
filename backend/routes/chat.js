const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const chatService = require('../services/chatService');

// In-memory chat store
const chats = new Map();

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'Authentication required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            req.user = { id: decoded.userId };
            console.log('Token verified for user:', req.user.id);
            next();
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Get chat history
router.get('/history', auth, async (req, res) => {
    try {
        const userChats = Array.from(chats.values())
            .filter(chat => chat.userId === req.user.id)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);

        res.json(userChats);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// Send message
router.post('/', auth, async (req, res) => {
    try {
        console.log('Received chat request:', {
            body: req.body,
            user: req.user,
            headers: req.headers
        });

        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.log('Invalid messages format:', messages);
            return res.status(400).json({ message: 'Messages array is required' });
        }

        console.log('Processing messages:', messages);
        console.log('From user:', req.user.id);

        const response = await chatService.getChatResponse(messages);
        console.log('Chat service response:', response);

        if (!response || !response.choices || !response.choices[0]) {
            console.error('Invalid response format:', response);
            throw new Error('Invalid response from chat service');
        }

        // Save chat to in-memory store
        const chatId = Date.now().toString();
        const chat = {
            id: chatId,
            userId: req.user.id,
            message: messages[messages.length - 1].content,
            response: response.choices[0].message.content,
            timestamp: new Date()
        };
        chats.set(chatId, chat);
        
        res.json(response);
    } catch (error) {
        console.error('Error in chat route:', error);
        console.error('Error stack:', error.stack);
        
        // Send a more detailed error response in development
        const errorResponse = {
            message: error.message || 'Failed to send message',
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                name: error.name,
                code: error.code
            } : undefined
        };
        
        res.status(500).json(errorResponse);
    }
});

// Translate message to Marathi
router.post('/translate', auth, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Text to translate is required' });
        }

        const translation = await chatService.translateToMarathi(text);
        res.json(translation);
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ message: 'Failed to translate message' });
    }
});

module.exports = router; 