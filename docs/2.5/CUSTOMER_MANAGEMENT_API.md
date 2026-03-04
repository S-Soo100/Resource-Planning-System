# 고객관리 기능 - 프론트엔드 API 문서

> **상태**: 코드 구현 완료 (마이그레이션 대기)
> **마지막 업데이트**: 2026-02-24

---

## 목차

1. [출고완료 건 통합 수정 API](#1-출고완료-건-통합-수정-api)
2. [세금계산서 관리 API](#2-세금계산서-관리-api)
3. [재구매 예정 고객 조회 API](#3-재구매-예정-고객-조회-api)
4. [고객 서류 관리 API](#4-고객-서류-관리-api)
5. [User 모델 추가 필드](#5-user-모델-추가-필드)
6. [Order 모델 추가 필드](#6-order-모델-추가-필드)
7. [타입 정의 (TypeScript)](#7-타입-정의-typescript)

---

## 1. 출고완료 건 통합 수정 API

주문의 가격, 환급, 입금, 세금계산서, 구매자(Supplier) 연결 정보를 한 번에 수정합니다.

### `PATCH /order/:id/details`

**권한**: 중간관리자(moderator) 이상

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Path Parameters**:

| 파라미터 | 타입     | 필수 | 설명    |
|---------|---------|------|---------|
| `id`    | `number` | Y   | 주문 ID |

**Request Body** (모든 필드 optional, 변경할 필드만 전송):

```typescript
{
  // 가격 관련
  totalPrice?: number;           // 총 판매가격
  orderItems?: [{                // 품목별 판매가 수정
    itemId: number;              // 품목 ID (필수)
    sellingPrice: number;        // 판매가 (필수)
    vat?: number;                // 세금 (선택)
  }];

  // 구매자 연결
  supplierId?: number;           // 구매자(Supplier) ID

  // 환급 관련
  isRefundApplied?: boolean;     // 환급 신청 여부
  isRefundReceived?: boolean;    // 환급금 입금 여부
  isRefundNotApplicable?: boolean; // 환급 해당없음

  // 세금계산서
  isTaxInvoiceIssued?: boolean;  // 매입세금계산서 발행 여부

  // 입금 관련
  depositStatus?: string;        // 입금 상태 ("자부담금" | "전액" | "선금" | "중도금" | "잔금")
  depositAmount?: number;        // 입금 금액
}
```

**Request 예시**:

```json
{
  "isRefundApplied": true,
  "isTaxInvoiceIssued": true,
  "depositStatus": "전액",
  "depositAmount": 150000
}
```

```json
{
  "totalPrice": 200000,
  "orderItems": [
    { "itemId": 1, "sellingPrice": 100000, "vat": 10000 },
    { "itemId": 2, "sellingPrice": 100000 }
  ],
  "supplierId": 5
}
```

**Response (200)**:

```json
{
  "id": 1,
  "userId": 10,
  "status": "shipmentCompleted",
  "totalPrice": 200000,
  "supplierId": 5,
  "isRefundApplied": true,
  "isRefundReceived": false,
  "isRefundNotApplicable": false,
  "isTaxInvoiceIssued": true,
  "depositStatus": "전액",
  "depositAmount": 150000,
  "orderItems": [
    {
      "id": 1,
      "itemId": 1,
      "sellingPrice": 100000,
      "vat": 10000
    }
  ],
  "updatedAt": "2026-02-24T10:00:00.000Z"
}
```

**Error Responses**:

| 상태 코드 | 설명 |
|----------|------|
| `400` | 잘못된 요청 형식 또는 유효하지 않은 데이터 |
| `401` | 인증되지 않은 사용자 |
| `403` | 권한 부족 (중간관리자 이상 필요) |
| `404` | 주문을 찾을 수 없음 |

**참고사항**:
- 출고완료(`shipmentCompleted`) 상태에서도 수정 가능
- 동일한 값을 전송하면 변경이력(ChangeHistory)에 기록되지 않음
- `supplierId` 변경 시 해당 Supplier 존재 여부를 자동 검증
- 변경된 필드는 자동으로 ChangeHistory에 기록됨

---

## 2. 세금계산서 관리 API

### 2-1. 세금계산서 업로드

### `POST /order/:id/tax-invoice/upload`

**권한**: 인증된 사용자

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data
```

**Path Parameters**:

| 파라미터 | 타입     | 필수 | 설명    |
|---------|---------|------|---------|
| `id`    | `number` | Y   | 주문 ID |

**Form Data**:

| 필드   | 타입     | 필수 | 설명                    |
|-------|---------|------|------------------------|
| `file` | `File`  | Y    | 업로드할 세금계산서 파일 |
| `memo` | `string` | N   | 메모                   |

**지원 파일 형식**: 이미지(jpeg, png, gif, webp), PDF, 문서(doc, docx), 스프레드시트(xls, xlsx), 텍스트(txt, csv)

**파일 크기 제한**: 최대 10MB

**Response (201)**:

```json
{
  "id": 1,
  "userId": 10,
  "orderId": 1,
  "documentType": "tax_invoice",
  "fileName": "세금계산서_202602.pdf",
  "fileUrl": "https://storage.googleapis.com/bucket/customer-documents/1708761234567_abc123_세금계산서_202602.pdf",
  "memo": "2월분 매입세금계산서",
  "createdAt": "2026-02-24T10:00:00.000Z",
  "updatedAt": "2026-02-24T10:00:00.000Z",
  "deletedAt": null
}
```

**Error Responses**:

| 상태 코드 | 설명 |
|----------|------|
| `400` | 파일 없음 또는 잘못된 형식 |
| `401` | 인증되지 않은 사용자 |
| `404` | 주문을 찾을 수 없음 |

---

### 2-2. 세금계산서 목록 조회

### `GET /order/:id/tax-invoices`

**권한**: 인증된 사용자

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:

| 파라미터 | 타입     | 필수 | 설명    |
|---------|---------|------|---------|
| `id`    | `number` | Y   | 주문 ID |

**Response (200)**:

```json
[
  {
    "id": 1,
    "userId": 10,
    "orderId": 1,
    "documentType": "tax_invoice",
    "fileName": "세금계산서_202602.pdf",
    "fileUrl": "https://storage.googleapis.com/bucket/customer-documents/...",
    "memo": "2월분 매입세금계산서",
    "createdAt": "2026-02-24T10:00:00.000Z",
    "updatedAt": "2026-02-24T10:00:00.000Z",
    "deletedAt": null
  }
]
```

**빈 결과 시**: `[]` (빈 배열)

---

### 2-3. 세금계산서 삭제

### `DELETE /order/:id/tax-invoice/:docId`

**권한**: 인증된 사용자

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:

| 파라미터 | 타입     | 필수 | 설명         |
|---------|---------|------|-------------|
| `id`    | `number` | Y   | 주문 ID      |
| `docId` | `number` | Y   | 세금계산서 ID |

**Response (200)**:

```json
{
  "id": 1,
  "userId": 10,
  "orderId": 1,
  "documentType": "tax_invoice",
  "fileName": "세금계산서_202602.pdf",
  "fileUrl": "https://storage.googleapis.com/bucket/...",
  "memo": null,
  "createdAt": "2026-02-24T10:00:00.000Z",
  "updatedAt": "2026-02-24T10:00:00.000Z",
  "deletedAt": "2026-02-24T11:00:00.000Z"
}
```

**Error Responses**:

| 상태 코드 | 설명 |
|----------|------|
| `400` | 세금계산서 삭제 중 오류 |
| `401` | 인증되지 않은 사용자 |
| `404` | 주문 또는 세금계산서를 찾을 수 없음 |

---

## 3. 재구매 예정 고객 조회 API

재구매 예정일이 오늘 이전인 고객 목록을 조회합니다.

### `GET /user/repurchase-due`

**권한**: 인증된 사용자

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Query Parameters**:

| 파라미터 | 타입     | 필수 | 설명   |
|---------|---------|------|--------|
| `teamId` | `number` | Y   | 팀 ID |

**Request 예시**:
```
GET /user/repurchase-due?teamId=1
```

**Response (200)**:

```json
[
  {
    "id": 10,
    "email": "customer@example.com",
    "name": "홍길동",
    "customerType": "b2c",
    "isRecipient": false,
    "depositorName": "홍길동",
    "repurchaseCycleMonths": 3,
    "repurchaseDueDate": "2026-02-20T00:00:00.000Z",
    "createdAt": "2025-11-01T00:00:00.000Z",
    "teamUserMap": [
      {
        "teamId": 1,
        "accessLevel": "user"
      }
    ]
  }
]
```

**빈 결과 시**: `[]` (빈 배열)

**정렬**: `repurchaseDueDate` 오름차순 (가장 오래 지난 고객이 먼저)

**참고사항**:
- `repurchaseDueDate <= 오늘`인 고객만 반환
- `teamId`는 필수 파라미터 (미전송 시 400 에러)
- 삭제된 사용자(`deletedAt != null`) 제외

---

## 4. 고객 서류 관리 API

### 4-1. 고객 서류 업로드

### `POST /user/:userId/documents/upload`

**권한**: 인증된 사용자

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data
```

**Path Parameters**:

| 파라미터  | 타입     | 필수 | 설명      |
|----------|---------|------|----------|
| `userId` | `number` | Y   | 사용자 ID |

**Form Data**:

| 필드           | 타입     | 필수 | 설명                                                    |
|---------------|---------|------|---------------------------------------------------------|
| `file`         | `File`  | Y    | 업로드할 파일                                            |
| `documentType` | `string` | Y   | 서류 유형: `prescription` / `recipient` / `receipt` / `tax_invoice` |
| `memo`         | `string` | N   | 메모                                                    |
| `orderId`      | `number` | N   | 연결할 주문 ID (세금계산서 등에 사용)                      |

**documentType 설명**:

| 값              | 설명             |
|----------------|------------------|
| `prescription` | 처방전            |
| `recipient`    | 수급자 서류        |
| `receipt`      | 영수증            |
| `tax_invoice`  | 세금계산서         |

**Response (201)**:

```json
{
  "id": 1,
  "userId": 10,
  "orderId": null,
  "documentType": "prescription",
  "fileName": "처방전_홍길동.pdf",
  "fileUrl": "https://storage.googleapis.com/bucket/customer-documents/...",
  "memo": "2026년 2월 처방전",
  "createdAt": "2026-02-24T10:00:00.000Z",
  "updatedAt": "2026-02-24T10:00:00.000Z",
  "deletedAt": null
}
```

**Error Responses**:

| 상태 코드 | 설명 |
|----------|------|
| `400` | 파일 없음 또는 잘못된 형식 |
| `401` | 인증되지 않은 사용자 |
| `404` | 사용자를 찾을 수 없음 |

---

### 4-2. 고객 서류 목록 조회

### `GET /user/:userId/documents`

**권한**: 인증된 사용자

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:

| 파라미터  | 타입     | 필수 | 설명      |
|----------|---------|------|----------|
| `userId` | `number` | Y   | 사용자 ID |

**Query Parameters**:

| 파라미터       | 타입     | 필수 | 설명                                                    |
|---------------|---------|------|---------------------------------------------------------|
| `documentType` | `string` | N   | 서류 유형 필터: `prescription` / `recipient` / `receipt` / `tax_invoice` |

**Request 예시**:
```
GET /user/10/documents
GET /user/10/documents?documentType=prescription
```

**Response (200)**:

```json
[
  {
    "id": 1,
    "userId": 10,
    "orderId": null,
    "documentType": "prescription",
    "fileName": "처방전_홍길동.pdf",
    "fileUrl": "https://storage.googleapis.com/bucket/...",
    "memo": "2026년 2월 처방전",
    "createdAt": "2026-02-24T10:00:00.000Z",
    "updatedAt": "2026-02-24T10:00:00.000Z",
    "deletedAt": null
  },
  {
    "id": 2,
    "userId": 10,
    "orderId": 5,
    "documentType": "tax_invoice",
    "fileName": "세금계산서.pdf",
    "fileUrl": "https://storage.googleapis.com/bucket/...",
    "memo": null,
    "createdAt": "2026-02-20T10:00:00.000Z",
    "updatedAt": "2026-02-20T10:00:00.000Z",
    "deletedAt": null
  }
]
```

**빈 결과 시**: `[]` (빈 배열)

**정렬**: `createdAt` 내림차순 (최신 서류가 먼저)

---

### 4-3. 고객 서류 삭제

### `DELETE /user/:userId/documents/:docId`

**권한**: 인증된 사용자

**Headers**:
```
Authorization: Bearer {JWT_TOKEN}
```

**Path Parameters**:

| 파라미터  | 타입     | 필수 | 설명      |
|----------|---------|------|----------|
| `userId` | `number` | Y   | 사용자 ID |
| `docId`  | `number` | Y   | 서류 ID   |

**Response (200)**:

```json
{
  "id": 1,
  "userId": 10,
  "orderId": null,
  "documentType": "prescription",
  "fileName": "처방전_홍길동.pdf",
  "fileUrl": "https://storage.googleapis.com/bucket/...",
  "memo": "2026년 2월 처방전",
  "createdAt": "2026-02-24T10:00:00.000Z",
  "updatedAt": "2026-02-24T10:00:00.000Z",
  "deletedAt": "2026-02-24T11:00:00.000Z"
}
```

**Error Responses**:

| 상태 코드 | 설명 |
|----------|------|
| `400` | 서류 삭제 중 오류 |
| `401` | 인증되지 않은 사용자 |
| `404` | 사용자 또는 서류를 찾을 수 없음 |

---

## 5. User 모델 추가 필드

기존 User 수정 API(`PATCH /user/:id`)에서 아래 필드를 추가로 전송/수신할 수 있습니다.

### 추가된 필드

| 필드                    | 타입        | 기본값  | 설명                      |
|------------------------|------------|--------|---------------------------|
| `customerType`          | `string?`  | `null` | 고객 분류 (`b2c` / `b2b`) |
| `isRecipient`           | `boolean`  | `false` | 수급자 여부               |
| `depositorName`         | `string?`  | `null` | 입금자명                  |
| `residentId`            | `string?`  | `null` | 주민등록번호               |
| `repurchaseCycleMonths` | `number?`  | `null` | 재구매 주기 (월 단위, 기본 3개월) |
| `repurchaseDueDate`     | `string?`  | `null` | 재구매 예정일 (ISO 8601, 자동 갱신) |

### PATCH /user/:id 에서 사용

```json
{
  "customerType": "b2c",
  "isRecipient": true,
  "depositorName": "홍길동",
  "residentId": "900101-1234567",
  "repurchaseCycleMonths": 6
}
```

**참고사항**:
- 모든 필드는 optional (변경할 필드만 전송)
- `repurchaseDueDate`는 직접 수정하지 않음 (주문 출고완료 시 자동 갱신)
- `repurchaseCycleMonths` 미설정 시 기본 3개월로 재구매일 계산

### GET /user/:id 응답에 추가되는 필드

```json
{
  "id": 10,
  "email": "customer@example.com",
  "name": "홍길동",
  "customerType": "b2c",
  "isRecipient": true,
  "depositorName": "홍길동",
  "residentId": "900101-1234567",
  "repurchaseCycleMonths": 3,
  "repurchaseDueDate": "2026-05-24T00:00:00.000Z"
}
```

---

## 6. Order 모델 추가 필드

기존 주문 조회 API(`GET /order/:id`) 응답에 아래 필드가 추가됩니다.

### 추가된 필드

| 필드                    | 타입       | 기본값  | 설명                     |
|------------------------|-----------|--------|--------------------------|
| `isRefundApplied`       | `boolean` | `false` | 환급 신청 여부            |
| `isRefundReceived`      | `boolean` | `false` | 환급금 입금 여부          |
| `isRefundNotApplicable` | `boolean` | `false` | 환급 해당없음             |
| `isTaxInvoiceIssued`    | `boolean` | `false` | 매입세금계산서 발행 여부   |
| `depositStatus`         | `string?` | `null`  | 입금 상태                |
| `depositAmount`         | `number?` | `null`  | 입금 금액                |

### GET /order/:id 응답 예시 (추가 필드 포함)

```json
{
  "id": 1,
  "userId": 10,
  "status": "shipmentCompleted",
  "totalPrice": 200000,
  "isRefundApplied": true,
  "isRefundReceived": false,
  "isRefundNotApplicable": false,
  "isTaxInvoiceIssued": true,
  "depositStatus": "전액",
  "depositAmount": 200000,
  "orderItems": [...],
  "user": {...},
  "supplier": {...}
}
```

---

## 7. 타입 정의 (TypeScript)

프론트엔드에서 사용할 수 있는 TypeScript 타입 정의입니다.

```typescript
// === 출고완료 건 통합 수정 ===

interface UpdateOrderDetailsRequest {
  totalPrice?: number;
  orderItems?: UpdateOrderPriceItem[];
  supplierId?: number;
  isRefundApplied?: boolean;
  isRefundReceived?: boolean;
  isRefundNotApplicable?: boolean;
  isTaxInvoiceIssued?: boolean;
  depositStatus?: string;
  depositAmount?: number;
}

interface UpdateOrderPriceItem {
  itemId: number;
  sellingPrice: number;
  vat?: number;
}

// === 고객 서류 ===

interface CustomerDocument {
  id: number;
  userId: number;
  orderId: number | null;
  documentType: 'prescription' | 'recipient' | 'receipt' | 'tax_invoice';
  fileName: string;
  fileUrl: string;
  memo: string | null;
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
  deletedAt: string | null;
}

// === 재구매 예정 고객 ===

interface RepurchaseDueUser {
  id: number;
  email: string;
  name: string;
  customerType: string | null;
  isRecipient: boolean;
  depositorName: string | null;
  repurchaseCycleMonths: number | null;
  repurchaseDueDate: string;  // ISO 8601
  createdAt: string;
  teamUserMap: {
    teamId: number;
    accessLevel: string;
  }[];
}

// === User 추가 필드 ===

interface UserCustomerFields {
  customerType?: string | null;   // 'b2c' | 'b2b'
  isRecipient?: boolean;
  depositorName?: string | null;
  residentId?: string | null;
  repurchaseCycleMonths?: number | null;
  repurchaseDueDate?: string | null;
}

// === Order 추가 필드 ===

interface OrderCustomerManagementFields {
  isRefundApplied: boolean;
  isRefundReceived: boolean;
  isRefundNotApplicable: boolean;
  isTaxInvoiceIssued: boolean;
  depositStatus: string | null;
  depositAmount: number | null;
}
```

---

## 부록: 자동 동작

### 재구매 예정일 자동 계산

주문 상태가 `shipmentCompleted`로 변경되면 자동으로 해당 고객의 `repurchaseDueDate`가 갱신됩니다.

```
repurchaseDueDate = 상태변경일 + repurchaseCycleMonths (기본 3개월)
```

- 프론트엔드에서 별도 호출 불필요
- 기존 `PATCH /order/:id/status` API에서 자동 처리

### ChangeHistory 자동 기록

`PATCH /order/:id/details` API로 필드를 변경하면 아래 필드들의 변경이력이 자동 기록됩니다.

| 필드                    | 라벨 (한글)         |
|------------------------|-------------------|
| `totalPrice`            | 총 판매가격        |
| `sellingPrice`          | 판매가            |
| `vat`                   | 세금              |
| `supplierId`            | 구매자/공급업체    |
| `isRefundApplied`       | 환급 신청          |
| `isRefundReceived`      | 환급금 입금        |
| `isRefundNotApplicable` | 환급 해당없음      |
| `isTaxInvoiceIssued`    | 매입세금계산서 발행 |
| `depositStatus`         | 입금 상태          |
| `depositAmount`         | 입금 금액          |

동일한 값을 전송하면 변경이력에 기록되지 않습니다.

---

_이 문서는 고객관리 기능 강화에 따른 신규 API를 프론트엔드 개발자를 위해 정리한 문서입니다._
