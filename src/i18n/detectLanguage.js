const SUPPORTED = ['ko', 'en'];
const STORAGE_KEY = 'rosko-locale';

/**
 * detectLanguage — 브라우저 환경에서 사용자 언어 감지
 *
 * 우선순위:
 * 1. URL 파라미터 (?lang=en)
 * 2. localStorage (이전 선택)
 * 3. navigator.language (브라우저 언어)
 * 4. 폴백 → 'ko'
 *
 * @returns {string} 'ko' | 'en'
 */
function detectLanguage() {
  if (typeof window === 'undefined') return 'ko';

  /** 1. URL 파라미터 */
  const url = new URL(window.location.href);
  const urlLang = url.searchParams.get('lang');
  if (urlLang && SUPPORTED.includes(urlLang)) {
    localStorage.setItem(STORAGE_KEY, urlLang);
    return urlLang;
  }

  /** 2. localStorage */
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) {
    return stored;
  }

  /** 3. 브라우저 언어 */
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && browserLang.startsWith('ko')) {
    return 'ko';
  }

  /** 4. 한국어 브라우저가 아닌 경우 → 영어 */
  return 'en';
}

export { detectLanguage, STORAGE_KEY, SUPPORTED };
