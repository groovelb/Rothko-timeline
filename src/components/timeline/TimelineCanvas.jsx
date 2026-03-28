import React, { useMemo, useState } from 'react';
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

/** 밴드별 일대기 설명 */
const BAND_DESC = {
  EXPAND: '1949–54년. 유럽 여행에서 마티스의 색채와 르네상스 프레스코의 규모에 깊이 감응한 로스코는 귀국 후 클래식 색면 양식을 완성한다. 딸 케이트의 탄생(1950), MoMA「15인의 미국인」전(1952) 참여, 시카고 아트 인스티튜트 개인전까지 — 예술적 인정과 개인적 행복이 동시에 정점에 이른 시기다. 캔버스는 오렌지, 레드, 옐로우의 발광하는 색면으로 가득 차며, 로스코 스스로 "인간의 기본 감정 — 비극, 황홀, 운명"을 표현한다고 말한 시기의 작품들이다.',
  RADIATE: '1945–48년. 첫 아내 에디스와 이혼(1944) 후 삽화가 멜 바이슬러와 재혼(1945)하며 새 출발을 한다. 페기 구겐하임의 아트 오브 디스 센추리 갤러리에서 첫 개인전(1945)을 열고, 동료 화가들과 뉴욕 예술학교(Subjects of the Artist)를 공동 설립(1948)한다. 구상의 잔재가 서서히 녹아내리며 멀티폼(Multiform) 양식이 탄생하는 시기로, 형태는 부유하고 색채는 점차 자율적으로 진동하기 시작한다. 새로운 사랑과 예술적 돌파의 에너지가 캔버스 밖으로 확산되는 발산의 시기.',
  EQUIL: '1938–44년. 뉴욕 지하철 연작에서 도시적 고독을 탐구하던 로스코가 니체와 그리스 비극에 몰입하며 신화적 초현실주의로 이행하는 과도기다. 아직 추상에 도달하지 못했지만 구상을 떠나고 있으며, 두 세계 사이의 긴장이 화면에 팽팽하게 공존한다. 개인적으로도 결혼 생활의 갈등과 이민자로서의 정체성 사이에서 균형을 찾으려 하던 시기. 팽창도 수축도 아닌, 전환 직전의 정적이 흐르는 명상적 평형 상태의 작품들.',
  CONTRACT: '1958–67년. 뉴욕 최고급 레스토랑 포시즌스를 위한 시그램 벽화를 의뢰받지만, "그곳에서 밥을 먹는 자들의 식욕을 망쳐놓겠다"고 선언한 뒤 결국 계약을 파기하고 작품을 회수한다(1959). 팝 아트의 부상으로 추상표현주의는 시대착오적이라는 비판을 받고, 로스코는 점점 고립된다. 하버드 벽화(1962), 로스코 채플 의뢰(1964) 등 기념비적 프로젝트를 수행하지만, 과도한 음주와 우울증이 심화되고 건강이 악화된다. 색조는 짙은 적갈색, 마룬, 검정으로 응축되며, 에너지는 외부로 발산되지 못하고 캔버스 안쪽으로 깊이 침잠한다.',
  VOID: '1968–70년. 대동맥류 진단을 받은 로스코는 의사의 경고에도 불구하고 작업을 멈추지 않는다. 아내 멜과 별거하고 스튜디오에서 홀로 지내며, 마지막 연작「Black on Gray」에 몰두한다. 검정과 회색 두 수평면만으로 구성된 이 작품들에는 이전의 색채 에너지가 완전히 소멸되어 있다. "침묵과 고독만이 나의 벗"이라 했던 로스코는 1970년 2월 25일, 뉴욕 이스트 69번가 스튜디오에서 스스로 생을 마감한다. 마지막 작품들은 형태의 해체이자 색의 환원 — 존재가 정적으로 귀결되는 과정 그 자체다.',
};

/** 이벤트 스트립 높이 — 축 바로 아래, 하단 패널 위 */
const EVENT_STRIP_H = 48;

/**
 * TimelineCanvas — 전체 좌표계를 담는 절대 위치 캔버스
 *
 * X축 상단에 작품을 감정 밴드별로 배치.
 * X축 하단: 이벤트 스트립 + 4컬럼 에디토리얼 패널.
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
 * @param {number} nodeScale - 작품 노드 크기 스케일 (0~1) [Optional, 기본값: 1]
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
  nodeScale = 1,
}) {
  const activeWork = activeId
    ? positionedWorks.find((w) => w.id === activeId)
    : null;

  const panelTop = axisY + EVENT_STRIP_H;
  const panelHeight = viewportHeight - panelTop;
  const BAND_LABELS = { EXPAND: '팽창', RADIATE: '발산', EQUIL: '균형', CONTRACT: '수축', VOID: '소멸' };
  const [selectedBand, setSelectedBand] = useState('EXPAND');

  /** 밴드별 색상 분포 — col1 스택 바 */
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

  /** 선택 밴드의 작품 리포트 — col2 스크롤 리스트 */
  const bandWorksReport = useMemo(() => {
    return positionedWorks
      .filter((w) => w.band === selectedBand)
      .sort((a, b) => a.year - b.year);
  }, [positionedWorks, selectedBand]);

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
          variant="h4"
          sx={ {
            display: 'block',
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '0.04em',
          } }
        >
          Mark Rothko
        </Typography>
        <Typography
          variant="caption"
          sx={ { color: 'text.disabled', mt: 0.5 } }
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
          nodeScale={ nodeScale }
          onMouseEnter={ () => onItemHover?.(work.id) }
          onMouseLeave={ () => onItemLeave?.() }
          onClick={ () => onItemHover?.(work.id) }
        />
      )) }

      {/* 이벤트 노드 (축 하단 — 이벤트 스트립 영역) */}
      { positionedEvents.map((event) => (
        <TimelineEventItem
          key={ event.id }
          event={ event }
          axisY={ axisY }
        />
      )) }

      {/* 하단 고정 패널 — 이벤트 스트립 아래, 4컬럼 에디토리얼 그리드 */}
      <motion.div
        style={ {
          position: 'absolute',
          left: 0,
          top: panelTop,
          width: '100vw',
          height: panelHeight,
          display: 'flex',
          paddingTop: 24,
          pointerEvents: 'none',
          zIndex: 4,
          x: scrollOffset,
        } }
      >
        {/* ── Col 1 — Entropy Distribution ── */}
        <Box
          sx={ {
            width: { xs: '100%', lg: '25%' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 3, sm: 4, md: 5, lg: 6, xl: 9 },
            py: { xs: 2, sm: 3, md: 4, lg: 5, xl: 7.5 },
            overflow: 'hidden',
          } }
        >
          <Typography
            variant="h4"
            sx={ {
              color: 'text.primary',
              mb: 0.5,
              flexShrink: 0,
              fontSize: { lg: '1.25rem', xl: '1.5rem' },
            } }
          >
            Entropy Distribution
          </Typography>
          <Typography
            variant="body2"
            sx={ {
              color: 'text.disabled',
              mb: { lg: 3, xl: 4 },
              flexShrink: 0,
            } }
          >
            감정 엔트로피 축에 따른 색상 사용 분포
          </Typography>

          {/* 밴드 바 — 세로 공간 균등 배분 */}
          <Box
            sx={ {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            } }
          >
            { bandColorDist.map((band) => (
              <Box key={ band.bandId } sx={ { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' } }>
                <Box sx={ { display: 'flex', justifyContent: 'space-between', mb: 0.5 } }>
                  <Typography
                    variant="body2"
                    sx={ { fontWeight: 500, color: 'text.secondary' } }
                  >
                    { band.label }
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={ { color: 'text.disabled' } }
                  >
                    { band.workCount }점
                  </Typography>
                </Box>
                <Box
                  sx={ {
                    height: 24,
                    display: 'flex',
                    borderRadius: '3px',
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
              </Box>
            )) }
          </Box>
        </Box>

        {/* ── Col 2 — Color Analysis ── */}
        <Box
          sx={ {
            width: { md: '33%', lg: '25%' },
            height: '100%',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            borderLeft: { md: '1px solid' },
            borderColor: 'grey.200',
            overflow: 'hidden',
            pointerEvents: 'auto',
          } }
        >
          <Box sx={ { px: { md: 3, lg: 5, xl: 7.5 }, pt: { md: 3, lg: 5, xl: 7.5 }, pb: { md: 1, lg: 1.5, xl: 2 }, flexShrink: 0 } }>
            <Typography
              variant="h4"
              sx={ {
                color: 'text.primary',
                fontSize: { md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
              } }
            >
              Color Analysis
            </Typography>
          </Box>

          <Box
            sx={ {
              display: 'flex',
              px: { md: 1.5, lg: 2, xl: 3 },
              gap: '2px',
              flexShrink: 0,
            } }
          >
            { BAND_ORDER.map((id) => (
              <Box
                key={ id }
                onClick={ () => setSelectedBand(id) }
                sx={ {
                  flex: 1,
                  py: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: selectedBand === id ? 'grey.100' : 'transparent',
                  transition: 'background-color 0.15s',
                  '&:hover': { backgroundColor: selectedBand === id ? 'grey.100' : 'grey.50' },
                } }
              >
                <Typography
                  variant="body2"
                  sx={ {
                    fontWeight: selectedBand === id ? 600 : 400,
                    color: selectedBand === id ? 'text.primary' : 'text.disabled',
                  } }
                >
                  { BAND_LABELS[id] }
                </Typography>
              </Box>
            )) }
          </Box>

          {/* 스크롤 영역 — 설명 + 작품 리스트 전체 */}
          <Box
            sx={ {
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 3 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.300', borderRadius: 2 },
            } }
          >
            {/* 밴드 설명 */}
            <Box sx={ { px: { md: 3, lg: 5, xl: 7.5 }, py: { md: 1.5, lg: 2, xl: 2 }, backgroundColor: 'grey.50' } }>
              <Typography
                variant="caption"
                sx={ { color: 'text.secondary', lineHeight: 1.6 } }
              >
                { BAND_DESC[selectedBand] }
              </Typography>
            </Box>

            {/* 작품 리포트 */}
            <Box sx={ { px: { md: 3, lg: 4, xl: 6 }, py: { md: 2, lg: 2.5, xl: 3 } } }>
              { bandWorksReport.length > 0 ? bandWorksReport.map((work) => (
                <Box
                  key={ work.id }
                  sx={ {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'grey.100',
                    '&:last-child': { borderBottom: 'none' },
                  } }
                >
                  <Box
                    component="img"
                    src={ work.image }
                    alt={ work.title }
                    sx={ {
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: '2px',
                      flexShrink: 0,
                    } }
                  />
                  <Box sx={ { flex: 1, minWidth: 0 } }>
                    <Typography
                      variant="body2"
                      sx={ {
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      } }
                    >
                      { work.title }
                    </Typography>
                    <Box sx={ { display: 'flex', gap: '3px', mt: 0.5 } }>
                      { work.color_blocks?.map((block, i) => (
                        <Box
                          key={ i }
                          sx={ {
                            width: 14,
                            height: 14,
                            backgroundColor: block.color,
                            borderRadius: '2px',
                            flexShrink: 0,
                          } }
                        />
                      )) }
                    </Box>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={ { color: 'text.disabled', flexShrink: 0 } }
                  >
                    { work.year }
                  </Typography>
                </Box>
              )) : (
                <Typography
                  variant="body2"
                  sx={ { color: 'text.disabled', fontStyle: 'italic', pt: 2 } }
                >
                  해당 밴드에 작품 없음
                </Typography>
              ) }
            </Box>
          </Box>
        </Box>

        {/* ── Col 3 — Selected Work ── */}
        <Box
          sx={ {
            width: { md: '33%', lg: '25%' },
            height: '100%',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            borderLeft: { md: '1px solid' },
            borderColor: 'grey.200',
            overflow: 'hidden',
          } }
        >
          <Box sx={ { px: { md: 4, lg: 5, xl: 7.5 }, pt: { md: 3, lg: 5, xl: 7.5 }, pb: { md: 1, lg: 1.5, xl: 2 }, flexShrink: 0 } }>
            <Typography
              variant="h4"
              sx={ {
                color: 'text.primary',
                fontSize: { md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
              } }
            >
              { activeWork ? 'Selected Work' : 'Portrait' }
            </Typography>
          </Box>
          <Box
            sx={ {
              flex: 1,
              overflow: 'hidden',
              backgroundColor: activeWork ? '#1a1a1a' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: activeWork
                ? { md: 3, lg: 4, xl: 6 }
                : { md: 2, lg: 3, xl: 4 },
            } }
          >
            <Box
              component="img"
              src={ activeWork ? activeWork.image : '/images/rothko/rothko-portrait-1949.jpg' }
              alt={ activeWork ? activeWork.title : 'Mark Rothko, photographed by Consuelo Kanaga, c. 1949' }
              sx={ {
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                opacity: activeWork ? 1 : 0.7,
              } }
            />
          </Box>
        </Box>

        {/* ── Col 4 — Details ── */}
        <Box
          sx={ {
            width: { md: '34%', lg: '25%' },
            height: '100%',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            px: { md: 4, lg: 6, xl: 9 },
            py: { md: 3, lg: 5, xl: 7.5 },
            borderLeft: { md: '1px solid' },
            borderColor: 'grey.200',
            overflow: 'hidden',
          } }
        >
          <Typography
            variant="h4"
            sx={ {
              color: 'text.primary',
              mb: { md: 2, lg: 3, xl: 4 },
              flexShrink: 0,
              fontSize: { md: '1.125rem', lg: '1.25rem', xl: '1.5rem' },
            } }
          >
            { activeWork ? 'Details' : 'About' }
          </Typography>

          { activeWork ? (
            <Box sx={ { flex: 1, display: 'flex', flexDirection: 'column' } }>
              {/* 컬러 스와치 */}
              <Box sx={ { display: 'flex', gap: 1, mb: 3 } }>
                { activeWork.color_blocks?.map((block, i) => (
                  <Box
                    key={ i }
                    sx={ {
                      width: 24,
                      height: 24,
                      backgroundColor: block.color,
                      borderRadius: '2px',
                    } }
                  />
                )) }
              </Box>

              <Typography
                variant="h4"
                sx={ { mb: 1 } }
              >
                { activeWork.title }
              </Typography>

              <Typography
                variant="subtitle1"
                sx={ { color: 'text.secondary', mb: 0.5 } }
              >
                { activeWork.year }
              </Typography>

              <Typography
                variant="body1"
                sx={ { color: 'text.disabled', mb: 0.5 } }
              >
                { BAND_LABELS[activeWork.band] || activeWork.band }
              </Typography>

              <Typography
                variant="body1"
                sx={ { color: 'text.disabled', mb: 1 } }
              >
                { activeWork.medium }
              </Typography>

              { activeWork.collection && (
                <Typography
                  variant="body2"
                  sx={ { color: 'text.disabled' } }
                >
                  { activeWork.collection }
                </Typography>
              ) }
            </Box>
          ) : (
            <Box sx={ { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' } }>
              <Typography
                variant="h5"
                sx={ { color: 'text.primary', mb: 2 } }
              >
                Mark Rothko
              </Typography>
              <Typography
                variant="subtitle2"
                sx={ { color: 'text.secondary', mb: 2 } }
              >
                1903, Daugavpils — 1970, New York
              </Typography>
              <Typography
                variant="body2"
                sx={ { color: 'text.secondary', lineHeight: 1.7, mb: 2 } }
              >
                라트비아 태생의 미국 화가. 색면 추상(Color Field Painting)의 선구자로, 거대한 캔버스 위에 부유하는 색채의 직사각형들을 통해 인간의 근원적 감정 — 비극, 황홀, 운명 — 을 직접 전달하고자 했다.
              </Typography>
              <Typography
                variant="body2"
                sx={ { color: 'text.disabled', lineHeight: 1.7 } }
              >
                작품 위에 마우스를 올려 상세 정보를 확인하세요.
              </Typography>
            </Box>
          ) }
        </Box>
      </motion.div>
    </Box>
  );
}

export { TimelineCanvas };
