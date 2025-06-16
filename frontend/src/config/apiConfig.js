const API_CONFIG = {
    OPENAI: {
        BASE_URL: 'https://api.openai.com/v1',
        API_KEY: import.meta.env.VITE_OPENAI_API_KEY
    },
    GOOGLE_TRANSLATE: {
        BASE_URL: 'https://translation.googleapis.com/language/translate/v2',
        API_KEY: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY
    }
};

export default API_CONFIG; 