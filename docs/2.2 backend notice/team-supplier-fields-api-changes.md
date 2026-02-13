# API 변경 사항: 팀 회사 정보 & 공급업체 대표자 이름 추가

**날짜**: 2026-02-11
**하위호환**: O (기존 API 호출에 영향 없음)

---

## 1. Team (팀) - 회사 정보 필드 추가

### 추가된 필드

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `companyName` | `string \| null` | X | 회사명 | `"(주)가나다"` |
| `businessRegistrationNumber` | `string \| null` | X | 사업자번호 | `"123-45-67890"` |
| `representativeName` | `string \| null` | X | 대표자 이름 | `"홍길동"` |
| `businessAddress` | `string \| null` | X | 사업장 주소 | `"서울시 강남구 역삼동 123번지"` |
| `email` | `string \| null` | X | 이메일 | `"company@example.com"` |
| `phoneNumber` | `string \| null` | X | 대표 번호 | `"02-1234-5678"` |

### 영향받는 API

#### POST /team (팀 생성)
요청 Body에 새 필드 추가 가능 (모두 선택사항)

```json
{
  "teamName": "개발팀",
  "mainWarehouseId": 1,
  "companyName": "(주)가나다",
  "businessRegistrationNumber": "123-45-67890",
  "representativeName": "홍길동",
  "businessAddress": "서울시 강남구 역삼동 123번지",
  "email": "company@example.com",
  "phoneNumber": "02-1234-5678"
}
```

#### PATCH /team/:id (팀 수정)
요청 Body에 새 필드 추가 가능 (모두 선택사항)

```json
{
  "companyName": "(주)수정된회사",
  "phoneNumber": "02-9876-5432"
}
```

#### GET /team (전체 팀 조회)
응답에 회사 정보 필드가 포함됨 (값이 없으면 `null`). 배열로 반환됩니다.

```json
[
  {
    "id": 1,
    "teamName": "개발팀",
    "companyName": "(주)가나다",
    "businessRegistrationNumber": "123-45-67890",
    "representativeName": "홍길동",
    "businessAddress": "서울시 강남구 역삼동 123번지",
    "email": "company@example.com",
    "phoneNumber": "02-1234-5678",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z",
    "deletedAt": null,
    "teamUserMap": [
      {
        "id": 1,
        "userId": 1,
        "teamId": 1,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "deletedAt": null,
        "user": {
          "id": 1,
          "email": "user@example.com",
          "name": "홍길동",
          "accessLevel": "admin",
          "isAdmin": true,
          "createdAt": "2025-01-01T00:00:00.000Z",
          "updatedAt": "2025-01-01T00:00:00.000Z",
          "deletedAt": null
        }
      }
    ],
    "package": [
      {
        "id": 1,
        "packageName": "기본 패키지",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "deletedAt": null
      }
    ],
    "suppliers": [
      {
        "id": 1,
        "supplierName": "(주)공급사",
        "supplierPhoneNumber": "02-1111-2222",
        "teamId": 1,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "deletedAt": null
      }
    ],
    "warehouses": [
      {
        "id": 1,
        "warehouseName": "서울 창고",
        "sortOrder": 1,
        "teamId": 1,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "deletedAt": null
      }
    ]
  }
]
```

#### GET /team/:id (단건 팀 조회)
전체 조회와 동일한 구조이나, 단건 객체로 반환됩니다.

> **참고**: `suppliers`와 `warehouses` 내에 `teamId`가 포함되지 않는 점이 전체 조회와의 차이입니다.

```json
{
  "id": 1,
  "teamName": "개발팀",
  "companyName": "(주)가나다",
  "businessRegistrationNumber": "123-45-67890",
  "representativeName": "홍길동",
  "businessAddress": "서울시 강남구 역삼동 123번지",
  "email": "company@example.com",
  "phoneNumber": "02-1234-5678",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z",
  "deletedAt": null,
  "teamUserMap": [
    {
      "id": 1,
      "userId": 1,
      "teamId": 1,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null,
      "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "홍길동",
        "accessLevel": "admin",
        "isAdmin": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "deletedAt": null
      }
    }
  ],
  "package": [
    {
      "id": 1,
      "packageName": "기본 패키지",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ],
  "suppliers": [
    {
      "id": 1,
      "supplierName": "(주)공급사",
      "supplierPhoneNumber": "02-1111-2222",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ],
  "warehouses": [
    {
      "id": 1,
      "warehouseName": "서울 창고",
      "sortOrder": 1,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

#### API별 응답 필드 차이 (중첩 객체 내)

| 중첩 필드 | GET /team | GET /team/:id |
|-----------|:---------:|:-------------:|
| `suppliers.teamId` | O | X |
| `warehouses.teamId` | O | X |

---

## 2. Supplier (공급업체) - 대표자 이름 필드 추가

### 추가된 필드

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `representativeName` | `string \| null` | X | 대표자 이름 | `"홍길동"` |

### 영향받는 API

#### POST /supplier (공급업체 생성)
```json
{
  "supplierName": "(주)가나다",
  "representativeName": "홍길동",
  "teamId": 1
}
```

#### PATCH /supplier/:id (공급업체 수정)
```json
{
  "representativeName": "김철수"
}
```

#### GET /supplier, GET /supplier/:id (전체 조회 / 단건 조회)
응답에 `representativeName` 필드 포함

```json
{
  "id": 1,
  "supplierName": "(주)가나다",
  "supplierPhoneNumber": "02-1234-5678",
  "representativeName": "홍길동",
  "teamId": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z",
  "deletedAt": null,
  "team": {
    "id": 1,
    "teamName": "개발팀",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "deletedAt": null
  },
  "inventoryRecords": [
    {
      "id": 1,
      "inboundDate": "2025-02-01T00:00:00.000Z",
      "outboundDate": null,
      "inboundLocation": "서울 창고",
      "outboundLocation": null,
      "inboundQuantity": 100,
      "outboundQuantity": null,
      "remarks": "초기 입고",
      "createdAt": "2025-02-01T00:00:00.000Z",
      "updatedAt": "2025-02-01T00:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

> **참고**: `GET /supplier`는 위 구조의 배열을 반환합니다.

#### GET /supplier/team/:teamId (팀별 공급업체 조회)
팀별 조회 시 추가 필드(`supplierAddress`, `email`, `registrationNumber`, `memo`)가 포함됩니다.

```json
[
  {
    "id": 1,
    "supplierName": "(주)가나다",
    "supplierPhoneNumber": "02-1234-5678",
    "representativeName": "홍길동",
    "supplierAddress": "서울시 강남구 역삼동 123번지",
    "email": "supplier@example.com",
    "registrationNumber": "123-45-67890",
    "memo": "월별 결제, 특이사항 없음",
    "teamId": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z",
    "deletedAt": null,
    "team": {
      "id": 1,
      "teamName": "개발팀",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null
    },
    "inventoryRecords": [
      {
        "id": 1,
        "inboundDate": "2025-02-01T00:00:00.000Z",
        "outboundDate": null,
        "inboundLocation": "서울 창고",
        "outboundLocation": null,
        "inboundQuantity": 100,
        "outboundQuantity": null,
        "remarks": "초기 입고",
        "createdAt": "2025-02-01T00:00:00.000Z",
        "updatedAt": "2025-02-01T00:00:00.000Z",
        "deletedAt": null
      }
    ]
  }
]
```

#### API별 응답 필드 차이

| 필드 | GET /supplier | GET /supplier/:id | GET /supplier/team/:teamId |
|------|:---:|:---:|:---:|
| `id` | O | O | O |
| `supplierName` | O | O | O |
| `supplierPhoneNumber` | O | O | O |
| `representativeName` | O | O | O |
| `supplierAddress` | X | X | O |
| `email` | X | X | O |
| `registrationNumber` | X | X | O |
| `memo` | X | X | O |
| `teamId` | O | O | O |
| `team` | O | O | O |
| `inventoryRecords` | O | O | O |
| `createdAt` | O | O | O |
| `updatedAt` | O | O | O |
| `deletedAt` | O | O | O |

---

## 3. 참고사항

- 모든 새 필드는 **선택사항(nullable)** 이므로 기존 API 호출은 변경 없이 정상 동작합니다.
- 기존 데이터의 새 필드 값은 모두 `null`로 반환됩니다.
- Swagger 문서(`/api`)에서 상세 스펙을 확인할 수 있습니다.
