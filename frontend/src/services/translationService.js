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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLanguage
                })
            });

            if (!response.ok) {
                throw new Error(`Translation failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data.translations[0].translatedText;
        } catch (error) {
            console.error('Error translating text:', error);
            throw error;
        }
    }
}

export default new TranslationService(); 