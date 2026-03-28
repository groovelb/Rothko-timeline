import { useMemo } from 'react';

/**
 * 엔트로피 Y → 5단계 밴드 매핑
 * (+) 팽창: 색의 방출, 형태의 해방, 창작 에너지 확장
 * (0) 균형: 전환점, 평형 상태
 * (-) 소멸: 색의 환원, 형태의 수축, 정적으로의 수렴
 */
const BANDS = [
  { id: 'EXPAND', min: 0.6, max: 1.0 },
  { id: 'RADIATE', min: 0.2, max: 0.59 },
  { id: 'EQUIL', min: -0.19, max: 0.19 },
  { id: 'CONTRACT', min: -0.59, max: -0.2 },
  { id: 'VOID', min: -1.0, max: -0.6 },
];

/** 밴드별 축으로부터의 거리 비율 (0=축, 1=최상단) — 밴드 중앙 emotion_y를 -1~1 범위에서 선형 매핑 */
const BAND_POSITIONS = Object.fromEntries(
  BANDS.map((band) => {
    const mid = (band.min + band.max) / 2;
    return [band.id, (mid + 1) / 2];
  })
);

/** 밴드 한글 라벨 */
const BAND_LABELS = {
  EXPAND: '팽창',
  RADIATE: '발산',
  EQUIL: '균형',
  CONTRACT: '수축',
  VOID: '소멸',
};

/** work.id 기반 일관적 지터 값 생성 */
function seededJitter(id) {
  const num = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return ((num * 7 + 3) % 17) - 8;
}

/** emotion_y → 밴드 ID */
function toBand(emotionY) {
  for (const band of BANDS) {
    if (emotionY >= band.min) return band.id;
  }
  return 'VOID';
}

/**
 * useTimelineLayout — 타임라인 레이아웃 계산 훅
 *
 * Props:
 * @param {Object} worksData - rothko_works.json 데이터 [Required]
 * @param {Object} eventsData - rothko_events.json 데이터 [Required]
 * @param {number} pxPerYear - 연도당 픽셀 수 [Optional, 기본값: 250]
 * @param {number} viewportWidth - 뷰포트 너비 [Optional, 기본값: 1920]
 * @param {number} viewportHeight - 뷰포트 높이 [Optional, 기본값: 800]
 */
function useTimelineLayout({
  worksData,
  eventsData,
  pxPerYear = 250,
  viewportWidth = 1920,
  viewportHeight = 800,
}) {
  return useMemo(() => {
    const works = worksData?.works || [];
    const events = (eventsData?.events || []).filter((e) => e.year >= 1933);
    const bioPeriods = eventsData?.meta?.biographical_periods || [];

    const START_YEAR = 1933;
    const END_YEAR = 1970;
    const leftPad = viewportWidth * 0.5;

    /** 연도 → X 픽셀 */
    function yearToX(year) {
      return leftPad + (year - START_YEAR) * pxPerYear;
    }

    const totalWidth = yearToX(END_YEAR) + leftPad;
    const TOP_PADDING = 40;
    const axisY = viewportHeight * 0.5;
    const upperHeight = axisY - TOP_PADDING;
    const Y_SCALE_MARGIN = 0.15;
    const scaleHeight = upperHeight * (1 - 2 * Y_SCALE_MARGIN);
    const scaleTop = TOP_PADDING + upperHeight * Y_SCALE_MARGIN;

    /** 시기 밴드 (배경 색상 영역) — 1933 이전 구간 클램프/제외 */
    const periodBands = bioPeriods
      .filter((bp) => bp.range[1] > START_YEAR)
      .map((bp) => {
        const clampedStart = Math.max(bp.range[0], START_YEAR);
        return {
          id: bp.id,
          label: bp.label,
          x: yearToX(clampedStart),
          width: yearToX(bp.range[1]) - yearToX(clampedStart),
          color: bp.band_colors[0],
          thickness: bp.band_thickness,
          blur: bp.blur_intensity,
        };
      });

    /** 작품 배치 */
    const yearWorkGroups = {};
    works.forEach((w) => {
      const key = w.year;
      if (!yearWorkGroups[key]) yearWorkGroups[key] = [];
      yearWorkGroups[key].push(w);
    });

    const positionedWorks = works.map((work) => {
      const group = yearWorkGroups[work.year];
      const indexInYear = group.indexOf(work);
      const subOffset = indexInYear * 140;

      const band = toBand(work.emotion_y);
      const bandRatio = BAND_POSITIONS[band];
      const jitter = seededJitter(work.id);
      const y = scaleTop + scaleHeight * (1 - bandRatio) + jitter;
      const x = yearToX(work.year) + subOffset;

      return { ...work, x, y, band };
    });

    /** 이벤트 배치 (축 하단) — 그리디 레인 배정으로 충돌 방지 */
    const CARD_WIDTH = 190;
    const LANE_HEIGHT = 80;
    const LANE_TOP_MARGIN = 20;

    const sortedEvents = [...events]
      .map((e) => ({ ...e, x: yearToX(e.year) }))
      .sort((a, b) => a.x - b.x);

    const laneEdges = [];

    const positionedEvents = sortedEvents.map((event) => {
      let lane = 0;
      while (lane < laneEdges.length && laneEdges[lane] > event.x) {
        lane++;
      }
      if (lane >= laneEdges.length) laneEdges.push(0);
      laneEdges[lane] = event.x + CARD_WIDTH;

      const y = axisY + LANE_TOP_MARGIN + lane * LANE_HEIGHT;
      return { ...event, y, lane };
    });

    /** Y축 감정 밴드 틱 데이터 */
    const emotionBands = BANDS.map((band) => {
      const ratio = BAND_POSITIONS[band.id];
      return {
        id: band.id,
        label: BAND_LABELS[band.id],
        y: scaleTop + scaleHeight * (1 - ratio),
      };
    });

    /** 연도 틱 데이터 */
    const yearTicks = [];
    for (let yr = START_YEAR; yr <= END_YEAR; yr++) {
      if (yr % 5 === 0) {
        yearTicks.push({
          year: yr,
          x: yearToX(yr),
          isMajor: yr % 10 === 0,
        });
      }
    }

    return {
      positionedWorks,
      positionedEvents,
      emotionBands,
      periodBands,
      yearTicks,
      totalWidth,
      axisY,
      yearToX,
    };
  }, [worksData, eventsData, pxPerYear, viewportWidth, viewportHeight]);
}

export { useTimelineLayout };
