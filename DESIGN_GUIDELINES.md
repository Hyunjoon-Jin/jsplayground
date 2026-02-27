# J들의 놀이터 — UI/UX 디자인 가이드라인

> **버전** 1.0 · 최초 작성: 2026-02-27
> 이 문서는 프로젝트의 모든 화면·컴포넌트 디자인 결정의 단일 출처(Single Source of Truth)입니다.
> 새로운 화면을 추가하거나 기존 컴포넌트를 수정할 때 반드시 이 가이드라인을 먼저 참고하세요.

---

## 목차

1. [디자인 원칙](#1-디자인-원칙)
2. [색상 시스템](#2-색상-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [간격 & 레이아웃](#4-간격--레이아웃)
5. [테두리 반경 (Border Radius)](#5-테두리-반경-border-radius)
6. [그림자 & 글로우](#6-그림자--글로우)
7. [글래스모피즘](#7-글래스모피즘)
8. [컴포넌트 규격](#8-컴포넌트-규격)
9. [인터랙션 & 애니메이션](#9-인터랙션--애니메이션)
10. [아이콘 사용 규칙](#10-아이콘-사용-규칙)
11. [모바일 우선 원칙](#11-모바일-우선-원칙)
12. [접근성 (Accessibility)](#12-접근성-accessibility)
13. [작성 규칙 (Writing)](#13-작성-규칙-writing)
14. [금지 패턴 (Anti-patterns)](#14-금지-패턴-anti-patterns)

---

## 1. 디자인 원칙

### 1-1. 명료성 (Clarity)
- 모든 요소는 **한 가지 목적**만 가진다. 복합 역할을 하는 버튼·영역은 분리한다.
- 텍스트는 필요한 최소한으로 유지한다. 레이블은 동사+명사 형태로 작성한다.
- 정보 계층(H1 → H2 → body → caption)을 절대로 건너뛰지 않는다.

### 1-2. 즉각성 (Immediacy)
- 모든 탭·버튼 클릭은 **100ms 이내** 시각 피드백을 제공해야 한다.
- 네트워크 응답 대기 중에도 UI는 멈추지 않는다 (Optimistic UI 또는 Skeleton 사용).
- 드래그·리사이즈 등 제스처 기반 인터랙션은 지연 없이 즉시 반응한다.

### 1-3. 일관성 (Consistency)
- 같은 역할을 하는 요소는 앱 전체에서 동일한 색상·크기·위치를 가진다.
- CSS 변수(`variables.css`)에 정의된 토큰만 사용하고, 하드코딩 색상/크기 값은 금지한다.
- 새로운 컴포넌트를 만들기 전에 기존 컴포넌트의 재사용 가능성을 먼저 검토한다.

### 1-4. 정교함 (Polish)
- 모서리·간격·정렬은 4px 그리드에 맞춰 픽셀 퍼펙트로 작성한다.
- 전환 애니메이션은 항상 ease-in-out 계열 커브를 사용한다.
- 빈 상태(Empty State)에도 디자인된 시각 요소를 배치한다.

### 1-5. 접지성 (Groundedness)
- 컴포넌트는 실제 물체처럼 깊이(depth)와 그림자를 통해 계층감을 표현한다.
- 인터랙티브 요소는 hover/active 상태에서 시각적으로 "눌리는" 느낌을 준다.

---

## 2. 색상 시스템

모든 색상은 `src/styles/variables.css`의 CSS 변수를 통해 참조한다.

### 2-1. 배경 계층

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg-base` | `#FFFFFF` | 앱 전체 최하위 배경 |
| `--bg-surface` | `#F8FAFC` | 카드·입력 필드 배경 |
| `--bg-elevated` | `#FFFFFF` | 모달·팝업·시트 배경 |
| `--bg-overlay` | `rgba(0,0,0,0.4)` | 딤 처리 오버레이 |

> **규칙**: 배경 계층은 항상 `base < surface < elevated` 순서를 따른다. 역전 금지.

### 2-2. 브랜드 / 강조색

| 토큰 | 값 | 용도 |
|---|---|---|
| `--accent-primary` | `#3B82F6` | CTA 버튼, 활성 탭, 포커스 링 |
| `--accent-secondary` | `#60A5FA` | 부가 강조, 뱃지 배경 |
| `--accent-glow` | `rgba(59,130,246,0.15)` | Glow 효과 배경 |

### 2-3. 텍스트 계층

| 토큰 | 값 | 용도 |
|---|---|---|
| `--text-primary` | `#1E293B` | 본문, 제목 |
| `--text-secondary` | `#64748B` | 부제목, 보조 설명 |
| `--text-muted` | `#94A3B8` | 비활성, Placeholder |
| `--text-inverse` | `#FFFFFF` | 어두운 배경 위 텍스트 |

### 2-4. 테두리

| 토큰 | 값 | 용도 |
|---|---|---|
| `--border-subtle` | `#F1F5F9` | 영역 구분 선 (극도로 연함) |
| `--border-default` | `#E2E8F0` | 입력 필드, 카드 테두리 |
| `--border-focus` | `#3B82F6` | 포커스 상태 테두리 |

### 2-5. 일정 유형 색상

| 토큰 | 값 | 일정 유형 |
|---|---|---|
| `--schedule-blue` | `#3B82F6` | 미팅·회의·기본 |
| `--schedule-red` | `#EF4444` | 중요·긴급 |
| `--schedule-orange` | `#F59E0B` | 경고·주의 |
| `--schedule-green` | `#10B981` | 약속·완료 |
| `--schedule-gray` | `#94A3B8` | 기타·비활성 |

### 2-6. 상태 색상

| 토큰 | 값 | 용도 |
|---|---|---|
| `--success` | `#10B981` | 성공, 완료 |
| `--warning` | `#F59E0B` | 경고 |
| `--error` | `#EF4444` | 오류, 삭제 |
| `--info` | `#3B82F6` | 정보 |

### 2-7. 색상 사용 규칙

- **절대 금지**: 색상 값을 컴포넌트에 직접 하드코딩 (`color: #3B82F6` 직접 작성 금지)
- 강조색(`--accent-primary`)은 화면당 **최대 2~3곳**에만 사용한다.
- 에러 색상(`--error`)은 삭제 버튼·에러 메시지 외에는 사용하지 않는다.
- 일정 카드의 배경은 단색이 아닌 **그라디언트** (`linear-gradient(135deg, ...)`)로 처리한다.

---

## 3. 타이포그래피

### 3-1. 폰트 패밀리

```
--font-base: 'Inter', 'Pretendard', -apple-system, sans-serif
```

- **Inter**: 영문·숫자 전용 (명확한 숫자 자형)
- **Pretendard**: 한글 전용 (Inter와 자연스럽게 혼용)
- `-apple-system`: iOS 네이티브 느낌 유지용 폴백

### 3-2. 폰트 크기 스케일

| 토큰 | 크기 | 용도 |
|---|---|---|
| `--text-xs` | 12px | 태그, 메타 정보, 뱃지 |
| `--text-sm` | 14px | 카드 본문, 부제목 |
| `--text-base` | 16px | 일반 본문, 입력값 |
| `--text-md` | 18px | 섹션 제목 |
| `--text-lg` | 22px | 페이지 제목 |
| `--text-xl` | 26px | 대형 날짜 표시 |
| `--text-2xl` | 32px | 히어로 타이틀 |

### 3-3. 폰트 굵기 규칙

| 굵기 | 용도 |
|---|---|
| `400` (Regular) | 일반 본문, 설명 텍스트 |
| `500` (Medium) | 레이블, 부제목 |
| `600` (SemiBold) | 카드 제목, 섹션 헤더 |
| `700` (Bold) | 페이지 제목, 강조 요소 |
| `800` (ExtraBold) | 일정 카드 제목, 날짜 숫자 |

> **규칙**: `font-weight`는 항상 숫자로 명시한다. `bold`, `normal` 키워드 사용 금지.

### 3-4. 행간 (Line Height)

- 제목: `1.2`
- 본문: `1.5`
- 캡션: `1.4`

### 3-5. 텍스트 말줄임 처리

단일 라인 말줄임은 반드시 세 속성을 함께 적용한다:

```css
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
```

---

## 4. 간격 & 레이아웃

### 4-1. 4px 기본 그리드

모든 padding, margin, gap은 **4의 배수**로 설정한다.

| 배수 | 값 | 주요 용도 |
|---|---|---|
| 1× | 4px | 아이콘-텍스트 간격, 최소 내부 여백 |
| 2× | 8px | 카드 내부 상하 패딩, 작은 요소 간격 |
| 3× | 12px | 카드 좌우 패딩, 목록 항목 간격 |
| 4× | 16px | 섹션 패딩, 모달 내부 여백 |
| 5× | 20px | 화면 가로 여백 |
| 6× | 24px | 섹션 간 여백 |
| 8× | 32px | 대형 섹션 분리 |

### 4-2. 레이아웃 고정 치수

| 토큰 | 값 | 설명 |
|---|---|---|
| `--header-height` | `110px` | 상단 CalendarNav 영역 |
| `--tab-bar-height` | `70px` | 하단 BottomNav 영역 |
| `--fab-size` | `60px` | Floating Action Button |
| `--safe-area-bottom` | `env(safe-area-inset-bottom, 20px)` | iOS 홈 인디케이터 여백 |
| `--timeline-hour-height` | `70px` | 타임라인 1시간 높이 |
| `--timeline-label-width` | `60px` | 시간 레이블 컬럼 너비 |

### 4-3. 최대 너비

- 콘텐츠 최대 너비: **600px** (모바일 최적화, 태블릿에서도 좁게 유지)
- 하단 탭바: `max-width: 600px`로 중앙 정렬

### 4-4. 스크롤 영역

스크롤 가능한 영역은 반드시 다음을 포함한다:

```css
overflow-y: auto;
-webkit-overflow-scrolling: touch; /* iOS 관성 스크롤 */
```

---

## 5. 테두리 반경 (Border Radius)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-sm` | `8px` | 태그, 뱃지, 소형 버튼 |
| `--radius-md` | `14px` | 카드, 입력 필드 |
| `--radius-lg` | `20px` | 모달 상단, 바텀 시트 |
| `--radius-xl` | `28px` | 대형 카드, 주요 CTA |
| `--radius-full` | `9999px` | 알약형 버튼, 칩, 아바타 |

### 규칙

- 일정 카드: `border-radius: 12px` (고정값, 카드 밀도를 위해 `--radius-md`보다 작게)
- 모달/시트: 상단 `--radius-lg`, 하단 `0` (바텀 시트 패턴)
- FAB: `--radius-full` (완전한 원형)

---

## 6. 그림자 & 글로우

| 토큰 | 값 | 용도 |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.05)` | 카드 기본 상태 |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | 호버된 카드, 드롭다운 |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.12)` | 모달, 팝업 |
| `--shadow-glow` | `0 4px 14px rgba(59,130,246,0.2)` | 활성 CTA 버튼 |

### 그림자 사용 원칙

- 그림자 강도는 요소의 **높이(elevation)**를 나타낸다. 위로 올라올수록 강한 그림자.
- 드래그 중인 요소는 `--shadow-lg`를 적용해 들어올린 느낌을 준다.
- 배경과 충분한 대비가 있는 요소에는 그림자를 생략할 수 있다.

---

## 7. 글래스모피즘

유리 질감은 헤더·모달·탭바에만 제한적으로 사용한다.

```css
/* 표준 글래스 스타일 (.glass 유틸리티 클래스) */
background: rgba(255, 255, 255, 0.8);    /* --glass-bg */
backdrop-filter: blur(12px);              /* --glass-blur */
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(59, 130, 246, 0.1); /* --glass-border */
```

### 규칙

- `backdrop-filter`는 성능 비용이 높으므로 **동시에 3개 이하** 요소에만 적용한다.
- 불투명도는 `0.8~0.95` 범위를 유지한다 (너무 투명하면 가독성 저하).
- 글래스 위에 올라오는 텍스트는 반드시 `--text-primary` 또는 `--text-secondary`를 사용한다.

---

## 8. 컴포넌트 규격

### 8-1. 하단 탭바 (BottomNav)

| 속성 | 값 |
|---|---|
| 높이 | `70px` + `safe-area-bottom` |
| 배경 | `rgba(255,255,255,0.9)` + `backdrop-filter: blur(12px)` |
| 상단 테두리 | `1px solid --border-subtle` |
| z-index | `100` |
| 아이콘 크기 | `22px` |
| 라벨 크기 | `10px` |
| 활성 색상 | `--accent-primary` |
| 비활성 색상 | `--text-muted` |
| 탭 클릭 피드백 | `transform: scale(0.9)` |

### 8-2. 캘린더 네비게이션 (CalendarNav)

| 속성 | 값 |
|---|---|
| 높이 | `110px` |
| 배경 | 글래스모피즘 |
| 월/주/일 토글 | 세그먼트 컨트롤 형태, 활성 탭은 `--accent-primary` 배경 |
| 이전/다음 버튼 | `--text-secondary` 아이콘, 터치 영역 `44×44px` 이상 |
| + 버튼 (FAB) | `--accent-primary` 배경, `--radius-full`, `--shadow-glow` |

### 8-3. 일정 카드 (Schedule Card)

```
┌────────────────────────────────┐  ← border-radius: 12px
│ ● 태그   카드유형             │  ← font-size: 11px, font-weight: 600
│                                │
│  일정 제목                     │  ← font-size: 14px, font-weight: 800
│  09:00 – 10:00                 │  ← font-size: 11px, opacity: 0.7
└────────────────────────────────┘
│← border-left: 4px solid COLOR
```

| 유형 | 배경 그라디언트 | 왼쪽 선 색상 | 텍스트 색상 |
|---|---|---|---|
| 미팅/회의 | `#EFF6FF → #DBEAFE` | `#3B82F6` | `#1E40AF` |
| 약속 | `#ECFDF5 → #D1FAE5` | `#10B981` | `#065F46` |
| 중요 | `#FFF1F2 → #FFE4E6` | `#F43F5E` | `#9F1239` |
| 기본 | `#F8FAFC → #F1F5F9` | `#94A3B8` | `#334155` |

- **hover**: `translateY(-2px)`, `filter: brightness(1.05)`
- **드래그 중**: `opacity: 0.6`, `z-index: 100`
- **리사이즈 중**: `opacity: 0.6`, `pointer-events: none`
- 전환: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### 8-4. 모달 (ScheduleModal / TodoModal)

| 속성 | 값 |
|---|---|
| 위치 | Fixed, 하단에서 슬라이드 업 |
| 배경 | `--bg-elevated` (`#FFFFFF`) |
| 상단 반경 | `--radius-lg` (20px) |
| 오버레이 | `--bg-overlay` |
| 내부 패딩 | `20px` |
| 입력 필드 | `--bg-surface` 배경, `--radius-md`, `16px` 패딩 |
| 저장 버튼 | `--accent-primary`, `--radius-full`, 전체 너비 |
| 삭제 버튼 | `--error` 텍스트, 배경 없음 |
| 닫기 버튼 | 우상단, `24px` 아이콘, 터치 영역 `44×44px` |

### 8-5. 입력 필드 (Input / Textarea)

```css
background: var(--bg-surface);
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
padding: 14px 16px;
font-size: var(--text-base);
color: var(--text-primary);
transition: border-color 0.15s ease;

/* Focus */
border-color: var(--border-focus);
box-shadow: 0 0 0 3px var(--accent-glow);
```

- Placeholder 색상: `--text-muted`
- 에러 상태: `border-color: --error`, 하단에 에러 메시지 (`--text-xs`, `--error` 색상)

### 8-6. 버튼 변형

| 변형 | 배경 | 텍스트 | 용도 |
|---|---|---|---|
| Primary | `--accent-primary` | `--text-inverse` | 주요 CTA |
| Secondary | `--bg-surface` | `--text-primary` | 보조 액션 |
| Ghost | 없음 | `--accent-primary` | 취소, 링크형 액션 |
| Danger | `--error` | `--text-inverse` | 삭제, 되돌릴 수 없는 액션 |

모든 버튼:
- 최소 높이: `44px` (터치 타깃 최소 요구사항)
- 클릭 피드백: `transform: scale(0.96)`, `transition: 0.1s ease`

### 8-7. 날짜 피커 (DatePickerModal)

- 바텀 시트 형태로 표시
- 월 그리드는 `7열 × 6행`
- 오늘 날짜: `--accent-primary` 배경, `--text-inverse` 텍스트
- 선택된 날짜: `--accent-primary` 배경 + `--shadow-glow`
- 다른 달 날짜: `--text-muted` (표시하되 상호작용 가능)

### 8-8. 타임라인 (DayView / WeekView)

- 1시간 = `70px` (`--timeline-hour-height`)
- 시간 레이블 컬럼 = `60px` (`--timeline-label-width`)
- 현재 시각 선: `2px solid --accent-primary` + 왼쪽 원형 마커
- 카드 좌우 여백: `4px`
- 겹치는 일정: 너비를 균등 분할 (50%, 33%, ...)

---

## 9. 인터랙션 & 애니메이션

### 9-1. 기본 트랜지션

| 목적 | duration | easing |
|---|---|---|
| 일반 hover/active | `150ms` | `ease` |
| 카드 이동·크기 변화 | `200ms` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 모달 열림/닫힘 | `280ms` | `cubic-bezier(0.32, 0.72, 0, 1)` |
| 탭 전환 | `220ms` | `ease-in-out` |
| 숫자 카운터 변화 | `300ms` | `ease-out` |

### 9-2. 클릭/탭 피드백 규칙

```css
/* 모든 클릭 가능한 요소 기본 스타일 */
.clickable:active {
  transform: scale(0.96);
  transition: transform 0.1s ease;
}

/* 소형 버튼·탭 아이템 */
:active {
  transform: scale(0.9);
}
```

- **항상 적용**: 버튼, 탭, 카드, 날짜 셀
- **미적용**: 텍스트 링크, disabled 요소

### 9-3. 드래그 & 드롭

- 드래그 시작: `opacity: 0.6` + `--shadow-lg` 즉시 적용 (지연 없음)
- 드래그 중: 원래 위치에 반투명 "고스트" 표시
- 드롭 완료: Optimistic Update → API 저장 → 실패 시 롤백
- **절대 금지**: 드래그 중 API 호출, 드롭 전 UI 업데이트 지연

### 9-4. 페이지 전환

- 월 → 일 뷰: 탭한 날짜에서 줌인 효과 (선택 사항)
- 뒤로 가기: 슬라이드 라이트 (기본 네이티브 동작 활용)
- 탭바 전환: Fade 또는 Cross-dissolve, slide 금지

### 9-5. 로딩 상태

| 상황 | UI 처리 |
|---|---|
| 일정 목록 로딩 | Skeleton Loader (카드 형태) |
| 저장 중 | 버튼에 스피너, disabled 처리 |
| 삭제 중 | 요소 즉시 숨김 (Optimistic) + 확인 후 확정 |
| 초기 진입 | Skeleton이 카드 2-3개 표시 |

---

## 10. 아이콘 사용 규칙

**라이브러리**: `lucide-react` 전용 (다른 아이콘 라이브러리 혼용 금지)

### 크기 규격

| 맥락 | 크기 |
|---|---|
| 탭바 아이콘 | `22px` |
| 버튼 내 아이콘 | `18px` |
| 카드 내 아이콘 | `14px` |
| 인라인 텍스트 아이콘 | `16px` |
| 빈 상태 일러스트 | `48px` |

### strokeWidth 규칙

| 상태 | strokeWidth |
|---|---|
| 활성 (active) | `2.5` |
| 비활성 (inactive) | `2.0` |
| 장식적 아이콘 | `1.5` |

### 의미 매핑

| 아이콘 | 역할 | 다른 용도로 사용 금지 |
|---|---|---|
| `Calendar` | 캘린더 탭 | ✓ 전용 |
| `ClipboardList` | 할 일 탭 | ✓ 전용 |
| `User` | 프로필 탭 | ✓ 전용 |
| `Plus` | 새 항목 추가 (FAB) | ✓ 전용 |
| `X` | 모달 닫기, 태그 삭제 | |
| `Check` | 완료, 선택 확인 | |
| `ChevronLeft/Right` | 이전/다음 날짜 | |
| `Handshake` | 미팅/회의 유형 | |
| `Star` | 중요도 높음 | |

---

## 11. 모바일 우선 원칙

### 11-1. 터치 타깃

- 모든 인터랙티브 요소의 최소 터치 영역: **44×44px**
- 실제 시각적 크기가 작아도 `padding`으로 터치 영역 확보

```css
/* 작은 아이콘 버튼의 터치 영역 확보 예시 */
.icon-button {
  padding: 10px;
  margin: -10px;
}
```

### 11-2. Safe Area

- 하단 탭바: `padding-bottom: env(safe-area-inset-bottom, 20px)` 필수
- 콘텐츠 영역: 탭바 높이(`70px`) + safe area만큼 하단 패딩 확보

### 11-3. 텍스트 크기

- 본문 최소 폰트: `14px` (모바일에서 더 작으면 가독성 저하)
- 입력 필드: `16px` 이상 (iOS 자동 줌 방지)

### 11-4. 스크롤 규칙

- 수평 스크롤은 **명확한 의도**(캘린더 날짜 탐색)에만 허용
- `overflow-x: hidden`을 `html, body`에 항상 적용
- 관성 스크롤: `-webkit-overflow-scrolling: touch`

### 11-5. 뷰포트

```html
<!-- layout.tsx에 반드시 포함 -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`viewport-fit=cover`는 노치·다이나믹 아일랜드 영역까지 앱이 확장되어 더 몰입감 있는 UI를 만든다.

---

## 12. 접근성 (Accessibility)

### 12-1. 색상 대비

| 조합 | 최소 대비율 |
|---|---|
| 본문 텍스트 (`--text-primary`) / 배경 | **4.5:1** 이상 |
| UI 컴포넌트·그래픽 | **3:1** 이상 |
| 비활성 텍스트 (`--text-muted`) | 예외 허용 |

### 12-2. 의미 있는 마크업

- 버튼은 항상 `<button>` 태그 사용 (div 클릭 이벤트 금지)
- 아이콘 전용 버튼에는 `aria-label` 필수

```tsx
<button aria-label="이전 달로 이동">
  <ChevronLeft size={20} />
</button>
```

### 12-3. 포커스 관리

- 모달 열릴 때: 첫 번째 입력 필드로 포커스 이동
- 모달 닫힐 때: 모달을 연 버튼으로 포커스 복귀
- 포커스 링: `border-color: --border-focus` + `box-shadow: 0 0 0 3px --accent-glow`

### 12-4. 의미 있는 빈 상태

빈 상태(데이터 없음)에는 반드시:
1. 설명적인 메시지 (예: "이 날에는 일정이 없어요")
2. CTA 버튼 (예: "일정 추가하기")
3. 시각적 아이콘 또는 일러스트

---

## 13. 작성 규칙 (Writing)

### 13-1. 버튼 레이블

- **동사형 사용**: "저장", "삭제", "추가", "취소" (명사형 금지)
- CTA 버튼은 결과를 명확히 표현: "일정 저장" > "확인"

### 13-2. 날짜/시간 형식

| 맥락 | 형식 | 예시 |
|---|---|---|
| 월 헤더 | `yyyy년 M월` | 2026년 2월 |
| 일 뷰 헤더 | `M월 d일 (요일)` | 2월 27일 (금) |
| 시간 표시 | `HH:mm` | 09:30 |
| 시간 범위 | `HH:mm – HH:mm` | 09:00 – 10:30 |
| 상대 날짜 | 오늘/내일/어제 (7일 이내) | 오늘, 내일 |

### 13-3. 에러 메시지

- 친근하고 구체적으로: "제목을 입력해 주세요" (기술적 표현 금지)
- 해결 방법 제시: "종료 시간은 시작 시간 이후여야 합니다"

### 13-4. 로딩 텍스트

- "로딩 중..." 대신 Skeleton UI 사용
- 불가피한 경우: "저장 중...", "삭제 중..."으로 진행 상태 명시

---

## 14. 금지 패턴 (Anti-patterns)

### 하드코딩 금지

```css
/* ❌ 금지 */
color: #3B82F6;
font-size: 14px;
border-radius: 8px;

/* ✅ 올바른 방법 */
color: var(--accent-primary);
font-size: var(--text-sm);
border-radius: var(--radius-sm);
```

### 레이아웃 금지

```css
/* ❌ 금지: 고정 높이로 텍스트 잘림 유발 */
height: 40px;
overflow: hidden;

/* ✅ 올바른 방법: 최소 높이 사용 */
min-height: 44px;
```

### 인터랙션 금지

```tsx
/* ❌ 금지: div에 클릭 이벤트 */
<div onClick={handleClick}>버튼</div>

/* ✅ 올바른 방법 */
<button onClick={handleClick}>버튼</button>
```

### 색상 금지

```tsx
/* ❌ 금지: 의미 없는 색상 사용 */
<span style={{ color: 'red' }}>삭제</span>

/* ✅ 올바른 방법 */
<span style={{ color: 'var(--error)' }}>삭제</span>
```

### 애니메이션 금지

```css
/* ❌ 금지: 지나치게 긴 애니메이션 */
transition: all 0.8s ease;

/* ❌ 금지: linear easing (기계적으로 보임) */
transition: transform 0.2s linear;

/* ✅ 올바른 방법 */
transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### API 패턴 금지

```tsx
/* ❌ 금지: 드래그 중 반복 API 호출 */
onDragOver={() => saveToServer()}

/* ✅ 올바른 방법: 드롭 완료 시 1회 호출 */
onDrop={() => saveToServer()}
```

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|---|---|---|
| 2026-02-27 | 1.0 | 최초 작성 — 색상, 타이포, 간격, 컴포넌트 규격 정의 |

---

*이 가이드라인은 살아있는 문서입니다. 새로운 컴포넌트를 추가하거나 디자인 결정이 변경될 때마다 업데이트해 주세요.*
