# i18n 설계 계획서 — 한/영 다국어 처리

> 작성일: 2026-03-29
> 프로젝트: Rosko (Mark Rothko Timeline)

---

## 1. 현황 분석

### 1.1 인프라 현황

| 항목 | 상태 | 비고 |
|------|------|------|
| i18n 라이브러리 | 없음 | i18next, react-intl 등 미설치 |
| 번역 파일 | 없음 | locale 파일 부재 |
| 언어 Context | 없음 | Provider, Hook 없음 |
| 라우팅 | 미사용 | react-router-dom 설치만 됨 |
| 한글 폰트 | 지원됨 | Pretendard, Noto Sans KR 테마 설정 완료 |

### 1.2 텍스트 소스 분류

**컴포넌트 하드코딩 (한국어)**

| 위치 | 변수 | 내용 |
|------|------|------|
| `TimelineCanvas.jsx` | `BAND_DESC` | 시대별 해설 5개 (각 200~300자) |
| `useTimelineLayout.js` | `BAND_LABELS` | 밴드명 5개 (팽창, 발산, 균형, 수축, 소멸) |

**JSON 데이터 (한영 혼재)**

| 파일 | 한국어 필드 | 영어 필드 |
|------|-----------|----------|
| `rothko_works.json` | `exhibition_note`, `significance`, `periods[].label`, `periods[].color_tendency` | `title`, `medium`, `collection`, `artist.name` |
| `rothko_events.json` | `biographical_periods[].label`, `biographical_periods[].keywords[]`, `entropy_curve[].label` | `meta.title`, `artist.name` |

### 1.3 번역 대상 수량

| 카테고리 | 개수 | 비고 |
|---------|------|------|
| UI 문구 (짧은 라벨) | ~20개 | BAND_LABELS, 시대명, UI 버튼 등 |
| 장문 콘텐츠 | 5개 | BAND_DESC 문단 |
| 작품 설명 (`exhibition_note`) | 47개 | 작품별 1~2문장 |
| 작품 의의 (`significance`) | 47개 | 키워드 형태 |
| 시대 라벨/색상경향 | 14개 | meta.periods × 2필드 |
| 전기 시대 라벨 | 10개 | biographical_periods |
| 전기 키워드 | ~40개 | keywords 배열 |
| 엔트로피 라벨 | ~55개 | entropy_curve |
| **합계** | **~240개** | |

### 1.4 번역 불필요 (고정 영어)

작품의 공식 명칭으로 번역하지 않는 필드:

- `title` — 작품 공식 영문 제목
- `medium` — 재료 (oil on canvas 등)
- `collection` — 소장처 공식 명칭
- `artist.name`, `birth_name`
- `id`, `year`, `range`, `period`
- `color_blocks`, `emotion_y`, `image`, `color_extraction`

---

## 2. 아키텍처 결정

### 2.1 커스텀 경량 시스템 (i18next 미사용)

**선택 근거:**

- 번역 대상 ~240개로 소규모
- "UI 문구 번역"보다 "콘텐츠 로컬라이제이션" 비중이 큼
- JSON 데이터 내 `{ko, en}` 구조와 직접 통합 가능
- 외부 의존성 최소화 — 번들 사이즈 증가 없음
- 프로젝트 복잡도에 비례하는 적정 설계

**구성 요소:**

```
React Context (상태) + Custom Hook (접근) + Locale Files (번역) + Data Restructuring (데이터)
```

### 2.2 디렉토리 구조

```
src/
├── i18n/                              # 신규 — 국제화 모듈
│   ├── LocaleProvider.jsx             # Context Provider + 감지 로직
│   ├── useLocale.js                   # Hook: locale, setLocale, t, localized
│   ├── detectLanguage.js              # 언어 감지 유틸리티
│   └── locales/
│       ├── ko/
│       │   ├── ui.js                  # UI 문구 (라벨, 버튼)
│       │   └── content.js             # 장문 콘텐츠 (BAND_DESC)
│       └── en/
│           ├── ui.js                  # UI strings
│           └── content.js             # Long-form content
├── data/rothko/
│   ├── rothko_works.json              # 재구성 → {ko, en} 키 도입
│   └── rothko_events.json             # 재구성 → 동일
```

---

## 3. 언어 감지 설계 (최초 유입)

### 3.1 감지 우선순위

```
1. URL 파라미터      →  ?lang=en / ?lang=ko       (공유 링크 대응)
2. localStorage      →  'rosko-locale' 키 조회     (재방문 유지)
3. navigator.language →  startsWith('ko') → 'ko'   (브라우저 언어)
4. 기본 폴백          →  'ko'                      (주 타깃: 한국 사용자)
```

### 3.2 동작 시나리오

| 시나리오 | 감지 단계 | 결과 |
|---------|----------|------|
| 한국에서 첫 방문 | navigator.language = `ko-KR` | 한국어 |
| 미국에서 첫 방문 | navigator.language = `en-US` | 영어 |
| `?lang=en` 링크로 유입 | URL 파라미터 | 영어 (localStorage 저장) |
| 재방문 (이전에 영어 선택) | localStorage = `en` | 영어 |
| 사용자 수동 전환 | 토글 클릭 | 변경 언어 (localStorage 갱신) |

### 3.3 감지 유틸리티

```js
// src/i18n/detectLanguage.js

const SUPPORTED = ['ko', 'en'];
const DEFAULT = 'ko';
const STORAGE_KEY = 'rosko-locale';

function detectLanguage() {
  // 1. URL 파라미터
  const url = new URL(window.location.href);
  const urlLang = url.searchParams.get('lang');
  if (urlLang && SUPPORTED.includes(urlLang)) {
    localStorage.setItem(STORAGE_KEY, urlLang);
    return urlLang;
  }

  // 2. localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) {
    return stored;
  }

  // 3. 브라우저 언어
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && browserLang.startsWith('ko')) {
    return 'ko';
  }

  // 4. 그 외 → 영어 (해외 유입은 영어로)
  // 한국어 브라우저가 아닌 모든 경우 영어
  return 'en';
}
```

> **참고**: 폴백 기본값이 `'ko'`인 이유 — 주 타깃이 한국 사용자. 다만 3단계에서 `ko`가 아닌 브라우저는 `en`으로 분기하므로, 실질적 폴백 도달은 거의 없음.

---

## 4. Hook 설계: `useLocale`

### 4.1 인터페이스

```js
const { locale, setLocale, t, localized } = useLocale();
```

| 반환값 | 타입 | 용도 |
|--------|------|------|
| `locale` | `'ko' \| 'en'` | 현재 언어 |
| `setLocale` | `(lang) => void` | 언어 변경 (localStorage 동기화) |
| `t` | `(key) => string` | UI 문구 번역 — locale 파일 키 조회 |
| `localized` | `(obj) => any` | 데이터 로컬라이즈 — `{ko, en}` 객체 → 현재 언어 값 |

### 4.2 핵심 구분: `t()` vs `localized()`

**`t(key)`** — 정적 UI 문구용

```jsx
// locale 파일에 미리 정의된 키로 조회
t('band.expand')     // → '팽창' (ko) / 'Expand' (en)
t('bandDesc.expand')  // → 장문 해설 문단
```

**`localized(obj)`** — 동적 JSON 데이터용

```jsx
// {ko, en} 구조의 데이터 객체에서 현재 언어 추출
localized(work.exhibition_note)
// → '로스코 재단 기증(1986)...' (ko)
// → 'Donated by Rothko Foundation (1986)...' (en)

localized(period.keywords)
// → ['불안', '이질감', '빈곤'] (ko)
// → ['anxiety', 'alienation', 'poverty'] (en)
```

### 4.3 구현

```jsx
// src/i18n/useLocale.js
import { useContext, useCallback } from 'react';
import { LocaleContext } from './LocaleProvider';

const useLocale = () => {
  const { locale, setLocale, translations } = useContext(LocaleContext);

  /** UI 문구 번역: dot-notation 키 → 해당 언어 문자열 */
  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value ?? key; // 키 미발견 시 키 자체 반환 (디버깅 용이)
  }, [translations]);

  /** 데이터 객체 로컬라이즈: {ko, en} → 현재 언어 값 */
  const localized = useCallback((obj) => {
    if (obj && typeof obj === 'object' && ('ko' in obj || 'en' in obj)) {
      return obj[locale] ?? obj.en ?? obj.ko;
    }
    return obj; // 단순 문자열이면 그대로 반환
  }, [locale]);

  return { locale, setLocale, t, localized };
};

export default useLocale;
```

### 4.4 Context Provider

```jsx
// src/i18n/LocaleProvider.jsx
import { createContext, useState, useMemo } from 'react';
import detectLanguage from './detectLanguage';

// locale별 번역 파일 import
import koUi from './locales/ko/ui';
import koContent from './locales/ko/content';
import enUi from './locales/en/ui';
import enContent from './locales/en/content';

const allTranslations = {
  ko: { ...koUi, ...koContent },
  en: { ...enUi, ...enContent },
};

export const LocaleContext = createContext(null);

const STORAGE_KEY = 'rosko-locale';

function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLanguage);

  const setLocale = (lang) => {
    setLocaleState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

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

export default LocaleProvider;
```

### 4.5 App 통합

```jsx
// src/App.jsx
import LocaleProvider from './i18n/LocaleProvider';

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider theme={ theme }>
        <CssBaseline />
        <RothkoTimeline worksData={ worksData } eventsData={ eventsData } />
      </ThemeProvider>
    </LocaleProvider>
  );
}
```

---

## 5. 데이터 재구성

### 5.1 원칙

- 번역 대상 필드만 `{ ko: "...", en: "..." }` 객체로 변환
- 고정 영어 필드(`title`, `medium` 등)는 변경 없음
- 숫자/색상/좌표 등 비텍스트 필드는 변경 없음
- 동일 구조를 두 JSON 파일에 일관 적용

### 5.2 rothko_works.json 변환

#### periods (meta)

```jsonc
// Before
{
  "id": "FIG",
  "label": "구상기 (Figurative)",
  "range": "1924–1940",
  "color_tendency": "탁한 갈색, 회색, 어두운 도시 팔레트"
}

// After
{
  "id": "FIG",
  "label": { "ko": "구상기", "en": "Figurative Period" },
  "range": "1924–1940",
  "color_tendency": {
    "ko": "탁한 갈색, 회색, 어두운 도시 팔레트",
    "en": "Dull brown, grey, dark urban palette"
  }
}
```

#### works[]

```jsonc
// Before
{
  "id": "W001",
  "year": 1929,
  "title": "Untitled (Reclining Nude)",          // 고정 영어 — 변경 없음
  "period": "FIG",                                // 코드 — 변경 없음
  "medium": "oil on canvas",                      // 고정 영어 — 변경 없음
  "collection": "National Gallery of Art",        // 고정 영어 — 변경 없음
  "exhibition_note": "로스코 재단 기증(1986). 현존 최초기 유화 중 하나",
  "significance": "최초기 유화, 막스 베버 영향, 탁하고 어두운 색감"
}

// After
{
  "id": "W001",
  "year": 1929,
  "title": "Untitled (Reclining Nude)",
  "period": "FIG",
  "medium": "oil on canvas",
  "collection": "National Gallery of Art",
  "exhibition_note": {
    "ko": "로스코 재단 기증(1986). 현존 최초기 유화 중 하나",
    "en": "Donated by Rothko Foundation (1986). One of the earliest surviving oil paintings"
  },
  "significance": {
    "ko": "최초기 유화, 막스 베버 영향, 탁하고 어두운 색감",
    "en": "Earliest oil painting, Max Weber influence, dull dark palette"
  }
}
```

### 5.3 rothko_events.json 변환

#### biographical_periods[]

```jsonc
// Before
{
  "id": "BIO_CHILD",
  "label": "유년·이민",
  "keywords": ["불안", "이질감", "빈곤", "상실"]
}

// After
{
  "id": "BIO_CHILD",
  "label": { "ko": "유년·이민", "en": "Childhood & Immigration" },
  "keywords": {
    "ko": ["불안", "이질감", "빈곤", "상실"],
    "en": ["anxiety", "alienation", "poverty", "loss"]
  }
}
```

#### entropy_curve[]

```jsonc
// Before
{ "year": 1903, "y": 0.0, "label": "출생" }

// After
{ "year": 1903, "y": 0.0, "label": { "ko": "출생", "en": "Birth" } }
```

### 5.4 변환 대상 필드 요약

| 파일 | 필드 경로 | 변환 | 개수 |
|------|----------|------|------|
| `rothko_works.json` | `meta.periods[].label` | `{ko, en}` | 7 |
| | `meta.periods[].color_tendency` | `{ko, en}` | 7 |
| | `works[].exhibition_note` | `{ko, en}` | 47 |
| | `works[].significance` | `{ko, en}` | 47 |
| `rothko_events.json` | `meta.periods[].label` | `{ko, en}` | 7 |
| | `meta.periods[].color_tendency` | `{ko, en}` | 7 |
| | `biographical_periods[].label` | `{ko, en}` | 10 |
| | `biographical_periods[].keywords` | `{ko, en}` | 10 (배열) |
| | `entropy_curve[].label` | `{ko, en}` | ~55 |

---

## 6. Locale 파일 구조

### 6.1 ko/ui.js

```js
export default {
  band: {
    expand: '팽창',
    radiate: '발산',
    equil: '균형',
    contract: '수축',
    void: '소멸',
  },
  period: {
    FIG: '구상기',
    MYTH: '신화/초현실기',
    MULTI: '멀티폼 전환기',
    CLASSIC_B: '클래식 밝은 시기',
    SEAGRAM: '시그램 벽화',
    DARK: '후기 어두운 시기',
    FINAL: '최후기',
  },
  ui: {
    langSwitch: 'English',
    langLabel: '언어',
  },
};
```

### 6.2 en/ui.js

```js
export default {
  band: {
    expand: 'Expand',
    radiate: 'Radiate',
    equil: 'Equilibrium',
    contract: 'Contract',
    void: 'Void',
  },
  period: {
    FIG: 'Figurative',
    MYTH: 'Mythomorphic',
    MULTI: 'Multiforms',
    CLASSIC_B: 'Classic Bright',
    SEAGRAM: 'Seagram Murals',
    DARK: 'Dark Period',
    FINAL: 'Final Works',
  },
  ui: {
    langSwitch: '한국어',
    langLabel: 'Language',
  },
};
```

### 6.3 ko/content.js

```js
export default {
  bandDesc: {
    expand: '1949–54년. 유럽 여행에서 마티스의 색채와 르네상스 프레스코의 규모에 깊이 감응한 로스코는 ...',
    radiate: '1945–48년. 첫 아내 에디스와 이혼(1944) 후 ...',
    equil: '...',
    contract: '...',
    void: '...',
  },
};
```

### 6.4 en/content.js

```js
export default {
  bandDesc: {
    expand: 'After his 1950 European tour, deeply moved by Matisse\'s color and Renaissance fresco scale, Rothko ...',
    radiate: 'After divorcing his first wife Edith (1944) ...',
    equil: '...',
    contract: '...',
    void: '...',
  },
};
```

---

## 7. 컴포넌트 적용 패턴

### 7.1 BAND_LABELS 제거 (useTimelineLayout.js)

```jsx
// Before
const BAND_LABELS = {
  EXPAND: '팽창',
  RADIATE: '발산',
  EQUIL: '균형',
  CONTRACT: '수축',
  VOID: '소멸',
};

// 사용
label: BAND_LABELS[band.id],

// After — 밴드 ID를 그대로 전달, 소비처에서 t() 호출
label: band.id,

// 소비 컴포넌트에서
const { t } = useLocale();
<Typography>{ t(`band.${bandId.toLowerCase()}`) }</Typography>
```

### 7.2 BAND_DESC 제거 (TimelineCanvas.jsx)

```jsx
// Before
const BAND_DESC = { EXPAND: '1949–54년. 유럽 여행에서...' };
{ BAND_DESC[selectedBand] }

// After
const { t } = useLocale();
{ t(`bandDesc.${selectedBand.toLowerCase()}`) }
```

### 7.3 데이터 소비 컴포넌트

```jsx
// 모든 JSON 데이터 소비 지점에서
const { localized } = useLocale();

// 단일 값
<Typography>{ localized(work.exhibition_note) }</Typography>

// 배열
{ localized(period.keywords).map((kw) => (
  <Chip key={ kw } label={ kw } />
)) }

// 중첩 접근
<Typography>{ localized(data.meta.periods[0].label) }</Typography>
```

---

## 8. 언어 전환 UI

### 8.1 토글 버튼

```jsx
/**
 * LanguageToggle 컴포넌트
 *
 * Props: 없음 (useLocale 훅으로 상태 관리)
 */
function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  const handleToggle = () => {
    setLocale(locale === 'ko' ? 'en' : 'ko');
  };

  return (
    <Button
      onClick={ handleToggle }
      variant="text"
      size="small"
      sx={ { position: 'fixed', top: 16, right: 16, zIndex: 1200 } }
    >
      { t('ui.langSwitch') }
    </Button>
  );
}
```

### 8.2 배치 위치

- 우측 상단 고정 위치 (`position: fixed`)
- 타임라인 UI 위에 떠있는 형태
- 현재 언어의 반대 언어명 표시 (ko일 때 "English", en일 때 "한국어")

---

## 9. 구현 로드맵

### Phase 1: 인프라 구축

| 작업 | 파일 | 영향 |
|------|------|------|
| `detectLanguage.js` 작성 | 신규 | 없음 |
| `LocaleProvider.jsx` 작성 | 신규 | 없음 |
| `useLocale.js` 작성 | 신규 | 없음 |
| `App.jsx`에 Provider 래핑 | 수정 | 기존 동작 유지 |

**검증**: Provider 래핑 후 기존 화면 정상 렌더 확인

### Phase 2: Locale 파일 작성

| 작업 | 파일 | 비고 |
|------|------|------|
| `ko/ui.js` 작성 | 신규 | 기존 하드코딩에서 추출 |
| `ko/content.js` 작성 | 신규 | BAND_DESC에서 추출 |
| `en/ui.js` 작성 | 신규 | 영문 번역 |
| `en/content.js` 작성 | 신규 | 영문 번역 (미술사 감수 필요) |

**검증**: import 정상 동작 확인

### Phase 3: JSON 데이터 재구성

| 작업 | 파일 | 주의 |
|------|------|------|
| `rothko_works.json` 재구성 | 수정 | 47개 작품 × 2필드 = 94개 영문 번역 필요 |
| `rothko_events.json` 재구성 | 수정 | ~55개 엔트로피 라벨 + 10개 전기 시대 영문 번역 |

**검증**: JSON 파싱 정상 확인, 기존 데이터 소비 지점에서 에러 없음 확인

> **주의**: 이 단계에서 데이터 구조가 바뀌므로, Phase 4와 동시에 진행하거나 임시 어댑터 필요

### Phase 4: 컴포넌트 통합

| 작업 | 파일 | 변경 내용 |
|------|------|----------|
| `BAND_DESC` 제거, `t()` 적용 | `TimelineCanvas.jsx` | 상수 → Hook 호출 |
| `BAND_LABELS` 제거, `t()` 적용 | `useTimelineLayout.js` | 상수 → Hook 또는 ID 전달 |
| 데이터 소비 지점에 `localized()` 적용 | 타임라인 관련 컴포넌트 전체 | 직접 참조 → `localized()` 래핑 |

**검증**: 한국어/영어 각각 전환하여 모든 텍스트 정상 표시 확인

### Phase 5: 언어 전환 UI + 마무리

| 작업 | 파일 | 비고 |
|------|------|------|
| `LanguageToggle` 컴포넌트 | 신규 | 우측 상단 고정 버튼 |
| `<html lang>` 동적 변경 | `LocaleProvider.jsx` | SEO 최소 대응 |
| URL `?lang=` 파라미터 반영 | `detectLanguage.js` | 공유 링크 대응 |

**검증**: E2E 시나리오 (첫 방문 → 감지 → 전환 → 재방문 유지)

---

## 10. 주의사항 및 고려사항

### 10.1 번역 품질

- 47개 작품의 `exhibition_note` + `significance`는 미술사 맥락이 필요한 전문 텍스트
- `entropy_curve` 라벨(~55개)은 전기적 사건을 압축한 단어 — 뉘앙스 보존 중요
- BAND_DESC 장문 콘텐츠는 서사적 품질이 핵심 — 기계 번역 후 수동 감수 권장

### 10.2 타이포그래피

- 한국어와 영어의 글자 폭, 줄간격 차이
- 현재 테마에 한글 폰트(Pretendard) + 영문 세리프(Georgia) 설정 완료
- 필요시 locale별 `lineHeight` 미세 조정 가능 (Phase 5 이후)

### 10.3 레이아웃 영향

- 한국어 → 영어 전환 시 텍스트 길이 변화로 레이아웃 깨짐 가능
- 특히 `BAND_LABELS` (한국어 2글자 vs 영어 5~11글자) — 축 라벨 영역 대응 필요
- `entropy_curve` 라벨도 길이 차이 발생 — 말줄임/줄바꿈 처리 고려

### 10.4 데이터 마이그레이션

- Phase 3에서 JSON 구조 변경 시, 기존 `work.exhibition_note`를 직접 참조하는 모든 지점이 깨짐
- **Phase 3과 Phase 4를 반드시 동시에 진행**하거나, 임시 어댑터 함수로 하위 호환 유지
- 어댑터 예시: `getString(field) → typeof field === 'object' ? field.ko : field`

### 10.5 SSR/SEO

- 현재 Vite SPA — SSR 미지원
- 최소 대응: `<html lang="ko">` / `<html lang="en">` 동적 변경
- 추후 SEO 필요 시 메타 태그 + Open Graph locale 태그 추가 고려

### 10.6 향후 확장

- 3개 언어 이상 확장 시 현재 `{ko, en}` 구조로 대응 가능 (`{ko, en, ja}`)
- 단, locale 파일이 커지면 dynamic import로 코드 스플리팅 고려
- 현 규모(~240개)에서는 불필요
