const mlService = require('../services/mlService');

exports.trainModel = async (req, res) => {
    try {
        // Start training in the background
        const trainingPromise = mlService.trainModel();
        
        // Send immediate response
        res.status(202).json({
            status: 'accepted',
            message: 'Training started. This may take a few minutes.'
        });

        // Handle training completion
        trainingPromise
            .then(result => {
                console.log('Training completed:', result);
            })
            .catch(error => {
                console.error('Training failed:', error);
            });
    } catch (error) {
        console.error('Error starting training:', error);
        res.status(500).json({ error: 'Error starting training' });
    }
};

exports.generateResponse = async (req, res) => {
    try {
        const { input } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Input is required' });
        }

        const response = await mlService.generateResponse(input);
        res.json({ response });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Error generating response' });
    }
}; 