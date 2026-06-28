# GitHub Actions + Notion API 동기화 가이드 v3

## Notion 필드 기준

### Type

GitHub Issue Types와 1:1로 맞춥니다.

- Task
- Bug
- Feature

### GitHub Labels

GitHub Labels는 별도 Multi-select 필드에 저장합니다.

- blocked
- chore
- docs
- feature
- fix
- question
- refactor
- style

## 자동 매핑 기준

| GitHub | Notion |
|---|---|
| Issue type Task | Type = Task |
| Issue type Bug | Type = Bug |
| Issue type Feature | Type = Feature |
| label blocked | GitHub Labels = blocked, Kanban Status = Blocked |
| label fix | GitHub Labels = fix, Type fallback = Bug |
| label feature | GitHub Labels = feature, Type fallback = Feature |
| label docs/refactor/style/chore/question | GitHub Labels에만 반영 |

## 주의

`docs`, `refactor`, `style`, `chore`, `question`은 GitHub label이지 Notion Type이 아닙니다.
따라서 Type에는 넣지 않습니다.

`fix` 라벨은 Bug Issue Type과 의미가 겹치므로 기본 분류는 Bug Type으로 합니다.
다만 GitHub-Notion 자동 동기화 또는 빠른 필터링이 필요한 경우 `fix` 라벨을 보조 라벨로 사용할 수 있습니다.