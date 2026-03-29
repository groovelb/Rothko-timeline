import { useContext, useCallback } from 'react';

import { LocaleContext } from './LocaleProvider';

/**
 * useLocale — 언어 상태 접근 및 번역 유틸리티 훅
 *
 * Returns:
 * @param {string} locale - 현재 언어 ('ko' | 'en')
 * @param {function} setLocale - 언어 변경 함수
 * @param {function} t - UI 문구 번역 (dot-notation 키 → 문자열)
 * @param {function} localized - 데이터 객체 로컬라이즈 ({ko, en} → 현재 언어 값)
 *
 * Example usage:
 * const { locale, setLocale, t, localized } = useLocale();
 * t('band.expand') → '팽창' or 'Expand'
 * localized(work.exhibition_note) → 현재 언어의 문자열
 */
function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  const { locale, setLocale, translations } = ctx;

  /** UI 문구 번역: dot-notation 키 → 해당 언어 문자열 */
  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value ?? key;
  }, [translations]);

  /** 데이터 객체 로컬라이즈: {ko, en} → 현재 언어 값 */
  const localized = useCallback((obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj) && ('ko' in obj || 'en' in obj)) {
      return obj[locale] ?? obj.en ?? obj.ko;
    }
    return obj;
  }, [locale]);

  return { locale, setLocale, t, localized };
}

export { useLocale };
