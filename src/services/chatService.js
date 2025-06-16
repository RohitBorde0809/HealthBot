import API_CONFIG from '../config/apiConfig';

class ChatService {
    constructor() {
        this.baseUrl = API_CONFIG.OPENAI.BASE_URL;
        this.apiKey = API_CONFIG.OPENAI.API_KEY;
    }

    async getChatResponse(messages) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting chat response:', error);
            throw error;
        }
    }

    async getSimplifiedExplanation(text) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a medical assistant that explains complex medical terms in simple language."
                        },
                        {
                            role: "user",
                            content: `Please explain this in simple terms: ${text}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting simplified explanation:', error);
            throw error;
        }
    }
}

export default new ChatService(); 