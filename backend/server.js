const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chat');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});