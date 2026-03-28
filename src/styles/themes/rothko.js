/**
 * Rothko Timeline Theme
 *
 * 로스코 타임라인 전용 디자인 토큰.
 * 메타포: "미술관의 연대기 벽" — 색은 오직 로스코에게서만 온다.
 *
 * ## 핵심 철학
 * - **Gallery White**: 미술관 벽의 따뜻한 백색
 * - **Monochrome Chrome**: UI 요소는 무채색만
 * - **Serif + Sans-serif Dual System**: 감성(세리프) + 정보(산세리프)
 * - **Rothko-only Color**: 색은 감정 밴드와 작품 색면에서만
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// 1. Color Tokens — 무채색 크롬 + 로스코 팔레트
// ============================================================
const palette = {
  mode: 'light',

  // 갤러리 크롬 (무채색)
  primary: {
    light: '#8A8A8A',
    main: '#1A1A1A',
    dark: '#000000',
    contrastText: '#FAFAFA',
  },
  secondary: {
    light: '#B8B8B8',
    main: '#8A8A8A',
    dark: '#5A5A5A',
    contrastText: '#FAFAFA',
  },

  text: {
    primary: '#1A1A1A',
    secondary: '#8A8A8A',
    disabled: '#B8B8B8',
  },

  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },

  divider: '#E8E8E8',

  action: {
    active: '#1A1A1A',
    hover: 'rgba(0, 0, 0, 0.03)',
    selected: 'rgba(0, 0, 0, 0.05)',
    disabled: '#B8B8B8',
    disabledBackground: '#F0F0F0',
    focus: 'rgba(0, 0, 0, 0.08)',
  },

  grey: {
    50: '#FAFAFA',
    100: '#F0F0F0',
    200: '#E8E8E8',
    300: '#D4D4D4',
    400: '#B8B8B8',
    500: '#8A8A8A',
    600: '#5A5A5A',
    700: '#3A3A3A',
    800: '#1A1A1A',
    900: '#0A0A0A',
  },
};

// ============================================================
// 2. Typography — Cormorant Garamond + Pretendard 이중 체계
// ============================================================

/** 세리프: 시간, 감성, 역사 */
const serifFamily = '"Cormorant Garamond", "Georgia", "Times New Roman", serif';

/** 산세리프: 정보, 기능 */
const sansFamily = [
  '"Pretendard Variable"',
  'Pretendard',
  '-apple-system',
  'BlinkMacSystemFont',
  'system-ui',
  'Roboto',
  '"Helvetica Neue"',
  'sans-serif',
].join(',');

const typography = {
  fontFamily: sansFamily,
  headingFontFamily: serifFamily,

  fontSize: 14,
  htmlFontSize: 16,

  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,

  // 헤딩 — 세리프 (Cormorant Garamond)
  h1: {
    fontFamily: serifFamily,
    fontWeight: 300,
    fontSize: '1.75rem',     // 28px — 시기 제목
    lineHeight: 1.2,
    letterSpacing: '0.02em',
  },
  h2: {
    fontFamily: serifFamily,
    fontWeight: 400,
    fontSize: '1.5rem',      // 24px
    lineHeight: 1.3,
    letterSpacing: '0.02em',
  },
  h3: {
    fontFamily: serifFamily,
    fontWeight: 400,
    fontSize: '1.25rem',     // 20px
    lineHeight: 1.3,
    letterSpacing: '0.01em',
  },
  h4: {
    fontFamily: serifFamily,
    fontWeight: 400,
    fontSize: '1rem',        // 16px — 작품 제목
    lineHeight: 1.4,
    letterSpacing: '0.01em',
  },
  h5: {
    fontFamily: serifFamily,
    fontWeight: 300,
    fontSize: '0.875rem',    // 14px
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  h6: {
    fontFamily: serifFamily,
    fontWeight: 300,
    fontSize: '0.8125rem',   // 13px — 연도
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    color: '#8A8A8A',
  },

  // 본문 — 산세리프 (Pretendard)
  body1: {
    fontSize: '0.875rem',    // 14px
    lineHeight: 1.6,
    letterSpacing: '0',
  },
  body2: {
    fontSize: '0.75rem',     // 12px
    lineHeight: 1.6,
    letterSpacing: '0',
  },

  subtitle1: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  subtitle2: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
    color: '#8A8A8A',
  },

  // 캡션 — 이벤트 라벨
  caption: {
    fontSize: '0.6875rem',   // 11px
    lineHeight: 1.5,
    letterSpacing: '0.02em',
    color: '#8A8A8A',
  },

  // 오버라인 — 카테고리 코드
  overline: {
    fontSize: '0.625rem',    // 10px
    fontWeight: 500,
    lineHeight: 2,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#B8B8B8',
  },

  button: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.04em',
    textTransform: 'none',
  },
};

// ============================================================
// 3. Spacing & Shape
// ============================================================
const spacing = 8;

const shape = {
  borderRadius: 0,
};

// ============================================================
// 4. Shadows — 거의 없음 (갤러리 벽)
// ============================================================
const customShadows = {
  none: 'none',
  sm: '0 0 8px rgba(0, 0, 0, 0.04)',
  md: '0 0 12px rgba(0, 0, 0, 0.06)',
  lg: '0 0 16px rgba(0, 0, 0, 0.08)',
  xl: '0 0 20px rgba(0, 0, 0, 0.10)',
};

// ============================================================
// 5. Transitions — 느리고 부드러운
// ============================================================
const transitions = {
  duration: {
    shortest: 200,
    shorter: 300,
    short: 400,
    standard: 500,
    complex: 600,
    enteringScreen: 400,
    leavingScreen: 300,
    /** 몰입 모드 배경색 전환 */
    immersion: 1200,
    /** 감정 밴드 페이드 */
    bandFade: 800,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    /** 로스코 전환 — 천천히 시작, 천천히 끝 */
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
};

// ============================================================
// 6. Breakpoints
// ============================================================
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
};

// ============================================================
// 7. Z-Index
// ============================================================
const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// ============================================================
// 8. Component Overrides
// ============================================================
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
        backgroundColor: '#FAFAFA',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: customShadows.none,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        textTransform: 'none',
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        border: '1px solid #E8E8E8',
        boxShadow: customShadows.sm,
        fontSize: '0.6875rem',
        borderRadius: 0,
      },
      arrow: {
        color: '#FFFFFF',
      },
    },
  },
};

// ============================================================
// Theme 생성
// ============================================================
const rothkoTheme = createTheme({
  palette,
  typography,
  spacing,
  shape,
  breakpoints,
  zIndex,
  transitions,
  components,
});

rothkoTheme.customShadows = customShadows;

// ============================================================
// 커스텀 토큰: 로스코 타임라인 전용
// ============================================================
rothkoTheme.rothko = {
  // ── 감정 밴드 색상 (biographical_periods 대응) ──
  band: {
    immigration:  { color: '#A0937D', label: '유년·이민' },
    yale:         { color: '#8B7D6B', label: '예일·좌절' },
    newYork:      { color: '#8B6914', label: '뉴욕·시작' },
    theTen:       { color: '#A07B3D', label: 'The Ten·정체성' },
    divorce:      { color: '#4A235A', label: '이혼·전환' },
    remarriage:   { color: '#E67E22', label: '재혼·돌파' },
    classic:      { color: '#E74C3C', label: '클래식기·정점' },
    mural:        { color: '#922B21', label: '벽화기·갈등' },
    dark:         { color: '#1C1C1C', label: '암흑기' },
    final:        { color: '#000000', label: '종결' },
  },

  // ── 밴드 투명도 (배경에 스며든 느낌) ──
  bandOpacity: {
    min: 0.12,
    max: 0.35,
  },

  // ── 타임라인 크롬 ──
  axis: {
    color: '#D4D4D4',
    tickColor: '#D4D4D4',
    tickHeight: 6,
    labelColor: '#8A8A8A',
  },

  // ── 작품 색면 블록 ──
  painting: {
    gap: 3,
    padding: 5,
    borderRadius: 1,
    blurMin: 0.5,
    blurMax: 2,
    sizes: {
      sm: { width: 36, height: 48 },
      md: { width: 60, height: 80 },
      lg: { width: 160, height: 213 },
      xl: { width: 320, height: 427 },
    },
  },

  // ── 이벤트 카테고리 아이콘 매핑 ──
  eventCategory: {
    life:      { icon: 'Circle',   label: '개인사' },
    art:       { icon: 'Diamond',  label: '양식 전환' },
    career:    { icon: 'Square',   label: '커리어' },
    emotional: { icon: 'Triangle', label: '감정 전환점' },
  },

  // ── 호버/포커스 ──
  hover: {
    dimOpacity: 0.3,
    tooltipBorderWidth: 3,
    scaleUp: 1.8,
  },

  // ── 몰입 모드 ──
  immersion: {
    transitionDuration: 1200,
    backgroundOpacity: 1,
  },

  // ── 줌 레벨 ──
  zoom: {
    min: 1,
    max: 8,
    default: 1,
  },

  // ── 시각적 밀도 ──
  density: {
    whitespaceRatio: 0.65,
  },

  // ── 세리프 폰트 직접 참조용 ──
  serifFamily: '"Cormorant Garamond", "Georgia", "Times New Roman", serif',
};

export default rothkoTheme;

export {
  palette,
  typography,
  spacing,
  shape,
  customShadows,
  breakpoints,
  zIndex,
  transitions,
  components,
};
