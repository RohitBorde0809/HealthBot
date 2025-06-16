const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const auth = require('../middleware/auth');

// Train model
router.post('/train', auth, mlController.trainModel);

// Generate response
router.post('/generate', auth, mlController.generateResponse);

module.exports = router; 