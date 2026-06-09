# API 협업 규칙

이 문서는 Next.js App Router 기반 프로젝트에서 API, Server Action, DB, 에러 처리, 인증/인가, 환경변수 사용 방식을 일관되게 유지하기 위한 협업 규칙입니다.

GitHub Issue, Branch, Commit, Pull Request, Merge 규칙은 `docs/git-strategy.md`를 따릅니다.

이 문서의 규칙은 프로젝트 초기 기준입니다. 개발 과정에서 실제 요구사항, 화면 구성, API 연동 방식에 따라 변경될 수 있습니다.  
다만 공통 규칙이 변경되는 경우에는 개인 판단으로 임의 수정하지 않고, 변경 이유와 영향 범위를 팀에 공유한 뒤 반영합니다.

## 1. 기본 원칙

- API, DB, 인증/인가, 환경변수 변경은 프로젝트 전체에 영향을 줄 수 있으므로 신중하게 진행합니다.
- 기능 담당자는 자신이 맡은 기능의 화면, API, 서버 로직, 로컬 확인까지 책임집니다.
- 공통 응답 형식, DB 구조, 인증 방식처럼 전체에 영향을 주는 변경은 팀에 먼저 공유합니다.
- 프론트엔드 화면과 서버 로직이 같은 repo에 있더라도, 책임 범위와 변경 사항은 명확히 기록합니다.
- 이해하지 못한 코드는 그대로 병합하지 않습니다.

## 2. 작업 범위

이 문서는 다음 작업에 적용합니다.

- Route Handler 구현
- Server Action 구현
- DB 테이블 또는 컬럼 설계
- 서버 로직 구현
- 에러 처리
- 인증/인가 처리
- 외부 API 연동
- 환경변수 설정
- API 명세 작성
- 테스트 코드 작성

## 3. Next.js App Router 서버 코드 기준

Next.js App Router에서는 서버 관련 코드를 아래 기준으로 구분합니다.

| 구분 | 사용 상황 |
| --- | --- |
| Route Handler | 외부 요청을 받는 API 엔드포인트가 필요할 때 |
| Server Action | 폼 제출, 데이터 변경 등 서버에서 직접 처리할 액션이 필요할 때 |
| Server Component | 서버에서 데이터를 조회한 뒤 화면을 렌더링할 때 |
| Client Component | 사용자 입력, 상태 관리, 브라우저 API 사용이 필요할 때 |

기본 원칙:

- 단순 데이터 조회는 가능하면 Server Component에서 처리합니다.
- 외부 클라이언트나 명확한 API 엔드포인트가 필요한 경우 Route Handler를 사용합니다.
- 폼 제출, 생성/수정/삭제처럼 서버에서 처리할 액션은 Server Action 사용을 검토합니다.
- Client Component에서 직접 민감한 서버 로직이나 환경변수에 접근하지 않습니다.

## 4. Route Handler 작성 규칙

Route Handler는 App Router의 `app/api` 아래에 작성합니다.

예시:

```txt
app/api/posts/route.ts
app/api/posts/[postId]/route.ts
app/api/users/me/route.ts
````

API URL은 리소스 중심으로 작성합니다.

좋은 예:

```txt
GET    /api/users/me
PATCH  /api/users/me
GET    /api/posts
GET    /api/posts/:postId
POST   /api/posts
PATCH  /api/posts/:postId
DELETE /api/posts/:postId
```

피해야 할 예:

```txt
GET /api/getPosts
POST /api/createPost
POST /api/deletePost
```

동작은 HTTP Method로 표현하고, URL은 리소스 이름을 사용합니다.

| Method   | 용도    |
| -------- | ----- |
| `GET`    | 조회    |
| `POST`   | 생성    |
| `PATCH`  | 일부 수정 |
| `PUT`    | 전체 수정 |
| `DELETE` | 삭제    |

## 5. Server Action 작성 규칙

Server Action은 서버에서 실행되어야 하는 데이터 변경 작업에 사용합니다.

사용 예시:

* 로그인 요청
* 게시글 생성
* 댓글 작성
* 프로필 수정
* 폼 제출 처리

기본 원칙:

* Server Action 파일에는 서버에서만 실행되어야 하는 로직을 작성합니다.
* DB 접근, 인증 확인, 권한 확인은 Server Action 또는 서버 전용 함수에서 처리합니다.
* Client Component에서는 Server Action을 호출하되, DB 로직을 직접 포함하지 않습니다.
* Server Action 결과 형식은 팀 내에서 정한 응답 구조를 따릅니다.

예시:

```ts
'use server';

export async function createPostAction(formData: FormData) {
  // 인증 확인
  // 입력값 검증
  // DB 저장
  // 결과 반환
}
```

## 6. 서버 로직 분리 기준

서버 로직은 가능하면 화면 코드와 분리합니다.

추천 구조 예시:

```txt
src/
├─ app/
│  ├─ api/
│  │  └─ posts/
│  │     └─ route.ts
│  └─ posts/
│     └─ page.tsx
├─ features/
│  └─ posts/
│     ├─ actions/
│     ├─ services/
│     ├─ schemas/
│     └─ types/
└─ shared/
   ├─ lib/
   ├─ api/
   └─ types/
```

역할 기준:

| 위치           | 역할             |
| ------------ | -------------- |
| `app/api`    | HTTP API 엔드포인트 |
| `actions`    | Server Action  |
| `services`   | DB 접근, 비즈니스 로직 |
| `schemas`    | 입력값 검증 스키마     |
| `types`      | 타입 정의          |
| `shared/lib` | 공통 유틸리티        |

프로젝트 구조는 실제 팀 합의에 따라 변경할 수 있습니다.
다만 서버 로직, 화면 코드, 타입, 검증 로직이 한 파일에 과하게 섞이지 않도록 합니다.

## 7. API 응답 형식

성공 응답은 아래 형식을 초기 기준으로 합니다.

```json
{
  "success": true,
  "data": {}
}
```

목록 조회 예시:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "게시글 제목",
      "createdAt": "2026-06-01T10:00:00"
    }
  ]
}
```

생성, 수정, 삭제 후 반환할 데이터가 없는 경우:

```json
{
  "success": true,
  "data": null
}
```

응답 구조는 기능마다 임의로 다르게 만들지 않습니다.
프론트엔드가 항상 같은 방식으로 응답을 처리할 수 있도록 기본 구조를 통일합니다.

다만 이 응답 형식은 초기 기준이며, 개발 과정에서 실제 화면 요구사항, 페이지네이션, 인증 처리, 에러 처리 방식에 따라 변경될 수 있습니다.

### 7.1 API 응답 형식 변경 기준

API 응답 형식은 화면 구현과 데이터 처리 방식에 직접 영향을 주므로, 기능 담당자가 임의로 변경하지 않습니다.

응답 형식 변경이 필요한 경우 아래 절차를 따릅니다.

1. 변경이 필요한 이유를 Issue 또는 PR에 작성합니다.
2. 변경 전/후 응답 예시를 함께 작성합니다.
3. 관련 화면 담당자에게 공유합니다.
4. 팀장 또는 담당자가 확인한 뒤 반영합니다.
5. 변경된 형식은 API 명세 또는 관련 문서에 업데이트합니다.

변경 예시:

```json
// 변경 전
{
  "success": true,
  "data": []
}
```

```json
// 변경 후
{
  "success": true,
  "data": {
    "items": [],
    "pageInfo": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

API 응답 형식은 처음부터 완벽하게 확정하기보다, 기본 구조를 유지하면서 필요한 경우 팀 합의 후 변경합니다.

## 8. 에러 응답 형식

에러 응답은 아래 형식을 초기 기준으로 합니다.

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "에러 메시지"
}
```

예시:

```json
{
  "success": false,
  "code": "USER_NOT_FOUND",
  "message": "사용자를 찾을 수 없습니다."
}
```

```json
{
  "success": false,
  "code": "INVALID_PASSWORD",
  "message": "비밀번호가 올바르지 않습니다."
}
```

에러 메시지는 화면에서 사용자에게 보여줄 수 있는 수준으로 작성합니다.
다만 내부 구현 정보, SQL 오류, 서버 경로 등은 응답에 포함하지 않습니다.

### 8.1 에러 코드 추가 기준

에러 코드는 기능 담당자가 임의로 중복 생성하지 않습니다.

새로운 에러 코드가 필요한 경우, 기존 에러 코드와 의미가 겹치지 않는지 확인한 뒤 추가합니다.

에러 코드 추가 시 PR에 아래 내용을 작성합니다.

* 추가한 에러 코드
* 발생 조건
* 화면에서 표시할 메시지

예시:

```txt
Error Code: POST_NOT_FOUND
발생 조건: 존재하지 않는 게시글 ID로 상세 조회 요청
표시 메시지: 게시글을 찾을 수 없습니다.
```

## 9. 상태 코드 규칙

Route Handler에서 HTTP 응답을 반환할 경우 상태 코드는 아래 기준을 따릅니다.

| Status Code                 | 사용 상황              |
| --------------------------- | ------------------ |
| `200 OK`                    | 조회, 수정 성공          |
| `201 Created`               | 생성 성공              |
| `204 No Content`            | 삭제 성공 또는 반환 데이터 없음 |
| `400 Bad Request`           | 잘못된 요청             |
| `401 Unauthorized`          | 인증 필요              |
| `403 Forbidden`             | 권한 없음              |
| `404 Not Found`             | 리소스 없음             |
| `409 Conflict`              | 중복 또는 충돌           |
| `500 Internal Server Error` | 서버 내부 오류           |

상태 코드와 응답 메시지는 의미가 일치해야 합니다.

## 10. Request / Response 작성 규칙

화면과 연동되는 API 또는 Server Action은 Issue 또는 PR에 request/response 예시를 작성합니다.

Route Handler 예시:

```txt
POST /api/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "사용자"
    }
  }
}
```

Server Action 예시:

```txt
createPostAction(formData)
```

Result:

```json
{
  "success": true,
  "data": {
    "postId": 1
  }
}
```

형식이 바뀌면 반드시 관련 화면 담당자에게 공유합니다.

## 11. DB 변경 규칙

DB 구조 변경은 프로젝트 전체에 영향을 줄 수 있으므로 신중하게 진행합니다.

초기 설계 이후에도 기능 구현 중 DB 변경이 필요할 수 있습니다.
다만 DB 변경은 API와 화면에 영향을 줄 수 있으므로, 변경 이유와 영향 범위를 먼저 공유한 뒤 반영합니다.

* 테이블 추가, 컬럼 추가/수정/삭제 전 팀에 공유합니다.
* DB 변경이 있는 PR에는 변경 내용을 반드시 작성합니다.
* 이미 다른 기능에서 사용하는 컬럼은 임의로 삭제하거나 이름을 바꾸지 않습니다.
* 마이그레이션 파일이 있다면 PR에 포함합니다.
* DB 변경 후 필요한 초기 데이터나 테스트 데이터가 있다면 함께 공유합니다.

DB 변경 사항 예시:

```md
## DB 변경 사항

- `posts` 테이블 추가
- `posts.title`, `posts.content`, `posts.userId` 컬럼 추가
- `users`와 `posts`는 1:N 관계
```

## 12. 인증 / 인가 규칙

인증이 필요한 서버 로직은 명확히 표시합니다.

Route Handler 예시:

```txt
GET /api/users/me
Authorization: Bearer {accessToken}
```

기본 원칙:

* 로그인하지 않은 사용자는 인증이 필요한 기능에 접근할 수 없습니다.
* 본인 데이터가 아닌 리소스에 접근할 때는 권한을 확인합니다.
* Route Handler, Server Action, Server Component에서 필요한 권한 검사를 누락하지 않습니다.
* 토큰, 비밀번호, API Key 등 민감한 값은 로그에 남기지 않습니다.
* 비밀번호는 평문으로 저장하지 않습니다.

## 13. 환경변수 규칙

환경변수는 `.env.local`에 작성하되, 실제 값은 GitHub에 올리지 않습니다.

레포에는 예시 파일만 올립니다.

```txt
.env.example
```

예시:

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_API_BASE_URL=
```

주의사항:

* `.env.local`은 `.gitignore`에 포함합니다.
* 새 환경변수가 추가되면 `.env.example`도 함께 수정합니다.
* 브라우저에 노출되어도 되는 값만 `NEXT_PUBLIC_` prefix를 사용합니다.
* DB URL, Secret, API Key 등 민감한 값에는 `NEXT_PUBLIC_`을 붙이지 않습니다.
* 배포 환경에 필요한 환경변수는 README 또는 배포 문서에 정리합니다.

## 14. 로그 규칙

개발 중 확인을 위한 로그는 사용할 수 있지만, PR 전에 불필요한 로그는 제거합니다.

금지 예시:

```txt
console.log(password)
console.log(accessToken)
console.log(process.env.AUTH_SECRET)
console.log(process.env.DATABASE_URL)
```

민감 정보는 절대 로그에 남기지 않습니다.

## 15. Pull Request 작성 규칙

Pull Request 작성 방식과 제목 규칙은 `docs/git-strategy.md`를 따릅니다.

다만 API, DB, 인증/인가, 환경변수 변경이 포함된 PR에는 아래 내용을 반드시 작성합니다.

* API 변경 사항
* DB 변경 사항
* 환경변수 변경 사항
* 인증/인가 영향 여부
* 확인 방법

예시:

```md
## API / DB 변경 사항

- `POST /api/posts`
- `GET /api/posts`
- `posts` 테이블 추가

## 환경변수 변경 사항

- `DATABASE_URL` 추가

## 인증 / 인가 영향

- 게시글 생성 API는 로그인한 사용자만 호출할 수 있습니다.

## 확인 방법

- 로컬 서버 실행 후 게시글 생성
- 게시글 생성 후 목록 조회에서 데이터 확인
```

## 16. 코드 리뷰 규칙

GitHub 리뷰 흐름은 `docs/git-strategy.md`를 따릅니다.

API, DB, 서버 로직 변경이 있는 경우 리뷰어는 추가로 아래 내용을 확인합니다.

* API URL과 HTTP Method가 적절한가
* Route Handler와 Server Action 선택이 적절한가
* 성공/에러 응답 형식이 규칙과 일치하는가
* 상태 코드가 적절한가
* DB 변경이 필요한 경우 충분히 공유되었는가
* 인증/인가가 필요한 기능에 권한 검사가 있는가
* 불필요한 로그나 민감 정보 노출이 없는가
* Client Component에 서버 전용 로직이 섞이지 않았는가

작성자는 리뷰 코멘트를 확인하고 수정한 뒤 다시 리뷰를 요청합니다.

## 17. 기능 담당 방식

이 프로젝트에서는 팀원별로 하나의 기능을 맡아 화면부터 서버 로직까지 담당할 수 있습니다.

예시:

```txt
팀원 A: 게시글 기능
- 화면: 게시글 목록, 상세, 작성 화면 구현
- 서버: 게시글 CRUD Route Handler 또는 Server Action 구현
- DB: 게시글 관련 테이블 또는 쿼리 확인

팀원 B: 댓글 기능
- 화면: 댓글 작성, 삭제 UI 구현
- 서버: 댓글 작성, 삭제 Server Action 구현
- DB: 댓글 관련 테이블 또는 쿼리 확인
```

다만 기능 담당자가 자유롭게 구현하더라도 다음은 반드시 통일합니다.

* API 응답 형식
* 에러 응답 형식
* API URL 규칙
* DB 변경 방식
* 인증/인가 처리 방식
* 환경변수 관리 방식

공통 규칙은 개발 중 변경될 수 있지만, 개인별로 다르게 적용하지 않습니다.
변경이 필요한 경우 팀에 공유하고, 변경 전/후 예시를 남긴 뒤 반영합니다.

## 18. 작업 흐름 요약

```txt
1. Issue 생성
2. Issue Type, Label, Priority 설정
3. Branch 생성
4. 화면 / API / DB 영향 범위 확인
5. 필요한 서버 로직 구현
6. 로컬에서 기능 동작 확인
7. Commit 작성
8. PR 생성
9. API / DB / 환경변수 변경 사항 작성
10. 리뷰 및 수정
11. main 브랜치에 병합
12. 관련 문서 또는 API 명세 업데이트
```

## 19. 예시 흐름

게시글 작성 기능을 구현하는 경우:

```txt
1. Issue 생성
   [feature] 게시글 작성 기능 구현

2. Issue 설정
   Issue Type: Feature
   Label: feature
   Priority: High

3. Branch 생성
   feature/#1-create-post

4. 구현
   - 게시글 작성 화면 구현
   - 게시글 생성 Server Action 구현
   - posts 테이블 또는 쿼리 확인

5. Commit 작성
   feat: 게시글 작성 기능 구현 (#1)

6. PR 생성
   [feature] 게시글 작성 기능 구현

7. PR 본문에 이슈 연결
   Closes #1

8. PR에 API / DB 변경 사항 작성

9. 리뷰 후 main에 병합
```

문서 작업을 진행하는 경우:

```txt
1. Issue 생성
   [docs] API 협업 규칙 문서 추가

2. Issue 설정
   Issue Type: Task
   Label: docs
   Priority: Low

3. Branch 생성
   docs/#5-api-convention

4. Commit 작성
   docs: API 협업 규칙 문서 추가 (#5)

5. PR 생성
   [docs] API 협업 규칙 문서 추가

6. PR 본문에 이슈 연결
   Closes #5

7. 리뷰 후 main에 병합
```

## 20. 주의사항

* API 또는 Server Action 결과 형식이 바뀌면 반드시 관련 화면 담당자에게 공유합니다.
* DB 구조를 바꿀 때는 팀에 먼저 공유합니다.
* 공통 응답 형식은 기능마다 다르게 만들지 않습니다.
* 인증/인가가 필요한 서버 로직은 누락하지 않습니다.
* Client Component에 서버 전용 로직이나 민감 정보를 포함하지 않습니다.
* 작업 완료 후 불필요한 로그와 테스트 코드는 제거합니다.
* 민감 정보는 코드, 로그, PR 본문에 남기지 않습니다.
* 이해하지 못한 코드는 그대로 병합하지 않습니다.
* GitHub에 남기는 기록은 포트폴리오와 협업 과정의 근거가 되므로, 제목과 설명을 최소한의 수준으로라도 명확하게 작성합니다.

