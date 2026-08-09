import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import taTranslations from './locales/ta.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ta: { translation: taTranslations }
        },
        lng: 'ta',
        supportedLngs: ['ta'],
        fallbackLng: 'ta',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
