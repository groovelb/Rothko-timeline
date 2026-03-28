/**
 * k-means 주요색 추출 — figurative/mythomorphic 작품용 폴백
 */
import { rgbToLab, deltaE, labToHex, medianLab } from './color-space.js';
import { getPixel } from './image-preprocessor.js';

const SAMPLE_STEP = 4;
const MAX_ITERATIONS = 20;
const MIN_CLUSTER_RATIO = 0.08;

/**
 * k-means 기반 주요색 추출
 * @param {{ pixels: Buffer, width: number, height: number, channels: number }} image
 * @returns {{ background, blocks, edge_colors, method, confidence }}
 */
function extractDominantColors(image) {
  const { pixels, width, height, channels } = image;

  // 그리드 샘플링
  const samples = [];
  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      const [r, g, b] = getPixel(pixels, width, channels, x, y);
      samples.push(rgbToLab(r, g, b));
    }
  }

  // k=2,3,4 시도 후 최적 k 선택
  let bestResult = null;
  let bestScore = Infinity;

  for (let k = 2; k <= 4; k++) {
    const result = kMeans(samples, k);
    const score = result.inertia / samples.length;

    // 너무 작은 클러스터가 있으면 페널티
    const minSize = Math.min(...result.clusters.map((c) => c.count));
    const penalty = minSize < samples.length * MIN_CLUSTER_RATIO ? 1000 : 0;

    const adjustedScore = score + penalty + k * 50;

    if (adjustedScore < bestScore) {
      bestScore = adjustedScore;
      bestResult = result;
    }
  }

  // 클러스터를 크기순 정렬
  const blocks = bestResult.clusters
    .filter((c) => c.count >= samples.length * MIN_CLUSTER_RATIO)
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      color: labToHex(c.center[0], c.center[1], c.center[2]),
      ratio: Math.round((c.count / samples.length) * 100) / 100,
      y_start: null,
      y_end: null,
      _lab: c.center,
    }));

  // ratio 정규화
  const totalRatio = blocks.reduce((s, b) => s + b.ratio, 0);
  if (totalRatio > 0) {
    blocks.forEach((b) => { b.ratio = Math.round((b.ratio / totalRatio) * 100) / 100; });
  }

  return {
    method: 'dominant_color',
    confidence: 'medium',
    background: null,
    blocks,
    edge_colors: [],
  };
}

/** k-means 클러스터링 */
function kMeans(samples, k) {
  // 초기 중심: 균등 간격 샘플에서 선택
  const step = Math.floor(samples.length / k);
  let centers = Array.from({ length: k }, (_, i) => [...samples[i * step]]);

  let assignments = new Array(samples.length).fill(0);

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    // 배정
    let changed = false;
    for (let i = 0; i < samples.length; i++) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let c = 0; c < k; c++) {
        const d = deltaE(samples[i], centers[c]);
        if (d < minDist) {
          minDist = d;
          minIdx = c;
        }
      }
      if (assignments[i] !== minIdx) {
        assignments[i] = minIdx;
        changed = true;
      }
    }

    if (!changed) break;

    // 중심 재계산
    for (let c = 0; c < k; c++) {
      const members = samples.filter((_, i) => assignments[i] === c);
      if (members.length > 0) {
        centers[c] = medianLab(members);
      }
    }
  }

  // 결과 정리
  let inertia = 0;
  const clusters = centers.map((center, c) => {
    const members = samples.filter((_, i) => assignments[i] === c);
    members.forEach((m) => { inertia += deltaE(m, center) ** 2; });
    return { center, count: members.length };
  });

  return { clusters, inertia };
}

export { extractDominantColors };
