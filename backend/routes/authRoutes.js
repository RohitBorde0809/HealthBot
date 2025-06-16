const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Temporary in-memory user store with test users
const users = new Map();

// Add test users
const testUsers = [
    {
        email: 'test@example.com',
        password: 'password123'
    },
    {
        email: 'user@example.com',
        password: 'password123'
    }
];

// Initialize test users
const initializeTestUsers = async () => {
    for (const user of testUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        users.set(userId, {
            id: userId,
            email: user.email,
            password: hashedPassword
        });
    }
    console.log('Test users initialized:', Array.from(users.values()).map(u => u.email));
};

// Initialize test users when the server starts
initializeTestUsers();

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const user = users.get(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Check if user exists
        for (const [_, user] of users) {
            if (user.email === email.toLowerCase()) {
                return res.status(400).json({ message: 'User already exists' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const userId = Date.now().toString();
        const user = {
            id: userId,
            email: email.toLowerCase(),
            password: hashedPassword
        };

        users.set(userId, user);

        // Create token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Find user
        let foundUser = null;
        for (const [_, user] of users) {
            if (user.email === email.toLowerCase()) {
                foundUser = user;
                break;
            }
        }

        if (!foundUser) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: foundUser.id },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            user: { 
                id: foundUser.id, 
                email: foundUser.email 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = users.get(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 