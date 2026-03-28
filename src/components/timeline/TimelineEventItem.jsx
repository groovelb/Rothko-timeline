import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** 마커 색상 */
const DOT_COLOR = '#000';

/**
 * TimelineEventItem — 타임라인 축 하단의 개별 이벤트 노드
 *
 * 축 도트 + 커넥터 라인 + 카드(연도, 제목, 설명)로 구성.
 *
 * Props:
 * @param {Object} event - 배치 계산된 이벤트 데이터 {x, y, staggerIndex, title, year, ...} [Required]
 * @param {number} axisY - 축 Y 위치 (px) [Required]
 * @param {boolean} isActive - 호버/선택 상태 [Optional, 기본값: false]
 * @param {function} onMouseEnter - 마우스 진입 콜백 [Optional]
 * @param {function} onMouseLeave - 마우스 이탈 콜백 [Optional]
 *
 * Example usage:
 * <TimelineEventItem event={positionedEvent} axisY={400} />
 */
function TimelineEventItem({
  event,
  axisY,
  isActive = false,
  onMouseEnter,
  onMouseLeave,
}) {
  const isHigh = event.significance === 'high' || event.significance === 'critical';
  const isDeepLane = event.lane > 0;
  const connectorHeight = event.y - axisY;
  const INDICATOR_HEIGHT = 16;

  return (
    <Box
      onMouseEnter={ onMouseEnter }
      onMouseLeave={ onMouseLeave }
      sx={ {
        position: 'absolute',
        left: event.x,
        top: isDeepLane ? event.y : axisY,
        transform: 'translateX(-3px)',
        cursor: 'default',
        zIndex: isActive ? 10 : 1,
      } }
    >
      {/* 축 도트 — lane 0만 표시 */}
      { !isDeepLane && (
        <Box
          sx={ {
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: DOT_COLOR,
            transform: 'translate(-50%, -50%)',
            ml: '3px',
          } }
        />
      ) }

      {/* 커넥터 라인 — lane 0: 축→카드, lane 1+: 짧은 인디케이터 */}
      { !isDeepLane && connectorHeight > 0 && (
        <Box
          sx={ {
            width: '1px',
            height: Math.max(0, connectorHeight - 4),
            backgroundColor: 'grey.300',
            ml: '2.5px',
          } }
        />
      ) }
      { isDeepLane && (
        <Box
          sx={ {
            position: 'absolute',
            bottom: '100%',
            left: '2.5px',
            width: '1px',
            height: INDICATOR_HEIGHT,
            backgroundColor: 'grey.300',
          } }
        />
      ) }

      {/* 이벤트 타이틀 */}
      <Typography
        variant="caption"
        sx={ {
          display: 'block',
          width: 160,
          transform: 'translateX(-8px)',
          pt: 0.5,
          fontWeight: isHigh ? 600 : 400,
          lineHeight: 1.3,
          fontSize: '0.7rem',
          color: 'text.secondary',
        } }
      >
        { event.title }
      </Typography>
    </Box>
  );
}

export { TimelineEventItem };
