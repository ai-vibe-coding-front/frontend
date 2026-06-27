# Git 협업 전략

이 문서는 GitHub Issue, Branch, Commit, Pull Request, Merge 흐름을 일관되게 사용하기 위한 협업 규칙입니다.

## 1. 기본 원칙

- `main` 브랜치는 항상 실행 가능하고 배포 가능한 상태로 유지합니다.
- 모든 작업은 Issue를 먼저 생성한 뒤 진행합니다.
- 모든 변경은 작업 브랜치와 Pull Request를 통해 반영합니다.
- 하나의 Issue는 가능한 하나의 명확한 작업 단위를 다룹니다.
- PR 생성 후에는 Vercel Preview Deployment에서 실제 동작을 확인합니다.
- `main` 병합 후에는 Vercel Production Deployment 상태를 확인합니다.

## 2. 브랜치 전략

이 프로젝트는 GitHub Flow를 사용합니다.

```txt
main
└─ feature/이슈번호-작업명
└─ fix/이슈번호-작업명
└─ refactor/이슈번호-작업명
└─ docs/이슈번호-작업명
└─ chore/이슈번호-작업명
```

`develop`, `release`, `hotfix` 브랜치를 별도로 운영하는 Git Flow는 사용하지 않습니다.

| 구분 | 역할 | Vercel 배포 |
| --- | --- | --- |
| `main` | 실제 발표 및 운영 기준 브랜치 | Production Deployment |
| 작업 브랜치 PR | 기능 확인 및 코드 리뷰 대상 | Preview Deployment |

## 3. 브랜치 네이밍 규칙

브랜치명은 아래 형식을 따릅니다.

```txt
type/issue-number-short-description
```

예시:

```txt
feature/1-login-page
feature/2-signup-api
fix/3-header-layout
refactor/4-button-component
docs/5-readme-update
chore/6-project-setting
```

브랜치명에는 `#`를 넣지 않습니다. 이슈 연결은 PR 본문의 `Closes #이슈번호`로 처리합니다.

## 4. 작업 타입

| Type | 사용 상황 |
| --- | --- |
| `feature` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변화 없는 코드 구조 개선 |
| `style` | UI, CSS, 레이아웃 수정 |
| `docs` | 문서 추가 또는 수정 |
| `chore` | 설정, 패키지, 빌드 환경 등 기타 작업 |

## 5. Commit 메시지 규칙

커밋 메시지는 아래 형식을 따릅니다.

```txt
type: 작업 내용 (#이슈번호)
```

예시:

```txt
feat: 로그인 페이지 구현 (#1)
fix: 모바일 헤더 레이아웃 수정 (#3)
refactor: Button 컴포넌트 구조 정리 (#4)
docs: README 실행 방법 추가 (#5)
chore: ESLint 설정 추가 (#6)
```

## 6. Issue 작성 규칙

Issue 제목은 아래 형식을 권장합니다.

```txt
[type] 작업 제목
```

Issue에는 최소한 아래 내용을 작성합니다.

- 작업 내용
- 완료 조건
- 참고 자료
- 작업 메모

## 7. Issue Type / Label / Priority 사용 규칙

| Issue Type | 의미 |
| --- | --- |
| `Feature` | 새로운 기능 추가 또는 기능 개선 |
| `Bug` | 예상과 다르게 동작하는 문제 또는 오류 수정 |
| `Task` | 문서, 설정, 리팩토링, 스타일 수정 등 명확한 작업 단위 |

| Label | 의미 |
| --- | --- |
| `feature` | 기능 추가 작업을 빠르게 확인하기 위한 보조 태그 |
| `refactor` | 기능 변화 없는 코드 구조 개선 |
| `style` | UI, CSS, 레이아웃, 디자인 관련 수정 |
| `docs` | 문서 추가, 수정, 정리 |
| `chore` | 설정, 패키지, 빌드, 환경 구성 등 기타 작업 |
| `question` | 논의나 확인이 필요한 작업 |
| `blocked` | 외부 요인이나 의존 작업으로 인해 진행이 막힌 작업 |
| `fix` | Bug Type 이슈의 보조 라벨 |

`fix` 라벨은 `Bug` Issue Type과 의미가 겹치므로 기본 분류는 `Bug` Issue Type으로 합니다. 다만 GitHub-Notion 자동 동기화 또는 빠른 필터링이 필요한 경우 `fix` 라벨을 보조 라벨로 사용할 수 있습니다.

우선순위는 Label이 아니라 GitHub Projects의 Priority 필드에서 관리합니다.

| Priority | 의미 |
| --- | --- |
| `High` | 핵심 기능, 마감에 직접 영향이 있는 작업 |
| `Medium` | 일반적인 우선순위의 작업 |
| `Low` | 여유가 있을 때 처리해도 되는 작업 |

## 8. Pull Request 규칙

PR 제목은 아래 형식을 따릅니다.

```txt
[type] 작업 요약
```

규칙:

- `type`은 소문자로 작성합니다.
- PR 제목에는 이슈 번호를 넣지 않습니다.
- 이슈 연결은 PR 본문의 `Closes #이슈번호`로 처리합니다.
- 커밋 메시지 형식(`feat: ...`, `fix: ...`)을 PR 제목으로 그대로 사용하지 않습니다.
- 연결된 Issue 제목을 기본으로 하되, 실제 PR 변경 범위가 더 명확히 드러나도록 조정할 수 있습니다.

권장 예시:

```txt
[feature] 로그인 페이지 구현
[fix] 모바일 헤더 레이아웃 수정
[refactor] Button 컴포넌트 구조 정리
[docs] README 실행 방법 추가
[chore] 환경변수 예시 파일 정리
```

피해야 할 예시:

```txt
feat: 로그인 페이지 구현 (#1)
[Fix] 로그인 실패 처리
[feature] 로그인 페이지 구현 (#1)
작업 완료
수정사항 반영
```

PR 본문에는 아래 내용을 작성합니다.

- 관련 이슈
- 작업 내용
- 확인 방법
- Vercel Preview 확인 여부
- 스크린샷 또는 참고 자료
- 리뷰 요청 사항

문서 수정처럼 배포 확인이 필요하지 않은 작업은 `배포 확인: 해당 없음 - 문서 수정`이라고 작성합니다.

## 9. 코드 리뷰 규칙

- PR 작성자는 리뷰어가 이해할 수 있도록 변경 내용을 간단히 설명합니다.
- 리뷰어는 동작 여부, 코드 구조, 불필요한 코드 여부를 확인합니다.
- 작성자는 리뷰 내용을 반영한 뒤 다시 확인을 요청합니다.
- 승인 없이 본인이 임의로 `main`에 병합하지 않습니다.

리뷰어는 특히 아래 내용을 확인합니다.

- 작업 내용이 Issue의 완료 조건을 만족하는가
- 불필요한 코드나 로그가 남아 있지 않은가
- 공통 컴포넌트나 공통 타입에 영향이 없는가
- UI 변경이 있다면 화면이 깨지지 않는가
- API 연동이 있다면 실패 상황도 고려했는가
- 환경변수나 API Key가 코드에 직접 노출되지 않았는가

## 10. Merge 규칙

- PR은 최소 1명 이상 확인한 뒤 병합합니다.
- 충돌이 발생하면 PR 작성자가 먼저 해결합니다.
- 병합 전 Vercel Preview Deployment 실패 여부를 확인합니다.
- 병합 후 사용하지 않는 작업 브랜치는 정리합니다.
- 병합 방식은 기본적으로 `Squash and merge`를 권장합니다.

## 11. 예시 흐름

```txt
1. Issue 생성
2. Issue Type, Label, Priority 설정
3. Branch 생성: feature/1-login-page
4. Commit 작성: feat: 로그인 페이지 UI 구현 (#1)
5. PR 생성: [feature] 로그인 페이지 구현
6. PR 본문에 이슈 연결: Closes #1
7. Vercel Preview 확인
8. 리뷰 후 main에 병합
9. Production 배포 상태 확인
```

## 12. 주의사항

- 작업 전에 항상 최신 `main` 브랜치를 pull 받습니다.
- 여러 명이 같은 파일을 동시에 수정해야 한다면 먼저 팀에 공유합니다.
- 공통 컴포넌트, 공통 타입, 설정 파일은 충돌 가능성이 높으므로 수정 전에 공유합니다.
- 환경변수는 코드에 직접 작성하지 않고 Vercel Project Settings 또는 `.env.local`에서 관리합니다.
- 큰 작업은 작은 Issue로 나눕니다.
- 이해하지 못한 코드는 그대로 병합하지 않습니다.
