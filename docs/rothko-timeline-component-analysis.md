# 로스코 타임라인 — UX 패턴 & 컴포넌트 분석

> `rothko-timeline-plan.md` 기획서 기반, 현재 디자인 시스템 대조 분석

---

## 1. 재활용 가능한 기존 컴포넌트

| 기존 컴포넌트 | 활용 위치 | 활용 방법 |
|---|---|---|
| **FullPageContainer / FullPageSection** | 작품 몰입 모드 (§7-4) | 클릭 시 전체화면 전환의 컨테이너로 사용 |
| **FadeTransition** | 몰입 모드 진입/퇴장 | 배경색 전환 시 fade 애니메이션 |
| **HighlightedTypography** | 인용문 표시 | 로스코 어록 강조 표시 |
| **CategoryTab** | 이벤트 카테고리 필터 (life/art/career/emotional) | 4개 카테고리 필터 UI |
| **SlidingHighlightMenu** | 시기(period) 내비게이션 | 10개 전기적 시기를 빠르게 이동하는 수평 메뉴 |
| **Indicator** | 줌 레벨/현재 위치 표시 | 타임라인 내 현재 위치 인디케이터 |
| **Typography (Title, StyledParagraph, PullQuote)** | 몰입 모드 텍스트 | 작품 제목, 설명, 인용문 |
| **GradientOverlay** | 감정 밴드 배경 효과 | WebGL 기반 blur/gradient 렌더링 기법 참고 가능 |
| **ScrollScaleContainer** | 줌 인/아웃 시 스케일 전환 | 스크롤 기반 scale 전환 로직 참고 |

---

## 2. 신규 필요 컴포넌트

### A. 코어 시각화 (Core Visualization)

| 컴포넌트 | 설명 | 복잡도 |
|---|---|---|
| **TimelineCanvas** | SVG 기반 메인 타임라인 좌표계. X축(시간) + Y축(감정) 렌더링, 패닝/줌 상태 관리 | **높음** |
| **EmotionBand** | 감정 곡선을 두께·색상·blur를 가진 밴드로 SVG path 렌더링. 43개 포인트를 cubic bezier로 보간 | **높음** |
| **EventMarker** | X축(Y=0) 위 이벤트 틱. significance에 따른 표시/숨김 로직 포함 | 중간 |
| **RothkoPainting** | `color_blocks[]` 데이터로 CSS 색면 블록 재현. `composition_type` 7종에 따른 레이아웃 변형 | 중간 |

### B. 인터랙션 (Interaction)

| 컴포넌트 | 설명 | 복잡도 |
|---|---|---|
| **EventTooltip** | 이벤트 호버 시 툴팁. 시기별 감정 밴드 색상의 left border, 카테고리 아이콘 | 낮음 |
| **ArtworkHoverCard** | 작품 호버 시 확대 카드. 색면 확대 + 제목/연도/사이즈/경매기록 | 중간 |
| **ImmersionView** | 작품 클릭 시 전체화면 몰입 모드. 배경색 전환, ←→ 작품 네비게이션, ESC 닫기 | **높음** |
| **TimelineZoomController** | 마우스 휠/핀치로 X축 스케일 제어. 줌 레벨에 따른 이벤트/작품 progressive disclosure | **높음** |

### C. 보조 UI (Supporting)

| 컴포넌트 | 설명 | 복잡도 |
|---|---|---|
| **PeriodLegend** | 미술사적 시기(7개) + 전기적 시기(10개) 범례. 색상 스와치 + 연도 범위 | 낮음 |
| **TimelineMinimap** | (선택) 줌 시 전체 타임라인에서 현재 뷰포트 위치를 보여주는 미니맵 | 중간 |

---

## 3. 핵심 UX 패턴

### 패턴 1: Progressive Disclosure (점진적 노출)

- **적용**: 줌 레벨에 따라 이벤트(4단계 significance)와 작품(3단계)을 단계적 표시
- **기존 유사**: 없음 — 신규 패턴
- **구현 키**: `significance` 필드 기반 visibility 상태 관리 훅 (`useZoomVisibility`)

### 패턴 2: Focus + Context (디밍)

- **적용**: 작품/이벤트 호버 시 주변 요소 dim 처리
- **기존 유사**: `GradientOverlay`의 배경 처리 참고
- **구현 키**: CSS `opacity` 전환 + pointer-events 제어

### 패턴 3: Detail-on-Demand (호버 상세)

- **적용**: 이벤트 툴팁 (§7-2), 작품 확대 카드 (§7-3)
- **기존 유사**: 없음 — 현재 디자인 시스템에 Tooltip/Popover 컴포넌트 부재
- **구현 키**: MUI `Popper` 또는 커스텀 positioned overlay

### 패턴 4: Immersive Transition (몰입 전환)

- **적용**: 작품 클릭 → 전체화면 색면 전환 (§7-4)
- **기존 유사**: `FullPageContainer` + `FadeTransition` 조합 가능
- **구현 키**: `background-color` CSS transition + scale animation

### 패턴 5: Semantic Zoom (의미적 줌)

- **적용**: 줌 시 단순 확대가 아닌, 콘텐츠 밀도가 변함
- **기존 유사**: 없음 — 신규 패턴
- **구현 키**: 줌 레벨 상태 → 필터링 → 재배치의 파이프라인

### 패턴 6: Spatial Navigation (공간 내비게이션)

- **적용**: 몰입 모드에서 ←→ 키보드로 작품 간 이동
- **기존 유사**: `ImageCarousel`의 이전/다음 로직 참고
- **구현 키**: `useEffect` 키보드 이벤트 바인딩

---

## 4. 필요 커스텀 훅

| 훅 | 역할 |
|---|---|
| `useTimelineZoom` | 휠/핀치 이벤트 → X축 도메인(viewable year range) 관리 |
| `useEmotionCurve` | 43개 포인트 → cubic bezier SVG path + 밴드 두께/색상 보간 |
| `useZoomVisibility` | 현재 줌 레벨 → significance 기반 표시 대상 필터링 |
| `useImmersionMode` | 몰입 모드 상태 관리 (진입/퇴장, 현재 작품, 키보드 네비게이션) |

---

## 5. 기존 디자인 시스템 갭 (Gap)

| 부재 영역 | 영향 | 대안 |
|---|---|---|
| **Tooltip/Popover 컴포넌트** | 이벤트 호버 툴팁 직접 구현 필요 | MUI `Tooltip`/`Popper` 활용 |
| **SVG 시각화 컴포넌트** | 차트/그래프 계열 전무 | D3.js 또는 순수 SVG + React로 직접 구현 |
| **줌/패닝 인터랙션** | 지도/차트형 인터랙션 패턴 없음 | `d3-zoom` 또는 커스텀 wheel/touch 핸들러 |
| **세리프 타이포그래피** | 현재 Pretendard(산세리프) + Outfit만 있음 | 세리프 웹폰트 추가 필요 (기획서 §9 요구) |

---

## 6. 추천 구현 우선순위

1. **데이터 레이어** — `rothko_events.json`, `rothko_works.json` 로딩 + 파싱 유틸
2. **TimelineCanvas + EmotionBand** — 핵심 좌표계와 감정 곡선 (이것 없이는 나머지 불가)
3. **RothkoPainting + EventMarker** — 좌표계 위에 배치할 요소들
4. **EventTooltip + ArtworkHoverCard** — 인터랙션 첫 단계 (호버)
5. **TimelineZoomController** — progressive disclosure 활성화
6. **ImmersionView** — 작품 몰입 모드 (가장 인상적이지만 독립적으로 개발 가능)

---

## 7. 요약

- **신규 컴포넌트**: 10개
- **커스텀 훅**: 4개
- **기존 컴포넌트 재활용**: 9개
- **최대 기술 도전**: SVG 시각화 + 줌/패닝 인터랙션 (디자인 시스템에 이 계열 전무)
- **선결 사항**: D3.js 도입 여부, 세리프 웹폰트 선정
