# API 변경 사항: 입출고 기록 목적 구분 필드 추가 (recordPurpose)

**날짜**: 2026-02-12
**하위호환**: O (기존 API 호출에 영향 없음)

---

## 변경 개요

입출고 기록의 목적을 구분하기 위해 `recordPurpose` 필드가 추가됩니다.
기존에는 창고 간 이동, 구매, 판매 등이 모두 동일한 입출고 기록으로 저장되어 구매/판매 금액 집계 시 구분이 불가능했습니다.

| 대상            | 추가 필드       | 타입             | 설명             |
| --------------- | --------------- | ---------------- | ---------------- |
| InventoryRecord | `recordPurpose` | `string \| null` | 입출고 목적 구분 |

---

## recordPurpose 허용 값

| 값             | 설명           | 자동 설정 여부             |
| -------------- | -------------- | -------------------------- |
| `purchase`     | 구매 입고      | 수동 (사용자 직접 선택)    |
| `sale`         | 판매 출고      | 자동 (주문 출고 시)        |
| `transfer`     | 창고 간 이동   | 수동 (사용자 직접 선택)    |
| `demo_out`     | 시연 출고      | 자동 (시연 출고 시)        |
| `demo_return`  | 시연 반납      | 자동 (시연 반납 시)        |
| `order_return` | 주문 반납      | 자동 (주문 취소/반납 시)   |
| `initial`      | 초기 재고 등록 | 자동 (아이템 초기 등록 시) |
| `adjustment`   | 재고 조정      | 수동 (사용자 직접 선택)    |
| `other`        | 기타           | 수동 (사용자 직접 선택)    |

---

## API 변경 상세

### 1. 입출고 기록 생성

#### POST /inventory-record

**Request Body 추가 필드:**

```json
{
  "inboundDate": "2023-05-01T09:00:00.000Z",
  "inboundQuantity": 100,
  "inboundLocation": "서울 창고",
  "itemId": 3,
  "warehouseId": 1,
  "recordPurpose": "purchase"
}
```

> `recordPurpose`는 선택사항입니다. 전송하지 않으면 `null`로 저장됩니다.

---

### 2. 입출고 기록 수정

#### PATCH /inventory-record/:id

**Request Body 추가 필드:**

```json
{
  "recordPurpose": "transfer"
}
```

> 기존 입출고 기록의 목적을 변경할 수 있습니다.

---

### 3. 입출고 기록 조회

#### GET /inventory-record/team/:teamId (팀별 조회)

**Response 추가 필드:**

```json
[
  {
    "id": 1,
    "inboundDate": "2025-05-01T09:00:00.000Z",
    "outboundDate": null,
    "inboundLocation": "서울 창고",
    "outboundLocation": null,
    "inboundQuantity": 100,
    "outboundQuantity": null,
    "remarks": "초기 입고",
    "recordPurpose": "purchase",
    "packageId": null,
    "itemId": 3,
    "userId": 1,
    "supplierId": 1,
    "orderId": null,
    "warehouseId": 1,
    "createdAt": "2025-05-01T09:00:00.000Z",
    "updatedAt": "2025-05-01T09:00:00.000Z",
    "deletedAt": null,
    "item": {
      "id": 3,
      "itemQuantity": 100,
      "warehouseId": 1,
      "teamItemId": 5,
      "createdAt": "2025-05-01T09:00:00.000Z",
      "updatedAt": "2025-05-01T09:00:00.000Z",
      "deletedAt": null,
      "teamItem": {
        "id": 5,
        "itemCode": "ITM-001",
        "itemName": "노트북",
        "memo": null
      }
    },
    "supplier": { "...": "..." },
    "package": null,
    "user": { "...": "..." },
    "order": null,
    "warehouse": { "...": "..." },
    "files": []
  }
]
```

---

### 4. 자동 설정되는 경우

아래 상황에서는 서버가 자동으로 `recordPurpose`를 설정합니다. 프론트엔드에서 별도 처리가 필요하지 않습니다.

| 상황             | recordPurpose  | 트리거                          |
| ---------------- | -------------- | ------------------------------- |
| 주문 출고 완료   | `sale`         | 주문 상태 → `shipmentCompleted` |
| 주문 취소/반납   | `order_return` | `shipmentCompleted` → 다른 상태 |
| 시연 출고 완료   | `demo_out`     | 시연 상태 → `shipmentCompleted` |
| 시연 반납        | `demo_return`  | `shipmentCompleted` → 다른 상태 |
| 아이템 초기 등록 | `initial`      | 아이템 생성 시 수량 > 0         |

---

## 프론트엔드 적용 가이드

### 수동 입출고 기록 생성 시

입출고 기록 생성 폼에 **목적 선택** 드롭다운을 추가합니다.

**추천 UI:**

```
목적 구분: [선택 안 함 ▼]
  ├─ 구매 입고 (purchase)
  ├─ 판매 출고 (sale)
  ├─ 창고 간 이동 (transfer)
  ├─ 재고 조정 (adjustment)
  └─ 기타 (other)
```

> `demo_out`, `demo_return`, `order_return`, `initial`은 자동 생성 전용이므로 수동 생성 시 선택지에서 **제외하는 것을 권장**합니다.

### 입출고 목록 표시 시

`recordPurpose` 값을 한글 라벨로 변환하여 표시합니다.

```typescript
const RECORD_PURPOSE_LABELS: Record<string, string> = {
  purchase: '구매',
  sale: '판매',
  transfer: '창고이동',
  demo_out: '시연출고',
  demo_return: '시연반납',
  order_return: '주문반납',
  initial: '초기등록',
  adjustment: '재고조정',
  other: '기타',
};
```

> `recordPurpose`가 `null`인 경우 (기존 데이터) 빈 값 또는 "미분류"로 표시합니다.

### 금액 집계 시 필터링

구매/판매 금액 집계 시 `recordPurpose`로 필터링합니다.

| 집계 목적 | 포함할 recordPurpose |
| --------- | -------------------- |
| 구매 금액 | `purchase`           |
| 판매 금액 | `sale`               |
| 시연 출고 | `demo_out`           |
| 시연 반납 | `demo_return`        |

> `transfer`, `adjustment`, `initial`은 금액 집계에서 **제외**합니다.

---

## 주의사항

### 기존 데이터

- 기존 입출고 기록의 `recordPurpose`는 모두 `null`
- `null` 체크 필수 (`recordPurpose ?? '미분류'`)

### 하위 호환성

- 모든 새 필드는 **선택사항(nullable)**
- 기존 API 호출 방식 그대로 사용 가능
- `recordPurpose`를 전송하지 않아도 오류 발생하지 않음

---
