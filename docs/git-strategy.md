````md
# Git 협업 전략

이 문서는 프로젝트를 진행하면서 GitHub Issue, Branch, Commit, Pull Request를 일관되게 사용하기 위한 협업 규칙입니다.

## 1. 기본 원칙

- `main` 브랜치는 항상 실행 가능한 상태로 유지합니다.
- 모든 작업은 Issue를 먼저 생성한 뒤 진행합니다.
- 작업 브랜치는 Issue 번호를 포함해 생성합니다.
- 작업이 끝나면 Pull Request를 생성하고, 리뷰 후 `main`에 병합합니다.
- `main` 브랜치에 직접 push하지 않습니다.
- 하나의 Issue는 가능한 하나의 명확한 작업 단위를 다룹니다.

## 2. 브랜치 전략

이 프로젝트는 GitHub Flow를 사용합니다.

```txt
main
└─ feature/#이슈번호-작업명
└─ fix/#이슈번호-작업명
└─ refactor/#이슈번호-작업명
````

`develop`, `release`, `hotfix` 브랜치를 별도로 운영하는 Git Flow는 사용하지 않습니다.
교육과정 프로젝트에서는 브랜치 구조를 단순하게 유지하는 것이 더 중요합니다.

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

## 7. Pull Request 규칙

작업이 끝나면 Pull Request를 생성합니다.

PR 제목은 작업 내용을 간단히 드러내도록 작성합니다.

예시:

```txt
[feature] 로그인 페이지 구현
[fix] 모바일 헤더 레이아웃 수정
[docs] README 실행 방법 추가
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

## 8. 코드 리뷰 규칙

* PR 작성자는 리뷰어가 이해할 수 있도록 변경 내용을 간단히 설명합니다.
* 리뷰어는 동작 여부, 코드 구조, 불필요한 코드 여부를 확인합니다.
* 리뷰 중 수정이 필요한 부분은 코멘트로 남깁니다.
* 작성자는 리뷰 내용을 반영한 뒤 다시 확인을 요청합니다.
* 승인 없이 본인이 임의로 `main`에 병합하지 않습니다.

## 9. Merge 규칙

* PR은 최소 1명 이상 확인한 뒤 병합합니다.
* 충돌이 발생하면 PR 작성자가 먼저 해결합니다.
* 병합 후 사용하지 않는 작업 브랜치는 삭제합니다.
* 병합 방식은 기본적으로 `Squash and merge`를 권장합니다.

## 10. Label 사용 규칙

Issue와 PR에는 상황에 맞는 Label을 붙입니다.

| Label            | 의미         |
| ---------------- | ---------- |
| `feature`        | 기능 추가      |
| `fix`            | 버그 수정      |
| `refactor`       | 리팩토링       |
| `style`          | UI/CSS 수정  |
| `docs`           | 문서 작업      |
| `chore`          | 설정 및 기타 작업 |
| `question`       | 논의가 필요한 작업 |
| `blocked`        | 진행이 막힌 작업  |
| `priority: high` | 우선순위 높음    |
| `priority: low`  | 우선순위 낮음    |

Label은 작업을 분류하기 위한 용도입니다.
처음부터 너무 많은 Label을 만들지 않고, 필요한 경우에만 추가합니다.

## 11. 작업 흐름 요약

```txt
1. Issue 생성
2. Issue 번호를 포함한 Branch 생성
3. 작업 진행
4. Commit 작성
5. 원격 Branch에 Push
6. Pull Request 생성
7. 코드 리뷰 및 수정
8. main 브랜치에 Merge
9. 작업 Branch 삭제
```

## 12. 예시 흐름

로그인 페이지를 구현하는 경우:

```txt
1. Issue 생성
   [feature] 로그인 페이지 구현

2. Branch 생성
   feature/#1-login-page

3. Commit 작성
   feat: 로그인 페이지 UI 구현 (#1)

4. PR 생성
   [feature] 로그인 페이지 구현

5. PR 본문에 이슈 연결
   Closes #1

6. 리뷰 후 main에 병합
```

## 13. 주의사항

* 작업 전에 항상 최신 `main` 브랜치를 pull 받습니다.
* 여러 명이 같은 파일을 동시에 수정해야 한다면 먼저 팀에 공유합니다.
* 공통 컴포넌트, 공통 타입, 설정 파일은 충돌 가능성이 높으므로 수정 전에 공유합니다.
* 큰 작업은 작은 Issue로 나눕니다.
* 단순 수정이라도 가능하면 Issue와 PR 기록을 남깁니다.

```
```
