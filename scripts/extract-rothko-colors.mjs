/**
 * 로스코 작품 색상 추출 메인 스크립트
 *
 * 47개 작품 이미지를 분석하여 color_blocks / background / color_extraction 데이터를 갱신.
 * 실행: node scripts/extract-rothko-colors.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadImage } from './lib/image-preprocessor.js';
import { analyzeWork } from './lib/strategy-selector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const WORKS_PATH = path.join(ROOT, 'src/data/rothko/rothko_works.json');
const IMAGES_DIR = path.join(ROOT, 'public');
const OVERRIDES_PATH = path.join(__dirname, 'rothko-manual-overrides.json');
const REPORT_PATH = path.join(__dirname, 'output/color-extraction-report.html');

async function main() {
  console.log('=== 로스코 색상 추출 시작 ===\n');

  const worksData = JSON.parse(readFileSync(WORKS_PATH, 'utf-8'));
  const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, 'utf-8'));
  const works = worksData.works;
  const reportRows = [];

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const work of works) {
    const id = work.id;

    // 수동 오버라이드 확인
    if (overrides[id]) {
      console.log(`[${id}] 수동 오버라이드 적용`);
      applyOverride(work, overrides[id]);
      reportRows.push(buildReportRow(work, overrides[id].color_extraction, 'override'));
      skipped++;
      continue;
    }

    // 이미지 경로 확인
    const imagePath = path.join(IMAGES_DIR, work.image);
    if (!existsSync(imagePath)) {
      console.log(`[${id}] 이미지 없음: ${work.image}`);
      errors++;
      continue;
    }

    try {
      const image = await loadImage(imagePath);
      const result = analyzeWork(image, work.composition_type);

      // 기존 데이터 백업 후 갱신
      const oldBlocks = work.color_blocks;
      applyResult(work, result);
      reportRows.push(buildReportRow(work, result, 'auto', oldBlocks));
      processed++;

      const blockColors = result.blocks.map((b) => b.color).join(', ');
      console.log(`[${id}] ${work.composition_type} → ${result.method} (${result.confidence}) | ${blockColors}`);
    } catch (err) {
      console.error(`[${id}] 오류: ${err.message}`);
      errors++;
    }
  }

  // JSON 저장
  writeFileSync(WORKS_PATH, JSON.stringify(worksData, null, 2) + '\n', 'utf-8');
  console.log(`\n✓ ${WORKS_PATH} 갱신 완료`);

  // 리포트 생성
  const html = generateReport(reportRows);
  writeFileSync(REPORT_PATH, html, 'utf-8');
  console.log(`✓ ${REPORT_PATH} 생성 완료`);

  console.log(`\n=== 완료: ${processed} 처리 / ${skipped} 오버라이드 / ${errors} 오류 ===`);
}

/** 추출 결과를 work 객체에 적용 */
function applyResult(work, result) {
  // color_blocks (기존 형태 유지)
  work.color_blocks = result.blocks.map((b) => ({
    color: b.color,
    ratio: b.ratio,
  }));

  // background
  if (result.background) {
    work.background = result.background.color;
  }

  // color_extraction (상세 데이터)
  work.color_extraction = {
    method: result.method,
    confidence: result.confidence,
    background: result.background ? { color: result.background.color, ratio: result.background.ratio } : null,
    blocks: result.blocks.map((b) => ({
      color: b.color,
      ratio: b.ratio,
      y_start: b.y_start,
      y_end: b.y_end,
    })),
    edge_colors: result.edge_colors || [],
  };
}

/** 수동 오버라이드 적용 */
function applyOverride(work, override) {
  if (override.color_blocks) work.color_blocks = override.color_blocks;
  if (override.background) work.background = override.background;
  if (override.color_extraction) work.color_extraction = override.color_extraction;
}

/** 리포트 행 데이터 생성 */
function buildReportRow(work, result, type, oldBlocks = null) {
  return {
    id: work.id,
    title: work.title,
    year: work.year,
    period: work.period,
    compositionType: work.composition_type,
    image: work.image,
    method: result.method,
    confidence: result.confidence,
    newBlocks: result.blocks || [],
    newBackground: result.background,
    oldBlocks: oldBlocks || [],
    edgeColors: result.edge_colors || [],
    type,
  };
}

/** HTML 리포트 생성 */
function generateReport(rows) {
  const rowsHtml = rows.map((r) => {
    const oldStrip = r.oldBlocks.map((b) =>
      `<div style="background:${b.color};flex:${b.ratio};height:100%"></div>`
    ).join('');

    const newStrip = r.newBlocks.map((b) =>
      `<div style="background:${b.color};flex:${b.ratio};height:100%"></div>`
    ).join('');

    const bgSwatch = r.newBackground
      ? `<div style="width:20px;height:20px;background:${r.newBackground.color || r.newBackground};border:1px solid #ddd"></div>`
      : '-';

    const edgeSwatch = r.edgeColors.map((e) =>
      `<div style="width:12px;height:12px;background:${e.color};display:inline-block;margin-right:2px;border:1px solid #eee"></div>`
    ).join('');

    const confClass = r.confidence === 'high' ? 'conf-high' : r.confidence === 'low' ? 'conf-low' : 'conf-med';

    return `<tr class="${confClass}">
      <td>${r.id}</td>
      <td><img src="../public${r.image}" width="60" height="80" style="object-fit:cover"></td>
      <td>${r.title}<br><small>${r.year} · ${r.period} · ${r.compositionType}</small></td>
      <td><div class="strip">${oldStrip}</div></td>
      <td><div class="strip">${newStrip}</div></td>
      <td>${bgSwatch}</td>
      <td>${edgeSwatch || '-'}</td>
      <td><span class="badge">${r.method}</span></td>
      <td><span class="badge badge-${r.confidence}">${r.confidence}</span></td>
    </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Rothko Color Extraction Report</title>
<style>
  body { font-family: -apple-system, sans-serif; margin: 20px; background: #fafafa; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e0e0e0; padding: 8px; text-align: center; vertical-align: middle; }
  th { background: #333; color: #fff; font-size: 0.8rem; }
  td { font-size: 0.75rem; }
  .strip { display: flex; width: 60px; height: 80px; border: 1px solid #ddd; margin: 0 auto; }
  .badge { padding: 2px 6px; border-radius: 3px; font-size: 0.65rem; background: #eee; }
  .badge-high { background: #c8e6c9; }
  .badge-medium, .badge-med { background: #fff9c4; }
  .badge-low { background: #ffcdd2; }
  .badge-manual { background: #bbdefb; }
  .conf-low { background: #fff3f0; }
  img { display: block; margin: 0 auto; }
  small { color: #888; }
</style>
</head>
<body>
<h1>Rothko Color Extraction Report</h1>
<p>Generated: ${new Date().toISOString()}</p>
<table>
<thead>
<tr>
  <th>ID</th><th>Image</th><th>Title</th><th>Old</th><th>New</th><th>BG</th><th>Edges</th><th>Method</th><th>Conf</th>
</tr>
</thead>
<tbody>
${rowsHtml}
</tbody>
</table>
</body>
</html>`;
}

main().catch(console.error);
