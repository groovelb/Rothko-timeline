import { createContext, useState, useMemo, useEffect } from 'react';

import { detectLanguage, STORAGE_KEY } from './detectLanguage';
import koUi from './locales/ko/ui';
import koContent from './locales/ko/content';
import enUi from './locales/en/ui';
import enContent from './locales/en/content';

const allTranslations = {
  ko: { ...koUi, ...koContent },
  en: { ...enUi, ...enContent },
};

const LocaleContext = createContext(null);

/**
 * LocaleProvider — 언어 상태 관리 Context Provider
 *
 * Props:
 * @param {React.ReactNode} children - 하위 컴포넌트 트리 [Required]
 *
 * Example usage:
 * <LocaleProvider><App /></LocaleProvider>
 */
function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLanguage);

  /** 언어 변경 시 localStorage + html lang 동기화 */
  const setLocale = (lang) => {
    setLocaleState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  /** 초기 마운트 시 html lang 설정 */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, []);

  const value = useMemo(() => ({
    locale,
    setLocale,
    translations: allTranslations[locale],
  }), [locale]);

  return (
    <LocaleContext.Provider value={ value }>
      { children }
    </LocaleContext.Provider>
  );
}

export { LocaleProvider, LocaleContext };
