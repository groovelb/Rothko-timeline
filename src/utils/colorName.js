/**
 * 회화 색상 네이밍 유틸리티
 * hex → 전통 회화 안료/색명 변환 (bilingual {en, ko})
 */

/** hex → HSL (h: 0-360, s: 0-100, l: 0-100) */
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * hex 색상 → 회화 색명 반환
 * @param {string} hex - '#rrggbb' 형식
 * @returns {{ en: string, ko: string }}
 */
function getColorName(hex) {
  /** 'Other' 버킷 */
  if (hex === '#BDBDBD') return { en: 'Other', ko: '기타' };

  const [h, s, l] = hexToHsl(hex);

  /* ── 무채색 ── */
  if (s < 8) {
    if (l < 8)  return { en: 'Ivory Black', ko: '아이보리 블랙' };
    if (l < 20) return { en: 'Lamp Black', ko: '램프 블랙' };
    if (l < 35) return { en: 'Charcoal', ko: '차콜' };
    if (l < 50) return { en: "Payne's Grey", ko: '페인즈 그레이' };
    if (l < 65) return { en: 'Neutral Grey', ko: '뉴트럴 그레이' };
    if (l < 80) return { en: 'Silver', ko: '실버' };
    if (l < 92) return { en: 'Flake White', ko: '플레이크 화이트' };
    return { en: 'Titanium White', ko: '티타늄 화이트' };
  }

  /* ── 저채도 (어스톤) ── */
  if (s < 25) {
    if (l < 20) {
      if (h >= 15 && h < 45)  return { en: 'Burnt Umber', ko: '번트 엄버' };
      if (h >= 45 && h < 80)  return { en: 'Raw Umber', ko: '로 엄버' };
      if (h >= 80 && h < 170) return { en: 'Dark Terre Verte', ko: '다크 테르 베르트' };
      if (h >= 170 && h < 260) return { en: 'Indigo', ko: '인디고' };
      return { en: 'Bistre', ko: '비스트르' };
    }
    if (l < 40) {
      if (h < 20 || h >= 345)  return { en: 'Indian Red', ko: '인디안 레드' };
      if (h >= 20 && h < 50)   return { en: 'Burnt Sienna', ko: '번트 시에나' };
      if (h >= 50 && h < 80)   return { en: 'Yellow Ochre', ko: '옐로 오커' };
      if (h >= 80 && h < 170)  return { en: 'Terre Verte', ko: '테르 베르트' };
      if (h >= 170 && h < 260) return { en: 'Slate Blue', ko: '슬레이트 블루' };
      return { en: 'Mauve', ko: '모브' };
    }
    if (l < 60) {
      if (h < 20 || h >= 345)  return { en: 'Venetian Red', ko: '베네치안 레드' };
      if (h >= 20 && h < 50)   return { en: 'Raw Sienna', ko: '로 시에나' };
      if (h >= 50 && h < 80)   return { en: 'Gold Ochre', ko: '골드 오커' };
      if (h >= 80 && h < 170)  return { en: 'Sage Green', ko: '세이지 그린' };
      if (h >= 170 && h < 260) return { en: 'Cadet Blue', ko: '카데트 블루' };
      return { en: 'Dusty Rose', ko: '더스티 로즈' };
    }
    if (h < 50 || h >= 340) return { en: 'Flesh Tint', ko: '플레시 틴트' };
    if (h >= 50 && h < 170)  return { en: 'Celadon', ko: '셀라돈' };
    return { en: 'Lavender Grey', ko: '라벤더 그레이' };
  }

  /* ── 고/중채도 — 색상환 분류 ── */

  /** Red (345°–15°) */
  if (h >= 345 || h < 15) {
    if (l < 20) return { en: 'Alizarin Crimson', ko: '알리자린 크림슨' };
    if (l < 35) return { en: 'Crimson Lake', ko: '크림슨 레이크' };
    if (l < 50) return { en: 'Cadmium Red Deep', ko: '카드뮴 레드 딥' };
    if (l < 65) return { en: 'Cadmium Red', ko: '카드뮴 레드' };
    if (l < 80) return { en: 'Vermillion', ko: '버밀리언' };
    return { en: 'Coral Pink', ko: '코랄 핑크' };
  }

  /** Red-Orange (15°–30°) */
  if (h < 30) {
    if (l < 30) return { en: 'Burnt Orange', ko: '번트 오렌지' };
    if (l < 50) return { en: 'Cadmium Orange', ko: '카드뮴 오렌지' };
    if (l < 70) return { en: 'Tangerine', ko: '탠저린' };
    return { en: 'Peach', ko: '피치' };
  }

  /** Orange-Yellow (30°–50°) */
  if (h < 50) {
    if (l < 30) return { en: 'Mars Orange', ko: '마스 오렌지' };
    if (l < 50) return { en: 'Yellow Ochre Deep', ko: '옐로 오커 딥' };
    if (l < 70) return { en: 'Naples Yellow Deep', ko: '나폴리 옐로 딥' };
    return { en: 'Naples Yellow', ko: '나폴리 옐로' };
  }

  /** Yellow (50°–65°) */
  if (h < 65) {
    if (l < 35) return { en: 'Yellow Ochre', ko: '옐로 오커' };
    if (l < 55) return { en: 'Cadmium Yellow Deep', ko: '카드뮴 옐로 딥' };
    if (l < 75) return { en: 'Cadmium Yellow', ko: '카드뮴 옐로' };
    return { en: 'Lemon Yellow', ko: '레몬 옐로' };
  }

  /** Yellow-Green (65°–85°) */
  if (h < 85) {
    if (l < 35) return { en: 'Olive Green', ko: '올리브 그린' };
    if (l < 55) return { en: 'Chartreuse', ko: '샤르트뢰즈' };
    if (l < 75) return { en: 'Yellow Green', ko: '옐로 그린' };
    return { en: 'Light Green', ko: '라이트 그린' };
  }

  /** Green (85°–160°) */
  if (h < 160) {
    if (l < 20) return { en: 'Hooker\'s Green', ko: '후커스 그린' };
    if (l < 35) return { en: 'Sap Green', ko: '삽 그린' };
    if (l < 50) return { en: 'Viridian', ko: '비리디안' };
    if (l < 65) return { en: 'Emerald Green', ko: '에메랄드 그린' };
    if (l < 80) return { en: 'Permanent Green', ko: '퍼머넌트 그린' };
    return { en: 'Mint', ko: '민트' };
  }

  /** Teal-Cyan (160°–200°) */
  if (h < 200) {
    if (l < 25) return { en: 'Viridian Deep', ko: '비리디안 딥' };
    if (l < 45) return { en: 'Teal', ko: '틸' };
    if (l < 65) return { en: 'Cerulean', ko: '세룰리안' };
    return { en: 'Turquoise', ko: '터콰이즈' };
  }

  /** Blue (200°–255°) */
  if (h < 255) {
    if (l < 15) return { en: 'Prussian Blue', ko: '프러시안 블루' };
    if (l < 30) return { en: 'Ultramarine Deep', ko: '울트라마린 딥' };
    if (l < 45) return { en: 'Ultramarine', ko: '울트라마린' };
    if (l < 60) return { en: 'Cobalt Blue', ko: '코발트 블루' };
    if (l < 75) return { en: 'Cerulean Blue', ko: '세룰리안 블루' };
    return { en: 'Powder Blue', ko: '파우더 블루' };
  }

  /** Violet-Purple (255°–300°) */
  if (h < 300) {
    if (l < 20) return { en: 'Dioxazine Purple', ko: '디옥사진 퍼플' };
    if (l < 40) return { en: 'Royal Purple', ko: '로열 퍼플' };
    if (l < 60) return { en: 'Violet', ko: '바이올렛' };
    if (l < 75) return { en: 'Amethyst', ko: '아메시스트' };
    return { en: 'Lavender', ko: '라벤더' };
  }

  /** Magenta-Pink (300°–345°) */
  if (l < 25) return { en: 'Quinacridone Magenta', ko: '퀴나크리돈 마젠타' };
  if (l < 45) return { en: 'Rose Madder', ko: '로즈 매더' };
  if (l < 60) return { en: 'Magenta', ko: '마젠타' };
  if (l < 75) return { en: 'Rose Pink', ko: '로즈 핑크' };
  return { en: 'Shell Pink', ko: '쉘 핑크' };
}

export { getColorName };
