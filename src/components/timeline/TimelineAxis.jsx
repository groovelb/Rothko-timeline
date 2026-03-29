import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { useLocale } from '../../i18n';

/**
 * TimelineAxis — 중앙 수평 축선 + 연도 틱 + 시기 배경 밴드 + Y축 감정 밴드 틱
 *
 * Props:
 * @param {number} totalWidth - 캔버스 전체 너비 (px) [Required]
 * @param {number} axisY - 축의 Y 위치 (px) [Required]
 * @param {Array} yearTicks - 연도 틱 데이터 [{year, x, isMajor}] [Required]
 * @param {Array} periodBands - 시기 밴드 데이터 [{id, x, width, color, label}] [Required]
 * @param {Array} emotionBands - Y축 감정 밴드 [{id, label, y}] [Required]
 * @param {number} viewportHeight - 뷰포트 높이 [Required]
 * @param {Object} scrollOffset - Y축 라벨 고정용 framer-motion MotionValue [Optional]
 *
 * Example usage:
 * <TimelineAxis totalWidth={8000} axisY={400} yearTicks={ticks} periodBands={bands} emotionBands={eBands} viewportHeight={800} />
 */
function TimelineAxis({ totalWidth, axisY, yearTicks, periodBands, emotionBands, viewportHeight, scrollOffset }) {
  const { t } = useLocale();

  return (
    <>

      {/* Y축 감정 밴드 수평 가이드 라인 */}
      { emotionBands.map((band) => (
        <Box
          key={ band.id }
          sx={ {
            position: 'absolute',
            left: 0,
            top: band.y,
            width: totalWidth,
            height: '1px',
            borderTop: '1px dashed',
            borderColor: 'grey.200',
            pointerEvents: 'none',
            opacity: 0.6,
          } }
        />
      )) }

      {/* Y축 감정 밴드 라벨 (스크롤 시 화면 고정) */}
      { emotionBands.map((band) => (
        <motion.div
          key={ `label-${band.id}` }
          style={ {
            position: 'absolute',
            left: 20,
            top: band.y,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 5,
            x: scrollOffset,
          } }
        >
          <Typography
            variant="caption"
            sx={ {
              color: 'text.disabled',
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              userSelect: 'none',
            } }
          >
            { band.localeKey ? t(band.localeKey) : band.label }
          </Typography>
        </motion.div>
      )) }

      {/* 수평 축선 */}
      <Box
        sx={ {
          position: 'absolute',
          left: 0,
          top: axisY,
          width: totalWidth,
          height: '1px',
          backgroundColor: 'grey.400',
          pointerEvents: 'none',
        } }
      />

      {/* 연도 틱 + 라벨 */}
      { yearTicks.map((tick) => (
        <Box
          key={ tick.year }
          sx={ {
            position: 'absolute',
            left: tick.x,
            top: axisY,
            transform: 'translateX(-0.5px)',
            pointerEvents: 'none',
          } }
        >
          {/* 틱 마크 */}
          <Box
            sx={ {
              width: '1px',
              height: tick.isMajor ? 12 : 8,
              backgroundColor: tick.isMajor ? 'grey.500' : 'grey.300',
              transform: 'translateY(-50%)',
            } }
          />
          {/* 연도 라벨 */}
          <Typography
            variant="caption"
            sx={ {
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              color: tick.isMajor ? 'text.secondary' : 'text.disabled',
              fontWeight: tick.isMajor ? 600 : 400,
              fontSize: tick.isMajor ? '0.75rem' : '0.625rem',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            } }
          >
            { tick.year }
          </Typography>
        </Box>
      )) }
    </>
  );
}

export { TimelineAxis };
