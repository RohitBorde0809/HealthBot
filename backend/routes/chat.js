const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const chatService = require('../services/chatService');
const Chat = require('../models/Chat');

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
        console.log('Fetching chat history for user:', req.user.id);
        
        const userChats = await Chat.find({ user: req.user.id })
            .sort({ timestamp: -1 })
            .limit(50);

        console.log(`Found ${userChats.length} chats for user ${req.user.id}`);
        res.json(userChats);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to fetch chat history',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

        // Save chat to database with translation
        const chat = new Chat({
            user: req.user.id,
            message: messages[messages.length - 1].content,
            response: response.choices[0].message.content,
            translatedResponse: response.choices[0].message.translatedContent,
            timestamp: new Date()
        });
        await chat.save();
        
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
        console.log('Translation request received:', {
            body: req.body,
            user: req.user,
            headers: req.headers
        });

        const { text } = req.body;
        
        if (!text) {
            console.log('No text provided for translation');
            return res.status(400).json({ message: 'Text to translate is required' });
        }

        console.log('Attempting to translate text:', text.substring(0, 100) + '...');
        const translation = await chatService.translateToMarathi(text);
        console.log('Translation successful');
        
        res.json(translation);
    } catch (error) {
        console.error('Translation error:', error);
        console.error('Translation error details:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status
        });

        // Provide more specific error messages based on the error type
        let errorMessage = 'Failed to translate message';
        let statusCode = 500;

        if (error.message.includes('API key')) {
            errorMessage = 'Translation service is not properly configured';
            statusCode = 503;
        } else if (error.response?.status === 403) {
            errorMessage = 'Translation service access denied';
            statusCode = 403;
        } else if (error.response?.status === 429) {
            errorMessage = 'Translation service quota exceeded';
            statusCode = 429;
        }

        res.status(statusCode).json({ 
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? {
                originalError: error.message,
                stack: error.stack
            } : undefined
        });
    }
});

module.exports = router; 