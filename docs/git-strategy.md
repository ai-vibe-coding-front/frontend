# Git 협업 전략

이 문서는 프로젝트를 진행하면서 GitHub Issue, Branch, Commit, Pull Request를 일관되게 사용하기 위한 협업 규칙입니다.

## 1. 기본 원칙

- `main` 브랜치는 항상 실행 가능한 상태로 유지합니다.
- 모든 작업은 Issue를 먼저 생성한 뒤 진행합니다.
- 작업 브랜치는 Issue 번호를 포함해 생성합니다.
- 작업이 끝나면 Pull Request를 생성하고, 리뷰 후 `main`에 병합합니다.
- `main` 브랜치에 직접 push하지 않습니다.
- 하나의 Issue는 가능한 하나의 명확한 작업 단위를 다룹니다.
- 단순 수정이라도 가능하면 Issue와 PR 기록을 남깁니다.

## 2. 브랜치 전략

이 프로젝트는 GitHub Flow를 사용합니다.

```txt
main
└─ feature/#이슈번호-작업명
└─ fix/#이슈번호-작업명
└─ refactor/#이슈번호-작업명
└─ docs/#이슈번호-작업명
└─ chore/#이슈번호-작업명
````

`develop`, `release`, `hotfix` 브랜치를 별도로 운영하는 Git Flow는 사용하지 않습니다.

교육과정 프로젝트에서는 브랜치 구조를 복잡하게 만드는 것보다, `main`과 작업 브랜치 중심으로 단순하게 유지하는 것이 더 중요합니다.

## 3. 브랜치 네이밍 규칙

브랜치명은 아래 형식을 따릅니다.

```txt
type/#issue-number-short-description
```

예시:

```txt
feature/#1-login-page
feature/#2-signup-api
fix/#3-header-layout
refactor/#4-button-component
docs/#5-readme-update
chore/#6-project-setting
```

## 4. 작업 타입

| Type       | 사용 상황                  |
| ---------- | ---------------------- |
| `feature`  | 새로운 기능 추가              |
| `fix`      | 버그 수정                  |
| `refactor` | 기능 변화 없는 코드 구조 개선      |
| `style`    | UI, CSS, 레이아웃 수정       |
| `docs`     | 문서 추가 또는 수정            |
| `chore`    | 설정, 패키지, 빌드 환경 등 기타 작업 |

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

커밋 타입은 다음 기준을 사용합니다.

| Commit Type | 의미         |
| ----------- | ---------- |
| `feat`      | 기능 추가      |
| `fix`       | 버그 수정      |
| `refactor`  | 리팩토링       |
| `style`     | UI/CSS 수정  |
| `docs`      | 문서 수정      |
| `chore`     | 설정 및 기타 작업 |

초기 문서 세팅처럼 Issue가 아직 없는 경우에는 이슈 번호를 생략할 수 있습니다.

예시:

```txt
docs: Git 협업 전략 문서 추가
docs: 이슈 및 PR 템플릿 추가
```

## 6. Issue 작성 규칙

모든 작업은 Issue에서 시작합니다.

Issue는 기능 추가, 버그 수정, 리팩토링, 문서 작업 등에 모두 사용할 수 있습니다.
별도의 템플릿을 여러 개로 나누지 않고, 하나의 기본 작업 이슈 템플릿을 사용합니다.

Issue 제목은 아래 형식을 권장합니다.

```txt
[type] 작업 제목
```

예시:

```txt
[feature] 로그인 페이지 구현
[fix] 로그인 실패 시 에러 메시지 미노출 수정
[refactor] Button 컴포넌트 props 구조 정리
[docs] README 실행 방법 추가
[chore] 프로젝트 초기 설정
```

Issue에는 최소한 아래 내용을 작성합니다.

* 작업 내용
* 완료 조건
* 참고 자료
* 작업 메모

`작업 메모`는 선택 작성 항목입니다.
AI가 작성한 내용만 남기기보다, 작업자가 직접 이해한 내용, 구현 의도, 고민한 점, 느낀 점을 기록하기 위한 공간입니다.

## 7. Issue Type / Label / Priority 사용 규칙

Issue와 PR은 Issue Type, Label, Priority를 함께 사용해 분류합니다.

### 7.1 Issue Type

Issue Type은 이슈의 큰 분류를 나타냅니다.

| Issue Type | 의미                               |
| ---------- | -------------------------------- |
| `Feature`  | 새로운 기능 추가 또는 기능 개선               |
| `Bug`      | 예상과 다르게 동작하는 문제 또는 오류 수정         |
| `Task`     | 문서, 설정, 리팩토링, 스타일 수정 등 명확한 작업 단위 |

예시:

```txt
Feature: 로그인 페이지 구현
Bug: 로그인 실패 시 에러 메시지 미노출 수정
Task: README 실행 방법 추가
Task: Button 컴포넌트 구조 정리
```

### 7.2 Label

Label은 Issue Type만으로 구분하기 어려운 세부 성격이나 상태를 표시하기 위해 사용합니다.

| Label      | 의미                           |
| ---------- | ---------------------------- |
| `feature`  | 기능 추가 작업을 빠르게 확인하기 위한 보조 태그  |
| `refactor` | 기능 변화 없는 코드 구조 개선            |
| `style`    | UI, CSS, 레이아웃, 디자인 관련 수정     |
| `docs`     | 문서 추가, 수정, 정리                |
| `chore`    | 설정, 패키지, 빌드, 환경 구성 등 기타 작업   |
| `question` | 논의나 확인이 필요한 작업               |
| `blocked`  | 외부 요인이나 의존 작업으로 인해 진행이 막힌 작업 |

`fix` 라벨은 `Bug` Issue Type과 의미가 겹치므로 기본 사용하지 않습니다.
다만 팀에서 필요하다고 판단하면 `Bug` 타입 이슈에 보조 라벨로 사용할 수 있습니다.

### 7.3 Priority

우선순위는 Label이 아니라 GitHub Projects의 Priority 필드에서 관리합니다.

| Priority | 의미                      |
| -------- | ----------------------- |
| `High`   | 핵심 기능, 마감에 직접 영향이 있는 작업 |
| `Medium` | 일반적인 우선순위의 작업           |
| `Low`    | 여유가 있을 때 처리해도 되는 작업     |

`priority: high`, `priority: low` 같은 라벨은 Priority 필드와 중복되므로 사용하지 않습니다.

## 8. Pull Request 규칙

작업이 끝나면 Pull Request를 생성합니다.

PR 제목은 자동 생성된 커밋 메시지를 그대로 사용하지 않고, 가능하면 연결된 Issue 제목과 동일한 형식으로 작성합니다.

예시:

```txt
Issue: [feature] 로그인 페이지 구현
PR: [feature] 로그인 페이지 구현
```

PR 제목 예시:

```txt
[feature] 로그인 페이지 구현
[fix] 모바일 헤더 레이아웃 수정
[refactor] Button 컴포넌트 구조 정리
[docs] README 실행 방법 추가
[chore] 프로젝트 초기 설정
```

PR 본문에는 아래 내용을 작성합니다.

* 관련 이슈
* 작업 내용
* 확인 방법
* 스크린샷 또는 참고 자료
* 리뷰 요청 사항

관련 이슈는 아래 형식으로 연결합니다.

```txt
Closes #이슈번호
```

예시:

```txt
Closes #3
```

PR이 병합되면 연결된 Issue는 자동으로 닫힙니다.

## 9. 코드 리뷰 규칙

* PR 작성자는 리뷰어가 이해할 수 있도록 변경 내용을 간단히 설명합니다.
* 리뷰어는 동작 여부, 코드 구조, 불필요한 코드 여부를 확인합니다.
* 리뷰 중 수정이 필요한 부분은 코멘트로 남깁니다.
* 작성자는 리뷰 내용을 반영한 뒤 다시 확인을 요청합니다.
* 승인 없이 본인이 임의로 `main`에 병합하지 않습니다.

리뷰어는 특히 아래 내용을 확인합니다.

* 작업 내용이 Issue의 완료 조건을 만족하는가
* 불필요한 코드나 로그가 남아 있지 않은가
* 공통 컴포넌트나 공통 타입에 영향이 없는가
* UI 변경이 있다면 화면이 깨지지 않는가
* API 연동이 있다면 실패 상황도 고려했는가

## 10. Merge 규칙

* PR은 최소 1명 이상 확인한 뒤 병합합니다.
* 충돌이 발생하면 PR 작성자가 먼저 해결합니다.
* 병합 후 사용하지 않는 작업 브랜치는 삭제합니다.
* 병합 방식은 기본적으로 `Squash and merge`를 권장합니다.

`Squash and merge`를 사용하면 여러 개의 작업 커밋을 하나의 커밋으로 정리해 `main` 브랜치의 히스토리를 깔끔하게 유지할 수 있습니다.

## 11. 작업 흐름 요약

```txt
1. Issue 생성
2. Issue Type, Label, Priority 설정
3. Issue 번호를 포함한 Branch 생성
4. 작업 진행
5. Commit 작성
6. 원격 Branch에 Push
7. Pull Request 생성
8. 코드 리뷰 및 수정
9. main 브랜치에 Merge
10. 작업 Branch 삭제
```

## 12. 예시 흐름

로그인 페이지를 구현하는 경우:

```txt
1. Issue 생성
   [feature] 로그인 페이지 구현

2. Issue 설정
   Issue Type: Feature
   Label: feature
   Priority: High

3. Branch 생성
   feature/#1-login-page

4. Commit 작성
   feat: 로그인 페이지 UI 구현 (#1)

5. PR 생성
   [feature] 로그인 페이지 구현

6. PR 본문에 이슈 연결
   Closes #1

7. 리뷰 후 main에 병합
```

문서 작업을 진행하는 경우:

```txt
1. Issue 생성
   [docs] Git 협업 전략 문서 추가

2. Issue 설정
   Issue Type: Task
   Label: docs
   Priority: Low

3. Branch 생성
   docs/#5-git-strategy

4. Commit 작성
   docs: Git 협업 전략 문서 추가 (#5)

5. PR 생성
   [docs] Git 협업 전략 문서 추가

6. PR 본문에 이슈 연결
   Closes #5

7. 리뷰 후 main에 병합
```

## 13. 주의사항

* 작업 전에 항상 최신 `main` 브랜치를 pull 받습니다.
* 여러 명이 같은 파일을 동시에 수정해야 한다면 먼저 팀에 공유합니다.
* 공통 컴포넌트, 공통 타입, 설정 파일은 충돌 가능성이 높으므로 수정 전에 공유합니다.
* 큰 작업은 작은 Issue로 나눕니다.
* 단순 수정이라도 가능하면 Issue와 PR 기록을 남깁니다.
* 이해하지 못한 코드는 그대로 병합하지 않습니다.
* GitHub에 남기는 기록은 포트폴리오와 협업 과정의 근거가 되므로, 제목과 설명을 최소한의 수준으로라도 명확하게 작성합니다.

