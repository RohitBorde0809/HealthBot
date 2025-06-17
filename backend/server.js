const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const contactRoutes = require('./routes/contactRoutes');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Add all your frontend origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: false, // Keep false for token-based auth
    maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/health-chatbot')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Configuration check endpoint (development only)
if (process.env.NODE_ENV === 'development') {
    app.get('/api/config/check', (req, res) => {
        const config = {
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            hasTranslateKey: !!process.env.GOOGLE_TRANSLATE_API_KEY,
            nodeEnv: process.env.NODE_ENV,
            mongoUri: process.env.MONGODB_URI ? 'configured' : 'not configured'
        };
        res.json(config);
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        response: err.response?.data
    });

    // Determine if this is a translation error
    const isTranslationError = err.message?.includes('Translation') || 
                             err.message?.includes('translate') ||
                             req.url?.includes('translate');

    // Send appropriate error response
    res.status(500).json({ 
        message: isTranslationError ? 
            'Translation service error. Please check your API key configuration.' : 
            'Internal server error',
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack,
            code: err.code,
            response: err.response?.data
        } : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

module.exports = app;