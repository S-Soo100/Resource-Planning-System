# 구매 관리 기능 명세

## 개요
구매 관리 페이지는 입고(Inbound) 데이터를 기반으로 구매 내역을 조회하고 분석하는 기능을 제공합니다. 입고 데이터를 구매 관점에서 재구성하여 표시하며, 엑셀 다운로드 기능을 포함합니다.

## 주요 파일

### 페이지 컴포넌트
- **경로**: `src/app/purchase/page.tsx`
- **역할**: 구매 내역 조회 및 표시
- **주요 기능**:
  - 반응형 디자인 (데스크톱: 테이블형, 모바일: 카드형)
  - 날짜 범위 필터 (기본값: 이번 달)
  - 창고, 공급처, 카테고리, 검색어 필터
  - 정렬 기능 (입고일자, 공급처, 품목코드, 품목명, 수량, 금액)
  - 엑셀 다운로드

### 데이터 훅
- **경로**: `src/hooks/usePurchaseData.ts`
- **역할**: 구매 데이터 조회 및 캐싱
- **API 엔드포인트**: `GET /api/purchase`
- **쿼리 키**: `['purchase', filters]`
- **반환 데이터**:
  - `records`: 구매 레코드 배열
  - `summary`: 구매 요약 정보

### 타입 정의
- **경로**: `src/types/purchase.ts`
- **주요 타입**:
  - `PurchaseRecord`: 구매 레코드 (입고 기반)
  - `PurchaseSummary`: 구매 요약 정보
  - `PurchaseFilterParams`: 필터 파라미터
  - `PurchaseSortConfig`: 정렬 설정

### 컴포넌트
- **PurchaseSummary** (`src/components/purchase/PurchaseSummary.tsx`)
  - 구매 요약 정보 카드
  - 총 입고 건수, 총 품목 수, 총 구매 수량, 총 구매 금액 표시

### 유틸리티
- **exportPurchaseToExcel** (`src/utils/exportPurchaseToExcel.ts`)
  - 구매 데이터 엑셀 다운로드
  - SheetJS(xlsx) 라이브러리 사용

## 데이터 구조

### PurchaseRecord
```typescript
{
  id: number;                    // 입고 ID
  inboundDate: string;           // 입고일자 (YYYY-MM-DD)
  warehouseName: string;         // 창고명
  supplierName: string | null;   // 공급처명 (null 가능)
  itemCode: string;              // 품목코드
  itemName: string;              // 품목명
  categoryName: string | null;   // 카테고리명 (null 가능)
  quantity: number;              // 입고 수량
  unitPrice: number | null;      // 단가 (원가, null: 미입력)
  totalPrice: number | null;     // 총 금액 (수량 × 단가, null: 미입력)
  remarks: string | null;        // 비고
}
```

### PurchaseSummary
```typescript
{
  totalInbounds: number;         // 총 입고 건수
  totalItems: number;            // 총 품목 수 (중복 제거)
  totalQuantity: number;         // 총 구매 수량
  totalAmount: number;           // 총 구매 금액 (원가 미입력 제외)
  missingCostCount: number;      // 원가 미입력 건수
}
```

## 주요 기능 상세

### 1. 필터링
- **날짜 범위**: startDate ~ endDate (기본값: 이번 달)
- **시연품 창고 제외**: 창고명에 '시연'이 포함된 입고 내역 자동 제외
  - 시연품은 여러 번 입고/출고가 반복되어 구매 총액이 뻥튀기되는 것을 방지
- **창고**: warehouseId로 필터링
- **공급처**: supplierId로 필터링
- **카테고리**: categoryId로 필터링
- **검색어**: 품목코드, 품목명, 비고 검색

### 2. 정렬
- **지원 필드**:
  - inboundDate: 입고일자
  - supplierName: 공급처명
  - itemCode: 품목코드
  - itemName: 품목명
  - quantity: 수량
  - totalPrice: 금액
- **방향**: asc(오름차순) / desc(내림차순)
- **기본값**: inboundDate desc

### 3. 반응형 디자인
- **데스크톱 (≥760px)**: 테이블형 레이아웃
  - 컬럼: No, 공급처, 입고일자, 품목코드, 품목명, 수량, 단가, 금액, 비고
  - 합계 행 표시 (파란색 배경)

- **모바일 (<760px)**: 카드형 레이아웃
  - 헤더: 품목명 + 금액
  - 본문: 공급처, 입고일자, 단가, 비고
  - 합계 카드 (파란색 배경)

- **미디어 쿼리**: `useMediaQuery` 훅 사용
  ```typescript
  const isMobile = useMediaQuery('(max-width: 759px)');
  ```

### 4. 엑셀 다운로드
- **라이브러리**: SheetJS (xlsx)
- **파일명**: `구매내역_YYYYMMDD_HHmmss.xlsx`
- **시트명**: "구매 내역"
- **포함 컬럼**:
  - No
  - 입고일자
  - 창고
  - 공급처
  - 품목코드
  - 품목명
  - 카테고리
  - 수량
  - 단가
  - 금액
  - 비고

### 5. 요약 정보
- **총 입고 건수**: 필터링된 레코드 수
- **총 품목 수**: 중복 제거한 품목 수
- **총 구매 수량**: 모든 수량의 합계
- **총 구매 금액**: 원가가 입력된 품목의 금액 합계
- **원가 미입력 건수**: unitPrice가 null인 건수

### 6. 알림 메시지
- **원가 미입력 경고**:
  - 조건: missingCostCount > 0
  - 배경색: 노란색 (yellow-50)
  - 아이콘: AlertCircle
  - 메시지: "원가 미입력 품목: N건"

## 데이터 흐름

```
1. 사용자가 필터 설정
   ↓
2. usePurchaseData 훅이 API 호출
   ↓
3. 입고 데이터를 구매 레코드로 변환
   ↓
4. 시연품 창고 입고 내역 제외 (창고명에 '시연' 포함된 경우)
   ↓
5. React Query가 데이터 캐싱
   ↓
6. 페이지 컴포넌트가 데이터 정렬
   ↓
7. 테이블/카드로 렌더링
   ↓
8. 사용자가 엑셀 다운로드 클릭
   ↓
9. exportPurchaseToExcel 실행
   ↓
10. XLSX 파일 생성 및 다운로드
```

## API 명세

### GET /api/purchase
구매 내역 조회

**쿼리 파라미터**:
- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)
- `warehouseId`: 창고 ID (선택)
- `supplierId`: 공급처 ID (선택)
- `categoryId`: 카테고리 ID (선택)
- `searchQuery`: 검색어 (선택)

**응답**:
```typescript
{
  records: PurchaseRecord[];
  summary: PurchaseSummary;
}
```

## 가격 계산 로직

```typescript
// 단가가 있는 경우에만 총 금액 계산
const totalPrice = unitPrice !== null
  ? quantity * unitPrice
  : null;

// 요약 정보 계산
const summary = {
  totalInbounds: records.length,
  totalItems: new Set(records.map(r => r.itemCode)).size,
  totalQuantity: records.reduce((sum, r) => sum + r.quantity, 0),
  totalAmount: records.reduce((sum, r) => {
    return sum + (r.totalPrice || 0);
  }, 0),
  missingCostCount: records.filter(r => r.unitPrice === null).length,
};
```

## 스타일링

### 색상
- **헤더 배경**: 회색 (gray-50)
- **테두리**: 회색 (gray-200)
- **합계 행 배경**: 파란색 (blue-50)
- **합계 금액 텍스트**: 파란색 (blue-600)
- **경고 배경**: 노란색 (yellow-50)
- **경고 텍스트**: 노란색 (yellow-800)

### 폰트
- **제목**: text-3xl (30px), font-bold
- **테이블 헤더**: text-xs (12px), font-medium
- **테이블 본문**: text-sm (14px)
- **합계 행**: text-sm (14px), font-bold

### 여백
- **컨테이너**: p-6
- **카드**: p-4
- **테이블 셀**: px-4 py-3
- **섹션 간격**: mb-6

## 사용자 경험 (UX)

### 로딩 상태
- **스켈레톤 UI**: LoadingSkeleton 컴포넌트 사용
- **타입**:
  - 데스크톱: 'table' (5개)
  - 모바일: 'card' (5개)
  - 요약: 'summary'

### 에러 상태
- **컴포넌트**: ErrorState
- **제목**: "데이터 조회 실패"
- **메시지**: "구매 내역을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
- **재시도**: window.location.reload()

### 빈 데이터
- **메시지**: "조회된 데이터가 없습니다."
- **위치**: 테이블/카드 중앙
- **스타일**: 회색 텍스트, py-12

## 테이블 상세

### 헤더
- **No**: 순번 (1부터 시작)
- **공급처**: 정렬 가능
- **입고일자**: 정렬 가능, YYYY-MM-DD 형식
- **품목코드**: 정렬 가능
- **품목명**: 정렬 가능
- **수량**: 정렬 가능, 천 단위 콤마
- **단가**: 천 단위 콤마, "₩" 접두사, 미입력 시 "미입력"
- **금액**: 정렬 가능, 천 단위 콤마, "₩" 접두사, 미입력 시 "-"
- **비고**: 최대 50자 (truncateRemarks 함수)

### 정렬 아이콘
- **없음**: ArrowUpDown (회색)
- **오름차순**: ArrowUp (파란색)
- **내림차순**: ArrowDown (파란색)

### 합계 행
- **컬럼 병합**: colSpan={5} (No ~ 품목명)
- **표시 정보**:
  - 좌측: "합계"
  - 수량 열: 총 수량
  - 금액 열: 총 금액 (파란색 강조)

## 카드 레이아웃 (모바일)

### 구조
```
┌─────────────────────────────────┐
│ [품목명]              [금액]     │
│ [품목코드]            [수량]     │
├─────────────────────────────────┤
│ 공급처: [공급처명]              │
│ 입고일자: [YYYY-MM-DD]          │
│ 단가: [₩X,XXX]                  │
│ ─────────────────────────       │
│ 비고: [비고 내용]               │
└─────────────────────────────────┘
```

### 합계 카드
```
┌─────────────────────────────────┐
│ 합계              [총 금액]      │
│                   [총 수량]      │
└─────────────────────────────────┘
```

## 유틸리티 함수

### formatDate
```typescript
// 날짜 포맷팅 (YYYY-MM-DD)
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy-MM-dd');
};
```

### truncateRemarks
```typescript
// 비고 텍스트 자르기 (50자 제한)
const truncateRemarks = (remarks: string | null) => {
  if (!remarks) return '-';
  return remarks.length > 50
    ? remarks.substring(0, 50) + '...'
    : remarks;
};
```

## 성능 최적화

### React Query 캐싱
- **staleTime**: 30초 (기본값)
- **cacheTime**: 5분 (기본값)
- **쿼리 키**: `['purchase', filters]`
- **자동 리페치**: focus, reconnect 시

### useMemo
```typescript
// 정렬된 레코드 메모이제이션
const sortedRecords = useMemo(() => {
  if (!data?.records) return [];
  return [...data.records].sort(sortFunction);
}, [data?.records, sortField, sortDirection]);
```

### 미디어 쿼리 최적화
```typescript
// 미디어 쿼리 이벤트 리스너 관리
useEffect(() => {
  const media = window.matchMedia(query);
  const listener = () => setMatches(media.matches);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
}, [matches, query]);
```

## 개선 필요 사항

### 데이터 정확성
- [ ] 원가 정보 일괄 입력 기능
- [ ] 원가 자동 계산 로직 (공급처별 기본 원가)
- [ ] 입고 수정 시 원가 업데이트 알림

### UI/UX
- [ ] 품목 상세 모달 (클릭 시)
- [ ] 공급처별 그룹핑 옵션
- [ ] 월별/분기별/연도별 비교 차트
- [ ] 원가 추이 그래프

### 데이터 분석
- [ ] 공급처별 구매 통계
- [ ] 카테고리별 구매 통계
- [ ] 월별 구매 트렌드
- [ ] 품목별 원가 변동 추이

### 엑셀 기능
- [ ] 템플릿 선택 (간단/상세)
- [ ] 차트 포함 옵션
- [ ] 다중 시트 (요약 + 상세)
- [ ] 자동 필터 및 서식 적용

## 참고 문서
- [입고 관리 명세](./inbound-management.md)
- [품목 관리 명세](./item-management.md)
- [창고 관리 명세](./warehouse-management.md)
- [공급처 관리 명세](./supplier-management.md)
