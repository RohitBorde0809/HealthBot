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
    const { user } = req.body;
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid request format. User data is required.' });
    }

    const { username, email, age, gender, medicalHistory } = user;
    
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
    }

    // Validate age if provided
    if (age !== undefined && age !== '') {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        return res.status(400).json({ message: 'Age must be a number between 0 and 120' });
      }
    }

    // Validate gender if provided
    if (gender !== undefined && gender !== '') {
      const validGenders = ['male', 'female', 'other'];
      if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({ message: 'Gender must be one of: male, female, other' });
      }
    }
    
    // Check if username or email is already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }
    
    // Update user fields
    if (username !== undefined) req.user.username = username.trim();
    if (email !== undefined) req.user.email = email.toLowerCase().trim();
    if (age !== undefined) req.user.age = age === '' ? null : parseInt(age);
    if (gender !== undefined) req.user.gender = gender === '' ? '' : gender.toLowerCase().trim();
    if (medicalHistory !== undefined) req.user.medicalHistory = medicalHistory.trim();

    await req.user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        age: req.user.age,
        gender: req.user.gender,
        medicalHistory: req.user.medicalHistory
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating your profile'
    });
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password
    });

    // Save user (password will be hashed by the pre-save middleware)
    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
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