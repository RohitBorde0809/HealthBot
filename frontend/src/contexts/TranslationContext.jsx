import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const TranslationContext = createContext(null);

export const TranslationProvider = ({ children }) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async (text, targetLang = 'mr') => {
    if (!text) return text;
    
    setIsTranslating(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/translate',
        { text, targetLang },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    } finally {
      setIsTranslating(false);
    }
  };

  const value = {
    translateText,
    isTranslating
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}; 