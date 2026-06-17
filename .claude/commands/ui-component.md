@.claude/commands/design-tokens.md

# UI Component

공통 컴포넌트를 수정하거나 새로 만들 때 사용한다.
`$ARGUMENTS`가 있으면 해당 컴포넌트만, 없으면 현재 대화 맥락의 컴포넌트를 대상으로 한다.

---

## 수정 전 체크리스트

### 1. 기존 컴포넌트 파악
대상 파일을 읽고 아래를 확인한다:
- Props 인터페이스 구조
- 사용 중인 색상 (design-tokens.md와 대조)
- className 패턴 (인라인 Tailwind / 상단 const 변수)
- 아이콘 사용 방식 (`public/icons/` 경로 확인)

### 2. Figma 원본 확인
`figma-sync.md`의 Node ID 목록에서 해당 컴포넌트가 포함된 화면을 찾아 `get_screenshot` 호출.
수치가 필요할 때만 `get_design_context` 호출 (토큰 절약).

---

## 코딩 규칙

### 색상
```
design-tokens.md 우선 → 없으면 Figma hex 그대로
절대 임의 색상 추가 금지
```

### Props
```typescript
// ✅ 올바른 패턴
interface ComponentProps {
  isActive?: boolean;       // Figma 베리언트
  size?: 'default' | 'large'; // Figma 사이즈 베리언트
  className?: string;       // 항상 마지막
}

// ❌ 금지
style?: React.CSSProperties  // inline style 금지
onClick?: () => void          // 공통 컴포넌트에 이벤트 직접 추가 금지 (필요 시 PR 논의)
```

### className 반복 제거
```typescript
// ❌ 반복
<div className="px-2 py-1 rounded-full text-xs">A</div>
<div className="px-2 py-1 rounded-full text-xs">B</div>

// ✅ 추출
const BADGE_CLASS = 'px-2 py-1 rounded-full text-xs';
<div className={BADGE_CLASS}>A</div>
<div className={BADGE_CLASS}>B</div>
```

### 아이콘
```typescript
// ✅ public/icons/ SVG만 사용
<Image src="/icons/arrow-back.svg" width={24} height={24} alt="" />

// ❌ 금지
<svg><path d="M12 ..." /></svg>  // 커스텀 path 직접 작성 금지
```

### 파일 구조 순서
```typescript
'use client'; // 필요할 때만

// 1. type / interface
// 2. 상단 const (색상 맵, 반복 className)
// 3. interface Props
// 4. export function Component
```

---

## 수정 후 처리

### 1. 검증
`/figma-verify` 실행. 불일치 항목이 있으면 즉시 수정한다.

### 2. design-tokens.md 업데이트
작업 중 새 색상이 추가된 경우 `.claude/commands/design-tokens.md`에 행을 추가한다.
기존 토큰과 중복되는 색상은 추가하지 않는다.

### 3. figma-sync.md 업데이트
새 컴포넌트를 추가한 경우 `.claude/commands/figma-sync.md`의 "완료된 컴포넌트 (스킵)" 목록에 추가한다.
```
- ComponentName → src/경로/ComponentName.tsx ✅
```

### 4. ui-component.md 업데이트
새 컴포넌트를 추가한 경우 이 파일 하단의 "컴포넌트별 Figma Node ID 참조" 테이블에 행을 추가한다.

---

## 컴포넌트별 Figma Node ID 참조

| 컴포넌트 | 파일 | 참조 Node ID |
|----------|------|-------------|
| CategoryBadge | src/components/common/CategoryBadge.tsx | 390:7200 내 배지 |
| CTAButton | src/components/common/CTAButton.tsx | 390:6614 내 버튼 |
| DDayBadge | src/components/common/DDayBadge.tsx | 390:7408 내 배지 |
| EmojiBox | src/components/common/EmojiBox.tsx | 390:6614 내 이모지 |
| Header | src/components/layout/Header.tsx | 390:7673 헤더 |
| BottomNav | src/components/layout/BottomNav.tsx | 390:7673 하단 탭 |
| TodayMoodCard | src/features/recommendations/TodayMoodCard.tsx | 390:7200 무드 카드 |
| EventCard | src/features/recommendations/EventCard.tsx | 390:7200 이벤트 카드 |
