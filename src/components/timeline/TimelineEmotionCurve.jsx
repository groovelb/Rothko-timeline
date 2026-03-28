import React from 'react';

/**
 * TimelineEmotionCurve — 감정 곡선 SVG 오버레이
 *
 * emotion_curve 데이터를 부드러운 catmull-rom 곡선으로 렌더.
 * 작품 노드 뒤, 축 위에 배치되어 감정의 흐름을 시각화.
 *
 * Props:
 * @param {string} path - SVG path d 속성 문자열 [Required]
 * @param {number} totalWidth - 캔버스 전체 너비 (px) [Required]
 * @param {number} viewportHeight - 뷰포트 높이 (px) [Required]
 *
 * Example usage:
 * <TimelineEmotionCurve path="M 100 400 C ..." totalWidth={8000} viewportHeight={800} />
 */
function TimelineEmotionCurve({ path, totalWidth, viewportHeight }) {
  if (!path) return null;

  return (
    <svg
      width={ totalWidth }
      height={ viewportHeight }
      style={ {
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      } }
    >
      <path
        d={ path }
        fill="none"
        stroke="#E0E0E0"
        strokeWidth={ 1.5 }
        strokeOpacity={ 0.4 }
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export { TimelineEmotionCurve };
