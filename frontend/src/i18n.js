import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationCS from './locales/cs/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  cs: {
    translation: translationCS
  }
};

const getDefaultLanguage = () => {
  if (typeof window !== 'undefined') {
    return 'cs'; 
  }
  return 'cs'; 
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'cs',
    interpolation: {
      escapeValue: false 
    },
    react: {
      useSuspense: false
    }
  });

export const t = i18n.t.bind(i18n);

export default i18n;