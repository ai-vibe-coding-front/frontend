# CLAUDE.md

## Figma 워크플로

커맨드: `/figma-sync`, `/figma-verify`, `/ui-check`

- `/figma-sync [URL]` — Figma 화면을 코드로 변환 (URL 생략 시 미작업 항목 자동 처리)
- `/figma-verify` — 기존 컴포넌트가 Figma 디자인과 일치하는지 검증
- `/ui-check` — 브라우저 스크린샷 vs Figma 시각 비교 후 자동 수정

**Figma MCP 연결 필수** — Claude Code 실행 전 Figma 플러그인 MCP가 연결되어 있어야 합니다.

상세 규칙: `.claude/commands/figma-sync.md`

## 공통 컴포넌트 수정 규칙

`src/components/common/`, `src/components/layout/`, `src/features/` 내 파일을 수정할 때 반드시 지킨다.

- **색상** — `design-tokens.md`의 hex 값 사용. 토큰에 없는 값은 Figma 수치 그대로.
- **className** — Tailwind 인라인. 동일 className 2회 이상 반복 시 파일 상단 const로 추출.
- **Props** — Figma 베리언트는 props로 표현 (`isActive`, `size` 등). 불필요한 prop 추가 금지.
- **구조** — 기존 컴포넌트 파일의 패턴(interface → const → export function) 유지.
- **아이콘** — `public/icons/` 의 SVG만 사용. 커스텀 path 직접 작성 금지.
- **수정 후** — `src/components/` 또는 `src/features/` 파일을 변경한 PR에서만 `/figma-verify` 실행. 로직·API·스타일 무관 PR은 스킵.

상세 체크리스트: `.claude/commands/ui-component.md`
