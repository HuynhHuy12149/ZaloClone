import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCache, setCache, CACHE_KEYS } from '@/base/shared/store/cache';
import { getTranslation } from '@/base/shared/i18n';

const LanguageContext = createContext({
  language: 'vi',
  setLanguage: () => {},
  t: (keyPath, fallback) => keyPath,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('vi');

  useEffect(() => {
    getCache(CACHE_KEYS.LANGUAGE).then((cachedLang) => {
      if (cachedLang && (cachedLang === 'vi' || cachedLang === 'en')) {
        setLanguageState(cachedLang);
      }
    });
  }, []);

  const setLanguage = async (newLang) => {
    setLanguageState(newLang);
    await setCache(CACHE_KEYS.LANGUAGE, newLang);
  };

  const t = (keyPath, fallback) => {
    return getTranslation(language, keyPath, fallback);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
