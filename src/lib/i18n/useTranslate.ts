'use client';

import { useLanguage } from './LanguageContext';

export function useTranslate() {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
}