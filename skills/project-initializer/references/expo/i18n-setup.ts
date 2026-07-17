import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translations
import vi from './vi.json';
import en from './en.json';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

const supportedLocales = Object.keys(resources);

const normalize = (locale?: string) =>
  locale?.trim().toLowerCase().split('-')[0];

// Detect device locale from expo-localization and normalize fallback.
const getDeviceLocale = (): string => {
  const locales = Localization.getLocales();
  const primaryLanguage = normalize(locales[0]?.languageCode);

  if (primaryLanguage && supportedLocales.includes(primaryLanguage)) {
    return primaryLanguage;
  }

  return 'vi';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLocale(),
  fallbackLng: 'vi',
  supportedLngs: supportedLocales,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
