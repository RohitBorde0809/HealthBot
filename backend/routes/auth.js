const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });
    
    if (!user) {
      throw new Error();
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Check if username or email is already taken
    if (username !== req.user.username || email !== req.user.email) {
      const existingUser = await User.findOne({
        $or: [
          { username, _id: { $ne: req.user._id } },
          { email, _id: { $ne: req.user._id } }
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already taken' });
      }
    }
    
    // Update user
    req.user.username = username || req.user.username;
    req.user.email = email || req.user.email;
    await req.user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(401).json({ error: 'Please authenticate' });
    }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password route (for testing purposes)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log('Password reset attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for password reset:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log('Password reset successful for:', email);
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 