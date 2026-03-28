import React, { useState, useCallback, useEffect } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { HorizontalScrollContainer } from '../content-transition/HorizontalScrollContainer.jsx';
import { TimelineCanvas } from './TimelineCanvas.jsx';
import { useTimelineLayout } from './useTimelineLayout.js';

/**
 * RothkoTimeline — 마크 로스코 인터랙티브 타임라인
 *
 * X축(시간, 1903-1970)을 화면 중앙에 배치하고,
 * 축 상단에 작품 이미지를 Y축 감정 밴드별로 배치.
 * HorizontalScrollContainer를 사용해 세로 스크롤→가로 이동 변환.
 *
 * Props:
 * @param {Object} worksData - rothko_works.json 데이터 [Required]
 * @param {Object} eventsData - rothko_events.json 메타데이터 (시기 밴드 등) [Required]
 * @param {number} pxPerYear - 연도당 픽셀 수 [Optional, 기본값: 250]
 * @param {string} backgroundColor - 배경색 [Optional, 기본값: '#FAFAFA']
 *
 * Example usage:
 * <RothkoTimeline worksData={works} eventsData={events} />
 */
function RothkoTimeline({
  worksData,
  eventsData,
  pxPerYear = 250,
  backgroundColor = '#FAFAFA',
}) {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [activeId, setActiveId] = useState(null);

  /** 반응형 값 계산 */
  const theme = useTheme();
  const isBelowSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));
  const isBelowLg = useMediaQuery(theme.breakpoints.down('lg'));

  const responsivePxPerYear = isBelowSm ? 120 : isBelowMd ? 160 : isBelowLg ? 200 : pxPerYear;
  const axisRatio = isBelowSm ? 0.6 : 0.5;
  const nodeScale = isBelowSm ? 0.53 : isBelowMd ? 0.67 : isBelowLg ? 0.83 : 1.0;

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const layout = useTimelineLayout({
    worksData,
    eventsData,
    pxPerYear: responsivePxPerYear,
    viewportWidth,
    viewportHeight,
    axisRatio,
  });

  /** 스크롤 진행도 → Y축 라벨 고정용 counter-offset */
  const scrollProgress = useMotionValue(0);
  const scrollDistance = Math.max(0, layout.totalWidth - viewportWidth);
  const scrollOffset = useTransform(
    scrollProgress,
    [0, 1],
    [0, scrollDistance]
  );

  const handleScrollProgress = useCallback((v) => {
    scrollProgress.set(v);
  }, [scrollProgress]);

  const handleItemHover = useCallback((id) => {
    setActiveId(id);
  }, []);

  const handleItemLeave = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <HorizontalScrollContainer
      backgroundColor={ backgroundColor }
      onScrollProgress={ handleScrollProgress }
    >
      <TimelineCanvas
        positionedWorks={ layout.positionedWorks }
        positionedEvents={ layout.positionedEvents }
        emotionBands={ layout.emotionBands }
        periodBands={ layout.periodBands }
        yearTicks={ layout.yearTicks }
        totalWidth={ layout.totalWidth }
        axisY={ layout.axisY }
        viewportHeight={ viewportHeight }
        activeId={ activeId }
        onItemHover={ handleItemHover }
        onItemLeave={ handleItemLeave }
        scrollOffset={ scrollOffset }
        nodeScale={ nodeScale }
      />
    </HorizontalScrollContainer>
  );
}

export { RothkoTimeline };
