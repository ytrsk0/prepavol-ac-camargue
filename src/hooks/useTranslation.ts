import { useContext, createContext } from 'react';
import { translations, Locale } from '../locales';

interface TranslationContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const TranslationContext = createContext<TranslationContextProps>({
  locale: 'fr',
  setLocale: () => {},
  t: (key) => translations['fr'][key] || key as string,
});

export const useTranslation = () => useContext(TranslationContext);
