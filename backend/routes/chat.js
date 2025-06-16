const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const chatService = require('../services/chatService');

// In-memory chat store
const chats = new Map();

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Please authenticate' });
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
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Received message:', message);
        console.log('From user:', req.user.id);
        
        const messages = [
            {
                role: "user",
                content: message
            }
        ];

        console.log('Sending to chat service:', messages);
        const response = await chatService.getChatResponse(messages);
        console.log('Chat service response:', response);

        if (!response || !response.choices || !response.choices[0]) {
            throw new Error('Invalid response from chat service');
        }

        const aiResponse = response.choices[0].message.content;
        console.log('AI response:', aiResponse);
        
        // Save chat to in-memory store
        const chatId = Date.now().toString();
        const chat = {
            id: chatId,
            userId: req.user.id,
            message: message,
            response: aiResponse,
            timestamp: new Date()
        };
        chats.set(chatId, chat);
        
        res.json({
            message: aiResponse
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            error: 'Failed to send message',
            details: error.message 
        });
    }
});

// Translate message to Marathi
router.post('/translate', auth, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text to translate is required' });
        }

        const translation = await chatService.translateToMarathi(text);
        res.json(translation);
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Failed to translate message' });
    }
});

module.exports = router; 