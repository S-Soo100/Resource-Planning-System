# KARS 컴포넌트 스펙 (Material Design 3 기반)

> M3 컴포넌트 스펙을 KARS 브랜드(Primary: `#FF8036`)에 맞게 번역한 가이드.

---

## Button

### 공통 스펙
| 속성 | 값 |
|---|---|
| 높이 | 40px |
| Border Radius | `rounded-full` (20px, Pill Shape) |
| 폰트 | Label Large — 14px / font-weight 500 |
| 최소 패딩 (텍스트만) | 좌우 24px |
| 아이콘 포함 시 패딩 | 좌 16px / 우 24px |
| 아이콘 크기 | 18px |
| 아이콘-텍스트 간격 | 8px |
| Hover State Layer | 8% `on-*` 색상 오버레이 |
| Focus/Press State Layer | 12% `on-*` 색상 오버레이 |

---

### Filled Button (주요 CTA)

> 가장 강조되는 버튼. 페이지당 1개 권장.

| 속성 | 값 | KARS 토큰 |
|---|---|---|
| 배경 | Primary | `Primary-Main` (`#FF8036`) |
| 텍스트 | On Primary | `#FFFFFF` |
| 아이콘 | On Primary | `#FFFFFF` |
| Disabled 배경 | on-surface 12% | `Gray-Sub-Disabled-40` |
| Disabled 텍스트 | on-surface 38% | `Text-Low-70` |

```tsx
// Filled Button
<button className="h-10 px-6 bg-Primary-Main text-white rounded-full text-sm font-medium
                   hover:brightness-90 active:brightness-85 disabled:bg-Gray-Sub-Disabled-40
                   disabled:text-Text-Low-70 disabled:cursor-not-allowed transition-all">
  확인
</button>
```

---

### Filled Tonal Button (보조 CTA)

> Filled보다 덜 강조. 선택 상태나 보조 액션에 사용.

| 속성 | 값 | KARS 토큰 |
|---|---|---|
| 배경 | Primary Container | `Primary-Container` (`#FFEADE`) |
| 텍스트 | On Primary Container | `#3D1500` (진한 오렌지 계열) |
| Disabled 배경 | on-surface 12% | `Gray-Sub-Disabled-40` |
| Disabled 텍스트 | on-surface 38% | `Text-Low-70` |

```tsx
// Tonal Button
<button className="h-10 px-6 bg-Primary-Container text-[#3D1500] rounded-full text-sm font-medium
                   hover:bg-[#FFCFB3] active:bg-[#FFBF9E] disabled:bg-Gray-Sub-Disabled-40
                   disabled:text-Text-Low-70 disabled:cursor-not-allowed transition-all">
  추가
</button>
```

---

### Outlined Button (보조, 중립)

> 배경 없이 테두리만. 주요 액션과 대비되는 보조 액션.

| 속성 | 값 | KARS 토큰 |
|---|---|---|
| 배경 | Transparent | — |
| 테두리 | 1px, Outline | `Outline` (`#78818A`) |
| 텍스트 | Primary | `Primary-Main` (`#FF8036`) |
| Focus 테두리 | Primary | `Primary-Main` |
| Disabled 테두리 | on-surface 12% | `Gray-Sub-Disabled-40` |
| Disabled 텍스트 | on-surface 38% | `Text-Low-70` |

```tsx
// Outlined Button
<button className="h-10 px-6 bg-transparent text-Primary-Main border border-Outline rounded-full
                   text-sm font-medium hover:bg-Primary-Container/20 focus:border-Primary-Main
                   disabled:border-Gray-Sub-Disabled-40 disabled:text-Text-Low-70
                   disabled:cursor-not-allowed transition-all">
  취소
</button>
```

---

### Text Button (최소 강조)

> 배경·테두리 없음. 인라인 액션, 팝업 내 버튼에 사용.

| 속성 | 값 | KARS 토큰 |
|---|---|---|
| 배경 | Transparent | — |
| 텍스트 | Primary | `Primary-Main` (`#FF8036`) |
| 패딩 | 좌우 12px | — |
| Disabled 텍스트 | on-surface 38% | `Text-Low-70` |

```tsx
// Text Button
<button className="h-10 px-3 bg-transparent text-Primary-Main rounded-full text-sm font-medium
                   hover:bg-Primary-Container/30 active:bg-Primary-Container/50
                   disabled:text-Text-Low-70 disabled:cursor-not-allowed transition-all">
  더보기
</button>
```

---

### Elevated Button (부드러운 강조)

> 그림자가 있는 버튼. Surface 위에서 떠 있는 느낌.

| 속성 | 값 | KARS 토큰 |
|---|---|---|
| 배경 | Surface Container Low | `Back-Low-10` (`#F9FAFD`) |
| 텍스트 | Primary | `Primary-Main` (`#FF8036`) |
| Shadow | Level 1 (1dp) | `shadow-sm` |
| Hover Shadow | Level 2 (3dp) | `shadow-md` |
| Disabled 배경 | on-surface 12% | `Gray-Sub-Disabled-40` |
| Disabled 텍스트 | on-surface 38% | `Text-Low-70` |

```tsx
// Elevated Button
<button className="h-10 px-6 bg-Back-Low-10 text-Primary-Main rounded-full text-sm font-medium
                   shadow-sm hover:shadow-md active:shadow-sm
                   disabled:bg-Gray-Sub-Disabled-40 disabled:text-Text-Low-70
                   disabled:shadow-none disabled:cursor-not-allowed transition-all">
  가져오기
</button>
```

---

## Chip

### 공통 스펙
| 속성 | 값 |
|---|---|
| 높이 | 32px |
| Border Radius | `rounded-lg` (8px) — M3 기준 (M2의 pill에서 변경됨) |
| 폰트 | Label Medium — 12px / font-weight 500 |
| 패딩 (텍스트만) | 좌우 16px |
| 패딩 (아이콘 있음) | 좌 8px / 우 16px |
| 아이콘 크기 | 18px |

---

### Assist Chip (작업 제안)

> 컨텍스트에 맞는 보조 액션 제안. 선택 상태 없음.

| 상태 | 배경 | 테두리 | 텍스트 |
|---|---|---|---|
| Default | 투명 | 1px `Outline` | `Text-High-90` |
| Hover | `Back-High-25` 8% | 1px `Outline` | `Text-High-90` |
| Disabled | 투명 | 1px `Gray-Sub-Disabled-40` | `Text-Low-70` |

```tsx
<button className="h-8 px-4 bg-transparent border border-Outline text-Text-High-90
                   rounded-lg text-xs font-medium hover:bg-Back-High-25
                   disabled:border-Gray-Sub-Disabled-40 disabled:text-Text-Low-70
                   disabled:cursor-not-allowed transition-all inline-flex items-center gap-2">
  <Icon size={16} />
  캘린더 추가
</button>
```

---

### Filter Chip (목록 필터링, 토글)

> 선택/해제 토글 가능. 필터 UI에 주로 사용.

| 상태 | 배경 | 테두리 | 텍스트 | 아이콘 |
|---|---|---|---|---|
| Unselected | 투명 | 1px `Outline` | `Text-High-90` | — |
| Selected | `Primary-Container` | 없음 | `Text-High-90` | 체크마크 표시 |
| Disabled | `Gray-Sub-Disabled-40` | 없음 | `Text-Low-70` | — |

```tsx
// Filter Chip (상태 토글)
const [selected, setSelected] = useState(false);
<button
  onClick={() => setSelected(!selected)}
  className={`h-8 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-2
    ${selected
      ? 'pl-2 pr-4 bg-Primary-Container text-Text-High-90 border-0'
      : 'px-4 bg-transparent text-Text-High-90 border border-Outline hover:bg-Back-High-25'
    }`}
>
  {selected && <Check size={16} />}
  승인 완료
</button>
```

---

### Input Chip (입력된 항목 태그, 제거 가능)

> 사용자가 입력/선택한 항목을 태그로 표시. X 버튼으로 제거.

| 상태 | 배경 | 테두리 | 텍스트 |
|---|---|---|---|
| Default | 투명 | 1px `Outline` | `Text-High-90` |
| Selected | `Back-High-25` | 없음 | `Text-High-90` |
| Disabled | 투명 | 1px `Gray-Sub-Disabled-40` | `Text-Low-70` |

```tsx
<div className="h-8 pl-3 pr-2 bg-transparent border border-Outline text-Text-High-90
                rounded-lg text-xs font-medium inline-flex items-center gap-1">
  <span>홍길동</span>
  <button onClick={onRemove} className="hover:bg-Back-High-25 rounded p-0.5">
    <X size={14} />
  </button>
</div>
```

---

### Suggestion Chip (자동완성 제안)

> 검색/입력 시 추천 항목 표시. 클릭 시 해당 값 입력.

| 상태 | 배경 | 테두리 | 텍스트 |
|---|---|---|---|
| Default | 투명 | 1px `Outline` | `Text-High-90` |
| Hover | `Back-High-25` | 1px `Outline` | `Text-High-90` |
| Disabled | 투명 | 1px `Gray-Sub-Disabled-40` | `Text-Low-70` |

```tsx
<button className="h-8 px-4 bg-transparent border border-Outline text-Text-High-90
                   rounded-lg text-xs font-medium hover:bg-Back-High-25
                   disabled:border-Gray-Sub-Disabled-40 disabled:text-Text-Low-70
                   disabled:cursor-not-allowed transition-all">
  휠체어
</button>
```

---

## 버튼 선택 가이드

```
페이지의 핵심 액션 (저장, 제출)    → Filled Button
핵심 액션과 대비되는 보조 액션     → Outlined Button
덜 강조된 보조 액션                → Tonal Button
카드/모달 내 텍스트 레벨 액션      → Text Button
그림자가 필요한 Floating 액션      → Elevated Button

필터/분류 토글                     → Filter Chip
검색 태그 표시                     → Input Chip
컨텍스트 액션 제안                 → Assist Chip
자동완성 추천                      → Suggestion Chip
```
