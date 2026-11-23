import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, TRANSLATIONS } from './translations';

export const LANGUAGES = [
  'English', 'العربية', 'Bahasa Indonesia', 'Deutsch', 'Dansk', 'Český',
  'Español', 'Ελληνικά', 'Français', 'Italiano', '日本語', '한국어',
  '简体中文', '繁體中文', 'हिन्दी', 'עברית', 'Magyar', 'Nederlands',
  'Norsk', 'Polski', 'Português', 'Română', 'Русский', 'Suomi',
  'Svenska', 'ภาษาไทย', 'Tiếng Việt', 'Türkçe', 'Українська'
];

/**
 * Standard BCP 47 language tags for HTML [lang] attribute accessibility (WCAG 3.1.1)
 */
export const BCP47_LANG_CODES: Record<string, string> = {
  'English': 'en',
  'العربية': 'ar',
  'Bahasa Indonesia': 'id',
  'Deutsch': 'de',
  'Dansk': 'da',
  'Český': 'cs',
  'Español': 'es',
  'Ελληνικά': 'el',
  'Français': 'fr',
  'Italiano': 'it',
  '日本語': 'ja',
  '한국어': 'ko',
  '简体中文': 'zh-CN',
  '繁體中文': 'zh-TW',
  'हिन्दी': 'hi',
  'עברית': 'he',
  'Magyar': 'hu',
  'Nederlands': 'nl',
  'Norsk': 'nb',
  'Polski': 'pl',
  'Português': 'pt',
  'Română': 'ro',
  'Русский': 'ru',
  'Suomi': 'fi',
  'Svenska': 'sv',
  'ภาษาไทย': 'th',
  'Tiếng Việt': 'vi',
  'Türkçe': 'tr',
  'Українська': 'uk'
};

interface LanguageContextType {
  currentLang: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLang: 'English',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isRtl: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editeverything_lang');
      if (saved && LANGUAGES.includes(saved)) {
        return saved;
      }
    }
    return 'English';
  });

  const isRtl = currentLang === 'العربية' || currentLang === 'עברית';

  const setLanguage = (lang: string) => {
    if (LANGUAGES.includes(lang)) {
      setCurrentLangState(lang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('editeverything_lang', lang);
      }
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = BCP47_LANG_CODES[currentLang] || 'en';
    }
  }, [currentLang, isRtl]);

  const t = (key: string, fallback?: string): string => {
    return getTranslation(currentLang, key, fallback);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
