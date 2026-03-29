import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useLocale } from '../../i18n';
import { getColorName } from '../../utils/colorName';

/** 극좌표 → 직교좌표 */
function polarToCartesian(cx, cy, r, angleRad) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/** 도넛 세그먼트 arc path */
function arcPath(cx, cy, outerR, innerR, startAngle, endAngle) {
  const gap = 0.005;
  const s = startAngle + gap;
  const e = endAngle - gap;
  if (e - s < 0.001) return '';

  const largeArc = (e - s) > Math.PI ? 1 : 0;
  const o1 = polarToCartesian(cx, cy, outerR, s);
  const o2 = polarToCartesian(cx, cy, outerR, e);
  const i1 = polarToCartesian(cx, cy, innerR, e);
  const i2 = polarToCartesian(cx, cy, innerR, s);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

/**
 * ColorDonutChart — SVG 도넛 차트
 *
 * Props:
 * @param {Array} data - [{ color, pct, works, bands }] [Required]
 * @param {number} size - 차트 크기 px [Optional, 기본값: 220]
 * @param {function} onSegmentClick - 세그먼트 클릭 콜백 [Optional]
 * @param {number} totalWorks - 중앙 표시용 총 작품 수 [Optional]
 *
 * Example usage:
 * <ColorDonutChart data={donutData} size={220} onSegmentClick={handleClick} />
 */
function ColorDonutChart({
  data,
  size = 220,
  onSegmentClick,
  totalWorks = 0,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const { localized } = useLocale();

  const thickness = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = (size - 4) / 2;
  const innerR = outerR - thickness;

  /** 세그먼트별 시작/끝 각도 계산 */
  const segments = useMemo(() => {
    let angle = -Math.PI / 2;
    return data.map((seg) => {
      const start = angle;
      const sweep = seg.pct * Math.PI * 2;
      angle += sweep;
      return { ...seg, startAngle: start, endAngle: start + sweep };
    });
  }, [data]);

  return (
    <Box
      sx={ {
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        pointerEvents: 'auto',
      } }
    >
      <svg
        viewBox={ `0 0 ${size} ${size}` }
        width={ size }
        height={ size }
        style={ { overflow: 'visible' } }
      >
        { segments.map((seg, i) => {
          const isHovered = hoveredIdx === i;
          /** 호버 시 세그먼트를 바깥으로 살짝 이동 */
          const midAngle = (seg.startAngle + seg.endAngle) / 2;
          const explode = isHovered ? 4 : 0;
          const tx = explode * Math.cos(midAngle);
          const ty = explode * Math.sin(midAngle);

          return (
            <path
              key={ i }
              d={ arcPath(cx, cy, outerR, innerR, seg.startAngle, seg.endAngle) }
              fill={ seg.color }
              transform={ `translate(${tx}, ${ty})` }
              style={ {
                cursor: 'pointer',
                opacity: hoveredIdx !== null && !isHovered ? 0.5 : 1,
                transition: 'opacity 0.15s, transform 0.15s',
              } }
              onMouseEnter={ () => setHoveredIdx(i) }
              onMouseLeave={ () => setHoveredIdx(null) }
              onClick={ () => onSegmentClick?.(seg) }
            />
          );
        }) }
      </svg>

      {/* 중앙 텍스트 */}
      <Box
        sx={ {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        } }
      >
        { hoveredIdx !== null ? (
          <>
            <Box
              sx={ {
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: segments[hoveredIdx]?.color,
                mb: 0.5,
              } }
            />
            <Typography
              variant="body2"
              sx={ {
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.2,
                textAlign: 'center',
                px: 1,
                maxWidth: '80%',
              } }
            >
              { localized(getColorName(segments[hoveredIdx]?.color)) }
            </Typography>
            <Typography
              variant="caption"
              sx={ {
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1rem',
                lineHeight: 1,
                mt: 0.5,
              } }
            >
              { `${(segments[hoveredIdx]?.pct * 100).toFixed(1)}%` }
            </Typography>
            <Typography
              variant="caption"
              sx={ { color: 'text.disabled', mt: 0.25, fontSize: '0.65rem' } }
            >
              { `${segments[hoveredIdx]?.works?.length || 0} works` }
            </Typography>
          </>
        ) : (
          <>
            <Typography
              variant="h5"
              sx={ {
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1,
              } }
            >
              { totalWorks }
            </Typography>
            <Typography
              variant="caption"
              sx={ { color: 'text.disabled', mt: 0.25 } }
            >
              works
            </Typography>
          </>
        ) }
      </Box>
    </Box>
  );
}

export { ColorDonutChart };
