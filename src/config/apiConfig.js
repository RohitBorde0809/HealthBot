// API Configuration
const API_CONFIG = {
    // OpenFDA API
    OPENFDA: {
        BASE_URL: 'https://api.fda.gov/drug',
        API_KEY: process.env.REACT_APP_OPENFDA_API_KEY
    },
    
    // OpenAI API
    OPENAI: {
        BASE_URL: 'https://api.openai.com/v1',
        API_KEY: process.env.REACT_APP_OPENAI_API_KEY
    },
    
    // Google Translate API
    GOOGLE_TRANSLATE: {
        BASE_URL: 'https://translation.googleapis.com/language/translate/v2',
        API_KEY: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY
    }
};

export default API_CONFIG; 