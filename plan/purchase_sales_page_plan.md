# 구매/판매 페이지 기획서

## 1. 구매 페이지

### 1.1 목적
- 팀의 모든 입고 내역과 원가 정보를 기반으로 기간별 구매 현황을 분석하고 시각화
- 입고된 아이템의 원가를 통해 총 구매 비용 파악

### 1.2 데이터 소스
- **API**: `GET /api/inventory` (입고 내역 조회)
- **기준 데이터**: `InventoryRecord` 중 `inboundQuantity > 0`인 입고 건만 필터링
- **원가 정보**: `inventoryRecord.item.teamItem.costPrice`

### 1.3 UI 구성

#### 1.3.1 페이지 상단 필터
```
┌─────────────────────────────────────────────────────────────┐
│ 📦 구매 내역                                                 │
│                                                              │
│ [기간 선택]                                                  │
│   시작일: [2024-01-01] ~ 종료일: [2024-01-31]               │
│                                                              │
│ [창고 선택] [전체 ▼]                                         │
│ [공급처 선택] [전체 ▼]                                       │
│ [카테고리 필터] [전체] [휠체어] [기타물품] ...               │
│                                                              │
│ [조회] [엑셀 다운로드]                                       │
└─────────────────────────────────────────────────────────────┘
```

**필터 기본값**:
- 기간: 현재 월의 1일 ~ 말일
- 창고: 전체
- 공급처: 전체
- 카테고리: 전체

#### 1.3.2 요약 카드
```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ 총 입고 건수  │ 총 품목 수    │ 총 입고 수량  │ 총 구매 금액  │
│  150건        │  45개         │  320개        │ ₩12,450,000   │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

#### 1.3.3 메인 테이블 (엑셀 스타일)

**테이블 구조**:
| No | 입고일자 | 품목코드 | 품목명 | 카테고리 | 수량 | 단가 | 금액 | 공급처 | 창고 | 비고 |
|----|---------|---------|--------|----------|------|------|------|--------|------|------|
| 1  | 2024-01-05 | WH-001 | 휠체어 A | 휠체어 | 5 | ₩500,000 | ₩2,500,000 | A공급처 | 본사창고 | - |
| 2  | 2024-01-08 | AC-002 | 보조기기 B | 기타물품 | 10 | ₩50,000 | ₩500,000 | B공급처 | 본사창고 | 급함 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| **합계** | | | | | **320** | | **₩12,450,000** | | | |

**컬럼 설명**:
- **No**: 행 번호 (자동 증가)
- **입고일자**: `inboundDate` (YYYY-MM-DD)
- **품목코드**: `item.teamItem.itemCode`
- **품목명**: `item.teamItem.itemName`
- **카테고리**: `item.teamItem.category.name` + 색상 태그
- **수량**: `inboundQuantity`
- **단가**: `item.teamItem.costPrice` (원가) - 우측 정렬, 천 단위 구분자
- **금액**: `수량 × 단가` (계산 필드) - 우측 정렬, 천 단위 구분자
- **공급처**: `supplier.supplierName` (없으면 "-")
- **창고**: `inboundLocation` (없으면 "-")
- **비고**: `remarks` (없으면 "-")

**테이블 기능**:
- ✅ 정렬: 입고일자, 품목명, 품목코드, 수량, 금액
- ✅ 행 클릭: 상세 모달 열기 (입고 건 상세 정보 + 첨부파일)
- ✅ 호버: `hover:bg-gray-50`
- ✅ 합계 행: 배경색 `bg-blue-50`, 굵은 텍스트
- ✅ 반응형: 모바일에서는 카드 형태로 전환

#### 1.3.4 추가 기능
- **엑셀 다운로드**: 현재 필터된 데이터를 xlsx 파일로 다운로드
- **페이지네이션**: 20개씩 표시 (기본값), 50개/100개 옵션
- **검색**: 품목코드, 품목명, 비고로 검색

---

## 2. 판매 페이지

### 2.1 목적
- 팀의 모든 발주 내역을 기반으로 판매처, 판매내역, 판매금액을 기간별로 분석하고 시각화
- 기간별 총 판매품목과 판매 비용 파악

### 2.2 데이터 소스
- **API**: `GET /api/order` (발주 내역 조회)
- **기준 데이터**: `Order` (상태 무관, 전체 발주 건)
- **판매가 정보**:
  - `order.totalPrice` (전체 주문 판매가)
  - `orderItem.sellingPrice` (개별 품목 판매가)

### 2.3 UI 구성

#### 2.3.1 페이지 상단 필터
```
┌─────────────────────────────────────────────────────────────┐
│ 💰 판매 내역                                                 │
│                                                              │
│ [기간 선택]                                                  │
│   시작일: [2024-01-01] ~ 종료일: [2024-01-31]               │
│                                                              │
│ [판매처(공급처) 선택] [전체 ▼]                               │
│ [상태 필터] [전체] [진행중] [완료] [취소]                    │
│ [패키지/개별] [전체] [패키지] [개별]                         │
│                                                              │
│ [조회] [엑셀 다운로드]                                       │
└─────────────────────────────────────────────────────────────┘
```

**필터 기본값**:
- 기간: 현재 월의 1일 ~ 말일 (`purchaseDate` 기준)
- 판매처: 전체
- 상태: 전체
- 패키지/개별: 전체

#### 2.3.2 요약 카드
```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ 총 발주 건수  │ 총 품목 수    │ 총 판매 수량  │ 총 판매 금액  │
│  85건         │  120개        │  280개        │ ₩45,600,000   │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

**계산 로직**:
- **총 발주 건수**: 필터링된 `Order` 개수
- **총 품목 수**: 모든 발주의 `orderItems` 배열 길이 합계
- **총 판매 수량**: 모든 `orderItem.quantity` 합계
- **총 판매 금액**:
  - `order.totalPrice`가 있으면 합계
  - 없으면 `Σ(orderItem.sellingPrice × orderItem.quantity)` 계산

#### 2.3.3 메인 테이블 (엑셀 스타일)

**테이블 구조 (발주 단위)**:
| No | 발주일자 | 제목 | 판매처 | 수령인 | 품목 수 | 총 금액 | 상태 | 담당자 | 비고 |
|----|---------|------|--------|--------|---------|---------|------|--------|------|
| 1  | 2024-01-05 | 강남구청 휠체어 납품 | 강남구청 | 홍길동 | 3종 5개 | ₩2,500,000 | 완료 | 김팀장 | - |
| 2  | 2024-01-08 | 서초구 보조기기 | 서초구청 | 이영희 | 2종 10개 | ₩800,000 | 진행중 | 박대리 | 급함 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| **합계** | | | | | **15종 280개** | **₩45,600,000** | | | |

**컬럼 설명**:
- **No**: 행 번호 (자동 증가)
- **발주일자**: `purchaseDate` (YYYY-MM-DD)
- **제목**: `title`
- **판매처**: `supplier.supplierName`
- **수령인**: `receiver`
- **품목 수**: `orderItems.length`종 + `Σ(orderItem.quantity)`개 (예: "3종 15개")
- **총 금액**: `totalPrice` 또는 계산 (우측 정렬, 천 단위 구분자)
- **상태**: `status` (색상 태그: 진행중-파랑, 완료-초록, 취소-빨강)
- **담당자**: `manager`
- **비고**: `memo` (없으면 "-")

**행 클릭 시 확장 (상세 품목)**:
```
┌──────────────────────────────────────────────────────────────────┐
│   품목명          품목코드     수량    단가         금액          │
│   휠체어 A        WH-001       2      ₩500,000    ₩1,000,000     │
│   보조기기 B      AC-002       3      ₩300,000    ₩900,000       │
│   기타 C          ET-003       10     ₩60,000     ₩600,000       │
│                                                                   │
│   [출고일]: 2024-01-10  [설치일]: 2024-01-12                     │
│   [주소]: 서울시 강남구 테헤란로 123                              │
│   [연락처]: 010-1234-5678                                         │
└──────────────────────────────────────────────────────────────────┘
```

**테이블 기능**:
- ✅ 정렬: 발주일자, 제목, 판매처, 총 금액, 상태
- ✅ 행 클릭: 하단에 상세 품목 확장 (OrderRecordTable 참고)
- ✅ 호버: `hover:bg-gray-50`
- ✅ 합계 행: 배경색 `bg-blue-50`, 굵은 텍스트
- ✅ NEW 배지: 72시간 이내 발주 건 표시
- ✅ 반응형: 모바일에서는 카드 형태로 전환

#### 2.3.4 추가 기능
- **엑셀 다운로드**:
  - Sheet 1: 발주 요약 (위 테이블)
  - Sheet 2: 품목 상세 (모든 orderItem 펼친 리스트)
- **페이지네이션**: 20개씩 표시 (기본값), 50개/100개 옵션
- **검색**: 제목, 판매처, 수령인, 담당자로 검색

---

## 3. 공통 기술 스펙

### 3.1 라우팅
- **구매 페이지**: `/purchase` 또는 `/analytics/purchase`
- **판매 페이지**: `/sales` 또는 `/analytics/sales`

### 3.2 권한 관리
- **Admin**: 모든 기능 접근
- **Moderator**: 읽기 전용 + 엑셀 다운로드
- **User**: 읽기 전용
- **Supplier**: 자신이 관련된 공급처만 필터링

### 3.3 상태 관리
- **React Query**:
  - `['purchase', { startDate, endDate, warehouseId, supplierId }]`
  - `['sales', { startDate, endDate, supplierId, status }]`
- **URL 쿼리 파라미터**: 필터 상태 유지 (StockTable 참고)

### 3.4 참고 컴포넌트
| 기능 | 참고 파일 |
|------|----------|
| 테이블 정렬 | `OrderRecordTable.tsx` |
| 행 확장 | `IoHistoryList.tsx` |
| 필터링 | `StockTable.tsx` |
| 합계 행 | `OrderRecordTable.tsx` |
| 카테고리 태그 | `StockTableDesktop.tsx` |
| 날짜 필터 | `IoHistoryList.tsx` |
| 엑셀 다운로드 | (신규 구현 필요 - xlsx 라이브러리 사용) |

### 3.5 스타일 가이드
- **테마 색상**: 파란색 계열 (`blue-500`, `blue-600`)
- **합계 행**: `bg-blue-50 border-t-2 border-blue-200`
- **호버**: `hover:bg-gray-50`
- **정렬 아이콘**: Lucide React (`ArrowUp`, `ArrowDown`, `ArrowUpDown`)
- **카테고리 태그**: `getColorClasses()` 함수 재사용

### 3.6 엑셀 다운로드 구현
```bash
npm install xlsx
```

```typescript
import * as XLSX from 'xlsx';

const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
```

---

## 4. 구현 순서 (권장)

### Phase 1: 구매 페이지
1. ✅ 타입 정의: `PurchaseRecord`, `PurchaseSummary`
2. ✅ API 훅: `usePurchaseData()`
3. ✅ 필터 컴포넌트: `PurchaseFilter.tsx`
4. ✅ 요약 카드: `PurchaseSummary.tsx`
5. ✅ 테이블: `PurchaseTable.tsx` (정렬, 호버, 합계)
6. ✅ 엑셀 다운로드: `exportPurchaseToExcel()`
7. ✅ 페이지 통합: `app/purchase/page.tsx`

### Phase 2: 판매 페이지
1. ✅ 타입 정의: `SalesRecord`, `SalesSummary`
2. ✅ API 훅: `useSalesData()`
3. ✅ 필터 컴포넌트: `SalesFilter.tsx`
4. ✅ 요약 카드: `SalesSummary.tsx`
5. ✅ 테이블: `SalesTable.tsx` (행 확장, 정렬, 합계)
6. ✅ 엑셀 다운로드: `exportSalesToExcel()` (2 sheets)
7. ✅ 페이지 통합: `app/sales/page.tsx`

### Phase 3: 테스트 및 최적화
1. ✅ 반응형 테스트 (모바일 카드 전환)
2. ✅ 권한별 접근 테스트
3. ✅ 성능 최적화 (대용량 데이터)
4. ✅ 네비게이션 메뉴 추가

---

## 5. 데이터 흐름 예시

### 5.1 구매 페이지 데이터 흐름
```
사용자 입력 (날짜, 창고, 공급처)
      ↓
usePurchaseData() 훅 호출
      ↓
GET /api/inventory?startDate=...&endDate=...&warehouseId=...
      ↓
InventoryRecord[] 받음
      ↓
필터링: inboundQuantity > 0
      ↓
매핑: {
  inboundDate,
  itemCode,
  itemName,
  category,
  quantity: inboundQuantity,
  unitPrice: item.teamItem.costPrice,
  totalPrice: quantity × unitPrice,
  supplier,
  warehouse,
  remarks
}
      ↓
PurchaseTable 렌더링
```

### 5.2 판매 페이지 데이터 흐름
```
사용자 입력 (날짜, 판매처, 상태)
      ↓
useSalesData() 훅 호출
      ↓
GET /api/order?startDate=...&endDate=...&supplierId=...
      ↓
Order[] 받음 (orderItems 포함)
      ↓
매핑: {
  purchaseDate,
  title,
  supplier,
  receiver,
  itemCount: orderItems.length,
  totalQuantity: Σ(orderItem.quantity),
  totalPrice: order.totalPrice || Σ(orderItem.sellingPrice × quantity),
  status,
  manager,
  memo,
  orderItems: [...]  // 확장용
}
      ↓
SalesTable 렌더링
```

---

## 6. 추가 고려사항

### 6.1 원가 정보 보안
- **구매 페이지**: 원가가 노출되므로 권한 제한 필요
  - Admin, Moderator만 접근 가능
  - User, Supplier는 접근 차단 또는 금액 마스킹

### 6.2 null 값 처리 방안

#### 6.2.1 구매 페이지 - 원가(costPrice)가 null인 경우
**표시 방법**:
- **단가 컬럼**: "-" 또는 "미입력" 표시 (회색 텍스트)
- **금액 컬럼**: "-" 또는 "미입력" 표시
- **합계 계산**: null 값은 제외하고 계산 (0으로 취급하지 않음)
- **경고 표시**: 테이블 상단에 "원가 미입력 품목: X건" 배지 표시

**처리 로직**:
```typescript
const unitPrice = item.teamItem.costPrice ?? null;
const amount = unitPrice !== null ? quantity * unitPrice : null;

// 합계 계산
const totalAmount = records.reduce((sum, record) => {
  return record.amount !== null ? sum + record.amount : sum;
}, 0);

// 미입력 건수
const missingCostCount = records.filter(r => r.unitPrice === null).length;
```

**UI 예시**:
| No | 입고일자 | 품목명 | 수량 | 단가 | 금액 |
|----|---------|--------|------|------|------|
| 1  | 2024-01-05 | 휠체어 A | 5 | ₩500,000 | ₩2,500,000 |
| 2  | 2024-01-08 | 보조기기 B | 10 | <span style="color:gray">미입력</span> | <span style="color:gray">-</span> |

**추가 기능**:
- 원가 미입력 품목만 필터링하는 옵션 추가
- 엑셀 다운로드 시 "원가 미입력" 시트 별도 생성

#### 6.2.2 판매 페이지 - 판매가(totalPrice, sellingPrice)가 null인 경우
**표시 방법**:
- **총 금액 컬럼**: "-" 또는 "미입력" 표시 (회색 텍스트)
- **합계 계산**: null 값은 제외하고 계산
- **경고 표시**: 테이블 상단에 "판매가 미입력 발주: X건" 배지 표시

**계산 우선순위**:
1. `order.totalPrice`가 있으면 사용
2. 없으면 `Σ(orderItem.sellingPrice × quantity)` 계산
3. orderItem.sellingPrice도 null이면 해당 품목은 제외하고 계산
4. 모든 품목이 null이면 전체 "-" 표시

**처리 로직**:
```typescript
const calculateOrderTotal = (order: Order) => {
  // 1순위: order.totalPrice
  if (order.totalPrice !== null) {
    return order.totalPrice;
  }

  // 2순위: orderItems 합계
  const itemsTotal = order.orderItems.reduce((sum, item) => {
    if (item.sellingPrice !== null) {
      return sum + (item.sellingPrice * item.quantity);
    }
    return sum;
  }, 0);

  // 모든 품목이 null이면 null 반환
  const hasAnyPrice = order.orderItems.some(item => item.sellingPrice !== null);
  return hasAnyPrice ? itemsTotal : null;
};

// 합계 계산
const totalSales = orders.reduce((sum, order) => {
  const orderTotal = calculateOrderTotal(order);
  return orderTotal !== null ? sum + orderTotal : sum;
}, 0);

// 미입력 건수
const missingPriceCount = orders.filter(o => calculateOrderTotal(o) === null).length;
```

**UI 예시**:
| No | 발주일자 | 제목 | 품목 수 | 총 금액 |
|----|---------|------|---------|---------|
| 1  | 2024-01-05 | 강남구청 납품 | 3종 5개 | ₩2,500,000 |
| 2  | 2024-01-08 | 서초구 발주 | 2종 10개 | <span style="color:gray">미입력</span> |

**확장 행에서 품목별 표시**:
| 품목명 | 수량 | 단가 | 금액 |
|--------|------|------|------|
| 휠체어 A | 2 | ₩500,000 | ₩1,000,000 |
| 보조기기 B | 3 | <span style="color:gray">미입력</span> | <span style="color:gray">-</span> |
| **소계** | | | **₩1,000,000** |

**추가 기능**:
- 판매가 미입력 발주만 필터링하는 옵션 추가
- 엑셀 다운로드 시 "판매가 미입력" 시트 별도 생성
- 미입력 발주 건에 대해 "가격 입력" 버튼 추가 (수정 모달 열기)

### 6.3 판매가 입력 유도
- 현재 `order.totalPrice`, `orderItem.sellingPrice`가 optional
- 판매 페이지에서 정확한 분석을 위해 입력 유도 필요
- 발주 생성/수정 폼에서 필수 입력으로 변경 검토
- null 값이 많으면 데이터 분석의 정확도 하락

### 6.4 통계 차트 추가 (선택)
- **구매 페이지**:
  - 카테고리별 구매 금액 파이 차트
  - 월별 구매 추이 라인 차트
- **판매 페이지**:
  - 판매처별 매출 비중 파이 차트
  - 월별 매출 추이 라인 차트

### 6.5 인쇄 기능 (선택)
- `window.print()` 기능 추가
- 인쇄 시 필터, 버튼 숨김 (`print:hidden` 클래스)

---

## 7. 예상 파일 구조

```
src/
├── app/
│   ├── purchase/
│   │   └── page.tsx                    # 구매 페이지
│   └── sales/
│       └── page.tsx                    # 판매 페이지
├── components/
│   ├── purchase/
│   │   ├── PurchaseFilter.tsx          # 필터 컴포넌트
│   │   ├── PurchaseSummary.tsx         # 요약 카드
│   │   ├── PurchaseTable.tsx           # 메인 테이블
│   │   └── PurchaseTableMobile.tsx     # 모바일 카드
│   └── sales/
│       ├── SalesFilter.tsx             # 필터 컴포넌트
│       ├── SalesSummary.tsx            # 요약 카드
│       ├── SalesTable.tsx              # 메인 테이블
│       ├── SalesTableMobile.tsx        # 모바일 카드
│       └── SalesDetailRow.tsx          # 확장 상세 행
├── hooks/
│   ├── usePurchaseData.ts              # 구매 데이터 훅
│   └── useSalesData.ts                 # 판매 데이터 훅
├── types/
│   ├── purchase.ts                     # 구매 타입
│   └── sales.ts                        # 판매 타입
└── utils/
    ├── exportPurchaseToExcel.ts        # 구매 엑셀 다운로드
    └── exportSalesToExcel.ts           # 판매 엑셀 다운로드
```

---

## 8. UI 목업 링크

### 8.1 구매 페이지 목업
```
참고: OrderRecordTable.tsx (합계 행, 정렬)
참고: IoHistoryList.tsx (날짜 필터)
참고: StockTable.tsx (창고 선택, 카테고리 필터)
```

### 8.2 판매 페이지 목업
```
참고: OrderRecordTable.tsx (전체 구조)
참고: IoHistoryList.tsx (행 확장)
참고: StockTableDesktop.tsx (카테고리 태그)
```

---

## 9. 완료 체크리스트

### 구매 페이지
- [ ] 타입 정의 완료
- [ ] API 훅 구현
- [ ] 필터 컴포넌트
- [ ] 요약 카드
- [ ] 테이블 (정렬, 호버, 합계)
- [ ] 엑셀 다운로드
- [ ] 반응형 (모바일)
- [ ] 권한 제어
- [ ] 테스트

### 판매 페이지
- [ ] 타입 정의 완료
- [ ] API 훅 구현
- [ ] 필터 컴포넌트
- [ ] 요약 카드
- [ ] 테이블 (정렬, 호버, 합계, 행 확장)
- [ ] 엑셀 다운로드 (2 sheets)
- [ ] 반응형 (모바일)
- [ ] 권한 제어
- [ ] 테스트

### 공통
- [ ] 네비게이션 메뉴 추가
- [ ] 문서 업데이트 (CHANGELOG.md)
- [ ] 빌드 테스트

---

## 10. 질문 사항

1. **구매 페이지 권한**: Admin/Moderator만 접근 vs 모든 사용자 접근 (금액 마스킹)?
2. **엑셀 다운로드**: 모든 권한 허용 vs Admin/Moderator만?
3. **통계 차트**: 필요한가? (선택 기능)
4. **인쇄 기능**: 필요한가? (선택 기능)
5. **판매가 입력**: 현재 optional인데 필수로 변경할지?
6. **네비게이션 위치**: 메인 메뉴 vs 서브 메뉴?

---

끝! 질문 있으면 언제든 말해줘 😊
