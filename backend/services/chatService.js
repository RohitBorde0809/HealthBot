const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatService {
    constructor() {
        console.log('Initializing Chat Service...');
        this.geminiApiKey = process.env.GEMINI_API_KEY;
        this.translateApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
        
        if (!this.geminiApiKey) {
            console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
            throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file');
        }
        
        if (!this.translateApiKey) {
            console.error('ERROR: GOOGLE_TRANSLATE_API_KEY is not set in environment variables');
            throw new Error('Google Translate API key is not configured. Please set GOOGLE_TRANSLATE_API_KEY in your .env file');
        }

        // Use the latest recommended Gemini model
        this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
        this.model = this.genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    }

    async getChatResponse(messages) {
        try {
            console.log('Processing chat request...');
            console.log('Messages:', JSON.stringify(messages, null, 2));

            // Get the last message
            const lastMessage = messages[messages.length - 1].content;

            // Prepare the prompt
            const prompt = `You are a helpful health assistant. Format your responses in the following structure:\n\n1. Disease Name or Topic\n   - Start with \"You asked about [Disease/Topic].\"\n\n2. Symptoms\n   - List common symptoms with \"Common symptoms include...\"\n\n3. Precautions\n   - List preventive measures with \"Ensure...\" or \"Avoid...\"\n\n4. Home Remedies (Only if safe)\n   - Start with \"You can...\" and list safe home remedies\n\n5. Treatment or Medicines\n   - Start with \"Consult a doctor for...\" and mention medications\n   - Always include \"Self-medication is not recommended\"\n\n6. When to See a Doctor\n   - Start with \"Seek immediate medical attention if...\"\n\n7. Emergency Warning Signs\n   - Start with \"If you notice...\" and list emergency symptoms\n\n8. Disclaimer\n   - Always end with \"This is not a substitute for professional medical advice. Always consult a doctor.\"\n\nAfter each numbered point and subpoint, insert a blank line (double newline) so that every section starts on a new line for readability. Do not use continuous text. Each main point and subpoint must be separated by a blank line.\n\nKeep responses clear, concise, and focused on the user's query. Always prioritize safety and professional medical consultation.\n\nUser's question: ${lastMessage}`;

            try {
                // Generate response
                console.log('Generating response...');
                const result = await this.model.generateContent(prompt);
                console.log('Got response from Gemini');
                const response = await result.response;
                const text = response.text();
                console.log('Response text:', text);

                // Return the raw response without translation
                return {
                    choices: [{
                        message: {
                            content: text
                        }
                    }]
                };
            } catch (geminiError) {
                console.error('Gemini API error:', geminiError);
                throw new Error(`Gemini API error: ${geminiError.message}`);
            }
        } catch (error) {
            console.error('Chat service error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
        }
    }

    async translateToMarathi(text) {
        try {
            console.log('Translating text to Marathi:', text);
            const response = await axios.post('https://translation.googleapis.com/language/translate/v2', {
                q: text,
                source: 'en',
                target: 'mr',
                key: this.translateApiKey
            });

            console.log('Translation response:', response.data);
            return {
                translatedText: response.data.data.translations[0].translatedText
            };
        } catch (error) {
            console.error('Translation error:', error);
            console.error('Translation error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            throw new Error('Failed to translate message to Marathi');
        }
    }
}

module.exports = new ChatService(); 