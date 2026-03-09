# 발주 상세 페이지 거래명세서 출력 기능

> **티켓**: E-014
> **유형**: Feature
> **상태**: 기획 완료
> **관련 페이지**: `orderRecord/[id]/page.tsx`, `sales/page.tsx`

## 개요

발주 상세 페이지(`/orderRecord/{id}`)에서 **거래명세서 출력** 버튼을 추가하여,
판매 내역 페이지(`/sales`)까지 가지 않고도 바로 거래명세서를 출력할 수 있도록 한다.

## 현재 상태

| 항목 | 상태 |
|------|------|
| 판매 내역 페이지 거래명세서 출력 | ✅ 구현 완료 |
| 발주 상세 페이지 거래명세서 출력 | ❌ 미구현 |

### 기존 구현 (판매 내역 페이지)

```
sales/page.tsx
  → handleOpenStatement(record: SalesRecord)
  → TransactionStatementModal({ record: SalesRecord })
    → PDF: window.print()
    → Excel: exportTransactionStatementToExcel()
```

- **모달 컴포넌트**: `src/components/sales/TransactionStatementModal.tsx`
- **엑셀 유틸**: `src/utils/exportTransactionStatementToExcel.ts`
- **입력 타입**: `SalesRecord` (판매 전용 타입)

## 문제점

`TransactionStatementModal`이 `SalesRecord` 타입만 받기 때문에,
`IOrderRecord` 타입을 사용하는 발주 상세 페이지에서는 직접 사용할 수 없다.

### 타입 비교

| 거래명세서에 필요한 데이터 | SalesRecord | IOrderRecord |
|---------------------------|-------------|--------------|
| `id` | ✅ `record.id` | ✅ `order.id` |
| `purchaseDate` | ✅ `record.purchaseDate` | ✅ `order.purchaseDate` |
| `orderItems` (품목, 단가, VAT) | ✅ `record.orderItems` | ✅ `order.orderItems` |
| `receiver` (수령자) | ✅ `record.originalOrder.receiver` | ✅ `order.receiver` |
| `receiverPhone` | ✅ `record.originalOrder.receiverPhone` | ✅ `order.receiverPhone` |
| `receiverAddress` | ✅ `record.originalOrder.receiverAddress` | ✅ `order.receiverAddress` |
| `supplierName` (공급받는자) | ✅ `record.supplierName` | ✅ `order.supplier.supplierName` |
| `totalPrice` | ✅ `record.totalPrice` | ✅ `order.totalPrice` |
| `requester` (요청자/담당자) | ✅ `record.originalOrder.requester` | ✅ `order.requester` |

> **결론**: `IOrderRecord`에 거래명세서 생성에 필요한 모든 데이터가 존재함.

## 구현 계획

### 방안: IOrderRecord → SalesRecord 변환 함수

모달과 엑셀 유틸을 수정하지 않고, **변환 함수**를 만들어서 기존 컴포넌트를 재사용한다.

#### 장점
- 기존 `TransactionStatementModal` 수정 불필요
- 기존 `exportTransactionStatementToExcel` 수정 불필요
- 판매 내역 페이지의 동작에 영향 없음

### 구현 단계

#### 1단계: 변환 함수 작성

**파일**: `src/utils/orderToSalesRecord.ts`

```typescript
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { SalesRecord } from "@/types/sales";
import { Order } from "@/types/(order)/order";

/**
 * IOrderRecord → SalesRecord 변환
 * 발주 상세 페이지에서 거래명세서 모달을 재사용하기 위한 어댑터
 */
export function orderToSalesRecord(order: IOrderRecord): SalesRecord {
  const orderItems = order.orderItems || [];

  // originalOrder 구성 (TransactionStatementModal이 사용하는 필드)
  const originalOrder: Order = {
    id: order.id,
    title: order.title,
    receiver: order.receiver,
    receiverPhone: order.receiverPhone,
    receiverAddress: order.receiverAddress,
    requester: order.requester,
    purchaseDate: order.purchaseDate,
    supplier: {
      supplierName: order.supplier?.supplierName || "",
    },
    orderItems: orderItems,
    totalPrice: order.totalPrice,
  } as Order;

  return {
    id: order.id,
    purchaseDate: order.purchaseDate,
    title: order.title,
    supplierName: order.supplier?.supplierName || "",
    receiver: order.receiver,
    itemCount: orderItems.length,
    totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: order.totalPrice ?? null,
    status: order.status,
    manager: order.manager,
    memo: order.memo || null,
    orderItems: orderItems,
    originalOrder: originalOrder,
  };
}
```

#### 2단계: 발주 상세 페이지에 버튼 추가

**파일**: `src/app/orderRecord/[id]/page.tsx`

**추가할 import:**
```typescript
import { FileText } from "lucide-react";
import { TransactionStatementModal } from "@/components/sales/TransactionStatementModal";
import { orderToSalesRecord } from "@/utils/orderToSalesRecord";
```

**추가할 상태:**
```typescript
const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
```

**버튼 위치**: 기존 상단 액션 버튼 영역 (인쇄 버튼 옆)

```tsx
<button
  onClick={() => setIsStatementModalOpen(true)}
  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm"
>
  <FileText className="w-4 h-4" />
  거래명세서
</button>
```

**모달 렌더링 (페이지 하단):**
```tsx
{order && (
  <TransactionStatementModal
    isOpen={isStatementModalOpen}
    onClose={() => setIsStatementModalOpen(false)}
    record={orderToSalesRecord(order)}
  />
)}
```

#### 3단계: 출력 가능 조건

거래명세서는 **판매가 정보가 입력된 발주**에서만 의미가 있으므로:

```typescript
// 판매가가 하나라도 입력된 경우에만 버튼 표시
const hasSellingPrice = order?.orderItems?.some(
  (item) => item.sellingPrice != null && item.sellingPrice > 0
);
```

단, 판매가 미입력 상태에서도 버튼은 보여주되 (0원으로 표시), 숨기지 않는 것이 더 나을 수 있음.
→ **결정**: 버튼은 항상 표시, 판매가 미입력 시 금액 0원으로 출력.

## 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `src/utils/orderToSalesRecord.ts` | **신규** - 변환 함수 |
| `src/app/orderRecord/[id]/page.tsx` | 버튼 + 모달 추가 |
| `src/components/sales/TransactionStatementModal.tsx` | 변경 없음 |
| `src/utils/exportTransactionStatementToExcel.ts` | 변경 없음 |

## UI 배치

```
┌─────────────────────────────────────────┐
│ ← 목록으로   발주 상세 #123             │
│                                         │
│  [인쇄] [거래명세서]  ... [삭제]        │
│                                         │
│  ┌─ 기본 정보 ──────────────────────┐   │
│  │ 고객명: ...                      │   │
│  │ 수령인: ...                      │   │
│  └──────────────────────────────────┘   │
│  ...                                    │
└─────────────────────────────────────────┘
```

## 체크리스트

- [ ] `orderToSalesRecord` 변환 함수 작성
- [ ] 발주 상세 페이지에 거래명세서 버튼 추가
- [ ] `TransactionStatementModal` import 및 렌더링
- [ ] 빌드 테스트 (`npm run build`)
