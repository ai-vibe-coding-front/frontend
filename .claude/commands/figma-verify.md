@.claude/commands/design-tokens.md

# Figma Verify

기존 React 컴포넌트가 Figma 디자인과 일치하는지 최소 토큰으로 검증합니다.

## 실행 순서

### 1. 검증 대상 목록 수집
`src/components`와 `src/features` 폴더를 스캔해서 현재 존재하는 컴포넌트 파일 목록을 만든다.

### 2. 코드 사전 필터링 (MCP 호출 최소화)

검증 대상 컴포넌트 코드를 먼저 읽어서 아래 조건 중 하나라도 해당하면 **Figma를 읽지 않고 스킵**한다:
- 파일이 최근 커밋 이후 수정되지 않았고
- 주요 토큰(색상·px 값)이 design-tokens.md와 일치하면

### 3. Figma 스크린샷 비교 (토큰 절약 1순위)
$ARGUMENTS에서 Figma URL을 추출한다. node-id가 없으면 figma-sync.md의 Node ID 목록을 참조한다.

**순서:**
1. `get_screenshot` 호출 → 화면 전체를 이미지로 받는다 (토큰 소모 최소)
2. 스크린샷과 현재 코드의 색상·크기·구조를 육안 비교한다
3. 차이가 의심되는 컴포넌트만 `get_design_context` 호출 (정밀 수치 확인)

> `get_design_context`는 차이가 확실할 때만 호출한다. 스크린샷으로 OK면 스킵.

### 4. 검증 항목
각 컴포넌트마다 아래를 확인한다:

| 항목 | 확인 내용 |
|------|----------|
| 색상 | 배경색·텍스트색·보더색 hex 값 일치 여부 |
| 크기 | width·height·padding·border-radius px 값 |
| 타이포 | font-size·font-weight·line-height·letter-spacing |
| 구조 | 자식 요소 순서·flex 방향·gap |
| 베리언트 | props로 정의된 상태(active/inactive, size 등)가 모두 반영됐는지 |

### 5. 결과 보고
검증 완료 후 아래 표 형식으로 보고한다.

| 컴포넌트 | 상태 | 차이점 |
|----------|------|--------|
| CategoryBadge | ✅ 일치 | — |
| BottomNav | ⚠️ 불일치 | 아이콘 크기 24px → 20px |
| Header | ✅ 일치 | — |

### 6. 자동 수정
불일치 항목은 바로 코드를 수정한다. 수정 후 변경된 파일 경로와 내용을 요약한다.

## 검증 대상 컴포넌트 (현재 기준)
- src/components/common/CategoryBadge.tsx
- src/components/common/CTAButton.tsx
- src/components/common/DDayBadge.tsx
- src/components/common/EmojiBox.tsx
- src/components/layout/Header.tsx
- src/components/layout/BottomNav.tsx
- src/features/recommendations/TodayMoodCard.tsx
- src/features/recommendations/EventCard.tsx
