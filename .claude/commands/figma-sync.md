@.claude/commands/design-tokens.md

# Figma Sync

Figma URL이 주어지면 해당 화면만 코드화한다.
**URL 없이 실행하면** 아래 진행 현황 테이블에서 `⏳ 미작업` 항목을 순서대로 하나씩 처리한다.

---

## 진행 현황 (MUUD 디자인 확정 페이지 기준)

| 순서 | 화면 | Figma Node ID | 상태 |
|------|------|---------------|------|
| 1 | onboarding 로그인 | 390:6027 | ⏳ 미작업 |
| 2 | onboarding 비로그인 | 390:6331 | ⏳ 미작업 |
| 3 | 위치동의 모달 | 390:6389 | ⏳ 미작업 |
| 4 | 동의 후 핀형 | 390:6446 | ⏳ 미작업 |
| 5 | 로그인 | 390:6525 | ⏳ 미작업 |
| 6 | 회원가입 | 390:6560 | ⏳ 미작업 |
| 7 | 큐레이션 (버튼 활성화) | 390:6614 | ⏳ 미작업 |
| 8 | 큐레이션 (버튼 비활성화) | 390:6669 | ⏳ 미작업 |
| 9 | 큐레이션 결과 O | 390:7200 | ⏳ 미작업 |
| 10 | 큐레이션 결과 X | 390:7319 | ⏳ 미작업 |
| 11 | 문화생활 상세보기 | 390:7408 | ⏳ 미작업 |
| 12 | 문화 생활지도 | 390:7456 | ⏳ 미작업 |
| 13 | 마이페이지 | 390:7673 | ⏳ 미작업 |
| 14 | WeatherCard | 422:8967 | ⏳ 미작업 |

**완료된 컴포넌트 (스킵):**
- CategoryBadge → apps/web/src/components/common/CategoryBadge.tsx ✅
- CTAButton → apps/web/src/components/common/CTAButton.tsx ✅
- DDayBadge → apps/web/src/components/common/DDayBadge.tsx ✅
- EmojiBox → apps/web/src/components/common/EmojiBox.tsx ✅
- Header → apps/web/src/components/layout/Header.tsx ✅
- BottomNav → apps/web/src/components/layout/BottomNav.tsx ✅
- TodayMoodCard → apps/web/src/features/recommendations/TodayMoodCard.tsx ✅
- EventCard → apps/web/src/features/recommendations/EventCard.tsx ✅

---

## URL 없이 실행 시 자동 진행 순서

### 1. 다음 미작업 항목 확인
위 테이블에서 `⏳ 미작업` 중 가장 순서가 빠른 항목을 선택한다.

### 2. Figma 읽기
선택된 항목의 Node ID로 `get_design_context`를 호출한다.
- 같은 화면의 베리언트(하트 활성/비활성 등)는 하나의 컴포넌트 props로 합친다

### 3. 코드 생성
아래 규칙을 따른다.

**폴더 규칙:**
- 공통 UI (버튼, 배지 등) → `apps/web/src/components/common/`
- 레이아웃 (헤더, 네비) → `apps/web/src/components/layout/`
- 온보딩/인증 화면 → `apps/web/src/app/onboarding/`, `apps/web/src/app/login/`, `apps/web/src/app/signup/`
- 기능별 컴포넌트 → `apps/web/src/features/<기능명>/`
- 모달 → `apps/web/src/components/common/<Name>Modal.tsx`

**네이밍 규칙:**
- 영어 이름 → 그대로 사용
- 한글 이름 → 영어로 변환

**베리언트 처리:**
- Figma 베리언트 → props (active/inactive → `isActive?: boolean`)

**className 중복 제거:**
- 동일 className이 같은 파일에서 2회 이상 → 파일 상단 const 변수로 추출

**아이콘 규칙:**
- `download_assets`로 SVG 직접 추출 (커스텀 path 금지)
- 저장: `apps/web/public/icons/`
- 명명: `{name}-active.svg` / `{name}-inactive.svg`

**디자인 토큰:**
- 색상은 상단에 로드된 `design-tokens.md` 값을 우선 사용한다
- 토큰에 없는 색상은 Figma 수치를 그대로 사용한다

### 4. 현황 테이블 업데이트
작업 완료 후 이 파일의 테이블에서 해당 항목을 `✅ 완료`로 변경한다.

### 5. 완료 보고
```
✅ 완료: <화면 이름>
📁 생성 파일: <경로>
⏭️ 다음 항목: <다음 미작업 화면 이름>
```

---

## URL 지정 시 실행 순서

$ARGUMENTS에서 Figma URL을 추출하고 node-id를 확인한다.

- node-id가 단일 컴포넌트 → 바로 `get_design_context` 호출
- node-id가 화면/페이지 → `get_metadata`로 구조 파악 후 새것만 `get_design_context` 호출

완료 후 테이블에서 해당 항목을 `✅ 완료`로 업데이트한다.
