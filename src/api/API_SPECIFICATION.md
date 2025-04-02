# KARS ERP API 명세서

## 1. 사용자 관리 API (User)

### 엔드포인트

- `POST /user`: 새로운 사용자 생성
- `GET /user`: 모든 사용자 목록 조회
- `GET /user/{id}`: 특정 사용자 조회
- `PATCH /user/{id}`: 사용자 정보 수정
- `DELETE /user/{id}`: 사용자 삭제

### 데이터 타입

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}
```

## 2. 팀 관리 API (Team)

### 엔드포인트

- `POST /team`: 새로운 팀 생성
- `GET /team`: 모든 팀 목록 조회
- `GET /team/{id}`: 특정 팀 조회
- `PATCH /team/{id}`: 팀 정보 수정
- `DELETE /team/{id}`: 팀 삭제

### 데이터 타입

```typescript
interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

## 3. 창고 관리 API (Warehouse)

### 엔드포인트

- `POST /warehouse`: 새로운 창고 생성
- `GET /warehouse`: 모든 창고 목록 조회
- `GET /warehouse/{id}`: 특정 창고 조회
- `PATCH /warehouse/{id}`: 창고 정보 수정
- `DELETE /warehouse/{id}`: 창고 삭제

### 데이터 타입

```typescript
interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

## 4. 공급업체 관리 API (Supplier)

### 엔드포인트

- `POST /supplier`: 새로운 공급업체 생성
- `GET /supplier`: 모든 공급업체 목록 조회
- `GET /supplier/{id}`: 특정 공급업체 조회
- `PATCH /supplier/{id}`: 공급업체 정보 수정
- `DELETE /supplier/{id}`: 공급업체 삭제

### 데이터 타입

```typescript
interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

## 5. 패키지 관리 API (Package)

### 엔드포인트

- `POST /package`: 새로운 패키지 생성
- `GET /package`: 모든 패키지 목록 조회
- `GET /package/{id}`: 특정 패키지 조회
- `PATCH /package/{id}`: 패키지 정보 수정
- `DELETE /package/{id}`: 패키지 삭제

### 데이터 타입

```typescript
interface Package {
  id: string;
  name: string;
  description: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

## 6. 주문 관리 API (Order)

### 엔드포인트

- `POST /order`: 새로운 주문 생성
- `GET /order`: 모든 주문 목록 조회
- `GET /order/user/{userId}`: 사용자별 주문 조회
- `GET /order/supplier/{supplierId}`: 공급업체별 주문 조회
- `GET /order/{id}`: 특정 주문 조회
- `PATCH /order/{id}`: 주문 정보 수정
- `DELETE /order/{id}`: 주문 삭제
- `PATCH /order/{id}/status`: 주문 상태 변경

### 데이터 타입

```typescript
interface Order {
  id: string;
  userId: string;
  supplierId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
```

## 7. 재고 관리 API (Inventory)

### 엔드포인트

- `POST /inventory`: 새로운 재고 항목 생성
- `GET /inventory`: 모든 재고 항목 목록 조회
- `GET /inventory/warehouse/{warehouseId}`: 창고별 재고 조회
- `GET /inventory/{id}`: 특정 재고 항목 조회
- `PATCH /inventory/{id}`: 재고 항목 정보 수정
- `DELETE /inventory/{id}`: 재고 항목 삭제

### 데이터 타입

```typescript
interface InventoryItem {
  id: string;
  packageId: string;
  warehouseId: string;
  quantity: number;
  location: string;
  lastUpdated: string;
}
```

## 8. 배송 관리 API (Delivery)

### 엔드포인트

- `POST /delivery`: 새로운 배송 생성
- `GET /delivery`: 모든 배송 목록 조회
- `GET /delivery/order/{orderId}`: 주문별 배송 조회
- `GET /delivery/{id}`: 특정 배송 조회
- `PATCH /delivery/{id}`: 배송 정보 수정
- `DELETE /delivery/{id}`: 배송 삭제

### 데이터 타입

```typescript
interface Delivery {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

enum DeliveryStatus {
  PENDING = "PENDING",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
```

## 9. 결제 관리 API (Payment)

### 엔드포인트

- `POST /payment`: 새로운 결제 생성
- `GET /payment`: 모든 결제 목록 조회
- `GET /payment/order/{orderId}`: 주문별 결제 조회
- `GET /payment/{id}`: 특정 결제 조회
- `PATCH /payment/{id}`: 결제 정보 수정
- `DELETE /payment/{id}`: 결제 삭제

### 데이터 타입

```typescript
interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  refundDate?: string;
  createdAt: string;
  updatedAt: string;
}

enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CASH = "CASH",
}
```

## 10. 재고 기록 관리 API (Inventory Record)

### 엔드포인트

- `POST /inventory-record`: 새로운 재고 기록 생성
- `GET /inventory-record`: 모든 재고 기록 목록 조회
- `GET /inventory-record/{id}`: 특정 재고 기록 조회
- `PATCH /inventory-record/{id}`: 재고 기록 정보 수정
- `DELETE /inventory-record/{id}`: 재고 기록 삭제

### 데이터 타입

```typescript
interface InventoryRecord {
  id: string;
  inventoryId: string;
  type: InventoryRecordType;
  quantity: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  updatedAt: string;
}

enum InventoryRecordType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
}
```

## 11. 아이템 관리 API (Item)

### 엔드포인트

- `POST /item`: 새로운 아이템 생성
- `GET /item`: 모든 아이템 목록 조회 (검색 및 창고별 필터링 지원)
- `GET /item/warehouse/{warehouseId}`: 창고별 아이템 조회
- `GET /item/{id}`: 특정 아이템 조회
- `PATCH /item/{id}`: 아이템 정보 수정
- `DELETE /item/{id}`: 아이템 삭제
- `PATCH /item/{id}/quantity`: 아이템 수량 변경

### 데이터 타입

```typescript
interface Item {
  id: string;
  name: string;
  description: string;
  sku: string;
  warehouseId: string;
  quantity: number;
  minimumQuantity: number;
  category: string;
  unit: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}
```

## 공통 응답 형식

모든 API는 다음과 같은 공통 응답 형식을 사용합니다:

```typescript
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}
```

## 에러 코드

- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 401: 인증 실패
- 403: 권한 없음
- 404: 리소스를 찾을 수 없음
- 500: 서버 내부 오류
