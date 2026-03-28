/**
 * composition_type에 따른 분석 전략 라우팅
 */
import { analyzeHorizontalBands } from './horizontal-band-analyzer.js';
import { extractDominantColors } from './dominant-color-extractor.js';

const BAND_TYPES = new Set(['classic', 'seagram', 'dark', 'final']);
const KMEANS_TYPES = new Set(['figurative', 'mythomorphic']);

/**
 * 작품의 composition_type에 맞는 전략으로 색상 추출
 * @param {{ pixels, width, height, channels }} image
 * @param {string} compositionType
 * @returns {{ method, confidence, background, blocks, edge_colors }}
 */
function analyzeWork(image, compositionType) {
  if (BAND_TYPES.has(compositionType)) {
    const bandResult = analyzeHorizontalBands(image, compositionType);
    if (bandResult.blocks.length >= 2) return bandResult;
    // 1블록 → k-means 폴백 (배경색은 밴드 분석 결과 유지)
    const kmeansResult = extractDominantColors(image);
    return { ...kmeansResult, background: bandResult.background, method: 'band_fallback_kmeans' };
  }

  if (KMEANS_TYPES.has(compositionType)) {
    return extractDominantColors(image);
  }

  // multiform: 밴드 분석 시도 → 실패 시 k-means 폴백
  if (compositionType === 'multiform') {
    const bandResult = analyzeHorizontalBands(image, compositionType);
    if (bandResult.blocks.length >= 2 && bandResult.confidence !== 'low') {
      return { ...bandResult, method: 'hybrid_band' };
    }
    return { ...extractDominantColors(image), method: 'hybrid_kmeans' };
  }

  // 알 수 없는 타입 → k-means 폴백
  return extractDominantColors(image);
}

export { analyzeWork };
