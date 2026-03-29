import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLocale } from '../../i18n';

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
  const { localized } = useLocale();
  const isHigh = event.significance === 'high' || event.significance === 'critical';

  return (
    <Box
      onMouseEnter={ onMouseEnter }
      onMouseLeave={ onMouseLeave }
      sx={ {
        position: 'absolute',
        left: event.x,
        top: axisY,
        transform: 'translateX(-3px)',
        cursor: 'default',
        zIndex: isActive ? 10 : 1,
      } }
    >
      {/* 축 도트 */}
      <Box
        sx={ {
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: DOT_COLOR,
          transform: 'translate(-50%, -50%)',
          ml: '3px',
        } }
      />

      {/* 이벤트 타이틀 — 연도 라벨(top:14 + ~14px) 아래에 배치 */}
      <Typography
        variant="caption"
        sx={ {
          display: 'block',
          width: 140,
          transform: 'translateX(-8px)',
          mt: '28px',
          fontWeight: isHigh ? 600 : 400,
          lineHeight: 1.3,
          color: 'text.disabled',
        } }
      >
        { localized(event.title) }
      </Typography>
    </Box>
  );
}

export { TimelineEventItem };
