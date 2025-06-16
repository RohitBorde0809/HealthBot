import API_CONFIG from '../config/apiConfig';

class TranslationService {
    constructor() {
        this.baseUrl = API_CONFIG.GOOGLE_TRANSLATE.BASE_URL;
        this.apiKey = API_CONFIG.GOOGLE_TRANSLATE.API_KEY;
    }

    async translateText(text, targetLanguage) {
        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLanguage
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error translating text:', error);
            throw error;
        }
    }

    async detectLanguage(text) {
        try {
            const response = await fetch(`${this.baseUrl}/detect?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: text
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error detecting language:', error);
            throw error;
        }
    }
}

export default new TranslationService(); 