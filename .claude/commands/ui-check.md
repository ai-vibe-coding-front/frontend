@.claude/commands/design-tokens.md

# UI Check

Figma 디자인과 실제 구현 코드를 스크린샷으로 비교해 차이를 자동으로 찾고 수정한다.

## 점검 대상 매핑

| 화면 | 로컬 URL | Figma Node ID | 코드 경로 |
|------|----------|---------------|-----------|
| onboarding (로그인) | /onboarding | 390:6027 | src/app/onboarding/page.tsx |
| onboarding (비로그인) | /onboarding | 390:6331 | src/app/onboarding/page.tsx |
| 위치동의 모달 | /onboarding | 390:6389 | src/components/common/LocationPermissionModal.tsx |
| 동의 후 핀형 | /location | 390:6446 | src/app/location/page.tsx |
| 로그인 | /login | 390:6525 | src/app/login/page.tsx |
| 회원가입 | /signup | 390:6560 | src/app/signup/page.tsx |
| 큐레이션 (활성) | /questions | 390:6614 | src/app/questions/page.tsx |
| 큐레이션 (비활성) | /questions | 390:6669 | src/app/questions/page.tsx |
| 큐레이션 결과 O | /recommendations | 390:7200 | src/app/recommendations/page.tsx |
| 큐레이션 결과 X | /recommendations | 390:7319 | src/app/recommendations/page.tsx |
| 문화생활 상세보기 | /events/[id] | 390:7408 | src/app/events/[id]/page.tsx |
| 문화 생활지도 | /explore | 390:7456 | src/app/explore/page.tsx |
| 마이페이지 | /mypage | 390:7673 | src/app/mypage/page.tsx |
| WeatherCard | /recommendations | 422:8967 | src/features/recommendations/WeatherCard.tsx |

## 컴포넌트 매핑

| 컴포넌트 | Figma에서 찾는 방법 | 코드 경로 |
|----------|-------------------|-----------|
| CategoryBadge | 큐레이션 결과 화면(390:7200) 내 배지 요소 | src/components/common/CategoryBadge.tsx |
| CTAButton | 큐레이션(390:6614) 내 버튼 | src/components/common/CTAButton.tsx |
| DDayBadge | 문화생활 상세(390:7408) 내 배지 | src/components/common/DDayBadge.tsx |
| EmojiBox | 큐레이션(390:6614) 내 이모지 영역 | src/components/common/EmojiBox.tsx |
| Header | 마이페이지(390:7673) 헤더 영역 | src/components/layout/Header.tsx |
| BottomNav | 마이페이지(390:7673) 하단 탭 | src/components/layout/BottomNav.tsx |
| TodayMoodCard | 큐레이션 결과(390:7200) 무드 카드 | src/features/recommendations/TodayMoodCard.tsx |
| EventCard | 큐레이션 결과(390:7200) 이벤트 카드 | src/features/recommendations/EventCard.tsx |

---

## 실행 순서

### 0. 인자 파싱
`$ARGUMENTS`가 있으면 해당 화면/컴포넌트 이름만 점검한다.
없으면 전체 매핑을 순서대로 처리한다.

### 1. dev server 확인
```
curl -s http://localhost:3000 > /dev/null
```
응답 없으면 `pnpm --filter web dev` 를 백그라운드로 실행하고 3초 대기한다.

### 2. 각 항목을 순서대로 처리

각 항목마다 아래 순서를 따른다:

**2-1. 브라우저 스크린샷**
Chrome MCP로 `http://localhost:3000/{로컬 URL}` 접속 후 스크린샷 촬영.
모바일 뷰포트(390×844)로 설정한다.

**2-2. Figma 스크린샷**
`get_screenshot`으로 해당 Node ID의 디자인 이미지를 받는다.

**2-3. 시각 비교**
두 이미지를 나란히 비교한다. 아래 항목을 집중 확인한다:
- 아이콘 모양 (가장 흔한 오류)
- 색상 (배경·텍스트·보더)
- 레이아웃 (요소 순서, 여백)
- 텍스트 크기·굵기

**2-4. 차이 있을 때만** `get_design_context` 호출 → 정확한 수치 확인 → 코드 즉시 수정

### 3. 결과 보고

```
## UI Check 결과

| 화면/컴포넌트 | 상태 | 수정 내용 |
|--------------|------|----------|
| 마이페이지 | ✅ 수정됨 | 뒤로가기 아이콘 교체 |
| BottomNav | ✅ 일치 | — |
| CategoryBadge | ⚠️ 확인 필요 | dev server 접근 불가 |
```

수정된 파일 목록을 마지막에 한번에 출력한다.

---

## 주의사항

- `get_design_context`는 시각 비교에서 차이가 명확할 때만 호출한다 (토큰 절약)
- 브라우저 스크린샷이 빈 화면이면 해당 항목은 스킵하고 "dev server 확인 필요"로 표시한다
- 동일 Figma Node ID를 여러 항목이 공유하면 `get_screenshot`은 1번만 호출한다
