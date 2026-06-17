# CLAUDE.md

## 프로젝트 맥락

이 프로젝트는 AI 보조 개발을 허용합니다. 팀 공통 기준은 `docs/ai-rules.md`를 따릅니다.

## 기본 원칙

요청받은 기능을 정해진 작업 범위 안에서만 구현합니다. 명시적으로 요청받지 않은 대규모 구조 변경, 폴더 구조 변경, 공통 로직 변경은 하지 않습니다.

## 수정 보호 영역

팀장 또는 지정 담당자의 명시적 승인 없이 아래 파일과 디렉터리를 직접 수정하지 않습니다.

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `src/auth.ts`
- `src/middleware.ts`
- `src/types/**`
- `src/lib/**`
- `src/components/common/**`
- `src/components/layout/**`
- `package.json`
- `pnpm-lock.yaml`
- `next.config.ts`
- `tailwind.config.ts`
- `.env`
- `.env.example`

보호 영역 변경이 필요해 보이면 바로 수정하지 말고 변경 이유, 영향 파일, 예상 리스크, 권장 변경안을 먼저 설명합니다.

## 코드 작성 규칙

- 변경 범위는 작고 명확하게 유지합니다.
- 관련 없는 코드를 다시 작성하지 않습니다.
- 승인 없이 API 응답 구조를 바꾸지 않습니다.
- 승인 없이 의존성을 추가하지 않습니다.
- 환경변수, API Key, 토큰 등 민감 정보를 노출하지 않습니다.
- 특정 페이지에서만 쓰는 컴포넌트는 해당 페이지 또는 기능 폴더 안에 둡니다.
- 기존 네이밍 규칙과 폴더 구조를 유지합니다.
- API 데이터와 연결되는 UI에는 loading, empty, error 상태를 고려합니다.
- 사용자 입력에는 기본적인 검증을 추가합니다.

## 검증 규칙

변경 후 가능한 범위에서 아래 명령어를 실행합니다.

```bash
pnpm lint
pnpm typecheck
pnpm build
```

검증이 실패하면 원인을 설명하고, 요청 범위 안에서 해결 가능한 문제만 수정합니다.

## Figma 워크플로

커맨드: `/figma-sync`, `/figma-verify`, `/ui-check`

- `/figma-sync [URL]`: Figma 화면을 코드로 변환합니다. URL을 생략하면 미작업 항목을 자동 처리합니다.
- `/figma-verify`: 기존 컴포넌트가 Figma 디자인과 일치하는지 검증합니다.
- `/ui-check`: 브라우저 스크린샷과 Figma를 비교하고 시각적 수정 방향을 제안합니다.

Claude Code에서 Figma 관련 커맨드를 실행하기 전에는 Figma MCP 연결이 필요합니다.

상세 규칙: `.claude/commands/figma-sync.md`

## 공통 컴포넌트 수정 규칙

`src/components/common/`, `src/components/layout/`, `src/features/` 내 파일을 수정할 때 아래 기준을 지킵니다.

- 색상: `design-tokens.md`의 hex 값을 사용합니다. 토큰에 없는 값은 Figma 수치를 따릅니다.
- `className`: Tailwind 인라인 방식을 사용합니다. 동일 className이 2회 이상 반복되면 파일 상단 const로 추출합니다.
- Props: Figma variant는 `isActive`, `size` 같은 props로 표현합니다. 불필요한 prop은 추가하지 않습니다.
- 구조: 기존 컴포넌트 파일의 패턴을 유지합니다.
- 아이콘: `public/icons/`의 SVG만 사용합니다. 승인 없이 custom path를 직접 작성하지 않습니다.
- 수정 후: `src/components/` 또는 `src/features/` 파일을 변경한 PR에서만 `/figma-verify`를 실행합니다. 로직, API, 문서만 변경한 PR은 생략합니다.

상세 체크리스트: `.claude/commands/ui-component.md`
