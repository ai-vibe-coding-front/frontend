# GitHub Actions + Notion API 동기화 가이드

이 자동화는 GitHub Issue와 Pull Request 이벤트를 Notion `Issues DB`에 동기화합니다.

## 1. 동작 범위

### Issue 이벤트

| GitHub 이벤트 | Notion 동작 |
|---|---|
| issue opened | Notion Issues DB에 새 항목 생성 |
| issue edited | 기존 항목 업데이트 |
| issue closed | `Kanban Status = Done`, `Status = 완료` |
| issue reopened | `Kanban Status = To Do`, `Status = 시작 전` |
| assigned / labeled 등 | GitHub 상태 정보 갱신 |

### PR 이벤트

| GitHub 이벤트 | Notion 동작 |
|---|---|
| PR opened | 연결된 이슈의 `PR Link` 입력, `Kanban Status = In Review` |
| PR ready_for_review | `Kanban Status = In Review` |
| PR synchronize | `GitHub Event = pr_sync` |
| PR merged | `Kanban Status = Done`, `Status = 완료` |
| PR closed without merge | `Kanban Status = To Do` |

## 2. PR과 Issue 연결 규칙

PR 본문에 아래 중 하나가 있어야 안정적으로 연결됩니다.

```md
Closes #1
```

또는

```md
Notion Issue ID: #1
```

연결 이슈 번호를 찾지 못하면 자동화는 `[PR] PR 제목` 형태의 PR 추적용 Notion 항목을 새로 만듭니다.

## 3. GitHub Secrets 설정

Repository Settings → Secrets and variables → Actions → Repository secrets

필수 Secret:

```text
NOTION_TOKEN
NOTION_ISSUES_DATA_SOURCE_ID
```

권장 Variable:

```text
NOTION_VERSION=2025-09-03
```

`NOTION_ISSUES_DATA_SOURCE_ID`에는 Notion Issues DB의 data source ID를 넣습니다.

현재 프로젝트 기준:

```text
ffb41b8a-8d5c-4246-bd40-4debec348485
```

## 4. Notion Integration 설정

1. Notion Developers에서 Internal Integration을 생성합니다.
2. Integration token을 `NOTION_TOKEN`으로 GitHub Secrets에 저장합니다.
3. Notion에서 `Issues DB` 페이지를 열고 Integration에 접근 권한을 부여합니다.
4. `Sprints DB` Relation/Rollup을 쓰는 경우 `Sprints DB`도 같은 Integration에 공유합니다.

## 5. 추가된 Notion 속성

| 속성 | 타입 | 목적 |
|---|---|---|
| GitHub Issue Number | Number | Issue 매칭 |
| GitHub PR Number | Number | PR 매칭 |
| GitHub State | Text | GitHub 원본 상태 |
| GitHub Repo | Text | 저장소 구분 |
| GitHub Synced At | Date | 마지막 동기화 시각 |
| GitHub Event | Select | 마지막 동기화 이벤트 |

## 6. 파일 배치

아래 파일을 GitHub 저장소에 추가합니다.

```text
.github/workflows/notion-sync.yml
scripts/sync-github-notion.mjs
```

## 7. 운영 규칙

- GitHub Issue를 만들면 Notion에도 자동 생성됩니다.
- Notion에서 `Sprint`, `Domain`, `Priority`, `Owner`, `Done Criteria`는 사람이 보완합니다.
- PR에는 반드시 `Closes #이슈번호`를 적습니다.
- PR이 merge되면 Notion 이슈가 자동 완료됩니다.

## 8. 자동화하지 않는 것이 좋은 항목

아래 값은 문맥 판단이 필요하므로 자동화하지 않는 편이 낫습니다.

- Sprint 자동 배정
- Priority 자동 판단
- Domain 자동 판단
- Done Criteria 자동 작성
- Owner 자동 매칭

이 자동화는 반복 입력을 줄이는 용도로 제한하는 것이 안전합니다.
