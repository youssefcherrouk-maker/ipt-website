'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from './en';
import fr from './fr';
import es from './es';

type Language = 'en' | 'fr' | 'es';
type Translations = typeof en;

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [t, setT] = useState<Translations>(en);

  useEffect(() => {
    const saved = localStorage.getItem('iptv_lang') as Language;
    if (saved && (saved === 'en' || saved === 'fr' || saved === 'es')) {
      setLang(saved);
      setT(saved === 'fr' ? fr : saved === 'es' ? es : en);
    }
  }, []);

  const setLanguage = (newLang: Language) => {
    setLang(newLang);
    setT(newLang === 'fr' ? fr : newLang === 'es' ? es : en);
    localStorage.setItem('iptv_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
