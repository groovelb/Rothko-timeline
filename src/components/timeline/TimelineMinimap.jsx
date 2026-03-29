import React, { useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import { motion, useTransform } from 'framer-motion';

/** 미니맵 고정 크기 */
const MAP_W = 180;
const MAP_H = 32;

/**
 * TimelineMinimap — 타임라인 축소 조감도 (우측 상단 fixed)
 *
 * 작품 분포를 작은 네모로 표시하고,
 * 현재 뷰포트 위치를 인디케이터로 보여준다.
 *
 * Props:
 * @param {Array} positionedWorks - 배치된 작품 배열 [Required]
 * @param {number} totalWidth - 타임라인 전체 너비 (px) [Required]
 * @param {number} axisY - 축 Y 위치 (px) [Required]
 * @param {number} viewportWidth - 뷰포트 너비 [Required]
 * @param {Object} scrollProgress - framer-motion MotionValue (0~1) [Required]
 * @param {function} onNavigate - (targetProgress) => void [Required]
 *
 * Example usage:
 * <TimelineMinimap positionedWorks={works} totalWidth={9000} ... />
 */
function TimelineMinimap({
  positionedWorks,
  totalWidth,
  axisY,
  viewportWidth,
  scrollProgress,
  onNavigate,
}) {
  const containerRef = useRef(null);

  /** 뷰포트 인디케이터 너비 (미니맵 내 비율) */
  const indicatorW = Math.max(12, (viewportWidth / totalWidth) * MAP_W);

  /** scrollProgress(0~1) → 인디케이터 X 위치 */
  const indicatorX = useTransform(
    scrollProgress,
    [0, 1],
    [0, MAP_W - indicatorW]
  );

  /** 미니맵 클릭 → 해당 위치로 내비게이션 */
  const handleClick = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetProgress = Math.max(0, Math.min(1, clickX / MAP_W));
    onNavigate(targetProgress);
  }, [onNavigate]);

  return (
    <Box
      ref={ containerRef }
      onClick={ handleClick }
      sx={ {
        position: 'fixed',
        top: 56,
        right: 16,
        zIndex: 1100,
        width: MAP_W,
        height: MAP_H,
        backgroundColor: 'rgba(250, 250, 250, 0.65)',
        backdropFilter: 'blur(4px)',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        display: { xs: 'none', md: 'block' },
      } }
    >
      {/* 작품 분포 — 작은 네모 */}
      { positionedWorks.map((work) => {
        const x = (work.x / totalWidth) * MAP_W;
        const y = (work.y / (axisY * 0.95)) * (MAP_H * 0.75);
        const color = work.color_blocks?.[0]?.color || '#bbb';
        return (
          <Box
            key={ work.id }
            sx={ {
              position: 'absolute',
              left: x,
              top: Math.max(1, Math.min(MAP_H - 3, y)),
              width: 2.5,
              height: 2.5,
              backgroundColor: color,
              opacity: 0.6,
            } }
          />
        );
      }) }

      {/* 뷰포트 인디케이터 */}
      <motion.div
        style={ {
          position: 'absolute',
          top: 0,
          left: 0,
          x: indicatorX,
          width: indicatorW,
          height: MAP_H,
          backgroundColor: 'rgba(0, 0, 0, 0.07)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.18)',
          borderRight: '1px solid rgba(0, 0, 0, 0.18)',
          pointerEvents: 'none',
        } }
      />
    </Box>
  );
}

export { TimelineMinimap };
