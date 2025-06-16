const express = require('express');
const router = express.Router();
const MLService = require('../services/mlService');
const DataService = require('../services/dataService');
const auth = require('../middleware/auth');

// Initialize and train the model with the dataset
router.post('/train', auth, async (req, res) => {
    try {
        console.log('Loading dataset...');
        await DataService.loadDataset();
        
        console.log('Processing data...');
        const trainingData = DataService.processData();
        
        console.log('Training model...');
        await MLService.trainModel(trainingData);
        
        res.json({ 
            message: 'Model trained successfully',
            trainingExamples: trainingData.length
        });
    } catch (error) {
        console.error('Error in training process:', error);
        res.status(500).json({ error: 'Error training model' });
    }
});

// Generate response using the trained model
router.post('/generate', auth, async (req, res) => {
    try {
        const { input } = req.body;
        
        if (!input) {
            return res.status(400).json({ error: 'Input is required' });
        }
        
        const response = await MLService.generateResponse(input);
        res.json({ response });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Error generating response' });
    }
});

// Get information about a specific disease
router.get('/disease/:name', auth, async (req, res) => {
    try {
        const diseaseInfo = DataService.getDiseaseInfo(req.params.name);
        
        if (!diseaseInfo) {
            return res.status(404).json({ error: 'Disease not found' });
        }
        
        res.json(diseaseInfo);
    } catch (error) {
        console.error('Error getting disease info:', error);
        res.status(500).json({ error: 'Error getting disease information' });
    }
});

// Get list of all diseases
router.get('/diseases', auth, async (req, res) => {
    try {
        const diseases = DataService.getAllDiseases();
        res.json({ diseases });
    } catch (error) {
        console.error('Error getting diseases list:', error);
        res.status(500).json({ error: 'Error getting diseases list' });
    }
});

// Save the trained model
router.post('/save', auth, async (req, res) => {
    try {
        const { path } = req.body;
        
        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }
        
        await MLService.saveModel(path);
        res.json({ message: 'Model saved successfully' });
    } catch (error) {
        console.error('Error saving model:', error);
        res.status(500).json({ error: 'Error saving model' });
    }
});

// Load a saved model
router.post('/load', auth, async (req, res) => {
    try {
        const { path } = req.body;
        
        if (!path) {
            return res.status(400).json({ error: 'Path is required' });
        }
        
        await MLService.loadModel(path);
        res.json({ message: 'Model loaded successfully' });
    } catch (error) {
        console.error('Error loading model:', error);
        res.status(500).json({ error: 'Error loading model' });
    }
});

module.exports = router; 