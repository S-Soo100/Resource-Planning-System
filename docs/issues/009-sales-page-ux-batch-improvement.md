# #009 판매 내역 페이지 UX 일괄 개선

## 유형: Improvement

## 요구사항

### 1. 안내 카드 접기(Collapsible) 처리
- 현재: 파란색 안내 카드가 항상 펼쳐져 있어 스크롤 필요
- 개선: 접을 수 있는 형태로 변경, 기본 접힌 상태

### 2. 검색 입력 debounce 적용
- 현재: 매 글자 입력 시 상태 즉시 변경 → 불필요한 리렌더
- 개선: 300ms debounce 적용

### 3. 엑셀 버튼 탭 색상 일관성
- 현재: 시연 탭에서도 엑셀 버튼이 파란색
- 개선: 활성 탭에 따라 파란색(발주) / 보라색(시연) 전환

### 4. 탭 전환 시 모서리 처리
- 현재: `rounded-tl-none`이 항상 적용됨
- 개선: 활성 탭 위치에 따라 동적으로 모서리 처리

### 5. 요약 카드 그리드 균형
- 현재: Admin 기준 7개 카드 → `grid-cols-4`에서 마지막 행 3개만 남음
- 개선: 기본 4개 / 마진 카드 3개 각각 별도 행으로 분리하여 균형 맞춤

### 6. formatDate 함수 중복 제거
- 현재: `page.tsx`와 `DemoSalesTable.tsx`에 동일 함수 존재
- 개선: `dateUtils.ts`의 기존 `formatDateForDisplay`(YY.MM.DD) 활용하여 통합

---

## 구현 계획

### 수정/생성 파일

| 파일 | 작업 |
|------|------|
| `src/hooks/useDebounce.ts` | 신규: debounce 훅 |
| `src/app/sales/page.tsx` | 수정: 안내 카드 접기, debounce, 엑셀 버튼 색상, 탭 모서리, formatDate 제거 |
| `src/components/sales/DemoSalesTable.tsx` | 수정: formatDate 제거, dateUtils 사용 |
| `src/components/sales/SalesSummary.tsx` | 수정: 그리드 레이아웃 개선 |

### 상세 변경

#### 1. useDebounce 훅 (신규)

```typescript
import { useState, useEffect } from "react";

export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};
```

#### 2. 안내 카드 접기

```tsx
const [isInfoOpen, setIsInfoOpen] = useState(false);

<div className="bg-blue-50 border border-blue-200 rounded-lg mb-6">
  <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="w-full p-4 flex items-center justify-between">
    <span>📊 어떤 데이터가 판매 내역에 포함되나요?</span>
    <ChevronDown className={`transform transition ${isInfoOpen ? 'rotate-180' : ''}`} />
  </button>
  {isInfoOpen && <div className="px-4 pb-4">...기존 내용...</div>}
</div>
```

#### 3. 검색 debounce

```tsx
const { searchQuery, setSearchQuery } = useSalesFilterStore();
const debouncedSearchQuery = useDebounce(searchQuery, 300);

// filters에서 debouncedSearchQuery 사용
const filters = { ...기존, searchQuery: debouncedSearchQuery };
```

#### 4. 엑셀 버튼 색상

```tsx
<button className={`... ${activeTab === 'demo' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
```

#### 5. 탭 모서리

```tsx
<div className={`... ${activeTab === 'order' ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
```

#### 6. SalesSummary 그리드

기본 카드 4개: `grid-cols-2 md:grid-cols-4`
마진 카드 3개: 별도 `grid-cols-3`로 분리

#### 7. formatDate 통합

`dateUtils.ts`의 `formatDateForDisplay` 사용 (YY.MM.DD 형식)
→ page.tsx, DemoSalesTable.tsx에서 로컬 formatDate 함수 삭제

---

## 검증 항목

1. `npm run build` 통과
2. E2E 테스트 전체 통과
3. 안내 카드 접기/펼치기 동작 확인
4. 검색 debounce 동작 확인 (300ms 지연 후 필터링)
5. 탭 전환 시 엑셀 버튼 색상 변경 확인
6. 탭 전환 시 모서리 자연스러운 연결 확인
7. Admin 기준 요약 카드 그리드 균형 확인
8. 날짜 표시 형식 일관성 확인

## 관련 이슈

- #008 판매 내역 & 마진 분석 페이지 UX 개선
- #006 매출마진 페이지 유료 시연 통합
