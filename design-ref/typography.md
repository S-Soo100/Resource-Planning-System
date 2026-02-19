# KARS 타이포그래피 (Material Design 3 기반)

> M3 Type Scale을 KARS 환경(Pretendard 폰트, px 단위)에 맞게 번역한 정의서.
> 기본 폰트: `Pretendard` (M3 기본 Roboto 대체)

---

## 타입 스케일 전체 목록

| Scale | Size | Weight | Line Height | Letter Spacing | 용도 |
|---|---|---|---|---|---|
| **Display Large** | 57px | 400 | 64px | -0.25px | 히어로 텍스트, 랜딩 페이지 |
| **Display Medium** | 45px | 400 | 52px | 0px | 대형 섹션 제목 |
| **Display Small** | 36px | 400 | 44px | 0px | 중형 섹션 제목 |
| **Headline Large** | 32px | 400 | 40px | 0px | 페이지 제목 |
| **Headline Medium** | 28px | 400 | 36px | 0px | 주요 섹션 헤더 |
| **Headline Small** | 24px | 400 | 32px | 0px | 서브섹션 헤더 |
| **Title Large** | 22px | 400 | 28px | 0px | 카드 제목, 모달 제목 |
| **Title Medium** | 16px | 500 | 24px | 0.15px | 리스트 항목 제목, 강조 레이블 |
| **Title Small** | 14px | 500 | 20px | 0.1px | 소형 카드 제목, 탭 레이블 |
| **Body Large** | 16px | 400 | 24px | 0.5px | 기본 본문 텍스트 |
| **Body Medium** | 14px | 400 | 20px | 0.25px | 보조 본문, 설명 텍스트 |
| **Body Small** | 12px | 400 | 16px | 0.4px | 캡션, 도움말 텍스트 |
| **Label Large** | 14px | 500 | 20px | 0.1px | 버튼 텍스트, 네비게이션 레이블 |
| **Label Medium** | 12px | 500 | 16px | 0.5px | 칩 텍스트, 배지 |
| **Label Small** | 11px | 500 | 16px | 0.5px | 오버라인, 최소 레이블 |

---

## KARS 실용 매핑

KARS에서 실제로 자주 쓰는 용도별 권장 스케일:

| 용도 | 권장 Scale | Tailwind 클래스 |
|---|---|---|
| 페이지 제목 | Headline Large | `text-3xl font-normal leading-10` |
| 섹션 헤더 | Headline Small | `text-2xl font-normal leading-8` |
| 카드 제목 | Title Large | `text-xl font-normal leading-7` |
| 리스트 항목 제목 | Title Medium | `text-base font-medium leading-6` |
| 기본 본문 | Body Large | `text-base font-normal leading-6` |
| 보조 설명 | Body Medium | `text-sm font-normal leading-5` |
| 버튼 텍스트 | Label Large | `text-sm font-medium leading-5` |
| 칩 텍스트 | Label Medium | `text-xs font-medium leading-4` |
| 캡션/힌트 | Body Small | `text-xs font-normal leading-4` |
| 테이블 헤더 | Title Small | `text-sm font-medium leading-5` |
| 테이블 셀 | Body Medium | `text-sm font-normal leading-5` |

---

## 사용 규칙

### DO ✅
- 위계(Hierarchy)를 명확히: 제목 > 본문 > 캡션 순으로 크기 감소
- 강조는 font-weight로: 같은 크기에서 400 → 500 → 600으로 강조
- 색상과 함께 위계 표현: 제목 `Text-Highest-100`, 본문 `Text-High-90`, 캡션 `Text-Low-70`

### DON'T ❌
- 같은 페이지에서 5가지 이상의 크기 혼용
- `font-bold (700)` 남발 — M3는 최대 500(Medium) 권장 (600은 강조 용도로 제한적 사용)
- `text-[13px]` 같은 임의 크기 — 스케일 외 값 사용 지양

---

## 폰트 설정 참고

```css
/* globals.css */
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

```tsx
// Tailwind에서 폰트 패밀리 지정 시
className="font-['Pretendard']"

// 또는 tailwind.config.ts에 fontFamily 추가 권장
fontFamily: {
  pretendard: ['Pretendard', 'sans-serif'],
}
```
