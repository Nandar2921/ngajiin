'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, translations, getDirection, getLanguageName, getLanguageFlag } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translation) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  getLanguageName: (code: Language) => string;
  getLanguageFlag: (code: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'sikaji-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && (saved === 'id' || saved === 'en' || saved === 'ar')) {
      setLanguage(saved);
    }
  }, []);

  // Save to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Set html dir attribute
    document.documentElement.dir = getDirection(lang);
    document.documentElement.lang = lang;
  };

  // Translation function
  const t = (key: keyof Translation): string => {
    return translations[language]?.[key] || translations.id[key] || key;
  };

  const dir = getDirection(language);
  const isRTL = dir === 'rtl';

  // Set initial dir
  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleSetLanguage, 
        t, 
        dir, 
        isRTL,
        getLanguageName,
        getLanguageFlag,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}