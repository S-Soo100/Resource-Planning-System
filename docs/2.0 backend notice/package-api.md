# Package API 문서 (프론트엔드용)

## 📋 개요

**작성일**: 2025-11-14
**버전**: v2.0 (PackageItem 적용 - 실제 구현 기준)
**Base URL**: `/package`
**인증**: JWT Bearer Token 필수

---

## 🔑 주요 개념

### Package란?

- **정의**: 자주 함께 주문하는 품목들을 묶어놓은 "템플릿"
- **용도**: 주문 시 빠른 선택을 위한 "즐겨찾기"
- **구성**: 품목 목록(itemIds)만 저장, 실제 수량은 주문 시 지정

### 데이터 구조

```typescript

// CreatePackageDto (패키지 생성 요청)
{
  packageName: string;      // 패키지 이름 (필수)
  teamId: number;           // 팀 ID (필수)
  itemIds?: number[];       // 품목 ID 배열 (선택)
  itemlist?: string;        // deprecated - 사용 권장 안 함 (선택)
}

// UpdatePackageDto (패키지 수정 요청)
{
  packageName?: string;     // 패키지 이름 (선택)
  teamId?: number;          // 팀 ID (선택)
  itemIds?: number[];       // 품목 ID 배열 (선택, 제공 시 기존 품목 전체 대체)
  itemlist?: string;        // deprecated - 사용 권장 안 함 (선택)
}
```

---

## 📡 API 엔드포인트

### 1. 패키지 생성

**POST** `/package`

#### Request

```typescript
{
  packageName: string;      // 패키지 이름 (필수)
  teamId: number;           // 팀 ID (필수)
  itemIds?: number[];       // 품목 ID 배열 (선택)
  itemlist?: string;        // deprecated (사용 권장 안 함)
}
```

**⚠️ 중요**:

- `itemIds`는 선택 사항입니다 (빈 패키지 생성 가능)
- 현재 구현에는 품목 검증 로직이 없어서 존재하지 않는 itemId 입력 시 DB 에러 발생
- 중복 품목 검증도 없음 (DB unique 제약으로만 방지)

#### Example Request

```json
{
  "packageName": "사무용품 기본 세트",
  "teamId": 1,
  "itemIds": [10, 15, 20]
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "packageName": "사무용품 기본 세트",
    "teamId": 1,
    "itemlist": null,
    "createdAt": "2025-11-14T10:00:00.000Z",
    "updatedAt": "2025-11-14T10:00:00.000Z",
    "deletedAt": null,
    "team": {
      "id": 1,
      "teamName": "개발팀",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null
    },
    "packageItems": [
      {
        "id": 1,
        "itemId": 10,
        "createdAt": "2025-11-14T10:00:00.000Z",
        "deletedAt": null,
        "item": {
          "id": 10,
          "itemQuantity": 100,
          "warehouseId": 1,
          "teamItemId": 5,
          "teamItem": {
            "id": 5,
            "itemCode": "ITM001",
            "itemName": "노트북",
            "memo": "삼성 노트북"
          },
          "warehouse": {
            "id": 1,
            "warehouseName": "A창고"
          }
        }
      },
      {
        "id": 2,
        "itemId": 15,
        "createdAt": "2025-11-14T10:00:00.000Z",
        "deletedAt": null,
        "item": {
          "id": 15,
          "itemQuantity": 200,
          "warehouseId": 1,
          "teamItemId": 6,
          "teamItem": {
            "id": 6,
            "itemCode": "ITM002",
            "itemName": "마우스",
            "memo": null
          },
          "warehouse": {
            "id": 1,
            "warehouseName": "A창고"
          }
        }
      }
    ]
  }
}
```

#### Error Responses

- **500 Internal Server Error**: 존재하지 않는 품목 ID (DB 외래키 에러)
  ```json
  {
    "success": false,
    "message": "Internal server error",
    "statusCode": 500
  }
  ```

---

### 2. 모든 패키지 조회

**GET** `/package`

#### Request

- Query Parameters: 없음

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "packageName": "사무용품 기본 세트",
      "itemlist": null,
      "teamId": 1,
      "createdAt": "2025-11-14T10:00:00.000Z",
      "updatedAt": "2025-11-14T10:00:00.000Z",
      "deletedAt": null,
      "team": {
        "id": 1,
        "teamName": "개발팀",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "deletedAt": null
      },
      "packageItems": [
        {
          "id": 1,
          "itemId": 10,
          "createdAt": "2025-11-14T10:00:00.000Z",
          "deletedAt": null,
          "item": {
            "id": 10,
            "itemQuantity": 100,
            "warehouseId": 1,
            "teamItemId": 5,
            "teamItem": {
              "id": 5,
              "itemCode": "ITM001",
              "itemName": "노트북",
              "memo": "삼성 노트북"
            },
            "warehouse": {
              "id": 1,
              "warehouseName": "A창고"
            }
          }
        }
      ],
      "inventoryRecords": [
        {
          "id": 1,
          "inboundDate": "2025-11-01T00:00:00.000Z",
          "outboundDate": null,
          "inboundLocation": "A창고",
          "outboundLocation": null,
          "inboundQuantity": 50,
          "outboundQuantity": null,
          "remarks": "초기 입고",
          "createdAt": "2025-11-01T00:00:00.000Z",
          "updatedAt": "2025-11-01T00:00:00.000Z",
          "deletedAt": null
        }
      ]
    }
  ]
}
```

**특징**:

- `deletedAt = null`인 패키지만 반환
- `team.deletedAt = null`인 팀의 패키지만 반환
- 생성일 기준 내림차순 정렬 (최신 순)

---

### 3. 팀별 패키지 조회

**GET** `/package/team/:teamId`

#### Request

- Path Parameters:
  - `teamId` (number, required): 팀 ID

#### Example

```
GET /package/team/1
```

#### Response (200 OK)

응답 형식은 "모든 패키지 조회"와 동일하나, 특정 팀의 패키지만 필터링됩니다.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "packageName": "사무용품 기본 세트",
      "teamId": 1,
      "team": { ... },
      "packageItems": [ ... ],
      "inventoryRecords": [ ... ]
    }
  ]
}
```

#### Error Response

- **404 Not Found**: 팀이 존재하지 않음
  ```json
  {
    "success": false,
    "message": "팀 ID 999를 찾을 수 없습니다.",
    "statusCode": 404
  }
  ```

---

### 4. 단일 패키지 조회

**GET** `/package/:id`

#### Request

- Path Parameters:
  - `id` (number, required): 패키지 ID

#### Example

```
GET /package/1
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "packageName": "사무용품 기본 세트",
    "itemlist": null,
    "teamId": 1,
    "createdAt": "2025-11-14T10:00:00.000Z",
    "updatedAt": "2025-11-14T10:00:00.000Z",
    "deletedAt": null,
    "team": {
      "id": 1,
      "teamName": "개발팀",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "deletedAt": null
    },
    "packageItems": [
      {
        "id": 1,
        "itemId": 10,
        "createdAt": "2025-11-14T10:00:00.000Z",
        "deletedAt": null,
        "item": {
          "id": 10,
          "itemQuantity": 100,
          "warehouseId": 1,
          "teamItemId": 5,
          "teamItem": {
            "id": 5,
            "itemCode": "ITM001",
            "itemName": "노트북",
            "itemPrice": 1500000,
            "memo": "삼성 노트북"
          },
          "warehouse": {
            "id": 1,
            "warehouseName": "A창고"
          }
        }
      }
    ],
    "inventoryRecords": [
      {
        "id": 1,
        "inboundDate": "2025-11-01T00:00:00.000Z",
        "outboundDate": null,
        "inboundLocation": "A창고",
        "outboundLocation": null,
        "inboundQuantity": 50,
        "outboundQuantity": null,
        "remarks": "초기 입고",
        "createdAt": "2025-11-01T00:00:00.000Z",
        "updatedAt": "2025-11-01T00:00:00.000Z",
        "deletedAt": null
      }
    ]
  }
}
```

#### Error Response

- **404 Not Found**: 패키지가 존재하지 않음
  ```json
  {
    "success": false,
    "message": "패키지 ID 999를 찾을 수 없습니다.",
    "statusCode": 404
  }
  ```

---

### 5. 패키지 수정

**PATCH** `/package/:id`

#### Request

- Path Parameters:
  - `id` (number, required): 패키지 ID
- Body:
  ```typescript
  {
    packageName?: string;    // 패키지 이름 (선택)
    teamId?: number;         // 팀 ID (선택)
    itemIds?: number[];      // 품목 ID 배열 (선택)
    itemlist?: string;       // deprecated (선택)
  }
  ```

**⚠️ 중요**:

- `itemIds`를 제공하면 기존 PackageItem이 **모두 soft delete**되고 새로운 품목으로 **완전 대체**됩니다
- `itemIds`를 제공하지 않으면 기존 품목 유지하고 다른 필드만 업데이트
- 트랜잭션으로 처리됨

#### Example Request 1: 이름만 수정

```json
{
  "packageName": "프리미엄 사무용품 세트"
}
```

응답: 기존 packageItems 유지, packageName만 변경

#### Example Request 2: 품목 전체 교체

```json
{
  "packageName": "프리미엄 사무용품 세트",
  "itemIds": [10, 15, 20, 25]
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "packageName": "프리미엄 사무용품 세트",
    "teamId": 1,
    "itemlist": null,
    "updatedAt": "2025-11-14T11:00:00.000Z",
    "team": { ... },
    "packageItems": [
      {
        "id": 5,
        "itemId": 10,
        "createdAt": "2025-11-14T11:00:00.000Z",
        "deletedAt": null,
        "item": { ... }
      },
      {
        "id": 6,
        "itemId": 15,
        "createdAt": "2025-11-14T11:00:00.000Z",
        "deletedAt": null,
        "item": { ... }
      },
      {
        "id": 7,
        "itemId": 20,
        "createdAt": "2025-11-14T11:00:00.000Z",
        "deletedAt": null,
        "item": { ... }
      },
      {
        "id": 8,
        "itemId": 25,
        "createdAt": "2025-11-14T11:00:00.000Z",
        "deletedAt": null,
        "item": { ... }
      }
    ]
  }
}
```

\

---

### 6. 패키지 삭제

**DELETE** `/package/:id`

#### Request

- Path Parameters:
  - `id` (number, required): 패키지 ID

#### Example

```
DELETE /package/1
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "deleted": true
  }
}
```

**주의**:

- Soft Delete 방식이므로 데이터베이스에서 실제로 삭제되지 않고 `deletedAt` 필드만 설정됩니다
- PackageItem은 자동으로 삭제되지 않습니다 (수동 처리 필요)

#### Error Response

- **404 Not Found**: 패키지가 존재하지 않음

---

---
