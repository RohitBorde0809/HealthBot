const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

class ChatService {
    constructor() {
        console.log('Initializing Chat Service...');
    }

    async getChatResponse(messages) {
        try {
            console.log('Processing chat request...');
            console.log('Messages:', JSON.stringify(messages, null, 2));

            // Get the last user message
            const userMessage = messages[messages.length - 1].content;

            // Call Python ML model
            const response = await this.callMLModel(userMessage);
            
            console.log('Response generated');
            return {
                choices: [{
                    message: {
                        content: response
                    }
                }]
            };
        } catch (error) {
            console.error('Chat service error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async callMLModel(query) {
        return new Promise((resolve, reject) => {
            const pythonScript = path.join(__dirname, '../ml/predict.py');
            const pythonProcess = spawn('python', [pythonScript, query]);

            let output = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('Python process error:', error);
                    reject(new Error(`Python process exited with code ${code}`));
                    return;
                }
                resolve(output.trim());
            });
        });
    }

    async translateToMarathi(text) {
        try {
            // Using Google Translate API
            const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {
                q: text,
                source: 'en',
                target: 'mr',
                key: process.env.GOOGLE_TRANSLATE_API_KEY
            });

            return {
                translatedText: response.data.data.translations[0].translatedText
            };
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }
}

module.exports = new ChatService(); 