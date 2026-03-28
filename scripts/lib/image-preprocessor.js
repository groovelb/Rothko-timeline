/**
 * 이미지 전처리 — sharp로 로드, 리사이즈, 픽셀 버퍼 추출
 */
import sharp from 'sharp';

const WORKING_WIDTH = 400;

/**
 * 이미지를 로드하고 RGB 픽셀 데이터를 반환
 * @param {string} imagePath - 이미지 파일 경로
 * @returns {{ pixels: Buffer, width: number, height: number }}
 */
async function loadImage(imagePath) {
  const meta = await sharp(imagePath).metadata();
  const needsResize = meta.width > WORKING_WIDTH;

  let pipeline = sharp(imagePath).removeAlpha().toColorspace('srgb');
  if (needsResize) {
    pipeline = pipeline.resize(WORKING_WIDTH);
  }

  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });

  return {
    pixels: data,
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
}

/**
 * (x, y) 좌표의 RGB 값을 반환
 */
function getPixel(pixels, width, channels, x, y) {
  const idx = (y * width + x) * channels;
  return [pixels[idx], pixels[idx + 1], pixels[idx + 2]];
}

export { loadImage, getPixel };
