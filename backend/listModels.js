const axios = require('axios');
require('dotenv').config();

async function listModels() {
    try {
        const response = await axios.get('https://generativelanguage.googleapis.com/v1/models', {
            headers: {
                'x-goog-api-key': process.env.GEMINI_API_KEY
            }
        });
        console.log('Available models:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error listing models:', error.response?.data || error.message);
    }
}

listModels(); 