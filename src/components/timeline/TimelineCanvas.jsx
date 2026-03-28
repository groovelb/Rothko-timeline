import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { TimelineAxis } from './TimelineAxis.jsx';
import { TimelineEventItem } from './TimelineEventItem.jsx';
import { TimelineWorkItem } from './TimelineWorkItem.jsx';

/** hex → [r, g, b] (0~255) */
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** [r, g, b] → hex */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/**
 * 유사 색상 클러스터링 — RGB를 step 단위로 양자화, 같은 버킷 합산
 * @returns {Array<{color: string, weight: number}>} 내림차순 정렬
 */
function clusterColors(colorEntries, step = 48) {
  const buckets = {};
  colorEntries.forEach(({ color, weight }) => {
    const [r, g, b] = hexToRgb(color);
    const qr = Math.round(r / step) * step;
    const qg = Math.round(g / step) * step;
    const qb = Math.round(b / step) * step;
    const key = `${qr},${qg},${qb}`;
    if (!buckets[key]) buckets[key] = { sumR: 0, sumG: 0, sumB: 0, totalW: 0 };
    buckets[key].sumR += r * weight;
    buckets[key].sumG += g * weight;
    buckets[key].sumB += b * weight;
    buckets[key].totalW += weight;
  });
  return Object.values(buckets)
    .map((b) => ({
      color: rgbToHex(b.sumR / b.totalW, b.sumG / b.totalW, b.sumB / b.totalW),
      weight: b.totalW,
    }))
    .sort((a, b) => b.weight - a.weight);
}

/** Y축 밴드 순서 (상→하) */
const BAND_ORDER = ['EXPAND', 'RADIATE', 'EQUIL', 'CONTRACT', 'VOID'];

/**
 * TimelineCanvas — 전체 좌표계를 담는 절대 위치 캔버스
 *
 * X축 상단에 작품을 감정 밴드별로 배치.
 * X축 하단: 좌측 컬러 팔레트 + 우측 호버 상세.
 *
 * Props:
 * @param {Array} positionedWorks - 배치 계산된 작품 배열 [Required]
 * @param {Array} positionedEvents - 배치 계산된 이벤트 배열 [Required]
 * @param {Array} emotionBands - Y축 감정 밴드 틱 [{id, label, y}] [Required]
 * @param {Array} periodBands - 시기 밴드 데이터 [Required]
 * @param {Array} yearTicks - 연도 틱 데이터 [Required]
 * @param {number} totalWidth - 캔버스 전체 너비 (px) [Required]
 * @param {number} axisY - 축 Y 위치 (px) [Required]
 * @param {number} viewportHeight - 뷰포트 높이 (px) [Required]
 * @param {string|null} activeId - 현재 활성 아이템 ID [Optional]
 * @param {function} onItemHover - 호버 콜백 [Optional]
 * @param {function} onItemLeave - 호버 해제 콜백 [Optional]
 * @param {Object} scrollOffset - 화면 고정용 framer-motion MotionValue [Optional]
 *
 * Example usage:
 * <TimelineCanvas {...layoutData} viewportHeight={800} />
 */
function TimelineCanvas({
  positionedWorks,
  positionedEvents,
  emotionBands,
  periodBands,
  yearTicks,
  totalWidth,
  axisY,
  viewportHeight,
  activeId = null,
  onItemHover,
  onItemLeave,
  scrollOffset,
}) {
  const activeWork = activeId
    ? positionedWorks.find((w) => w.id === activeId)
    : null;

  const bottomHeight = viewportHeight - axisY;
  const BAND_LABELS = { EXPAND: '팽창', RADIATE: '발산', EQUIL: '균형', CONTRACT: '수축', VOID: '소멸' };

  /** 밴드별 색상 분포 — 각 감정 밴드에서 어떤 색이 얼마나 사용되었는지 */
  const bandColorDist = useMemo(() => {
    const grouped = {};
    BAND_ORDER.forEach((id) => { grouped[id] = []; });
    positionedWorks.forEach((work) => {
      const band = work.band || 'EQUIL';
      if (!grouped[band]) grouped[band] = [];
      (work.color_blocks || []).forEach((block) => {
        grouped[band].push({ color: block.color, weight: block.ratio });
      });
    });
    return BAND_ORDER.map((id) => {
      const clusters = clusterColors(grouped[id], 48);
      const total = clusters.reduce((s, c) => s + c.weight, 0);
      return {
        bandId: id,
        label: BAND_LABELS[id] || id,
        workCount: positionedWorks.filter((w) => w.band === id).length,
        colors: clusters.map((c) => ({ ...c, pct: total > 0 ? c.weight / total : 0 })),
      };
    });
  }, [positionedWorks]);

  return (
    <Box
      sx={ {
        position: 'relative',
        width: totalWidth,
        height: viewportHeight,
        flexShrink: 0,
      } }
    >
      {/* 좌상단 고정 타이틀 */}
      <motion.div
        style={ {
          position: 'absolute',
          left: 24,
          top: 24,
          pointerEvents: 'none',
          zIndex: 5,
          x: scrollOffset,
        } }
      >
        <Typography
          sx={ {
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: '0.85rem',
            fontWeight: 400,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          } }
        >
          Mark Rothko
        </Typography>
        <Typography
          sx={ {
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontSize: '0.65rem',
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: 'text.disabled',
            mt: 0.25,
          } }
        >
          1903 — 1970
        </Typography>
      </motion.div>

      {/* 축 + Y축 감정 틱 */}
      <TimelineAxis
        totalWidth={ totalWidth }
        axisY={ axisY }
        yearTicks={ yearTicks }
        periodBands={ periodBands }
        emotionBands={ emotionBands }
        viewportHeight={ viewportHeight }
        scrollOffset={ scrollOffset }
      />

      {/* 작품 노드 (축 상단) */}
      { positionedWorks.map((work) => (
        <TimelineWorkItem
          key={ work.id }
          work={ work }
          axisY={ axisY }
          isActive={ activeId === work.id }
          onMouseEnter={ () => onItemHover?.(work.id) }
          onMouseLeave={ () => onItemLeave?.() }
        />
      )) }

      {/* 이벤트 노드 (축 하단) */}
      { positionedEvents.map((event) => (
        <TimelineEventItem
          key={ event.id }
          event={ event }
          axisY={ axisY }
        />
      )) }

      {/* 하단 고정 패널 — 축 아래 전체, 2컬럼 */}
      <motion.div
        style={ {
          position: 'absolute',
          left: 0,
          top: axisY + 1,
          width: '100vw',
          height: bottomHeight - 1,
          display: 'flex',
          pointerEvents: 'none',
          zIndex: 4,
          x: scrollOffset,
        } }
      >
        {/* 좌측: 밴드별 색상 분포 (수평 스택 바) */}
        <Box
          sx={ {
            width: '35%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 3,
            py: 2,
            gap: '6px',
            overflow: 'hidden',
          } }
        >
          { bandColorDist.map((band) => (
            <Box key={ band.bandId } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
              {/* 밴드 라벨 */}
              <Typography
                sx={ {
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  fontSize: '0.6rem',
                  color: 'text.disabled',
                  width: 28,
                  textAlign: 'right',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                } }
              >
                { band.label }
              </Typography>

              {/* 스택 바 */}
              <Box
                sx={ {
                  flex: 1,
                  height: 10,
                  display: 'flex',
                  borderRadius: '2px',
                  overflow: 'hidden',
                } }
              >
                { band.colors.length > 0 ? band.colors.map((c, i) => (
                  <Box
                    key={ i }
                    sx={ {
                      width: `${c.pct * 100}%`,
                      height: '100%',
                      backgroundColor: c.color,
                      minWidth: '2px',
                    } }
                  />
                )) : (
                  <Box sx={ { width: '100%', height: '100%', backgroundColor: 'grey.100' } } />
                ) }
              </Box>

              {/* 작품 수 */}
              <Typography
                sx={ {
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  fontSize: '0.5rem',
                  color: 'text.disabled',
                  width: 16,
                  textAlign: 'right',
                  flexShrink: 0,
                } }
              >
                { band.workCount }
              </Typography>
            </Box>
          )) }
        </Box>

        {/* 우측: 호버 작품 이미지 + 상세 */}
        <Box
          sx={ {
            width: '65%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            overflow: 'hidden',
          } }
        >
          { activeWork ? (
            <Box
              sx={ {
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                height: '100%',
                maxWidth: '100%',
              } }
            >
              {/* 작품 이미지 — 원본 비율 유지 */}
              <Box
                component="img"
                src={ activeWork.image }
                alt={ activeWork.title }
                sx={ {
                  maxHeight: '85%',
                  maxWidth: '50%',
                  objectFit: 'contain',
                  flexShrink: 0,
                } }
              />

              {/* 텍스트 상세 */}
              <Box sx={ { minWidth: 0, flexShrink: 1 } }>
                {/* 컬러 스와치 */}
                <Box sx={ { display: 'flex', gap: 0.75, mb: 2 } }>
                  { activeWork.color_blocks?.map((block, i) => (
                    <Box
                      key={ i }
                      sx={ {
                        width: 20,
                        height: 20,
                        backgroundColor: block.color,
                        borderRadius: '1px',
                      } }
                    />
                  )) }
                </Box>

                <Typography
                  sx={ {
                    fontFamily: '"Georgia", "Times New Roman", serif',
                    fontSize: '1.1rem',
                    fontWeight: 400,
                    lineHeight: 1.3,
                    mb: 0.5,
                  } }
                >
                  { activeWork.title }
                </Typography>

                <Typography
                  variant="caption"
                  sx={ {
                    color: 'text.secondary',
                    display: 'block',
                    mb: 0.25,
                    fontSize: '0.75rem',
                  } }
                >
                  { activeWork.year } · { BAND_LABELS[activeWork.band] || activeWork.band }
                </Typography>

                <Typography
                  variant="caption"
                  sx={ {
                    color: 'text.disabled',
                    display: 'block',
                    fontSize: '0.7rem',
                    mb: 0.5,
                  } }
                >
                  { activeWork.medium }
                </Typography>

                { activeWork.collection && (
                  <Typography
                    variant="caption"
                    sx={ {
                      color: 'text.disabled',
                      display: 'block',
                      fontSize: '0.65rem',
                    } }
                  >
                    { activeWork.collection }
                  </Typography>
                ) }
              </Box>
            </Box>
          ) : (
            <Typography
              variant="caption"
              sx={ {
                color: 'text.disabled',
                fontSize: '0.75rem',
                fontStyle: 'italic',
              } }
            >
              작품 위에 마우스를 올려보세요
            </Typography>
          ) }
        </Box>
      </motion.div>
    </Box>
  );
}

export { TimelineCanvas };
