# KARS 색상 토큰 (Material Design 3 기반)

> 참고: M3(Material Design 3)의 Role 기반 색상 시스템을 KARS 브랜드에 맞게 번역한 토큰 정의서.
> 브랜드 Primary 색상: `#FF8036` (오렌지)

---

## 토큰 철학

M3는 색상 자체가 아니라 **역할(Role)** 로 토큰을 정의함.
- `primary` = "가장 중요한 UI 요소에 쓰는 색" → 실제 hex는 브랜드마다 다름
- `on-primary` = "primary 배경 위에 올라오는 텍스트/아이콘 색"
- `primary-container` = "덜 강조된 primary 영역의 배경색"

KARS는 이 철학을 유지하되, 토큰 네이밍을 기존 스타일(`Back-*`, `Text-*`)로 유지함.

---

## Surface / 배경 계열 (Back-*)

> M3의 `surface-container` 계열에 대응. 배경, 카드, 시트, 컨테이너에 사용.

| KARS 토큰 | M3 대응 Role | Hex | 사용처 |
|---|---|---|---|
| `Back-Lowest-00` | `surface-container-lowest` | `#FFFFFF` | 최상위 배경, 흰 카드 |
| `Back-Low-10` | `surface-container-low` | `#F9FAFD` | 페이지 기본 배경 |
| `Back-Mid-20` | `surface-container` | `#F3F6F8` | 일반 컨테이너, 입력 필드 배경 |
| `Back-High-25` | `surface-container-high` | `#ECF0F4` | 강조 컨테이너, 칩 기본 배경 |
| `Back-Highest-30` | `surface-container-highest` | `#E3E9ED` | 최고 강조 컨테이너, 구분선 |

---

## Text / 텍스트·아이콘 계열 (Text-*)

> M3의 `on-surface` 계열에 대응. 텍스트, 아이콘, 레이블에 사용.

| KARS 토큰 | M3 대응 Role | Hex | 사용처 |
|---|---|---|---|
| `Text-Highest-100` | `on-surface` | `#171725` | 기본 본문 텍스트, 제목 |
| `Text-High-90` | `on-surface-variant` | `#434E58` | 보조 텍스트, 레이블 |
| `Text-Low-70` | (outline-high) | `#78828A` | 힌트, 플레이스홀더, 비활성 레이블 |
| `Text-Lowest-60` | (outline-low) | `#9CA4AB` | 최저 강조 텍스트, 캡션 |

---

## Primary / 브랜드 주색 계열

> KARS 브랜드 인디고/바이올렛 기반.

| KARS 토큰 | M3 대응 Role | Hex | 사용처 |
|---|---|---|---|
| `Primary-Main` | `primary` | `#5B5BD6` | Filled 버튼 배경, 주요 강조 요소 |
| `Primary-Container` | `primary-container` | `#E8E8FF` | Tonal 버튼/칩 배경, 선택 상태 |
| `On-Primary` | `on-primary` | `#FFFFFF` | Primary 배경 위 텍스트/아이콘 |
| `On-Primary-Container` | `on-primary-container` | `#1B0070` | Primary-Container 위 텍스트/아이콘 |

> ⚠️ `On-Primary`, `On-Primary-Container`는 tailwind 토큰 미등록 상태. 필요 시 추가.

---

## Error / 오류 계열

> M3의 `error` 계열에 대응. 경고, 오류, 위험 동작에 사용.

| KARS 토큰 | M3 대응 Role | Hex | 사용처 |
|---|---|---|---|
| `Error-Main` | `error` | `#BA1A1A` | 오류 텍스트, 위험 버튼 배경 |
| `Error-Container` | `error-container` | `#FFDAD6` | 오류 영역 배경, 인라인 에러 |
| `On-Error` | `on-error` | `#FFFFFF` | Error 배경 위 텍스트 |
| `On-Error-Container` | `on-error-container` | `#410002` | Error-Container 위 텍스트 |

---

## Outline / 경계선 계열

> 테두리, 구분선, 비활성 상태 경계에 사용.

| KARS 토큰 | M3 대응 Role | Hex | 사용처 |
|---|---|---|---|
| `Outline` | `outline` | `#78818A` | 중요한 테두리 (입력 필드, Outlined 버튼) |
| `Outline-Variant` | `outline-variant` | `#C2C8CE` | 장식적 구분선, Divider |

---

## Gray Sub / 그레이 계열

> 비활성 상태, 보조 UI 요소에 사용.

| KARS 토큰 | 역할 | Hex | 사용처 |
|---|---|---|---|
| `Gray-Sub-High-80` | 높은 강도 그레이 | `#66707A` | 비활성 아이콘, 보조 버튼 텍스트 |
| `Gray-Sub-Low-50` | 낮은 강도 그레이 | `#BFC6CC` | 구분선, 비활성 테두리 |
| `Gray-Sub-Disabled-40` | 비활성 상태 | `#CED1D3` | 비활성 버튼/칩 배경 |

---

## Neutral / 기준색

| KARS 토큰 | Hex | 사용처 |
|---|---|---|
| `Neutral-White` | `#FFFFFF` | 순수 흰색이 필요한 경우 |
| `Neutral-Black` | `#0C0B17` | 순수 검정이 필요한 경우 |

---

## State Layer (상태 오버레이)

> M3에서 Hover/Focus/Press 상태를 표현하는 반투명 오버레이 규칙.
> Tailwind로는 `opacity-*` 또는 CSS custom properties로 구현.

| 상태 | Opacity | 적용 색상 |
|---|---|---|
| Hovered | 8% | `on-surface` 또는 해당 컨테이너의 `on-*` 색상 |
| Focused | 12% | 동일 |
| Pressed | 12% | 동일 |
| Dragged | 16% | 동일 |

---

## 사용 예시

```tsx
// ✅ 올바른 사용 (토큰 사용)
<button className="bg-Primary-Main text-white">확인</button>
<div className="bg-Back-Low-10 text-Text-High-90">카드 내용</div>
<span className="text-Error-Main">오류 메시지</span>

// ❌ 피할 것 (하드코딩)
<button className="bg-[#FF8036]">확인</button>
<span className="text-red-500">오류 메시지</span>
```
