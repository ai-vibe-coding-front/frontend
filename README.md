# MUUD

MUUD는 질문 기반으로 사용자의 현재 감정과 상황에 맞는 문화예술 경험을 추천하는 웹 애플리케이션입니다.

## 프로젝트 구조

```txt
muud/
├── apps/
│   └── web/
├── packages/
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 실행 방법

```bash
pnpm install
pnpm dev
```

## 주요 명령어

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## 웹앱 경로

```txt
apps/web
```

## 개발 기준

- 패키지 매니저는 `pnpm`을 사용합니다.
- 웹앱은 `apps/web`에서 관리합니다.
- Git 협업 전략은 `docs/git-strategy.md`를 따릅니다.
- API 규칙은 `docs/api-convention.md`를 따릅니다.
