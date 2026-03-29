/**
 * i18n 누락 영문 번역 보완 스크립트
 * 사용: node scripts/migrate-i18n-patch.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../src/data/rothko');

/* ────── Works 보완 ────── */

const worksPath = resolve(DATA_DIR, 'rothko_works.json');
const works = JSON.parse(readFileSync(worksPath, 'utf-8'));

const worksPatch = {
  W003b: {
    exhibition_note: 'Gloucester summer work. Direct Avery influence.',
    significance: 'Rare natural landscape with beach subject. Dull palette despite bright theme.',
  },
  W007b: {
    exhibition_note: 'Exhibited at Kunsthistorisches Museum Vienna (2019), Fondation Louis Vuitton (2023). References Vermeer\'s "The Art of Painting."',
    significance: 'Last major figurative painting. FIG→MYTH turning point. Year of The Ten\'s dissolution.',
  },
  W030b: {
    exhibition_note: 'Sotheby\'s 2014 $36.5M. Bunny Mellon estate.',
    significance: 'All-warm palette. Same year as Newman/Still betrayal — dramatic contrast between bright colors and melancholic emotion.',
  },
  W033b: {
    exhibition_note: 'Acquired 1997. A transitional work from the Seagram crisis year, with bright orange still present.',
    significance: 'One of 19 works from 1960. Bright orange remains but aubergine ground foreshadows coming darkness.',
  },
  W033c: {
    exhibition_note: 'Sotheby\'s May 2019 $50.1M. Silver-grey band extremely rare in Rothko\'s oeuvre.',
    significance: 'Personally selected by Rothko for SFMOMA. Silver-grey band is nearly unique across all works.',
  },
  W036b: {
    exhibition_note: 'Donated 2020. Horizontal format — unusual for Rothko.',
    significance: 'Horizontal format. Upper white band intensifies the dark palette. Prefigures Chapel murals.',
  },
  W046b: {
    exhibition_note: 'Independent work from Chapel immersion period. Shares Chapel palette but smaller scale.',
    significance: 'Rare independent work during Chapel immersion. Very few works from 1965.',
  },
  W046c: {
    exhibition_note: 'Donated by Rothko Foundation (1986). Special medium intended to absorb rather than reflect light.',
    significance: 'Chapel alternate work. Special light-absorbing medium. Approximately 15 feet.',
  },
  W046d: {
    exhibition_note: 'Muriel Kallis Steinberg Newman Collection.',
    significance: 'Rare warm color remnant in final period. Red-orange and magenta. Momentary warmth amid darkness.',
  },
  W046e: {
    exhibition_note: 'One of five completed works from 1967.',
    significance: 'Return to easel work after Chapel. Near-monochrome darkness. Precursor to final period.',
  },
  W048: {
    exhibition_note: 'NGA. Created after aortic aneurysm diagnosis.',
    significance: '"Brown and Gray" series. Restricted to under 3 feet.',
  },
  W049: {
    exhibition_note: 'NGA. Exhibited at Pace "Dark Paintings" (1985), Tate "Late Series" (2008), Gemeentemuseum/Seoul (2014).',
    significance: 'Black on Gray series of 25 works. Canvas bisected horizontally. Created in studio after separation from Mell.',
  },
  W050: {
    exhibition_note: 'NGA. Posthumous donation by Rothko Foundation.',
    significance: 'Among Rothko\'s last canvas works. Possibly unfinished.',
  },
};

let worksPatched = 0;
works.works = works.works.map((w) => {
  const patch = worksPatch[w.id];
  if (patch) {
    worksPatched++;
    return {
      ...w,
      exhibition_note: { ko: w.exhibition_note.ko, en: patch.exhibition_note },
      significance: { ko: w.significance.ko, en: patch.significance },
    };
  }
  return w;
});

writeFileSync(worksPath, JSON.stringify(works, null, 2) + '\n', 'utf-8');
console.log(`✓ Works patched: ${worksPatched} entries`);

/* ────── Events 보완 ────── */

const eventsPath = resolve(DATA_DIR, 'rothko_events.json');
const events = JSON.parse(readFileSync(eventsPath, 'utf-8'));

const eventsPatch = {
  E033: {
    title: 'Seagram commission officially withdrawn',
    description: 'Officially withdraws from Seagram commission, returning full $35,000. Keeps the paintings. Relationship with commercial art world permanently severed.',
  },
  E034: {
    title: 'MoMA retrospective & Harvard commission',
    description: 'Major MoMA retrospective — commercial and critical success. Seated next to Joseph Kennedy at JFK inauguration ball. Accepts Harvard University Holyoke Center mural commission.',
  },
  E035: {
    title: 'Rise of Pop Art & growing isolation',
    description: 'Pop Art ascends. Calls Warhol and others "charlatans and young opportunists." Upon seeing Jasper Johns\' flag paintings: "We worked for years to get rid of all that." Isolation deepens.',
  },
  E036: {
    title: 'Son Christopher born',
    description: 'Son Christopher born.',
  },
  E037: {
    title: 'Rothko Chapel commission & Black-Form series',
    description: 'Receives chapel mural commission from the de Menils for a non-denominational chapel in Houston. Devotes the next three years to the project. Creates 17 "Black-Form" paintings. Moves to new East 69th Street studio with pulley system for lighting control.',
  },
  E038: {
    title: 'Second European tour',
    description: 'European tour — Italy, Portugal, Spain, France, Netherlands, Belgium, London. Visits Giotto in Assisi, Fra Angelico in Florence, Monet\'s Water Lilies room in Paris.',
  },
  E039: {
    title: 'Aortic aneurysm diagnosis',
    description: 'In early spring, experiences back pain and leg numbness after dinner — diagnosed with aortic aneurysm. Hospitalized for approximately two weeks (Dr. Allen Mead). Caused by hypertension. Surgery impossible due to severe cirrhosis and emphysema from years of heavy drinking. Prescribed reserpine and diuretics. Ignores doctor\'s orders to quit drinking, smoking, and exercise. Banned from paintings over 3 feet — switches to small acrylics on paper. Physical impotence rapidly deteriorates relationship with Mell.',
  },
  E040: {
    title: 'Elected to National Institute of Arts and Letters',
    description: 'Elected to the National Institute of Arts and Letters.',
  },
  E041: {
    title: 'Separation from Mell',
    description: 'Officially separates from Mell on January 1. Moves into his studio. Solitude, depression, and heavy drinking intensify.',
  },
  E042: {
    title: 'Yale honorary doctorate & Tate donation',
    description: 'Receives honorary Doctor of Fine Arts from Yale University. Donates nine Seagram Murals to London\'s Tate Gallery, stipulating a dedicated exhibition room.',
  },
  E043: {
    title: 'Black on Gray series',
    description: 'Creates 25-work "Black on Gray" series. Canvas bisected horizontally — black above, gray below. The chromatic vibration and internal luminosity nearly vanish. An ultimate style of extreme reduction.',
  },
  E044: {
    title: 'Death',
    description: 'Found dead in his East 69th Street studio (age 66) by assistant Oliver Steindecker. The same day, the Seagram Murals arrive at London\'s Tate Gallery.',
  },
  E045: {
    title: 'Rothko Chapel consecrated',
    description: 'Rothko Chapel consecration ceremony (the year after his death).',
  },
  E046: {
    title: 'MoMA posthumous retrospective',
    description: 'MoMA retrospective "Mark Rothko 1903–1970" opens (March 26 – May 31).',
  },
  E047: {
    title: 'Fear of Cossack persecution',
    description: 'Grows up witnessing Cossack anti-Jewish violence in Dvinsk. The image of Jewish children buried in pits becomes a lifelong trauma. Later implied: "Every shape in my paintings begins with this memory."',
  },
  E048: {
    title: 'Yale scholarship revoked',
    description: 'Full scholarship revoked after freshman year. Antisemitism the likely cause. Works as waiter, laundry worker to pay tuition. Ostracized by WASP classmates. A classmate scrawls "will be a pawnbroker" in the yearbook.',
  },
  E049: {
    title: 'Milton Avery circle',
    description: 'Joins the circle around Milton Avery, alongside Adolph Gottlieb and other young painters. Avery demonstrates that "a life as a professional painter is possible." Summers together in Lake George and Gloucester — painting by day, debating by night. A formative creative community.',
  },
  E050: {
    title: 'Rothkowitz → Rothko name change',
    description: 'Changes surname to "Rothko," conscious of antisemitism and rumors of Jewish deportation in America. "Roth" was still recognizably Jewish but a compromise. Confided to a friend: "I never felt a complete sense of belonging in this land where my father transplanted me."',
  },
  E051: {
    title: 'Arshile Gorky\'s suicide',
    description: 'Fellow painter and former New School mentor Arshile Gorky commits suicide. Shocks the entire New York art world. Gorky\'s death comes the same year as Rothko\'s mother\'s passing.',
  },
  E052: {
    title: 'Newman & Still\'s betrayal',
    description: 'Fortune magazine features Rothko\'s work as "a good investment." Barnett Newman and Clyfford Still denounce him as "a turncoat with bourgeois ambitions." Still demands return of gifted paintings. Friendships with closest artistic allies permanently destroyed. Severe depression.',
  },
  E053: {
    title: 'Jackson Pollock\'s death',
    description: 'Fellow artist and rival Jackson Pollock dies in a drunk-driving accident. An enormous loss for the Abstract Expressionist movement. Members of Rothko\'s circle begin disappearing one by one.',
  },
  E054: {
    title: 'Alcohol dependence begins',
    description: 'Becomes a constant drinker, consuming a bottle of vodka daily. Drinks straight from the bottle at 5 AM, rationalizing "glasses and mixers just make it drinking." Hides bottles in friends\' studios. His large frame keeps most people from noticing.',
  },
  E055: {
    title: 'Franz Kline\'s death',
    description: 'Fellow Abstract Expressionist Franz Kline dies of rheumatic heart disease at 52. Another loss from the inner circle.',
  },
  E056: {
    title: 'Departure from Sidney Janis Gallery',
    description: 'When Janis Gallery begins exhibiting Pop Art newcomers, Rothko, Motherwell, and de Kooning angrily leave the gallery. Rothko: "Are these young artists trying to kill us all?" Goes unmentioned in magazines; visits from younger artists cease. Declares: "I am dead."',
  },
  E057: {
    title: 'Harvard murals fade',
    description: 'Five murals installed at Harvard\'s Holyoke Center begin fading from sunlight and cocktail stains from parties. Curator\'s recommendations to close curtains ignored. Eventually moved to storage in 1979. A symbolic event of institutional neglect destroying Rothko\'s work.',
  },
  E058: {
    title: 'Ad Reinhardt\'s death',
    description: 'Long-time colleague and friend Ad Reinhardt dies of a heart attack. Rothko later begins a relationship with Reinhardt\'s widow Rita.',
  },
  E059: {
    title: 'Relationship with Rita Reinhardt',
    description: 'Begins romantic relationship with Ad Reinhardt\'s widow Rita (in her 30s). Starts during studio solitude after separating from Mell. Estate manager Bernard Reis encourages the relationship. Daughter Kate remembers her father as "helpless, irritable, and tired of the world."',
  },
  E060: {
    title: 'Drug abuse',
    description: 'Simultaneously taking antidepressant Sinequan (doxepin), Valium, and medications for hypertension, gout, and anxiety. Continues heavy drinking while on Sinequan. Ignores prescribed dosages, adjusting arbitrarily. Tells a friend: "The doctor says take two, but who\'s counting?"',
  },
  E061: {
    title: 'Mell\'s death',
    description: 'Approximately six months after Rothko\'s death, wife Mell also dies at 48 (health deterioration from heavy drinking). Daughter Kate (19) and son Christopher (6) are orphaned. The estate lawsuit ("The Rothko Case") follows.',
  },
  E062: {
    title: 'Enters Heder (Jewish school)',
    description: 'Despite father Jacob being a "fierce anti-religionist," Markus alone is sent to Heder (traditional Jewish school) for Talmud education. Three brothers attend public school. This special religious education becomes the foundation of his later spiritual sensitivity.',
  },
  E063: {
    title: 'Brothers depart for America',
    description: 'Brothers Moise and Albert embark on a dangerous journey to America without passports. Nine-year-old Markus remains in Dvinsk with his mother and sister. The gradual family separation becomes a lifelong abandonment anxiety.',
  },
  E064: {
    title: 'Kaddish mourning, school advancement',
    description: 'During year-long Kaddish (mourning prayers) for his father. Attends synagogue daily. Simultaneously advances several grades from Failing Elementary to Shattuck School due to academic ability. Intellectual precociousness coexists with religious grief.',
  },
  E065: {
    title: 'Child labor, friendship with Max Gordon',
    description: 'Works as a newsboy on the streets, befriending cousin Max Gordon (future founder of the Village Vanguard jazz club). Also works at uncle Samuel Weinstein\'s wholesale clothing warehouse. Family economically dependent on the Weinstein family.',
  },
  E066: {
    title: 'Lincoln High School, antisemitism, debate club founded',
    description: 'Enters Lincoln High School. Excluded from school social clubs for being Jewish. In response, co-founds the debate club and writes columns for school newspaper "The Cardinal" — "an open forum for ideas."',
  },
  E067: {
    title: 'IWW rallies, labor movement dreams',
    description: 'Attends IWW (Industrial Workers of the World) rallies in Portland. Hears speeches by Big Bill Haywood and Emma Goldman, dreaming of becoming a labor organizer. The oratory skills developed here become the foundation for his later advocacy of Surrealism.',
  },
  E068: {
    title: 'Kaddish ends, complete break with religion',
    description: 'After completing the Kaddish period for his father, declares a complete break with organized religion. Anger toward the God who took his father is the emotional cause. This rupture becomes the foundation for the non-denominational spirituality in his later work.',
  },
  E069: {
    title: 'First art class in Portland, Yale scholarship',
    description: 'Takes first art class at Portland Art School (more interested in music at the time). Earns a full scholarship to Yale through academic excellence.',
  },
  E070: {
    title: 'Returns to New York, Gorky class experience',
    description: 'Returns to New York. Briefly attends Arshile Gorky\'s class at the New School but quits, finding the "supervision excessive." Re-enrolls at the Art Students League. In summer 1924, acts alongside Clark Gable in Josephine Dillon\'s Portland theater company.',
  },
  E071: {
    title: 'Completes Weber studies, independent work begins',
    description: 'Completes studies with Max Weber (fall 1925–spring 1926). Receives direct knowledge of Cézanne, Fauvism, and Cubism. Begins independent work. Supports himself through garment factory work and bookkeeping at a relative\'s office.',
  },
  E072: {
    title: 'Solitary self-education, poverty',
    description: 'No exhibitions, no school. A period of complete self-teaching. Repeated cycles of poverty and odd jobs. Dark urban scenes and subway paintings begin.',
  },
  E073: {
    title: 'Children\'s art philosophy forming',
    description: 'Third year at Center Academy. Developing the philosophy that children\'s art is as truthful as modern painting. Establishing presence in the New York art world through small group exhibitions.',
  },
  E074: {
    title: 'Gallery Secession exhibition, artists\' union',
    description: 'Exhibits at Gallery Secession. Participates in founding the Artists\' Union during the Depression. This group leaves Secession months later to form the nucleus of "The Ten."',
  },
  E075: {
    title: 'The Ten dissolves, running errands for Edith\'s shop',
    description: 'The Ten holds its final exhibition (Bonestell Gallery, Oct 23–Nov 4) and dissolves over "reorganization issues." While Edith\'s jewelry shop thrives, Rothko is reduced to running errands — "like a little boy." WWII outbreak (September) deepens identity crisis as an immigrant Jew.',
  },
  E076: {
    title: 'De facto separation from Edith',
    description: 'After roughly two years of involuntary jeweler\'s assistant life, effectively separates from Edith. Creates "The Omen of the Eagle" based on Aeschylus\'s Oresteia — "This painting is not about a particular anecdote but the spirit of myth." Surrealism arrives in New York with European exile artists.',
  },
  E077: {
    title: 'Refuses Whitney purchase',
    description: 'Refuses the Whitney Museum\'s offer to purchase two paintings. Cites "a deep sense of responsibility for the life my work will live in the world." Fourth year of Classic period, daughter Kate age 3. Stable with Mell but internal conflict between commercial success and artistic purity intensifies.',
  },
  E078: {
    title: 'Physical limitations, switch to acrylic on paper',
    description: 'After aneurysm diagnosis, doctors ban paintings over 3 feet (approx. 90 cm). Gradually pushes to 72×60 inches. Switches from canvas to acrylic on paper. Aneurysm surgery impossible due to severe liver disease from years of heavy drinking.',
  },
};

let eventsPatched = 0;
events.events = events.events.map((e) => {
  const patch = eventsPatch[e.id];
  if (patch) {
    eventsPatched++;
    return {
      ...e,
      title: { ko: e.title.ko, en: patch.title },
      description: e.description
        ? { ko: e.description.ko, en: patch.description }
        : e.description,
    };
  }
  return e;
});

/* ────── Entropy curve 보완 ────── */

const entropyCurvePatch = {
  '멜과의 만남': 'Meeting Mell',
  '재혼, 구겐하임 개인전': 'Remarriage, Guggenheim solo show',
  '멀티폼, 최초 미술관 소장': 'Multiforms, first museum acquisition',
  '완전한 추상': 'Complete abstraction',
  '어머니 사망, 고르키 자살': 'Mother\'s death, Gorky\'s suicide',
  '클래식 양식 돌파 (애도와 공존)': 'Classic style breakthrough (amid mourning)',
  '유럽 여행, 딸 출생': 'European tour, daughter born',
  '교수직, 경제적 불안 지속': 'Teaching position, financial anxiety persists',
  'MoMA 전시': 'MoMA exhibition',
  '작업 안정, 상업 성공 갈등': 'Work stability, commercial success conflict',
  '뉴먼·스틸 배신, 심한 우울증': 'Newman/Still betrayal, severe depression',
  '작업 지속하나 고통 속': 'Work continues but in agony',
  '알코올 의존 시작 (보드카 매일 1병)': 'Alcohol dependence begins (a bottle of vodka daily)',
  '폴록 사망': 'Pollock\'s death',
  '종교적 발언 (확신이지 행복 아님)': 'Religious statement (conviction, not happiness)',
  '시그램 수락': 'Seagram commission accepted',
  '포시즌스 식사, 시그램 거부': 'Four Seasons dinner, Seagram rejection',
  '$35K 반환, 상업계와 결별': '$35K returned, break with commercial world',
  'MoMA 회고전 (양가감정)': 'MoMA retrospective (ambivalence)',
  '팝아트 고립, 클라인 사망, 갤러리 이탈': 'Pop Art isolation, Kline\'s death, gallery departure',
  '아들 출생 (어둠 속 빛)': 'Son born (light amid darkness)',
  '채플 커미션': 'Chapel commission',
  '하버드 벽화 퇴색': 'Harvard murals fading',
  '유럽 여행 (알코올 의존 지속)': 'European tour (alcohol dependence continues)',
  '라인하트 사망': 'Reinhardt\'s death',
  '대동맥류, 간경변, 폐기종, 발기부전': 'Aneurysm, cirrhosis, emphysema, impotence',
  '별거, 리타 관계, 약물 남용': 'Separation, Rita relationship, drug abuse',
};

let entropyPatched = 0;
events.meta.entropy_curve = events.meta.entropy_curve.map((e) => {
  const en = entropyCurvePatch[e.label.ko];
  if (en && e.label.en === e.label.ko) {
    entropyPatched++;
    return { ...e, label: { ko: e.label.ko, en } };
  }
  return e;
});

writeFileSync(eventsPath, JSON.stringify(events, null, 2) + '\n', 'utf-8');
console.log(`✓ Events patched: ${eventsPatched} events, ${entropyPatched} entropy points`);

/* ────── 검증 ────── */

const verifyWorks = JSON.parse(readFileSync(worksPath, 'utf-8'));
const verifyEvents = JSON.parse(readFileSync(eventsPath, 'utf-8'));

const emptyWorksEn = verifyWorks.works.filter(w =>
  w.exhibition_note?.en === '' || w.significance?.en === ''
);
const emptyEventsEn = verifyEvents.events.filter(e =>
  e.title?.en === e.title?.ko || e.title?.en === ''
);
const emptyEntropyEn = verifyEvents.meta.entropy_curve.filter(e =>
  e.label?.en === e.label?.ko
);

console.log(`\n── Verification ──`);
console.log(`Works still missing EN: ${emptyWorksEn.length}`);
console.log(`Events still missing EN: ${emptyEventsEn.length}`);
console.log(`Entropy still missing EN: ${emptyEntropyEn.length}`);

if (emptyWorksEn.length) emptyWorksEn.forEach(w => console.log(`  ⚠ ${w.id}`));
if (emptyEventsEn.length) emptyEventsEn.forEach(e => console.log(`  ⚠ ${e.id}: ${e.title?.ko}`));
if (emptyEntropyEn.length) emptyEntropyEn.forEach(e => console.log(`  ⚠ ${e.year}: ${e.label?.ko}`));
