# 고객 상세 페이지 기능 명세 (v2.5)

## 개요
고객(Supplier) 상세 페이지는 특정 고객과의 모든 거래 내역(판매 & 구매)을 통합 조회하고 분석하는 기능을 제공합니다. 고객별 매출/매입 현황을 한눈에 파악할 수 있으며, 권한별로 마진 정보를 제공합니다.

---

## 주요 파일

### 페이지 컴포넌트
- **경로**: `src/app/supplier/[id]/page.tsx`
- **역할**: 고객 상세 정보 및 거래 내역 통합 표시
- **주요 기능**:
  - 고객 기본 정보 표시
  - 판매/구매 요약 통계 (4개 카드)
  - 판매 내역 탭 (발주 데이터 기반)
  - 구매 내역 탭 (입고 데이터 기반)
  - 반응형 디자인 (데스크톱: 테이블, 모바일: 카드)

### 데이터 훅
- **경로**: `src/hooks/useSupplierDetail.ts`
- **역할**: 고객 상세 데이터 통합 조회
- **쿼리 키**:
  - Supplier: `['supplier', supplierId]`
  - Sales: `['sales', teamId, startDate, endDate, supplierId, ...]`
  - Purchase: `['purchase', teamId, startDate, endDate, supplierId, ...]`
- **반환 데이터**:
  - `supplier`: 고객 기본 정보
  - `salesRecords`: 판매 레코드 배열
  - `salesSummary`: 판매 요약 정보
  - `purchaseRecords`: 구매 레코드 배열
  - `purchaseSummary`: 구매 요약 정보
  - `summary`: 통합 요약 통계
  - `dateRange`: 조회 날짜 범위

### 타입 정의
- **경로**: `src/types/supplier.ts`
- **주요 타입**:
  - `SupplierDetailSummary`: 고객 상세 요약 통계

### 컴포넌트
- **SupplierDetailHeader** (`src/components/supplier/SupplierDetailHeader.tsx`)
  - 고객 기본 정보 카드
  - 고객명, 대표자명, 전화번호, 이메일, 사업자등록번호, 주소, 메모 표시
  - "정보 수정" 버튼 (Admin/Moderator만)

- **SupplierDetailSummaryComponent** (`src/components/supplier/SupplierDetailSummary.tsx`)
  - 요약 통계 4개 카드
  - 총 판매 건수, 총 판매 금액, 총 구매 건수, 총 구매 금액
  - 마진 정보 (Admin/Moderator만)

- **SupplierSalesTab** (`src/components/supplier/SupplierSalesTab.tsx`)
  - 판매 내역 탭 (발주 데이터 기반)
  - 요청/반려/출고자반려 상태 자동 제외
  - 데스크톱: 테이블형, 모바일: 카드형
  - 발주 상세 페이지 링크

- **SupplierPurchaseTab** (`src/components/supplier/SupplierPurchaseTab.tsx`)
  - 구매 내역 탭 (입고 데이터 기반)
  - 실시간 원가 정보 표시
  - 데스크톱: 테이블형, 모바일: 카드형

---

## 데이터 구조

### SupplierDetailSummary
```typescript
{
  // 판매 관련
  totalSalesOrders: number;    // 총 판매 건수
  totalSalesAmount: number;    // 총 판매 금액 (VAT 포함)
  totalMargin?: number;        // 총 마진액 (Admin/Moderator만)
  averageMarginRate?: number;  // 평균 마진율 (Admin/Moderator만)

  // 구매 관련
  totalPurchaseOrders: number; // 총 구매 건수
  totalPurchaseAmount: number; // 총 구매 금액 (원가)
}
```

---

## URL 구조

```
/supplier/[id]
```

**예시**:
- `/supplier/123` - ID가 123인 고객 상세 페이지

---

## 페이지 구조

### 1. 헤더 섹션
- **뒤로가기 버튼**: 이전 페이지로 이동
- **고객 기본 정보 카드**:
  - 고객명 (대제목) + 회사 아이콘
  - 대표자명, 전화번호, 이메일
  - 사업자등록번호, 주소, 메모
  - "정보 수정" 버튼 (Admin/Moderator만)

### 2. 요약 통계 카드 (4개)
1. **총 판매 건수** (파란색)
   - 아이콘: ShoppingCart
   - 값: N건

2. **총 판매 금액** (파란색)
   - 아이콘: TrendingUp
   - 값: ₩X,XXX
   - 서브텍스트: 평균 마진율 X.X% (Admin/Moderator만)

3. **총 구매 건수** (녹색)
   - 아이콘: Package
   - 값: N건

4. **총 구매 금액** (녹색)
   - 아이콘: DollarSign
   - 값: ₩X,XXX

### 3. 탭 UI
#### 탭 1: 판매 내역 (Sales)
- **데이터 소스**: Order 데이터 (`supplierId` 일치)
- **필터링**: 요청/반려/출고자반려 상태 제외
- **테이블 컬럼** (데스크톱):
  - No
  - 발주일자 (YYYY-MM-DD)
  - 제목
  - 수령인
  - 품목 수 (N개)
  - 총 수량 (N개)
  - 판매 금액 (₩X,XXX)
  - 마진율 (X.X%, Admin/Moderator만, 역마진 빨간색)
  - 상태 (승인완료/출고완료 등)
  - 상세 (발주 상세 페이지 링크)

- **카드 레이아웃** (모바일):
  - 헤더: 제목 + 상태 배지
  - 본문: 수령인, 품목 수, 총 수량, 판매 금액, 마진율
  - 푸터: "상세 보기" 버튼

#### 탭 2: 구매 내역 (Purchase)
- **데이터 소스**: InventoryRecord (`supplierId` 일치, `recordPurpose = 'inbound'`)
- **테이블 컬럼** (데스크톱):
  - No
  - 입고일자 (YYYY-MM-DD)
  - 품목코드
  - 품목명
  - 수량 (N개)
  - 단가 (원가, ₩X,XXX 또는 "미입력")
  - 금액 (₩X,XXX)
  - 비고

- **카드 레이아웃** (모바일):
  - 헤더: 품목명 + 금액
  - 본문: 입고일자, 수량, 단가, 비고

---

## 데이터 흐름

```
사용자 진입 (/supplier/123)
  ↓
useSupplierDetail 훅 호출
  ↓
병렬 API 호출 (React Query)
  ├─ supplierApi.getSupplier(123)       [고객 기본 정보]
  ├─ useSalesData({ supplierId: 123 }) [판매 데이터]
  └─ usePurchaseData({ supplierId: 123 }) [구매 데이터]
  ↓
데이터 통합 & 요약 계산
  ├─ 판매 요약 (총 건수, 총 금액, 마진)
  └─ 구매 요약 (총 건수, 총 금액)
  ↓
컴포넌트 렌더링
  ├─ SupplierDetailHeader (기본 정보)
  ├─ SupplierDetailSummaryComponent (4개 통계 카드)
  └─ Tabs
      ├─ SupplierSalesTab (판매 내역)
      └─ SupplierPurchaseTab (구매 내역)
```

---

## 주요 기능 상세

### 1. 날짜 범위 설정
- **기본값**: 최근 3개월 (현재일 기준)
- **계산 로직**:
  ```typescript
  const startDate = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  ```

### 2. 권한별 표시
- **Admin/Moderator**:
  - 마진 정보 표시 (마진액, 마진율, 평균 마진율)
  - "정보 수정" 버튼 표시

- **User/Supplier**:
  - 마진 정보 숨김
  - "정보 수정" 버튼 숨김

### 3. 상태 필터링 (판매 탭)
자동으로 다음 상태를 제외:
- `requested` (요청)
- `rejected` (반려)
- `rejectedByShipper` (출고자 반려)

**포함 상태**:
- `approved` (승인완료)
- `confirmedByShipper` (출고자 확인)
- `shipmentCompleted` (출고완료)

### 4. 반응형 디자인
- **데스크톱 (≥760px)**: 테이블 레이아웃
- **모바일 (<760px)**: 카드 레이아웃
- **미디어 쿼리**: `window.innerWidth < 760`

### 5. 실시간 원가 표시 (구매 탭)
- **데이터 소스**: `teamItemsMap` (TeamItem의 최신 원가)
- **계산 로직**:
  ```typescript
  const costPrice = teamItemsMap.get(teamItemId)?.costPrice ?? null;
  const totalPrice = costPrice !== null ? quantity * costPrice : null;
  ```

---

## 스타일링

### 색상 테마
| 섹션       | 색상                              | 용도                  |
| ---------- | --------------------------------- | --------------------- |
| 판매       | `blue-600`, `blue-50`             | 판매 관련 UI          |
| 구매       | `green-600`, `green-50`           | 구매 관련 UI          |
| 마진       | `purple-600`                      | 마진 정보 강조        |
| 역마진     | `red-600`                         | 역마진 경고           |
| 승인완료   | `blue-100`, `blue-700`            | 상태 배지             |
| 출고완료   | `green-100`, `green-700`          | 상태 배지             |
| 기타 상태  | `gray-100`, `gray-700`            | 상태 배지             |

### 레이아웃
- **컨테이너**: `p-4 md:p-6`
- **카드**: `rounded-2xl shadow-sm border border-Outline-Variant p-6`
- **간격**: `mb-6` (섹션 간)
- **그리드**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` (요약 카드)

---

## 사용자 경험 (UX)

### 로딩 상태
- **전체 로딩**: 중앙 스피너 + "데이터를 불러오는 중..." 메시지
- **탭별 로딩**: 각 탭 내부에 스피너 표시

### 에러 처리
1. **고객 정보 없음**:
   - 아이콘: ⚠️
   - 메시지: "고객 정보를 찾을 수 없습니다"
   - 액션: "고객 목록으로 돌아가기" 버튼

2. **로그인 필요**:
   - 아이콘: 🔒
   - 메시지: "로그인이 필요합니다"
   - 액션: "로그인 페이지로 이동" 버튼

### 빈 데이터
- **판매 탭**: FileText 아이콘 + "판매 내역이 없습니다" + "해당 기간 내 판매 거래가 없습니다"
- **구매 탭**: Package 아이콘 + "구매 내역이 없습니다" + "해당 기간 내 구매 거래가 없습니다"

---

## 네비게이션

### 진입 경로
1. **고객 목록 페이지**:
   - URL: `/supplier`
   - 고객명 클릭 → `/supplier/[id]`

2. **판매 페이지**:
   - URL: `/sales`
   - 판매처명 클릭 → `/supplier/[supplierId]`

3. **구매 페이지**:
   - URL: `/purchase`
   - 공급처명 클릭 → `/supplier/[supplierId]`

4. **발주 목록 페이지** (모바일):
   - URL: `/orderRecord`
   - 수령자 클릭 → `/supplier/[supplierId]`

### 이탈 경로
1. **뒤로가기 버튼**: `router.back()` (이전 페이지)
2. **"정보 수정" 버튼**: `/supplier?edit=[id]` (고객 목록 페이지 + 수정 모달)
3. **"상세 보기" 버튼**: `/orderRecord/[orderId]` (발주 상세 페이지)

---

## 성능 최적화

### React Query 캐싱
- **고객 정보**: `staleTime: 30분` (변경 빈도 낮음)
- **판매 데이터**: `staleTime: 5분`
- **구매 데이터**: `staleTime: 5분`

### useMemo 최적화
```typescript
// 요약 통계 계산 메모이제이션
const summary = useMemo(() => {
  // 복잡한 계산 로직
}, [salesQuery.data, purchaseQuery.data]);

// 필터링된 레코드 메모이제이션
const filteredRecords = useMemo(() => {
  // 필터링 로직
}, [records]);
```

### 병렬 API 호출
```typescript
// 고객 정보, 판매 데이터, 구매 데이터 동시 조회
useSupplierDetail(supplierId) {
  const supplierQuery = useGetSupplier(supplierId);
  const salesQuery = useSalesData({ supplierId });
  const purchaseQuery = usePurchaseData({ supplierId });
  // ...
}
```

---

## API 명세

### 사용 API
1. **고객 정보 조회**:
   - `supplierApi.getSupplier(supplierId)`
   - 반환: `Supplier` 객체

2. **판매 데이터 조회**:
   - `useSalesData({ supplierId, startDate, endDate })`
   - 내부적으로 `getOrdersByTeamId()` 호출 후 클라이언트 필터링
   - 반환: `{ records: SalesRecord[], summary: SalesSummary }`

3. **구매 데이터 조회**:
   - `usePurchaseData({ supplierId, startDate, endDate })`
   - 내부적으로 `inventoryRecordApi.getInventoryRecordsByTeamId()` 호출 후 클라이언트 필터링
   - 반환: `{ records: PurchaseRecord[], summary: PurchaseSummary, teamItemsMap }`

---

## 개선 필요 사항

### Phase 1 (완료)
- [x] 기본 정보 표시
- [x] 판매/구매 내역 테이블
- [x] 요약 통계 (4개 카드)
- [x] 반응형 디자인 (모바일/데스크톱)
- [x] 권한별 마진 정보 표시

### Phase 2 (향후 개선)
- [ ] **날짜 범위 선택기**: 사용자가 직접 조회 기간 설정 (최근 1개월, 3개월, 6개월, 1년, 전체)
- [ ] **거래 트렌드 차트**: 월별 판매/구매 금액 추이 그래프
- [ ] **품목별 거래 분석**: 해당 고객과 가장 많이 거래한 품목 TOP 10
- [ ] **거래 알림 설정**: 월 N회 이상 거래 시 알림
- [ ] **거래명세서 일괄 발송**: 판매 내역 선택 → 이메일 발송
- [ ] **즐겨찾기 고객**: 자주 찾는 고객 북마크
- [ ] **메모 기능**: 고객별 영업 메모 추가
- [ ] **엑셀 다운로드**: 판매/구매 내역 엑셀 export
- [ ] **인쇄 최적화**: 프린터 친화적 레이아웃

### 데이터 정확성
- [ ] 시연품 거래 별도 표시 (구매 금액 뻥튀기 방지)
- [ ] 반품/교환 내역 추가 (별도 탭)
- [ ] 미수금/미지급금 관리

### UI/UX
- [ ] 스켈레톤 UI 개선 (섹션별 독립 로딩)
- [ ] 무한 스크롤 (테이블 페이지네이션)
- [ ] 정렬 기능 추가 (날짜, 금액 등)
- [ ] 검색 기능 추가 (품목명, 제목 등)

---

## 참고 문서
- [고객 관리 명세](./supplier-management.md) (작성 필요)
- [판매 관리 명세](./sales-management.md)
- [구매 관리 명세](./purchase-management.md)
- [발주 관리 명세](./order-management.md)
- [재고 관리 명세](./inventory-management.md)

---

## 버전 히스토리
- **v2.5.0** (2026-02-24): 고객 상세 페이지 신규 추가
  - 기본 정보 표시
  - 판매/구매 통합 조회
  - 요약 통계 (4개 카드)
  - 반응형 디자인
  - 권한별 마진 정보
