/**
 * 색공간 변환 유틸리티
 * sRGB ↔ CIE LAB, Delta-E (CIE76)
 */

/** sRGB → Linear RGB (감마 제거) */
function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** Linear RGB → sRGB (감마 적용) */
function linearToSrgb(c) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, v * 255)));
}

/** RGB [0-255] → CIE LAB */
function rgbToLab(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  // D65 illuminant
  let x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047;
  let y = (0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb) / 1.00000;
  let z = (0.0193339 * lr + 0.0119150 * lg + 0.9503041 * lb) / 1.08883;

  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  const f = (t) => (t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116);

  x = f(x);
  y = f(y);
  z = f(z);

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** CIE LAB → RGB [0-255] */
function labToRgb(L, a, b) {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  const finv = (t) => {
    const t3 = t * t * t;
    return t3 > epsilon ? t3 : (116 * t - 16) / kappa;
  };

  const x = finv(fx) * 0.95047;
  const y = finv(fy) * 1.00000;
  const z = finv(fz) * 1.08883;

  const lr = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const lg = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  const lb = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  return [linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb)];
}

/** Delta-E CIE76 */
function deltaE(lab1, lab2) {
  return Math.sqrt(
    (lab1[0] - lab2[0]) ** 2 +
    (lab1[1] - lab2[1]) ** 2 +
    (lab1[2] - lab2[2]) ** 2
  );
}

/** RGB → hex */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

/** LAB → hex */
function labToHex(L, a, b) {
  const [r, g, bb] = labToRgb(L, a, b);
  return rgbToHex(r, g, bb);
}

/** 배열의 중앙값 (숫자) */
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** LAB 배열의 채널별 중앙값 */
function medianLab(labs) {
  return [
    median(labs.map((l) => l[0])),
    median(labs.map((l) => l[1])),
    median(labs.map((l) => l[2])),
  ];
}

export { rgbToLab, labToRgb, deltaE, rgbToHex, labToHex, median, medianLab };
