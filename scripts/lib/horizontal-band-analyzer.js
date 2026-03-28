/**
 * 수평 밴드 분석 — 로스코 color field 전용 알고리즘
 *
 * 1. 배경색 추출 (외곽 픽셀)
 * 2. 수직 컬러 프로파일 구축 (행별 중앙값)
 * 3. Delta-E 기반 경계 탐지
 * 4. 블록별 색상/비율 추출
 * 5. 경계 전환색 추출
 */
import { rgbToLab, deltaE, medianLab, labToHex, median } from './color-space.js';
import { getPixel } from './image-preprocessor.js';

const BORDER_RATIO = 0.07;
const INNER_MARGIN = 0.08;
const GAUSSIAN_SIGMA = 2;
const MIN_ZONE_RATIO = 0.05;
const MERGE_DISTANCE_RATIO = 0.05;

/**
 * 수평 밴드 분석 실행
 * @param {{ pixels: Buffer, width: number, height: number, channels: number }} image
 * @param {string} compositionType - 'classic' | 'seagram' | 'dark' | 'final'
 * @returns {{ background, blocks, edge_colors, method, confidence }}
 */
function analyzeHorizontalBands(image, compositionType) {
  const { pixels, width, height, channels } = image;

  // Step 1: 배경색 추출
  const background = extractBackground(pixels, width, height, channels);

  // Step 2: 수직 컬러 프로파일
  const profile = buildVerticalProfile(pixels, width, height, channels);

  // Step 3: 경계 탐지
  const isDark = compositionType === 'dark' || compositionType === 'final' || compositionType === 'seagram';
  const boundaries = detectBoundaries(profile, height, isDark);

  // Step 4: 블록 추출
  const topMargin = Math.round(height * BORDER_RATIO);
  const bottomMargin = height - Math.round(height * BORDER_RATIO);
  const blocks = extractBlocks(profile, boundaries, topMargin, bottomMargin, height);

  // Step 5: 경계 전환색
  const edgeColors = extractEdgeColors(profile, boundaries, height);

  // 신뢰도 판단
  let confidence = 'high';
  if (blocks.length <= 1) confidence = 'medium';
  if (blocks.length === 0) confidence = 'low';

  return {
    method: 'horizontal_band',
    confidence,
    background,
    blocks,
    edge_colors: edgeColors,
  };
}

/** 외곽 픽셀에서 배경색 추출 */
function extractBackground(pixels, width, height, channels) {
  const borderX = Math.max(1, Math.round(width * BORDER_RATIO));
  const borderY = Math.max(1, Math.round(height * BORDER_RATIO));
  const labs = [];

  // 상단 스트립
  for (let y = 0; y < borderY; y++) {
    for (let x = borderX; x < width - borderX; x += 3) {
      const [r, g, b] = getPixel(pixels, width, channels, x, y);
      labs.push(rgbToLab(r, g, b));
    }
  }
  // 하단 스트립
  for (let y = height - borderY; y < height; y++) {
    for (let x = borderX; x < width - borderX; x += 3) {
      const [r, g, b] = getPixel(pixels, width, channels, x, y);
      labs.push(rgbToLab(r, g, b));
    }
  }
  // 좌측 스트립
  for (let y = borderY; y < height - borderY; y += 2) {
    for (let x = 0; x < borderX; x++) {
      const [r, g, b] = getPixel(pixels, width, channels, x, y);
      labs.push(rgbToLab(r, g, b));
    }
  }
  // 우측 스트립
  for (let y = borderY; y < height - borderY; y += 2) {
    for (let x = width - borderX; x < width; x++) {
      const [r, g, b] = getPixel(pixels, width, channels, x, y);
      labs.push(rgbToLab(r, g, b));
    }
  }

  const med = medianLab(labs);
  const bgPixelCount = labs.length;
  const totalPixels = width * height;

  return {
    color: labToHex(med[0], med[1], med[2]),
    ratio: Math.round((bgPixelCount / totalPixels) * 100) / 100,
    _lab: med,
  };
}

/** 행별 중앙값으로 수직 컬러 프로파일 구축 */
function buildVerticalProfile(pixels, width, height, channels) {
  const marginX = Math.round(width * INNER_MARGIN);
  const profile = [];

  for (let y = 0; y < height; y++) {
    const labs = [];
    for (let x = marginX; x < width - marginX; x += 2) {
      const [r, g, b] = getPixel(pixels, width, channels, x, y);
      labs.push(rgbToLab(r, g, b));
    }
    profile.push(medianLab(labs));
  }

  return profile;
}

/** 가우시안 스무딩 */
function gaussianSmooth(signal, sigma) {
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const half = Math.floor(kernelSize / 2);
  const kernel = [];
  let sum = 0;

  for (let i = -half; i <= half; i++) {
    const val = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(val);
    sum += val;
  }
  kernel.forEach((_, i) => { kernel[i] /= sum; });

  const result = new Array(signal.length).fill(0);
  for (let i = 0; i < signal.length; i++) {
    let acc = 0;
    for (let k = 0; k < kernelSize; k++) {
      const idx = Math.min(signal.length - 1, Math.max(0, i + k - half));
      acc += signal[idx] * kernel[k];
    }
    result[i] = acc;
  }
  return result;
}

/** Delta-E 기반 경계 탐지 */
function detectBoundaries(profile, height, isDark) {
  const topMargin = Math.round(height * BORDER_RATIO);
  const bottomMargin = height - Math.round(height * BORDER_RATIO);

  // 연속 행 간 Delta-E
  const rawDeltaE = [];
  for (let y = 1; y < profile.length; y++) {
    rawDeltaE.push(deltaE(profile[y - 1], profile[y]));
  }

  // 가우시안 스무딩
  const smoothed = gaussianSmooth(rawDeltaE, GAUSSIAN_SIGMA);

  // 내부 영역만으로 통계 계산 (테두리 전환 노이즈 제외)
  const innerSmoothed = smoothed.slice(topMargin, bottomMargin);
  const sorted = [...innerSmoothed].sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)];
  const stddev = Math.sqrt(innerSmoothed.reduce((s, v) => s + (v - med) ** 2, 0) / innerSmoothed.length);

  // 이중 임계값: 절대 최소값 + 상대 비율(중앙값 대비)
  const absThreshold = isDark ? 0.5 : 1.0;
  const relThreshold = med > 0 ? med * 3 : absThreshold;
  const threshold = Math.max(absThreshold, Math.min(relThreshold, med + 1.5 * stddev));

  // 피크 탐지 (내부 영역만, 확장된 마진 10%)
  const peakMarginTop = Math.round(height * 0.10);
  const peakMarginBot = height - Math.round(height * 0.10);
  const peaks = [];
  for (let i = Math.max(1, peakMarginTop); i < Math.min(smoothed.length - 1, peakMarginBot); i++) {
    if (smoothed[i] > threshold && smoothed[i] >= smoothed[i - 1] && smoothed[i] >= smoothed[i + 1]) {
      peaks.push({ y: i + 1, strength: smoothed[i] });
    }
  }

  // 인접 피크 병합
  const mergeDistance = Math.round(height * MERGE_DISTANCE_RATIO);
  const merged = [];
  for (const peak of peaks) {
    if (merged.length === 0 || peak.y - merged[merged.length - 1].y > mergeDistance) {
      merged.push(peak);
    } else if (peak.strength > merged[merged.length - 1].strength) {
      merged[merged.length - 1] = peak;
    }
  }

  return merged;
}

/** 경계 사이 블록 색상 추출 */
function extractBlocks(profile, boundaries, topMargin, bottomMargin, height) {
  const transitionWidth = Math.round(height * 0.02);
  const zones = [];

  // 경계점으로 구간 분할
  const edges = [topMargin, ...boundaries.map((b) => b.y), bottomMargin];

  for (let i = 0; i < edges.length - 1; i++) {
    const start = i === 0 ? edges[i] : edges[i] + transitionWidth;
    const end = i === edges.length - 2 ? edges[i + 1] : edges[i + 1] - transitionWidth;

    if (end - start < height * MIN_ZONE_RATIO) continue;

    const zoneLabs = profile.slice(start, end);
    if (zoneLabs.length === 0) continue;

    const med = medianLab(zoneLabs);
    const innerHeight = bottomMargin - topMargin;

    zones.push({
      color: labToHex(med[0], med[1], med[2]),
      ratio: Math.round(((end - start) / innerHeight) * 100) / 100,
      y_start: Math.round((start / height) * 100) / 100,
      y_end: Math.round((end / height) * 100) / 100,
      _lab: med,
    });
  }

  // ratio 정규화
  const totalRatio = zones.reduce((s, z) => s + z.ratio, 0);
  if (totalRatio > 0) {
    zones.forEach((z) => { z.ratio = Math.round((z.ratio / totalRatio) * 100) / 100; });
  }

  return zones;
}

/** 경계 전환색 추출 */
function extractEdgeColors(profile, boundaries, height) {
  const edgeWidth = Math.round(height * 0.02);

  return boundaries.map((b) => {
    const start = Math.max(0, b.y - edgeWidth);
    const end = Math.min(profile.length, b.y + edgeWidth);
    const labs = profile.slice(start, end);
    if (labs.length === 0) return null;

    const med = medianLab(labs);
    return {
      color: labToHex(med[0], med[1], med[2]),
      y_position: Math.round((b.y / height) * 100) / 100,
      width: Math.round(((edgeWidth * 2) / height) * 100) / 100,
    };
  }).filter(Boolean);
}

export { analyzeHorizontalBands };
