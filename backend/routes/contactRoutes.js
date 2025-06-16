const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// Submit contact form
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                message: 'Please provide all required fields' 
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Please provide a valid email address' 
            });
        }

        // Create new contact submission
        const contact = new Contact({
            name,
            email,
            subject,
            message
        });

        await contact.save();

        res.status(201).json({
            message: 'Contact form submitted successfully',
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                status: contact.status,
                createdAt: contact.createdAt
            }
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ 
            message: 'Error submitting contact form',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all contact submissions (admin only)
router.get('/all', auth, async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ 
            message: 'Error fetching contact submissions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update contact status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['new', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status value' 
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-__v');

        if (!contact) {
            return res.status(404).json({ 
                message: 'Contact submission not found' 
            });
        }

        res.json({
            message: 'Status updated successfully',
            contact
        });
    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({ 
            message: 'Error updating contact status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete contact submission (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({ 
                message: 'Contact submission not found' 
            });
        }

        res.json({
            message: 'Contact submission deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ 
            message: 'Error deleting contact submission',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 