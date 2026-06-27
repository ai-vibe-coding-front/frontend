# API 협업 규칙

이 문서는 Next.js App Router 기반 프로젝트에서 API, Server Action, DB, 에러 처리, 인증/인가, 환경변수 사용 방식을 일관되게 유지하기 위한 협업 규칙입니다.

GitHub Issue, Branch, Commit, Pull Request, Merge 규칙은 `docs/git-strategy.md`를 따릅니다.

공통 규칙이 변경되는 경우에는 개인 판단으로 임의 수정하지 않고, 변경 이유와 영향 범위를 팀에 공유한 뒤 반영합니다.

## 1. 기본 원칙

- API, DB, 인증/인가, 환경변수 변경은 프로젝트 전체에 영향을 줄 수 있으므로 신중하게 진행합니다.
- 기능 담당자는 자신이 맡은 기능의 화면, API, 서버 로직, 로컬 확인까지 책임집니다.
- 공통 응답 형식, DB 구조, 인증 방식처럼 전체에 영향을 주는 변경은 팀에 먼저 공유합니다.
- 프론트엔드 화면과 서버 로직이 같은 repo에 있더라도, 책임 범위와 변경 사항은 명확히 기록합니다.
- 이해하지 못한 코드는 그대로 병합하지 않습니다.

## 2. Next.js App Router 서버 코드 기준

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

## 3. Route Handler 작성 규칙

Route Handler는 App Router의 `app/api` 아래에 작성합니다.

```txt
app/api/posts/route.ts
app/api/posts/[postId]/route.ts
app/api/users/me/route.ts
```

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

| Method | 용도 |
| --- | --- |
| `GET` | 조회 |
| `POST` | 생성 |
| `PATCH` | 일부 수정 |
| `PUT` | 전체 수정 |
| `DELETE` | 삭제 |

## 4. 서버 로직 분리 기준

서버 로직은 가능하면 화면 코드와 분리합니다.

권장 구조:

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

프로젝트 구조는 실제 팀 합의에 따라 변경할 수 있습니다. 다만 서버 로직, 화면 코드, 타입, 검증 로직이 한 파일에 과하게 섞이지 않도록 합니다.

## 5. API 응답 형식

성공 응답은 아래 형식을 기본으로 합니다.

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

페이지네이션 또는 부가 정보가 필요한 목록 조회는 `items`와 메타 정보를 함께 반환할 수 있습니다.

```json
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

생성, 수정, 삭제 후 반환할 데이터가 없는 경우:

```json
{
  "success": true,
  "data": null
}
```

응답 구조는 기능마다 임의로 다르게 만들지 않습니다.

### 5.1 목록 조회 0건 기준

목록 조회 API는 결과가 0건이어도 기본적으로 `200 OK`와 빈 배열을 반환합니다.

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0
  }
}
```

단건 조회 API에서 대상 리소스가 없을 때만 `404 Not Found`를 반환합니다.

예외적으로 빈 결과를 에러로 처리해야 하는 경우에는 API 명세와 관련 화면 요구사항에 이유를 남깁니다.

## 6. 에러 응답 형식

에러 응답은 아래 형식을 기본으로 합니다.

```json
{
  "success": false,
  "errorCode": "ERROR_CODE",
  "message": "에러 메시지"
}
```

예시:

```json
{
  "success": false,
  "errorCode": "USER_NOT_FOUND",
  "message": "사용자를 찾을 수 없습니다."
}
```

```json
{
  "success": false,
  "errorCode": "INVALID_PASSWORD",
  "message": "비밀번호가 올바르지 않습니다."
}
```

현재 공통 응답 유틸과 타입은 `errorCode` 필드를 사용합니다. 문서와 API 명세도 `code`가 아니라 `errorCode`로 통일합니다.

에러 메시지는 화면에서 사용자에게 보여줄 수 있는 수준으로 작성합니다. 다만 내부 구현 정보, SQL 오류, 서버 경로 등은 응답에 포함하지 않습니다.

새로운 에러 코드가 필요한 경우 PR에 아래 내용을 작성합니다.

- 추가한 에러 코드
- 발생 조건
- 화면에서 표시할 메시지

## 7. 상태 코드 규칙

| Status Code | 사용 상황 |
| --- | --- |
| `200 OK` | 조회, 수정 성공 |
| `201 Created` | 생성 성공 |
| `204 No Content` | 삭제 성공 또는 반환 데이터 없음 |
| `400 Bad Request` | 잘못된 요청 |
| `401 Unauthorized` | 인증 필요 |
| `403 Forbidden` | 권한 없음 |
| `404 Not Found` | 단건 리소스 없음 |
| `409 Conflict` | 중복 또는 충돌 |
| `500 Internal Server Error` | 서버 내부 오류 |

상태 코드와 응답 메시지는 의미가 일치해야 합니다.

## 8. Request / Response 작성 규칙

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
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "사용자"
    }
  }
}
```

형식이 바뀌면 반드시 관련 화면 담당자에게 공유합니다.

## 9. DB 변경 규칙

- 테이블 추가, 컬럼 추가/수정 전 팀에 공유합니다.
- DB 변경이 있는 PR에는 변경 내용을 반드시 작성합니다.
- 이미 다른 기능에서 사용하는 컬럼은 임의로 삭제하거나 이름을 바꾸지 않습니다.
- 마이그레이션 파일이 있다면 PR에 포함합니다.
- DB 변경 후 필요한 초기 데이터나 테스트 데이터가 있다면 함께 공유합니다.

DB 변경 사항 예시:

```md
## DB 변경 사항

- `posts` 테이블 추가
- `posts.title`, `posts.content`, `posts.userId` 컬럼 추가
- `users`와 `posts`는 1:N 관계
```

## 10. 인증 / 인가 규칙

- 로그인하지 않은 사용자는 인증이 필요한 기능에 접근할 수 없습니다.
- 본인 데이터가 아닌 리소스에 접근할 때는 권한을 확인합니다.
- Route Handler, Server Action, Server Component에서 필요한 권한 검사를 누락하지 않습니다.
- 토큰, 비밀번호, API Key 등 민감한 값은 로그에 남기지 않습니다.
- 비밀번호는 평문으로 저장하지 않습니다.

## 11. 환경변수 규칙

환경변수는 `.env.local`에 작성하되, 실제 값은 GitHub에 올리지 않습니다.

- `.env.local`은 `.gitignore`에 포함합니다.
- 새 환경변수가 추가되면 `.env.example`도 함께 수정합니다.
- 브라우저에 노출되어도 되는 값만 `NEXT_PUBLIC_` prefix를 사용합니다.
- DB URL, Secret, API Key 등 민감한 값에는 `NEXT_PUBLIC_`을 붙이지 않습니다.
- 배포 환경에 필요한 환경변수는 README 또는 배포 문서에 정리합니다.

## 12. 로그 규칙

개발 중 확인을 위한 로그는 사용할 수 있지만, PR 전에 불필요한 로그는 제거합니다.

금지 예시:

```txt
console.log(password)
console.log(accessToken)
console.log(process.env.AUTH_SECRET)
console.log(process.env.DATABASE_URL)
```

민감 정보는 절대 로그에 남기지 않습니다.

## 13. Pull Request 작성 규칙

Pull Request 작성 방식과 제목 규칙은 `docs/git-strategy.md`를 따릅니다.

API, DB, 인증/인가, 환경변수 변경이 포함된 PR에는 아래 내용을 반드시 작성합니다.

- API 변경 사항
- DB 변경 사항
- 환경변수 변경 사항
- 인증/인가 영향 여부
- 확인 방법

## 14. Query Key Factory와 API Hook 작성 규칙

이 절은 GitHub Issue #61과 TDD v1.5, API 명세서 v1.0, 요구사항 정의서 v1.0, ERD v1.0을 기준으로 합니다.

대상 도메인은 다음과 같습니다.

- auth / users
- exploration sessions
- recommendations
- events (행사 상세 / 주변 행사)
- favorites
- event logs

Query key는 `apps/web/src/lib/query-keys.ts`의 `queryKeys`에서만 생성합니다.

```ts
import { queryKeys } from '@/lib/query-keys';

queryKeys.users.me();
queryKeys.recommendations.detail(runId);
queryKeys.recommendations.recent();
queryKeys.events.detail(eventItemId);
queryKeys.events.nearby.list({ lat, lng, radiusKm, limit, category });
queryKeys.favorites.list();
queryKeys.favorites.count();
```

작성 기준:

- 화면이나 hook에서 `['users', 'me']` 같은 배열을 직접 만들지 않습니다.
- query string에 영향을 주는 값은 모두 key에 포함합니다.
- key에 함수, 클래스 인스턴스, `undefined`가 섞인 임시 객체를 넣지 않습니다.
- API 연동 UI는 loading, empty, error 상태를 구분합니다.
- 서버 컴포넌트와 서버 서비스에서는 내부 API를 다시 호출하기보다 service 함수를 직접 호출하는 기준을 따릅니다.

## 15. API 명세와 Query Key 대응

| API | Query key 또는 처리 |
| --- | --- |
| `POST /api/auth/signup` | mutation, 성공 후 인증 관련 캐시 갱신 |
| `POST /api/auth/login` | mutation, 성공 후 인증 관련 캐시 갱신 |
| `POST /api/auth/logout` | mutation, 성공 후 사용자별 캐시 제거 |
| `POST /api/auth/refresh` | mutation, 자동 retry는 별도 이슈 |
| `GET /api/users/me` | `queryKeys.users.me()` |
| `POST /api/exploration-sessions` | mutation |
| `PATCH /api/exploration-sessions/:explorationSessionId/status` | mutation |
| `POST /api/recommendations` | mutation |
| `GET /api/recommendations/:runId` | `queryKeys.recommendations.detail(runId)` |
| `GET /api/recommendations/recent` | `queryKeys.recommendations.recent()` |
| `GET /api/events/:eventItemId` | `queryKeys.events.detail(eventItemId)` |
| `GET /api/events/nearby` | `queryKeys.events.nearby.list(query)` |
| `POST /api/favorites` | mutation |
| `DELETE /api/favorites/:eventItemId` | mutation |
| `GET /api/favorites` | `queryKeys.favorites.list()` |
| `GET /api/favorites/count` | `queryKeys.favorites.count()` |
| `POST /api/event-logs` | mutation, 화면 데이터 무효화 없음 |

질문 Q1~Q4 답변은 질문마다 mutation hook으로 저장하지 않습니다. 요구사항 정의서 v1.0과 ERD v1.0 기준대로 프론트 상태에 임시 보관하고 `POST /api/recommendations` 요청에서 한 번에 전달합니다.
