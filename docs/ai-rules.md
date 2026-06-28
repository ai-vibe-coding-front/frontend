# AI 활용 및 코드 변경 규칙

## 1. 목적

이 문서는 Good Vibe MUUD 프로젝트에서 Codex, Claude Code, ChatGPT, Cursor 등 AI 도구를 활용해 코드를 작성할 때 지켜야 할 공통 규칙을 정의한다.

AI를 활용한 코드 작성은 허용한다. 단, AI가 작성한 코드의 책임은 해당 기능 담당자에게 있다.

## 2. 기본 원칙

- AI는 코드 작성 보조 도구로 사용한다.
- AI가 생성한 코드는 반드시 담당자가 직접 읽고 이해해야 한다.
- 설명할 수 없는 코드는 PR에 포함하지 않는다.
- AI가 제안한 변경사항을 그대로 적용하지 않는다.
- 담당 범위를 벗어난 파일은 임의로 수정하지 않는다.
- 보호 파일 변경은 팀장 또는 지정 담당자의 승인을 받은 뒤 진행한다.
- PR은 CI 통과와 사람 리뷰 이후에만 merge한다.

## 3. AI 사용 가능 범위

- 담당 페이지의 UI 컴포넌트 초안 작성
- 담당 API Route 초안 작성
- 담당 기능의 hook, util 함수 초안 작성
- TypeScript 타입 초안 작성
- Zod validation schema 초안 작성
- 테스트 케이스 초안 작성
- 에러 처리 방식 제안
- 리팩토링 제안
- PR 셀프 리뷰
- README, 회고, 문서 초안 작성

## 4. AI 단독 수정 금지 범위

아래 파일은 AI가 직접 수정하도록 요청하지 않는다. 필요한 경우 AI에게 변경 제안만 요청하고, 실제 수정은 팀장 또는 지정 담당자가 진행한다.

### 앱 내부 보호 경로

- `apps/web/prisma/schema.prisma`
- `apps/web/prisma/migrations/**`
- `apps/web/src/auth.ts`
- `apps/web/src/middleware.ts`
- `apps/web/src/types/**`
- `apps/web/src/lib/**`
- `apps/web/src/components/common/**`
- `apps/web/src/components/layout/**`
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/tailwind.config.ts`
- `apps/web/.env`
- `apps/web/.env.local`
- `apps/web/.env.example`

### 저장소 루트 보호 경로

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `.env`
- `.env.example`

## 5. DB 스키마 변경 규칙

- DB 스키마 변경은 팀장 승인 후 진행한다.
- 팀원은 임의로 `apps/web/prisma/schema.prisma`를 수정하지 않는다.
- 팀원은 임의로 `apps/web/prisma/migrations/**` 파일을 생성하지 않는다.
- 스키마 변경이 필요하면 담당 기능, 필요한 변경, 이유, 예상 영향 범위를 팀장에게 공유한다.

## 6. 공통 컴포넌트 변경 규칙

- 개인 페이지에서만 사용하는 컴포넌트는 해당 페이지 폴더 내부에 둔다.
- 2개 이상 페이지에서 반복 사용될 때 공통화 여부를 논의한다.
- `apps/web/src/components/common`, `apps/web/src/components/layout` 변경은 팀장 또는 공통 담당자 리뷰가 필요하다.
- AI가 공통 컴포넌트 수정을 제안하더라도 바로 적용하지 않는다.

## 7. 작업 전 AI 프롬프트 규칙

AI에게 작업을 요청할 때는 반드시 아래 정보를 포함한다.

```markdown
## 작업 범위

담당 기능:
-

수정 가능한 파일:
-

수정 금지 파일:
-

요구사항:
-

검증 방법:
-
```

## 8. 작업 후 검증 규칙

AI가 작성한 코드를 적용한 뒤 담당자는 아래 항목을 확인한다.

- [ ] 내가 이해하지 못하는 코드가 포함되지 않았는가?
- [ ] 내 담당 범위 밖의 파일이 수정되지 않았는가?
- [ ] 보호 파일이 승인 없이 변경되지 않았는가?
- [ ] 인증/인가 로직이 임의로 변경되지 않았는가?
- [ ] 기존 API 응답 형식이 바뀌지 않았는가?
- [ ] 환경변수 또는 API Key가 노출되지 않았는가?
- [ ] `pnpm lint` 또는 `pnpm --filter web lint`가 통과하는가?
- [ ] `pnpm typecheck` 또는 `pnpm --filter web typecheck`가 통과하는가?
- [ ] `pnpm build` 또는 `pnpm --filter web build`가 통과하는가?

## 9. PR 규칙

PR 본문에는 AI 사용 여부를 작성한다.

```markdown
## AI 활용 여부

- [ ] AI를 사용하지 않았습니다.
- [ ] AI를 사용했습니다.

### AI 사용 목적
-

### AI가 생성 또는 수정한 주요 파일
-

### 직접 검증한 내용

- [ ] 생성된 코드를 직접 읽고 이해했습니다.
- [ ] 설명할 수 없는 코드는 제거했습니다.
- [ ] 수정 금지 파일이 변경되지 않았는지 확인했습니다.
- [ ] lint/typecheck/build를 실행했습니다.
```

보호 파일을 변경하는 PR은 승인 기록을 함께 작성한다.

```markdown
## 보호 파일 변경 여부

- 변경 여부: 있음 / 없음
- 대상 파일:
  - apps/web/src/lib/api-response.ts
- 승인자: @팀장계정
- 승인 사유: API 응답 공통 형식 정리
```

## 10. Merge 규칙

- `main` 브랜치에 직접 push하지 않는다.
- 모든 변경은 PR을 통해 반영한다.
- CI가 실패한 PR은 merge하지 않는다.
- 보호 파일을 수정한 PR은 팀장 또는 Code Owner 승인 없이는 merge하지 않는다.
- 본인이 작성한 PR을 본인이 단독으로 merge하지 않는다.
- 최종 merge는 팀장 또는 지정 담당자가 진행한다.

## 11. 도구별 규칙 파일

팀원들이 사용하는 AI 도구가 다를 수 있으므로 아래 파일을 함께 관리한다.

- `docs/ai-rules.md`: 팀 공통 AI 활용 규칙 원본
- `AGENTS.md`: Codex용 작업 지침
- `CLAUDE.md`: Claude Code용 작업 지침

규칙이 변경되면 세 파일을 함께 업데이트한다.
