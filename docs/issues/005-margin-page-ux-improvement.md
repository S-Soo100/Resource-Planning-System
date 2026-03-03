# [Improvement] 매출마진 관리 페이지 UX 개선 (날짜 필터링 & 필터 상태 보존)

- **유형**: Improvement
- **우선순위**: P2
- **영역**: 매출마진 관리 (`/sales`) / 날짜 필터링 / 네비게이션
- **상태**: 열림
- **생성일**: 2026-03-03

---

## 현재 문제

### 1. 날짜 필터링 Preset 버튼 미작동
`MonthRangePicker.tsx`에 5개의 프리셋 버튼(이번 달, 최근 3개월, 최근 6개월, 올해, 작년)이 UI에 표시되지만 **클릭해도 필터에 반영되지 않는 문제**.

### 2. 날짜 필터링 조작 어려움
현재 연도/월을 개별 드롭다운으로 선택하는 방식이 직관적이지 않아 사용성 저하.

### 3. 상세 페이지 이동 후 필터 초기화
판매 목록에서 거래 상세(`/orderRecord/:id`)로 이동 후 뒤로가기를 누르면 **모든 필터(날짜, 고객, 검색어 등)가 초기값으로 리셋**됨.

---

## 근본 원인 분석

### Preset 버튼
- `MonthRangePicker.tsx`에 preset 배열은 정의되어 있으나 클릭 핸들러가 부모 컴포넌트의 `onStartDateChange`/`onEndDateChange`와 제대로 연결되지 않았을 가능성

### 필터 상태 보존
- 필터 상태가 `useState`로만 관리됨 (URL params, localStorage, Zustand 미사용)
- `router.push("/orderRecord/${id}")`로 페이지 이동 시 React 컴포넌트 unmount → state 소실
- 뒤로가기 시 `/sales` 컴포넌트가 새로 mount되며 초기값으로 리셋

```typescript
// 현재 구현 — state만 사용
const [filters, setFilters] = useState<SalesFilterParams>({
  startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  // ...
});
```

---

## 영향 범위

| 파일 | 역할 |
|------|------|
| `src/components/common/MonthRangePicker.tsx` | 날짜 필터 프리셋 버튼 |
| `src/app/sales/page.tsx` | 매출마진 메인 페이지 (필터 상태 관리) |
| `src/hooks/useSalesData.ts` | 판매 데이터 조회 훅 (queryKey에 필터 포함) |

---

## 완료 조건 (Acceptance Criteria)

- [ ] **AC-1**: Preset 버튼(이번 달, 최근 3개월, 최근 6개월, 올해, 작년) 클릭 시 날짜 필터가 즉시 반영됨
- [ ] **AC-2**: 날짜 필터링 UX가 개선됨 (preset 버튼 활성 상태 표시, 선택된 기간 시각적 피드백)
- [ ] **AC-3**: `/orderRecord/:id` 상세 페이지에서 뒤로가기 시 이전 필터 상태가 복원됨
- [ ] **AC-4**: 필터 상태 보존이 다른 필터(고객, 검색어, 정렬 등)에도 적용됨

---

## 제안 해결 방안

### AC-1, AC-2: Preset 버튼 수정
`MonthRangePicker.tsx`의 preset 클릭 핸들러가 `onStartDateChange`/`onEndDateChange` 콜백을 올바르게 호출하도록 수정. 활성 preset에 하이라이트 스타일 적용.

### AC-3, AC-4: 필터 상태 보존

**방안 A: URL Search Params (권장)**
```typescript
// 필터를 URL에 반영 — 뒤로가기 시 자동 복원
/sales?startDate=2026-01-01&endDate=2026-03-31&supplierId=5
```

**방안 B: Zustand + sessionStorage**
```typescript
// 메뉴 탭 상태처럼 Zustand store로 관리
const useSalesFilterStore = create(persist(..., { storage: sessionStorage }));
```

---

## 참고 문서
- `/docs/margin-analysis.md`
- `/docs/sales-management.md`
- `/docs/menu-tab-state-management.md` (탭 상태 보존 패턴 참고)

## 예상 작업량
M (Medium)
