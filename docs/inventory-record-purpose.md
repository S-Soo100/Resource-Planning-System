# 입출고 기록 목적 구분 (recordPurpose)

**버전**: v2.1.0
**작성일**: 2026-02-13
**관련 백엔드 문서**: `/docs/2.2 backend notice/record-purpose-api-changes.md`

---

## 개요

입출고 기록에 `recordPurpose` 필드가 추가되어, 입출고의 목적(구매/판매/창고이동 등)을 명확히 구분할 수 있게 되었습니다. 이를 통해 구매/판매 금액 집계 시 불필요한 데이터를 제외하고 정확한 금액을 계산할 수 있습니다.

---

## recordPurpose 허용 값

| 값              | 한글 라벨  | 설정 방식 | 설명                           |
| --------------- | ---------- | --------- | ------------------------------ |
| `purchase`      | 구매       | 수동      | 구매 입고 (구매 금액 집계 포함) |
| `sale`          | 판매       | 자동      | 판매 출고 (발주 출고 시)        |
| `transfer`      | 창고이동   | 수동      | 창고 간 이동                   |
| `demo_out`      | 시연출고   | 자동      | 시연 출고 완료 시              |
| `demo_return`   | 시연반납   | 자동      | 시연 반납 시                   |
| `order_return`  | 주문반납   | 자동      | 주문 취소/반납 시              |
| `initial`       | 초기등록   | 자동      | 아이템 초기 등록 시            |
| `adjustment`    | 재고조정   | 수동      | 재고 조정                      |
| `other`         | 기타       | 수동      | 기타 목적                      |
| `null`          | 미분류     | -         | 기존 데이터 (하위 호환)        |

---

## 구현 내용

### 1. 타입 정의

**파일**:
- [src/types/(inventoryRecord)/inventory-record.ts](../src/types/(inventoryRecord)/inventory-record.ts)
- [src/types/(inventoryRecord)/inventory.ts](../src/types/(inventoryRecord)/inventory.ts)

```typescript
export interface InventoryRecord {
  // ... 기존 필드들
  recordPurpose?: string | null;  // 추가됨
}

export interface CreateInventoryRecordDto {
  // ... 기존 필드들
  recordPurpose?: string;  // 추가됨
}
```

### 2. 상수 정의

**파일**: [src/constants/recordPurpose.ts](../src/constants/recordPurpose.ts)

```typescript
// 한글 라벨 매핑
export const RECORD_PURPOSE_LABELS: Record<string, string> = {
  purchase: '구매',
  sale: '판매',
  transfer: '창고이동',
  // ... (전체 목록)
};

// 수동 선택 가능 목록 (자동 생성 전용 제외)
export const MANUAL_RECORD_PURPOSES = [
  { value: 'purchase', label: '구매 입고' },
  { value: 'sale', label: '판매 출고' },
  { value: 'transfer', label: '창고 간 이동' },
  { value: 'adjustment', label: '재고 조정' },
  { value: 'other', label: '기타' },
];

// 유틸 함수
export const getRecordPurposeLabel = (purpose: string | null | undefined): string => {
  if (!purpose) return '미분류';
  return RECORD_PURPOSE_LABELS[purpose] || '미분류';
};
```

### 3. 입출고 모달 UI

#### 입고 모달
**파일**: [src/components/stock/modal/InboundModal.tsx](../src/components/stock/modal/InboundModal.tsx:396-416)

- **선택 가능 목적**: 구매 입고, 창고 간 이동, 재고 조정, 기타
- **제외**: 판매 출고 (출고 전용)
- **기본값**: "선택 안 함" (undefined)

#### 출고 모달
**파일**: [src/components/stock/modal/OutboundModal.tsx](../src/components/stock/modal/OutboundModal.tsx:396-416)

- **선택 가능 목적**: 판매 출고, 창고 간 이동, 재고 조정, 기타
- **제외**: 구매 입고 (입고 전용)
- **기본값**: "선택 안 함" (undefined)

### 4. 입출고 목록 화면

**파일**: [src/components/ioHistory/IoHistoryList.tsx](../src/components/ioHistory/IoHistoryList.tsx)

- **테이블 컬럼 추가**: "목적" 컬럼 추가 (일자, 구분 다음)
- **표시 형식**: `getRecordPurposeLabel()`로 한글 라벨 표시
- **기존 데이터**: `null`인 경우 "미분류"로 표시

### 5. 입출고 상세 정보

**파일**: [src/components/ioHistory/InventoryRecordDetail.tsx](../src/components/ioHistory/InventoryRecordDetail.tsx:67-74)

- **표시 위치**: "구분" 다음, "품목" 이전
- **표시 형식**: 한글 라벨

### 6. 구매 관리 금액 집계

**파일**: [src/hooks/usePurchaseData.ts](../src/hooks/usePurchaseData.ts:22-25)

```typescript
// recordPurpose가 'purchase'가 아닌 경우 제외 (null인 기존 데이터는 포함)
if (inventory.recordPurpose && inventory.recordPurpose !== 'purchase') {
  return null;
}
```

- **포함**: `recordPurpose === 'purchase'` 또는 `null` (기존 데이터)
- **제외**: `transfer`, `adjustment`, `initial`, `demo_out`, `demo_return` 등

### 7. 판매 관리

**파일**: [src/hooks/useSalesData.ts](../src/hooks/useSalesData.ts)

- **별도 수정 불필요**: Order 기반 집계이므로 서버에서 자동으로 `recordPurpose = 'sale'` 설정
- 발주 출고 시 자동으로 판매 출고로 기록됨

---

## 사용 예시

### 입고 등록 (수동)

1. 입고 모달 열기
2. 품목, 수량, 날짜 등 입력
3. **목적 구분** 드롭다운에서 "구매 입고" 선택
4. 입고 완료 클릭

→ `recordPurpose = 'purchase'`로 저장됨

### 발주 출고 (자동)

1. 발주 상태를 "출고 완료"로 변경
2. 서버가 자동으로 입출고 기록 생성

→ `recordPurpose = 'sale'`로 자동 설정됨 (프론트 처리 불필요)

### 시연 출고/반납 (자동)

1. 시연 상태를 "출고 완료"로 변경
2. 서버가 자동으로 입출고 기록 생성

→ `recordPurpose = 'demo_out'`로 자동 설정됨

---

## 주의사항

### 1. 하위 호환성

- 기존 입출고 기록은 `recordPurpose = null`
- null 체크 필수: `recordPurpose ?? '미분류'`
- 구매 금액 집계 시 null도 포함 (기존 데이터 보호)

### 2. 자동 설정 목적

수동 입출고 UI에서 **제외해야 할 목적**:
- `demo_out`, `demo_return`: 시연 시스템에서 자동 설정
- `order_return`: 발주 취소 시 자동 설정
- `initial`: 아이템 생성 시 자동 설정

### 3. 금액 집계 로직

| 화면      | 포함 목적       | 제외 목적                                      |
| --------- | --------------- | ---------------------------------------------- |
| 구매 관리 | `purchase`, null | `transfer`, `adjustment`, `initial`, `demo_*` |
| 판매 관리 | `sale`          | 기타 모두 (Order 기반이므로 자동 필터링)       |

---

## 향후 개선 사항

1. **필터링 기능**: 입출고 목록에서 목적별 필터 추가 가능
2. **통계 분석**: 목적별 입출고 현황 대시보드
3. **문서화**: 입출고 관리 전체 문서 작성 (`/docs/inbound-management.md`, `/docs/outbound-management.md`)

---

## 관련 파일

### 수정된 파일 (10개)

1. `src/types/(inventoryRecord)/inventory-record.ts`
2. `src/types/(inventoryRecord)/inventory.ts`
3. `src/constants/recordPurpose.ts` (신규)
4. `src/components/stock/modal/InboundModal.tsx`
5. `src/components/stock/modal/OutboundModal.tsx`
6. `src/components/ioHistory/IoHistoryList.tsx`
7. `src/components/ioHistory/InventoryRecordDetail.tsx`
8. `src/hooks/usePurchaseData.ts`
9. `src/api/inventory-record-api.ts` (타입만 자동 반영)
10. `src/services/inventoryRecordService.ts` (타입만 자동 반영)

### 참고 문서

- 백엔드 API 명세: `/docs/2.2 backend notice/record-purpose-api-changes.md`
- 구매 관리: `/docs/purchase-management.md`
- 판매 관리: `/docs/sales-management.md`
- 발주 관리: `/docs/order-management.md`
- 시연 관리: `/docs/demonstration-management.md`
