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
      memo?: string;
    }
  ];
  // ...기존 필드
}
```

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

---
