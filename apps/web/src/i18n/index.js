import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

const getSavedLanguage = () => {
  try {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage === 'en' || savedLanguage === 'hi') {
      return savedLanguage;
    }
  } catch (error) {
    console.warn('Unable to read preferred language from localStorage', error);
  }

  return 'en';
};

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

i18n.use(initReactI18next).init({
  resources,
  supportedLngs: ['en', 'hi'],
  lng: getSavedLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
