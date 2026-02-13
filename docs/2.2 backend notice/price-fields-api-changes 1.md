# API 변경 사항 안내 - 가격 필드 추가

> **배포 예정일**: TBD
> **하위 호환성**: 유지 (기존 API 정상 동작)

---

## 📋 변경 개요

ERP 시스템에 가격 관련 필드가 추가됩니다.

| 대상      | 추가 필드      | 타입             | 설명             |
| --------- | -------------- | ---------------- | ---------------- |
| TeamItem  | `costPrice`    | `number \| null` | 품목 원가        |
| OrderItem | `sellingPrice` | `number \| null` | 주문 품목 판매가 |
| OrderItem | `vat`          | `number \| null` | 주문 품목 세금   |
| Order     | `totalPrice`   | `number \| null` | 주문 총 판매가격 |

**모든 필드는 선택적(Optional)** 이며, 기존 API 호출은 변경 없이 정상 동작합니다.

---

## 🔄 API 변경 상세

### 1. TeamItem API

#### GET /team-item, GET /team-item/:id

**Response 추가 필드:**

```typescript
{
  id: number;
  itemCode: string;
  itemName: string;
  memo: string | null;
  costPrice: number | null; // 🆕 추가
  teamId: number;
  categoryId: number | null;
  // ...
}
```

#### POST /team-item, PATCH /team-item/:id

**Request Body 추가 필드:**

```typescript
{
  itemCode: string;
  itemName: string;
  teamId: number;
  // ...기존 필드
  costPrice?: number;  // 🆕 추가 (선택)
}
```

---

### 2. Order API

#### GET /order, GET /order/:id

**Response 추가 필드:**

```typescript
{
  id: number;
  userId: number;
  totalPrice: number | null;  // 🆕 추가
  // ...기존 필드
  orderItems: [
    {
      id: number;
      itemId: number;
      quantity: number;
      sellingPrice: number | null;  // 🆕 추가
      vat: number | null;           // 🆕 추가
      memo: string | null;
      item: {
        id: number;
        itemQuantity: number;
        teamItem: {
          id: number;
          itemCode: string;
          itemName: string;
          costPrice: number | null;  // 🆕 추가
          memo: string | null;
        };
        // ...
      };
    }
  ];
  // ...
}
```

#### POST /order

**Request Body 추가 필드:**

```typescript
{
  userId: number;
  totalPrice?: number;  // 🆕 추가 (선택)
  orderItems: [
    {
      itemId: number;
      quantity: number;
      sellingPrice?: number;  // 🆕 추가 (선택)
      vat?: number;           // 🆕 추가 (선택)
      memo?: string;
    }
  ];
  // ...기존 필드
}
```

#### PATCH /order/:id

**Request Body 추가 필드:**

```typescript
{
  totalPrice?: number;  // 🆕 추가 (선택)
  orderItems?: [
    {
      itemId: number;
      quantity: number;
      sellingPrice?: number;  // 🆕 추가 (선택)
      vat?: number;           // 🆕 추가 (선택)
      memo?: string;
    }
  ];
  // ...기존 필드
}
```

---

### 3. 주문 가격 수정 API (신규)

#### PATCH /order/:id/price

출고완료(`shipmentCompleted`) 등 기존에 수정이 불가능한 상태에서도 **가격만 별도로 수정**할 수 있는 API입니다.

**권한**: `moderator` 또는 `admin` (중간관리자 이상)

**Request Body:**

```typescript
{
  totalPrice?: number;   // 주문 총 판매가격 (선택)
  orderItems?: [         // 품목별 가격 수정 (선택)
    {
      itemId: number;       // 품목 ID (필수)
      sellingPrice: number; // 판매가 (필수)
      vat?: number;         // 세금 (선택)
    }
  ];
}
```

**Response:**

```typescript
{
  id: number;
  totalPrice: number | null;
  orderItems: [
    {
      id: number;
      itemId: number;
      quantity: number;
      sellingPrice: number | null;
      vat: number | null;
      memo: string | null;
      item: {
        id: number;
        itemQuantity: number;
        teamItem: {
          id: number;
          itemCode: string;
          itemName: string;
          costPrice: number | null;
          memo: string | null;
        };
        // ...
      };
    }
  ];
  // ...기존 Order 응답 필드 전체
}
```

**사용 예시:**

```typescript
// 총 판매가격만 수정
PATCH /order/1/price
{
  "totalPrice": 200000
}

// 품목별 판매가 + 세금 수정
PATCH /order/1/price
{
  "orderItems": [
    { "itemId": 1, "sellingPrice": 15000, "vat": 1500 },
    { "itemId": 2, "sellingPrice": 20000 }
  ]
}

// 총 판매가격 + 품목별 가격 동시 수정
PATCH /order/1/price
{
  "totalPrice": 250000,
  "orderItems": [
    { "itemId": 1, "sellingPrice": 15000, "vat": 1500 },
    { "itemId": 2, "sellingPrice": 20000, "vat": 2000 }
  ]
}
```

**에러 응답:**

| 상태 코드 | 조건 |
| --------- | ---- |
| 403 Forbidden | `user` 권한으로 요청 시 |
| 404 Not Found | 주문이 존재하지 않거나 삭제된 경우 |

**특징:**

- 주문 상태에 관계없이 가격 수정 가능 (출고완료 후에도 가능)
- 변경이력(ChangeHistory)에 자동 기록됨
- `totalPrice`와 `orderItems`는 각각 독립적으로 수정 가능

---

## 📊 필드 상세 정보

### costPrice (TeamItem)

| 항목      | 값               |
| --------- | ---------------- |
| 위치      | TeamItem 모델    |
| 타입      | `number \| null` |
| 단위      | 원 (정수)        |
| 필수 여부 | 선택             |
| 기본값    | `null`           |

**특징:**

- 품목 마스터 데이터로 관리
- 수정 시 해당 품목을 참조하는 모든 Item에 반영

---

### sellingPrice (OrderItem)

| 항목      | 값                    |
| --------- | --------------------- |
| 위치      | OrderItem (주문 품목) |
| 타입      | `number \| null`      |
| 단위      | 원 (정수)             |
| 필수 여부 | 선택                  |
| 기본값    | `null`                |

**특징:**

- 주문 생성 시점의 판매가를 저장
- 이후 TeamItem 가격이 변경되어도 기존 주문의 값은 유지됨

---

### vat (OrderItem)

| 항목      | 값                    |
| --------- | --------------------- |
| 위치      | OrderItem (주문 품목) |
| 타입      | `number \| null`      |
| 단위      | 원 (정수)             |
| 필수 여부 | 선택                  |
| 기본값    | `null`                |

**특징:**

- 주문 품목별 세금(부가세) 금액
- 클라이언트에서 계산하여 전송
- 서버는 전달받은 값을 저장

---

### totalPrice (Order)

| 항목      | 값               |
| --------- | ---------------- |
| 위치      | Order 모델       |
| 타입      | `number \| null` |
| 단위      | 원 (정수)        |
| 필수 여부 | 선택             |
| 기본값    | `null`           |

**특징:**

- 주문의 총 판매가격
- 클라이언트에서 계산하여 전송
- 서버는 전달받은 값을 저장

---

## ⚠️ 주의사항

### 하위 호환성

- 모든 새 필드는 **선택적(Optional)**
- 기존 API 호출 방식 그대로 사용 가능
- 새 필드를 전송하지 않아도 오류 발생하지 않음

### 기존 데이터

- 기존 데이터의 새 필드 값은 `null`로 조회됨
- `null` 체크 필요

### 데이터 타입

- 모든 가격 필드는 **정수(Int)** 타입
- 소수점 금액은 지원하지 않음

### 가격 수정 API 권한

- `PATCH /order/:id/price`는 **중간관리자(moderator) 이상**만 사용 가능
- `user` 권한으로 요청 시 `403 Forbidden` 반환

---
