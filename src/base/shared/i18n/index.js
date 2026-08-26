import vi from './vi';
import en from './en';

export const translations = {
  vi,
  en,
};

export const getTranslation = (lang, keyPath, fallback = '') => {
  const dict = translations[lang] || translations.vi;
  const keys = keyPath.split('.');
  let result = dict;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return fallback || keyPath;
    }
  }

  return typeof result === 'string' ? result : fallback || keyPath;
};
