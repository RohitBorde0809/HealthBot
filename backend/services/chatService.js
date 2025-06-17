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

                // Try to translate the response to Marathi
                let translatedText = null;
                try {
                    console.log('Attempting to translate response to Marathi...');
                    const translation = await this.translateToMarathi(text);
                    translatedText = translation.translatedText;
                    console.log('Translation successful');
                } catch (translationError) {
                    console.error('Translation failed:', translationError);
                    // Continue without translation
                }

                // Return both English and Marathi responses
                return {
                    choices: [{
                        message: {
                            content: text,
                            translatedContent: translatedText
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
                stack: error.stack,
                response: error.response?.data
            });
            throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
        }
    }

    async translateToMarathi(text) {
        try {
            console.log('Translating text to Marathi:', text);
            
            if (!this.translateApiKey) {
                console.error('Translation API key is not configured');
                throw new Error('Translation service is not configured. Please set GOOGLE_TRANSLATE_API_KEY in your .env file');
            }

            // Split text into chunks if it's too long (Google Translate API has a limit)
            const chunks = this.splitTextIntoChunks(text, 5000);
            let translatedChunks = [];

            for (const chunk of chunks) {
                try {
                    const response = await axios.post(
                        'https://translation.googleapis.com/language/translate/v2',
                        {
                            q: chunk,
                            source: 'en',
                            target: 'mr',
                            format: 'text',
                            key: this.translateApiKey
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data && response.data.data && response.data.data.translations) {
                        translatedChunks.push(response.data.data.translations[0].translatedText);
                    } else {
                        throw new Error('Invalid translation response format');
                    }
                } catch (chunkError) {
                    console.error('Error translating chunk:', chunkError);
                    throw chunkError;
                }
            }

            // Combine translated chunks
            const translatedText = translatedChunks.join('\n\n');
            console.log('Translation successful');
            
            return {
                translatedText: translatedText
            };
        } catch (error) {
            console.error('Translation error:', error);
            console.error('Translation error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Provide a more specific error message
            if (error.response?.status === 403) {
                throw new Error('Translation API key is invalid or has insufficient permissions');
            } else if (error.response?.status === 429) {
                throw new Error('Translation API quota exceeded. Please try again later');
            } else if (!this.translateApiKey) {
                throw new Error('Translation service is not configured. Please set GOOGLE_TRANSLATE_API_KEY in your .env file');
            } else {
                throw new Error(`Translation failed: ${error.message}`);
            }
        }
    }

    splitTextIntoChunks(text, maxChunkSize) {
        const chunks = [];
        let currentChunk = '';
        
        // Split by paragraphs first
        const paragraphs = text.split('\n\n');
        
        for (const paragraph of paragraphs) {
            if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk);
                }
                currentChunk = paragraph;
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    }
}

module.exports = new ChatService(); 