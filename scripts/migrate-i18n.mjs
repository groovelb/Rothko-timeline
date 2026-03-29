/**
 * i18n 데이터 마이그레이션 스크립트
 *
 * rothko_works.json, rothko_events.json의 한국어 텍스트 필드를
 * { ko: "...", en: "..." } 구조로 변환합니다.
 *
 * 사용: node scripts/migrate-i18n.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../src/data/rothko');

/** 문자열을 {ko, en} 객체로 래핑. 이미 객체면 그대로 반환 */
function wrapBilingual(koText, enText = '') {
  if (koText && typeof koText === 'object' && 'ko' in koText) return koText;
  return { ko: koText || '', en: enText || '' };
}

/* ────── Works 마이그레이션 ────── */

const worksPath = resolve(DATA_DIR, 'rothko_works.json');
const works = JSON.parse(readFileSync(worksPath, 'utf-8'));

/** meta.periods — label, color_tendency */
const periodLabelEn = {
  FIG: 'Figurative Period',
  MYTH: 'Mythomorphic Period',
  MULTI: 'Multiforms Transition',
  CLASSIC_B: 'Classic Bright Period',
  SEAGRAM: 'Seagram Murals',
  DARK: 'Dark Period',
  FINAL: 'Final Works',
};

const periodTendencyEn = {
  FIG: 'Dull brown, grey, dark urban palette',
  MYTH: 'Grey-brown, reddish-brown, dreamlike tones',
  MULTI: 'Colors begin to brighten, multi-colored masses',
  CLASSIC_B: 'Orange, yellow, red, pink — warm, luminous colors',
  SEAGRAM: 'Maroon, dark red, black — abrupt shift to darkness',
  DARK: 'Dark purple, black, brown, deep blue',
  FINAL: 'Black, grey, brown — extreme reduction of color',
};

works.meta.periods = works.meta.periods.map((p) => ({
  ...p,
  label: wrapBilingual(
    p.label.replace(/\s*\(.*\)$/, ''),
    periodLabelEn[p.id] || p.label
  ),
  color_tendency: wrapBilingual(
    p.color_tendency,
    periodTendencyEn[p.id] || ''
  ),
}));

/** works[] — exhibition_note, significance 영문 번역 매핑 */
const worksEnMap = {
  W001: {
    exhibition_note: 'Donated by Rothko Foundation (1986). One of the earliest surviving oil paintings.',
    significance: 'Earliest oil painting, Max Weber influence, dull dark palette',
  },
  W003: {
    exhibition_note: 'Donated by Rothko Foundation (1986). Created around the time of marriage to Edith.',
    significance: 'Depression-era landscape during marriage, Milton Avery influence',
  },
  W002: {
    exhibition_note: 'Exhibited at first solo show in Portland (1933).',
    significance: 'Early watercolor landscape',
  },
  W004: {
    exhibition_note: 'Gifted to friends during The Ten period.',
    significance: 'Subway series, urban solitude theme explored',
  },
  W005: {
    exhibition_note: 'A subway scene exhibited at The Ten group show; recently re-evaluated.',
    significance: 'The Ten period, Expressionist influence lingers, urban despair',
  },
  W006: {
    exhibition_note: 'Exhibited after Rothko\'s mythological turn; Nietzsche and Aeschylus influence visible.',
    significance: 'First mythological/surrealist work, radical shift from figuration',
  },
  W007: {
    exhibition_note: 'Letters to Barnett Newman confirm this is the start of mythological themes.',
    significance: 'Mythological series, surrealist symbolism, biomorphic forms',
  },
  W008: {
    exhibition_note: 'Displayed at Peggy Guggenheim\'s Art of This Century gallery.',
    significance: 'Exhibited at Guggenheim gallery, surrealist aquatic imagery',
  },
  W009: {
    exhibition_note: 'Transitional work from mythology to color abstraction, Multiform prototype.',
    significance: 'Transition from mythology to abstraction, Multiform prototype',
  },
  W010: {
    exhibition_note: 'Displayed at Betty Parsons Gallery. Marks full departure from figuration.',
    significance: 'Pure Multiform, full departure from figuration, floating color masses',
  },
  W011: {
    exhibition_note: 'Exhibited at Betty Parsons Gallery.',
    significance: 'Late Multiform with early Classic form emerging, orange/yellow birth',
  },
  W012: {
    exhibition_note: 'One of the first "classic" format works with stacked rectangles.',
    significance: 'First Classic Bright work, horizontal color stacks, luminous surface',
  },
  W013: {
    exhibition_note: 'Donated by Rothko Foundation (1986). Kate\'s birth year, peak personal happiness.',
    significance: 'Kate\'s birth year, warm orange, peak emotion and luminosity',
  },
  W014: {
    exhibition_note: 'Currently displayed at MoMA permanent collection.',
    significance: 'Exhibited at "15 Americans," public recognition, warm luminous peak',
  },
  W015: {
    exhibition_note: 'MoMA permanent collection. Whitney retrospective.',
    significance: 'Whitney retrospective, horizontal format, red/orange luminosity',
  },
  W016: {
    exhibition_note: 'Solo show at Art Institute of Chicago. Peak of warm color period.',
    significance: 'Chicago solo show, warm yellow/orange peak, brightest period',
  },
  W017: {
    exhibition_note: 'Estate of Mark Rothko.',
    significance: 'Orange Multiform legacy, deep luminous surface',
  },
  W018: {
    exhibition_note: 'Sold at Christie\'s for $86.9M (2012). Highest auction price at the time.',
    significance: 'Auction record, orange/yellow peak, commercial pinnacle',
  },
  W019: {
    exhibition_note: 'European tour begins (1958). Turning point from brightness to darkness.',
    significance: 'First hint of darkness, European encounter with Matisse/Rembrandt',
  },
  W020: {
    exhibition_note: 'Seagram Mural commission. "I want to ruin the appetite of every son of a bitch."',
    significance: 'Seagram commission, radical shift to dark red/maroon',
  },
  W021: {
    exhibition_note: 'One of the Seagram Mural series. Contract broken, works reclaimed.',
    significance: 'Seagram Murals, doorway motif, interior absorption',
  },
  W022: {
    exhibition_note: 'Exhibited at Sidney Janis Gallery.',
    significance: 'Post-Seagram dark period begins, Pop Art isolation',
  },
  W023: {
    exhibition_note: 'Purchased by Dominique de Menil.',
    significance: 'Deep darkness, post-Pop Art alienation',
  },
  W024: {
    exhibition_note: 'Harvard Mural commission (Holyoke Center). Later faded due to light damage.',
    significance: 'Harvard Murals, institutional commission, dark crimson',
  },
  W025: {
    exhibition_note: 'Harvard Mural panel. Deep crimson on brown, meditative darkness.',
    significance: 'Harvard Murals, deep meditative darkness',
  },
  W026: {
    exhibition_note: 'Displayed at Whitechapel Gallery retrospective, London.',
    significance: 'Whitechapel retrospective, European recognition, dark synthesis',
  },
  W027: {
    exhibition_note: 'Rothko Chapel commission begins (1964). Rothko\'s life project.',
    significance: 'Chapel commission begins, ultimate darkness project',
  },
  W028: {
    exhibition_note: 'A deep dark work reflecting increasing depression and drinking.',
    significance: 'Deepening depression, colors nearly extinguished',
  },
  W029: {
    exhibition_note: 'One of the Rothko Chapel murals. Triptych format.',
    significance: 'Chapel murals, sacred space, total color reduction',
  },
  W030: {
    exhibition_note: 'Chapel mural. Monochrome darkness, meditation space.',
    significance: 'Chapel monochrome, approaching black',
  },
  W031: {
    exhibition_note: 'Chapel interior panel. Purple-black, spiritual void.',
    significance: 'Chapel panel, spiritual void, near-black purple',
  },
  W032: {
    exhibition_note: 'Late Chapel panel. Extreme reduction.',
    significance: 'Chapel extreme reduction, formless dark',
  },
  W033: {
    exhibition_note: 'Created during health crisis. Aortic aneurysm diagnosis (1968).',
    significance: 'Post-aneurysm, extreme dark brown, health crisis works',
  },
  W034: {
    exhibition_note: 'Brown on grey series. Shift to paper works after aneurysm.',
    significance: 'Brown on grey, paper works, physical limitation',
  },
  W035: {
    exhibition_note: 'First of the Black on Gray series. Final studio period.',
    significance: 'Black on Gray begins, final series, binary reduction',
  },
  W036: {
    exhibition_note: 'Tate Gallery donation accepted during this period.',
    significance: 'Tate donation, Black on Gray, approaching end',
  },
  W037: {
    exhibition_note: 'One of the last Black on Gray works. Separation from Mell.',
    significance: 'Late Black on Gray, marital separation, isolation',
  },
  W038: {
    exhibition_note: 'Among the final works. Studio solitude.',
    significance: 'Final works, complete solitude, binary void',
  },
  W039: {
    exhibition_note: 'One of the very last paintings. Found in studio after death.',
    significance: 'Last paintings, found posthumously, ultimate reduction',
  },
  W040: {
    exhibition_note: 'Sold at Sotheby\'s for $46.5M (2007). Bright period masterwork.',
    significance: 'Auction landmark, bright period representative, white center',
  },
  W041: {
    exhibition_note: 'Sold at Christie\'s for $72.8M (2007).',
    significance: 'Auction record, green/blue luminous surface',
  },
  W042: {
    exhibition_note: 'Sold at Sotheby\'s for $75.1M (2015).',
    significance: 'Auction record, untitled purple/red/blue classic',
  },
  W043: {
    exhibition_note: 'Phillips Collection, Washington. One of the Rothko Room works.',
    significance: 'Rothko Room installation, immersive experience, orange/red',
  },
  W044: {
    exhibition_note: 'Phillips Collection Rothko Room.',
    significance: 'Rothko Room, ochre/green meditative pair',
  },
  W045: {
    exhibition_note: 'Seagram Mural donated to Tate. Arrived the day after Rothko\'s death.',
    significance: 'Tate Seagram gift, arrived day after death, dark red/maroon',
  },
  W046: {
    exhibition_note: 'National Gallery of Art permanent collection.',
    significance: 'NGA collection, classic bright period, orange/yellow',
  },
  W047: {
    exhibition_note: 'San Francisco Museum of Modern Art.',
    significance: 'SFMOMA collection, late bright period, red/orange transitions',
  },
};

works.works = works.works.map((w) => {
  const en = worksEnMap[w.id] || {};
  return {
    ...w,
    exhibition_note: wrapBilingual(w.exhibition_note, en.exhibition_note || ''),
    significance: wrapBilingual(w.significance, en.significance || ''),
  };
});

writeFileSync(worksPath, JSON.stringify(works, null, 2) + '\n', 'utf-8');
console.log(`✓ rothko_works.json migrated (${works.works.length} works)`);

/* ────── Events 마이그레이션 ────── */

const eventsPath = resolve(DATA_DIR, 'rothko_events.json');
const events = JSON.parse(readFileSync(eventsPath, 'utf-8'));

/** meta.periods — 동일 구조 */
events.meta.periods = events.meta.periods.map((p) => ({
  ...p,
  label: wrapBilingual(
    p.label.replace(/\s*\(.*\)$/, ''),
    periodLabelEn[p.id] || p.label
  ),
  color_tendency: wrapBilingual(
    p.color_tendency,
    periodTendencyEn[p.id] || ''
  ),
}));

/** biographical_periods — label, keywords */
const bioPeriodsEn = {
  BIO_CHILD: { label: 'Childhood & Immigration', keywords: ['anxiety', 'alienation', 'poverty', 'loss'] },
  BIO_YALE: { label: 'Yale, Frustration & Independence', keywords: ['alienation', 'rebellion', 'independence'] },
  BIO_NY: { label: 'New York & Beginnings', keywords: ['passion', 'exploration', 'first marriage'] },
  BIO_TEN: { label: 'The Ten & Identity', keywords: ['solidarity', 'resistance', 'civil rights'] },
  BIO_DIVORCE: { label: 'Divorce & Transformation', keywords: ['loss', 'mythological quest', 'artistic declaration'] },
  BIO_REBIRTH: { label: 'Remarriage & Breakthrough', keywords: ['love', 'Multiform birth', 'mother\'s death', 'reaching classic'] },
  BIO_CLASSIC: { label: 'Classic Period & Zenith', keywords: ['orange', 'red', 'yellow', 'recognition', 'zenith', 'distrust begins'] },
  BIO_MURAL: { label: 'Mural Period & Conflict', keywords: ['Seagram', 'anger', 'purity', 'Pop Art isolation', 'weight of fame'] },
  BIO_DARK: { label: 'Dark Period', keywords: ['Chapel', 'health decline', 'black forms', 'solitude'] },
  BIO_END: { label: 'The End', keywords: ['separation', 'Black on Gray', 'Tate donation', 'death'] },
};

events.meta.biographical_periods = events.meta.biographical_periods.map((bp) => {
  const en = bioPeriodsEn[bp.id] || {};
  return {
    ...bp,
    label: wrapBilingual(bp.label, en.label || bp.label),
    keywords: bp.keywords
      ? wrapBilingual(bp.keywords, en.keywords || bp.keywords)
      : bp.keywords,
  };
});

/** entropy_curve — label */
const entropyCurveEn = {
  '출생': 'Birth',
  '코사크 박해 공포': 'Fear of Cossack persecution',
  '유대 공동체, 헤데르 교육': 'Jewish community, Heder education',
  '아버지 이민, 7세에 이별': 'Father emigrates, parted at age 7',
  '가족 재결합, 미국 도착': 'Family reunited, arrives in America',
  '아버지 사망, 소년 노동': 'Father dies, child labor',
  '카디시 애도기, 종교 몰입': 'Kaddish mourning, religious immersion',
  '종교 단절, 노동, 적응': 'Religious break, labor, adaptation',
  'IWW 집회, 노동운동 꿈': 'IWW rallies, labor movement dreams',
  '고교 졸업, 카디시 종료': 'High school graduation, Kaddish ends',
  '예일 입학': 'Yale admission',
  '장학금 박탈, 반유대주의': 'Scholarship revoked, antisemitism',
  '중퇴, 방황': 'Dropout, wandering',
  '뉴욕 방황, 예술계 첫 접촉': 'New York wandering, first contact with art world',
  '아트 스튜던츠 리그': 'Art Students League',
  '베버 수학 완료, 고군분투': 'Weber studies complete, struggling',
  '첫 그룹전, 삽화 소송 패소': 'First group show, illustration lawsuit lost',
  '교사, 안정': 'Teaching, stability',
  '에이버리 서클': 'Avery circle',
  '에디스 교제': 'Courting Edith',
  '결혼': 'Marriage',
  '첫 개인전': 'First solo exhibition',
  '대공황 속 투쟁': 'Struggle amid the Depression',
  'The Ten 연대': 'The Ten solidarity',
  'WPA 참여': 'WPA participation',
  '결혼 위기': 'Marriage crisis',
  '시민권, 개명의 정체성 비용': 'Citizenship, identity cost of name change',
  '이혼 직전, 정체성 위기': 'Brink of divorce, identity crisis',
  '신화적 추상 시작': 'Mythological abstraction begins',
  'NYT 선언': 'NYT manifesto',
  '이혼': 'Divorce',
  '멜과 결혼, 첫 개인전(구겐하임)': 'Marriage to Mell, first solo show (Guggenheim)',
  'Subjects of the Artist 공동 설립': 'Co-founds Subjects of the Artist',
  '멀티폼 → 클래식 도달': 'Multiform → Classic achieved',
  '어머니 사망': 'Mother\'s death',
  '딸 케이트 탄생': 'Daughter Kate born',
  '15인의 미국인, MoMA': '15 Americans, MoMA',
  '시카고 개인전': 'Chicago solo exhibition',
  '휘트니 회고전': 'Whitney retrospective',
  '아들 크리스토퍼 탄생, 시그램 의뢰': 'Son Christopher born, Seagram commission',
  '시그램 파기, 유럽 여행': 'Seagram contract broken, European tour',
  '하버드 벽화 의뢰': 'Harvard Mural commission',
  '팝 아트 부상, 고립 심화': 'Pop Art rises, isolation deepens',
  'MoMA 회고전, 케네디 취임식 참석': 'MoMA retrospective, Kennedy inauguration',
  '채플 의뢰': 'Chapel commission',
  '건강 악화, 과음 심화': 'Health decline, heavy drinking',
  '채플 완성 눈앞, 대동맥류 진단': 'Chapel near completion, aneurysm diagnosis',
  '블랙 온 그레이 시리즈': 'Black on Gray series',
  '멜과 별거': 'Separation from Mell',
  '예일 명예박사 (너무 망가져 회복 불가)': 'Yale honorary doctorate (too broken to recover)',
  '블랙 온 그레이 시리즈': 'Black on Gray series',
  '자살': 'Suicide',
};

events.meta.entropy_curve = events.meta.entropy_curve.map((e) => ({
  ...e,
  label: wrapBilingual(e.label, entropyCurveEn[e.label] || e.label),
}));

/** events[] — title, description */
const eventsEnMap = {
  E001: { title: 'Birth', description: 'Born in Dvinsk, Russian Empire (now Daugavpils, Latvia) as the youngest of four children in a Jewish family. Birth name: Markus Yakovlevich Rothkowitz.' },
  E002: { title: 'Father emigrates to America', description: 'Father Jacob emigrates alone to Portland, USA, fleeing conscription fears and pogroms.' },
  E003: { title: 'Arrives in America', description: 'Markus, his mother, and sister Sonia arrive in America via Ellis Island. Family reunites in Portland.' },
  E004: { title: 'Father dies', description: 'Father Jacob dies of colon cancer, just 7 months after family reunification. After about a year of mourning at the synagogue, Markus renounces religion.' },
  E005: { title: 'Enters Yale University', description: 'Enters Yale University on a full scholarship. Studies economics, French, European history, mathematics, physics, biology, philosophy, and psychology. Original career goals: engineer or lawyer.' },
  E006: { title: 'Drops out of Yale, moves to NYC', description: 'Drops out of Yale, moves to New York. Later said he came "to bum around and starve a bit." Saw students sketching models at the Art Students League and recalled: "My life began."' },
  E007: { title: 'Enrolls at Art Students League', description: 'Enrolls at Art Students League. Studies under George Bridgman and Max Weber. In summer 1924, acts alongside Clark Gable at Josephine Dillon\'s Portland theater company. Later claimed "I was a better actor than Clark Gable." Gains stage set painting experience.' },
  E008: { title: 'First group show & illustration dispute', description: 'First group exhibition at Opportunity Galleries, New York. Loses lawsuit over credits and payment for Lewis Browne\'s "The Graphic Bible" illustrations.' },
  E009: { title: 'Begins teaching children\'s art', description: 'Begins teaching art to children at the Center Academy of the Brooklyn Jewish Center. Continues teaching for over 20 years.' },
  E010: { title: 'First solo exhibition', description: 'First solo exhibition at the Contemporary Arts Gallery, New York.' },
  E011: { title: 'The Ten group formed', description: 'Co-founds "The Ten: Whitney Dissenters" with Adolph Gottlieb and others to protest conservative exhibition practices.' },
  E012: { title: 'U.S. citizenship, name change', description: 'Officially becomes a U.S. citizen. Legally changes name from Marcus Rothkowitz to Mark Rothko.' },
  E013: { title: 'NYT manifesto', description: 'Publishes letter in New York Times with Adolph Gottlieb: "We favor flat forms that destroy illusion and reveal truth."' },
  E014: { title: 'Divorce', description: 'Divorces first wife Edith Sachar after years of marital conflict.' },
  E015: { title: 'Marries Mell, first solo show (Guggenheim)', description: 'Marries illustrator Mary Alice "Mell" Beistle. Holds first major solo exhibition at Peggy Guggenheim\'s Art of This Century gallery.' },
  E016: { title: 'Co-founds Subjects of the Artist', description: 'Co-founds the Subjects of the Artist school on East 8th Street with Baziotes, Hare, Motherwell, and David Hare. Becomes a key venue for Abstract Expressionist discourse.' },
  E017: { title: 'Mother dies', description: 'Mother Kate Rothkowitz dies. A pivotal personal loss during his artistic breakthrough period.' },
  E018: { title: 'Daughter Kate born', description: 'Daughter Kate (Katherine) born. Personal happiness peaks alongside artistic recognition.' },
  E019: { title: '15 Americans, MoMA', description: 'Participates in MoMA\'s landmark "15 Americans" exhibition, curated by Dorothy Miller.' },
  E020: { title: 'Chicago solo exhibition', description: 'Solo exhibition at the Art Institute of Chicago. Marks peak of Classic Bright period.' },
  E021: { title: 'Whitney retrospective', description: 'Retrospective exhibition at the Whitney Museum of American Art.' },
  E022: { title: 'Son Christopher born, Seagram commission', description: 'Son Christopher born. Receives commission for Seagram Building\'s Four Seasons restaurant murals.' },
  E023: { title: 'Seagram contract broken, European tour', description: 'Breaks Seagram contract, reclaims all paintings. Declared he wanted to "ruin the appetite of every son of a bitch." Travels Europe, visits Matisse chapel in Vence and Michelangelo\'s Laurentian Library.' },
  E024: { title: 'Harvard Mural commission', description: 'Receives commission for Harvard University\'s Holyoke Center murals. Creates five panels of deep crimson.' },
  E025: { title: 'Pop Art rises, isolation deepens', description: 'Pop Art dominates the art world. Abstract Expressionism criticized as anachronistic. Rothko grows increasingly isolated and bitter.' },
  E026: { title: 'MoMA retrospective, Kennedy inauguration', description: 'MoMA retrospective exhibition. Attends President Kennedy\'s inauguration ceremony.' },
  E027: { title: 'Chapel commission', description: 'Receives commission from John and Dominique de Menil for a non-denominational chapel in Houston (later the Rothko Chapel).' },
  E028: { title: 'Health decline, heavy drinking', description: 'Health significantly deteriorates due to excessive drinking, depression, and overwork.' },
  E029: { title: 'Chapel near completion, aneurysm diagnosis', description: 'Chapel murals nearing completion. Diagnosed with aortic aneurysm. Doctors restrict him to small-format works only.' },
  E030: { title: 'Black on Gray series', description: 'Begins final series "Black on Gray" — two horizontal planes of black and gray, the ultimate reduction of color.' },
  E031: { title: 'Separation from Mell', description: 'Separates from wife Mell. Lives alone in his East 69th Street studio.' },
  E032: { title: 'Death', description: 'Found dead in his studio on February 25, 1970. The Tate Gallery\'s Seagram Mural donation arrived the same day. The Rothko Chapel opened the following year (1971).' },
};

events.events = events.events.map((e) => {
  const en = eventsEnMap[e.id] || {};
  return {
    ...e,
    title: wrapBilingual(e.title, en.title || e.title),
    description: e.description
      ? wrapBilingual(e.description, en.description || '')
      : e.description,
  };
});

writeFileSync(eventsPath, JSON.stringify(events, null, 2) + '\n', 'utf-8');
console.log(`✓ rothko_events.json migrated (${events.events.length} events, ${events.meta.entropy_curve.length} entropy points, ${events.meta.biographical_periods.length} bio periods)`);

console.log('\nMigration complete!');
