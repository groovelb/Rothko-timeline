import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const IMAGE_WIDTH = 60;
const IMAGE_HEIGHT = 80;
const YEAR_LABEL_HEIGHT = 18;

/**
 * TimelineWorkItem — 타임라인 축 상단의 개별 작품 노드
 *
 * 이미지 + 커넥터 라인 + 축 도트로 구성.
 * 호버 시 확대 + 정보 툴팁 표시.
 *
 * Props:
 * @param {Object} work - 배치 계산된 작품 데이터 {x, y, band, title, year, image, color_blocks, ...} [Required]
 * @param {number} axisY - 축 Y 위치 (px) [Required]
 * @param {boolean} isActive - 호버/선택 상태 [Optional, 기본값: false]
 * @param {number} nodeScale - 노드 크기 스케일 (0~1) [Optional, 기본값: 1]
 * @param {function} onMouseEnter - 마우스 진입 콜백 [Optional]
 * @param {function} onMouseLeave - 마우스 이탈 콜백 [Optional]
 * @param {function} onClick - 클릭 콜백 (터치 디바이스용) [Optional]
 *
 * Example usage:
 * <TimelineWorkItem work={positionedWork} axisY={400} isActive={false} />
 */
function TimelineWorkItem({
  work,
  axisY,
  isActive = false,
  nodeScale = 1,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const dotColor = '#000';
  const dotSize = 6;
  const scaledW = Math.round(IMAGE_WIDTH * nodeScale);
  const scaledH = Math.round(IMAGE_HEIGHT * nodeScale);
  /** 도트 중심이 axisY에 정확히 오도록 절대 좌표 계산 */
  const dotTop = axisY - work.y - dotSize / 2;
  const imageBottom = YEAR_LABEL_HEIGHT + scaledH;
  const connectorTop = imageBottom;
  const connectorHeight = dotTop - connectorTop;
  const isFlipped = work.y < 140;
  const containerHeight = dotTop + dotSize;

  return (
    <Box
      onMouseEnter={ onMouseEnter }
      onMouseLeave={ onMouseLeave }
      onClick={ onClick }
      sx={ {
        position: 'absolute',
        left: work.x,
        top: work.y,
        width: scaledW,
        height: containerHeight,
        cursor: 'pointer',
        zIndex: isActive ? 10 : 1,
        '&:hover .work-tooltip': {
          opacity: 1,
          visibility: 'visible',
        },
      } }
    >
      {/* 연도 라벨 */}
      <Typography
        variant="caption"
        sx={ {
          display: 'block',
          textAlign: 'center',
          color: 'text.disabled',
          fontSize: '0.6rem',
          lineHeight: `${YEAR_LABEL_HEIGHT}px`,
          height: YEAR_LABEL_HEIGHT,
          userSelect: 'none',
        } }
      >
        { work.year }
      </Typography>

      {/* 작품 이미지 */}
      <Box
        className="work-image"
        component="img"
        src={ work.image }
        alt={ work.title }
        loading="lazy"
        sx={ {
          display: 'block',
          width: scaledW,
          height: scaledH,
          objectFit: 'contain',
        } }
      />

      {/* 커넥터 라인 (이미지 하단 → 축 도트) */}
      { connectorHeight > 0 && (
        <Box
          sx={ {
            position: 'absolute',
            left: '50%',
            top: connectorTop,
            width: '1px',
            height: connectorHeight,
            borderLeft: '1px dashed',
            borderColor: 'grey.300',
          } }
        />
      ) }

      {/* 축 도트 — axisY에 정확히 고정 */}
      <Box
        sx={ {
          position: 'absolute',
          left: '50%',
          top: dotTop,
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: dotColor,
          transform: 'translateX(-50%)',
        } }
      />

      {/* 호버 툴팁 — 상단 공간 부족 시 이미지 아래로 플립 */}
      <Box
        className="work-tooltip"
        sx={ {
          position: 'absolute',
          left: '50%',
          ...(isFlipped
            ? { top: YEAR_LABEL_HEIGHT + scaledH + 8, transform: 'translateX(-50%)' }
            : { top: -8, transform: 'translateX(-50%) translateY(-100%)' }
          ),
          opacity: 0,
          visibility: 'hidden',
          transition: 'opacity 0.2s ease, visibility 0.2s ease',
          backgroundColor: '#fff',
          p: 1.5,
          minWidth: 180,
          maxWidth: 220,
          boxShadow: '0 0 16px rgba(0, 0, 0, 0.08)',
          zIndex: 20,
          pointerEvents: 'none',
        } }
      >
        {/* 컬러 블록 스와치 */}
        <Box sx={ { display: 'flex', gap: 0.5, mb: 1 } }>
          { work.color_blocks?.map((block, i) => (
            <Box
              key={ i }
              sx={ {
                width: 12,
                height: 12,
                backgroundColor: block.color,
                flexShrink: 0,
              } }
            />
          )) }
        </Box>

        <Typography
          variant="subtitle2"
          sx={ { fontWeight: 600, lineHeight: 1.3, mb: 0.25 } }
        >
          { work.title }
        </Typography>
        <Typography variant="caption" sx={ { color: 'text.secondary', display: 'block' } }>
          { work.year } · { work.medium }
        </Typography>
        { work.collection && (
          <Typography
            variant="caption"
            sx={ { color: 'text.disabled', display: 'block', mt: 0.25 } }
          >
            { work.collection }
          </Typography>
        ) }
      </Box>
    </Box>
  );
}

export { TimelineWorkItem };
