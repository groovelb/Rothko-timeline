# Project Rules

## 규칙 원본

### MUST (매 대화 자동 로드)
@.claude/rules/code-convention.md
@.claude/rules/design-system.md
@.claude/rules/mui-grid-usage.md
@.claude/rules/directory-structure.md

### Skill Resources (자동 로드되지 않음, Skill 활성화 시 on-demand Read)
- `.claude/skills/component-work/resources/components.md` — 기존 컴포넌트 목록
- `.claude/skills/component-work/resources/mui-theme.md` — MUI 테마 설정
- `.claude/skills/component-work/resources/refactoring-guide.md` — 리팩토링 가이드
- `.claude/skills/component-work/resources/project-summary.md` — 프로젝트 개요

## Workflow

- 디자인 관련 작업 → `/frontend-design` Skill 사용
- 컴포넌트 작업 → `component-work` Skill이 워크플로우 담당
- 리팩토링 → `refactoring-guide.md` 참조, 기존 스토리 통과 확인
- 룰 수정 먼저 제안 → `src/data/ruleRelationships.js` 동기화 필수