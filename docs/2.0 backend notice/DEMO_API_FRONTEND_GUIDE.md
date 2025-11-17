# Demo API - 프론트엔드 가이드 (간략판)

**작성일**: 2025-11-17
**대상**: 프론트엔드 개발팀

---

## 🎯 빠른 시작

Demo 모듈은 시연 요청을 관리하는 API입니다.

### 기본 정보

- **Base URL**: `/demo`
- **인증**: 모든 API에 `Authorization: Bearer {token}` 필수
- **Content-Type**: `application/json`

---

## 📋 주요 API

### 1. 데모 목록 조회

```http
GET /demo
Authorization: Bearer {token}
```

**응답 예시:**

```json
[
  {
    "id": 1,
    "demoTitle": "테스트 데모",
    "demoStatus": "requested",
    "demoStartDate": "2025-07-20T00:00:00.000Z",
    "demoEndDate": "2025-07-21T00:00:00.000Z",
    "eventStartDate": "2025-08-01T00:00:00.000Z",
    "eventEndDate": "2025-08-10T00:00:00.000Z",
    "requester": "test@example.com",
    "handler": "담당자",
    "demoAddress": "서울시 강남구",
    ...
  }
]
```

---

### 2. 데모 상세 조회

```http
GET /demo/:id
Authorization: Bearer {token}
```

**응답 예시:**

```json
{
  "id": 1,
  "demoTitle": "테스트 데모",
  "demoStatus": "requested",
  "requester": "test@example.com",
  "handler": "담당자",
  "demoManager": "매니저",
  "demoManagerPhone": "010-1234-5678",
  "demoAddress": "서울시 강남구",
  "demoStartDate": "2025-07-20T00:00:00.000Z",
  "demoEndDate": "2025-07-21T00:00:00.000Z",
  "eventStartDate": "2025-08-01T00:00:00.000Z",
  "eventEndDate": "2025-08-10T00:00:00.000Z",
  "demoItems": [
    {
      "id": 1,
      "itemId": 1,
      "quantity": 2,
      "memo": "시연용",
      "item": {
        "id": 1,
        "itemName": "품목명"
      }
    }
  ],
  "files": [...],
  "comments": [...]
}
```

---

### 3. 데모 생성

```http
POST /demo
Authorization: Bearer {token}
Content-Type: application/json
```

**요청 바디:**

```json
{
  "requester": "test@example.com",
  "handler": "담당자",
  "demoManager": "매니저",
  "demoManagerPhone": "010-1234-5678",
  "memo": "테스트용 시연입니다",
  "demoTitle": "테스트 데모",
  "demoNationType": "국내",
  "demoPaymentType": "현금",
  "demoPrice": 1000000,
  "demoPaymentDate": "2025-07-20",
  "demoAddress": "서울시 강남구",
  "demoStartDate": "2025-07-20",
  "demoStartTime": "09:00",
  "demoEndDate": "2025-07-21",
  "demoEndTime": "18:00",
  "demoStartDeliveryMethod": "직접수령",
  "demoEndDeliveryMethod": "직접반납",
  "eventStartDate": "2025-08-01",
  "eventEndDate": "2025-08-10",
  "userId": 1,
  "warehouseId": 1,
  "demoItems": [
    {
      "itemId": 1,
      "quantity": 2,
      "memo": "시연용"
    }
  ]
}
```

**필수 필드:**

- `requester`, `handler`, `demoManager`, `demoManagerPhone`
- `demoTitle`, `demoNationType`, `demoPaymentType`
- `demoAddress`, `demoStartDate`, `demoStartTime`, `demoEndDate`, `demoEndTime`
- `demoStartDeliveryMethod`, `demoEndDeliveryMethod`
- `userId`, `warehouseId`

**선택 필드:**

- `memo`, `demoPrice`, `demoPaymentDate`
- `eventStartDate`, `eventEndDate` ⭐ NEW
- `demoItems`

---

### 4. 데모 수정

```http
PATCH /demo/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**요청 바디 (부분 업데이트 가능):**

```json
{
  "demoTitle": "수정된 데모",
  "memo": "수정된 메모",
  "eventStartDate": "2025-08-15",
  "eventEndDate": "2025-08-20",
  "demoItems": [
    {
      "itemId": 1,
      "quantity": 1,
      "memo": "수정된 메모"
    }
  ]
}
```

**참고:**

- 모든 필드가 선택 사항입니다 (부분 업데이트)
- `demoStatus`가 `requested`일 때만 수정 가능

---

### 5. 데모 상태 변경

```http
PATCH /demo/:id/status
Authorization: Bearer {token}
Content-Type: application/json
```

**요청 바디:**

```json
{
  "status": "approved"
}
```

**상태 값:**

- `requested`: 시연 요청됨
- `approved`: 시연 승인됨 (재고 출고)
- `shipmentCompleted`: 배송 완료
- `demoCompleted`: 시연 완료 (재고 입고)

**상태 전이:**

```
requested → approved → shipmentCompleted → demoCompleted
```

---

### 6. 데모 삭제

```http
DELETE /demo/:id
Authorization: Bearer {token}
```

**응답:**

```json
{
  "id": 1,
  "deleted": true
}
```

**참고:** Soft Delete 방식 (실제 삭제 X, deletedAt 필드만 업데이트)

---

## 🆕 신규 필드 안내 (2025-11-17 추가)

### eventStartDate, eventEndDate

**용도:** 이벤트 시작/종료 날짜 (시연 날짜와 별도)

**필드 정보:**

- 타입: `string` (요청 시), `string | null` (응답 시)
- 필수 여부: **선택** (없어도 됨)
- 형식: `YYYY-MM-DD` (권장) 또는 `YYYY-MM-DD HH:MM:SS.mmm`

**예시:**

```json
{
  "eventStartDate": "2025-08-01",
  "eventEndDate": "2025-08-10"
}
```

**응답 형식:**

```json
{
  "eventStartDate": "2025-08-01T00:00:00.000Z",
  "eventEndDate": "2025-08-10T00:00:00.000Z"
}
```

**null 처리:**

```json
{
  "eventStartDate": null,
  "eventEndDate": null
}
```

---
