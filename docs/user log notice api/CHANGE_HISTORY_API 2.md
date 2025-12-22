# 변경 이력 API 문서

> **버전**: 3.0 (팀별 SSE 스트림 및 연결 관리 추가)
> **최종 수정일**: 2025-12-22
> **대상**: 프론트엔드 개발자

---

## 목차

1. [개요](#개요)
2. [시스템 흐름](#시스템-흐름)
3. [API 엔드포인트](#api-엔드포인트)
4. [SSE 실시간 알림](#sse-실시간-알림)
5. [팀별 SSE 스트림](#팀별-sse-스트림) ✨ 신규
6. [SSE 연결 관리](#sse-연결-관리) ✨ 신규
7. [응답 형식](#응답-형식)
8. [필드명 매핑](#필드명-매핑)
9. [UI 가이드](#ui-가이드)

---

## 개요

Demo(시연), Order(주문)의 모든 변경 사항 및 아이템 재고 변동을 자동으로 추적하고 조회하는 API입니다.

### 핵심 특징

- **자동 기록**: 백엔드에서 Demo/Order 생성, 수정, 상태변경, 삭제 및 재고 변동 시 자동으로 이력 기록
- **프론트 작업 불필요**: 이력 생성을 위한 별도 API 호출 없음
- **조회만 구현**: 프론트엔드는 이력 조회 API만 호출하면 됨
- **실시간 알림 (선택)**: SSE를 통한 실시간 변경 알림 지원

### 추적되는 변경 유형

| Action            | 설명      | 자동 기록 시점                |
| ----------------- | --------- | ----------------------------- |
| `create`          | 생성      | Demo/Order 생성 API 호출 시   |
| `update`          | 필드 수정 | Demo/Order 수정 API 호출 시   |
| `status_change`   | 상태 변경 | 상태 변경 API 호출 시         |
| `delete`          | 삭제      | Demo/Order 삭제 API 호출 시   |
| `quantity_change` | 재고 변동 | 아이템 재고 수정 API 호출 시  |

### 인증

모든 API는 JWT 인증이 필요합니다.

```
Authorization: Bearer {accessToken}
```

---

## 시스템 흐름

### 자동 이력 기록 흐름

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│  프론트엔드  │────▶│  백엔드 API  │────▶│  ChangeHistory   │
│             │     │  Controller  │     │     Service      │
└─────────────┘     └─────────────┘     └──────────────────┘
                           │                      │
                           │                      ▼
                           │              ┌──────────────┐
                           │              │   Database   │
                           │              │ ChangeHistory│
                           │              └──────────────┘
                           │                      │
                           ▼                      ▼
                    ┌─────────────┐       ┌──────────────┐
                    │   SSE 알림   │◀──────│ EventEmitter │
                    │  (선택사항)  │       │   (백엔드)   │
                    └─────────────┘       └──────────────┘
```

### 프론트엔드 관점 흐름

```
1. 기존 API 사용 (변경 없음)
   ┌──────────────────────────────────────────────────────────┐
   │ POST /demo           → Demo 생성 (이력 자동 기록)         │
   │ PATCH /demo/:id      → Demo 수정 (이력 자동 기록)         │
   │ PATCH /demo/:id/status → 상태 변경 (이력 자동 기록)       │
   │ DELETE /demo/:id     → Demo 삭제 (이력 자동 기록)         │
   │                                                          │
   │ POST /order          → Order 생성 (이력 자동 기록)        │
   │ PATCH /order/:id     → Order 수정 (이력 자동 기록)        │
   │ PATCH /order/:id/status → 상태 변경 (이력 자동 기록)      │
   │ DELETE /order/:id    → Order 삭제 (이력 자동 기록)        │
   │                                                          │
   │ PATCH /item/:id/quantity → 재고 수량 수정 (이력 자동 기록) │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
2. 이력 조회 (새 API)
   ┌──────────────────────────────────────────────────────────┐
   │ GET /change-history/demo/:id   → Demo 변경 이력 조회      │
   │ GET /change-history/order/:id  → Order 변경 이력 조회     │
   │ GET /change-history/item/:id   → Item 재고 변동 이력 조회 │
   └──────────────────────────────────────────────────────────┘
                              │
                              ▼
3. 실시간 알림 (선택, SSE)
   ┌───────────────────────────────────────────────────────────────┐
   │ GET /change-history/demo/:id/stream  → Demo 실시간 구독       │
   │ GET /change-history/order/:id/stream → Order 실시간 구독      │
   │ GET /change-history/item/:id/stream  → Item 재고 실시간 구독  │
   └───────────────────────────────────────────────────────────────┘
                              │
                              ▼
4. 팀별 실시간 알림 (선택, SSE) ✨ 신규
   ┌───────────────────────────────────────────────────────────────┐
   │ GET /change-history/team/:teamId/stream → 팀 전체 변경 구독   │
   │ GET /change-history/team/:teamId/stream?types=demo,order      │
   │                                         → 특정 타입만 필터링  │
   └───────────────────────────────────────────────────────────────┘
```

### 프론트엔드 구현 범위

| 구분              | 프론트 작업 필요 여부 | 설명                     |
| ----------------- | :-------------------: | ------------------------ |
| 이력 생성         |          ❌           | 백엔드 자동 처리         |
| 이력 조회         |          ✅           | 조회 API 호출 필요       |
| 실시간 알림 (SSE) |       ✅ (선택)       | 필요 시 EventSource 연결 |
| 팀별 SSE 스트림   |       ✅ (선택)       | 팀 대시보드에서 활용     |

---

## API 엔드포인트

### 1. Demo 변경 이력 조회

```http
GET /change-history/demo/:id
```

**Path Parameters:**

| 파라미터 | 타입   | 필수 | 설명    |
| -------- | ------ | :--: | ------- |
| `id`     | number |  ✅  | Demo ID |

**Query Parameters:**

| 파라미터 | 타입   | 기본값 | 설명                                                  |
| -------- | ------ | ------ | ----------------------------------------------------- |
| `page`   | number | 1      | 페이지 번호                                           |
| `limit`  | number | 10     | 페이지당 항목 수                                      |
| `action` | string | -      | 필터링할 액션 (create, update, status_change, delete) |

**요청 예시:**

```http
GET /change-history/demo/123?page=1&limit=10
GET /change-history/demo/123?action=status_change
```

---

### 2. Order 변경 이력 조회

```http
GET /change-history/order/:id
```

**Path Parameters:**

| 파라미터 | 타입   | 필수 | 설명     |
| -------- | ------ | :--: | -------- |
| `id`     | number |  ✅  | Order ID |

**Query Parameters:**

| 파라미터 | 타입   | 기본값 | 설명                                                  |
| -------- | ------ | ------ | ----------------------------------------------------- |
| `page`   | number | 1      | 페이지 번호                                           |
| `limit`  | number | 10     | 페이지당 항목 수                                      |
| `action` | string | -      | 필터링할 액션 (create, update, status_change, delete) |

**요청 예시:**

```http
GET /change-history/order/456?page=1&limit=10
GET /change-history/order/456?action=update
```

---

### 3. Item(아이템 재고) 변동 이력 조회

```http
GET /change-history/item/:id
```

**Path Parameters:**

| 파라미터 | 타입   | 필수 | 설명    |
| -------- | ------ | :--: | ------- |
| `id`     | number |  ✅  | Item ID |

**Query Parameters:**

| 파라미터 | 타입   | 기본값 | 설명                               |
| -------- | ------ | ------ | ---------------------------------- |
| `page`   | number | 1      | 페이지 번호                        |
| `limit`  | number | 10     | 페이지당 항목 수                   |
| `action` | string | -      | 필터링할 액션 (quantity_change)    |

**요청 예시:**

```http
GET /change-history/item/789?page=1&limit=10
GET /change-history/item/789?action=quantity_change
```

**응답 예시:**

```json
{
  "data": [
    {
      "id": 1,
      "action": "quantity_change",
      "field": "itemQuantity",
      "fieldLabel": "재고 수량",
      "oldValue": { "itemQuantity": 100 },
      "newValue": { "itemQuantity": 85 },
      "userName": "홍길동",
      "userEmail": "hong@example.com",
      "accessLevel": "moderator",
      "remarks": null,
      "createdAt": "2025-12-19T10:30:00.000Z"
    },
    {
      "id": 2,
      "action": "quantity_change",
      "field": "itemQuantity",
      "fieldLabel": "재고 수량",
      "oldValue": { "itemQuantity": 85 },
      "newValue": { "itemQuantity": 90 },
      "userName": "김철수",
      "userEmail": "kim@example.com",
      "accessLevel": "admin",
      "remarks": "반품 입고",
      "createdAt": "2025-12-18T14:20:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

## SSE 실시간 알림

> **구현 상태**: ✅ 구현 완료 (Phase 4)

### SSE란?

Server-Sent Events(SSE)는 서버에서 클라이언트로 단방향 실시간 데이터를 전송하는 기술입니다.

- **연결 방식**: HTTP 기반, 한 번 연결하면 서버가 계속 푸시
- **재연결**: 브라우저가 자동 재연결 지원
- **서버 부하**: 이벤트 발생 시에만 데이터 전송 (폴링보다 효율적)

### SSE vs WebSocket vs Polling 비교

| 구분       | SSE                | WebSocket      | Polling           |
| ---------- | ------------------ | -------------- | ----------------- |
| 방향       | 서버 → 클라이언트  | 양방향         | 클라이언트 → 서버 |
| 프로토콜   | HTTP               | WS             | HTTP              |
| 재연결     | 자동               | 수동 구현 필요 | 해당없음          |
| 복잡도     | 낮음               | 높음           | 매우 낮음         |
| 서버 부하  | 낮음               | 중간           | 높음              |
| 실시간성   | 즉시               | 즉시           | 주기적            |
| **적합성** | **✅ 권장**        | 과함           | 비효율적          |

### SSE 엔드포인트

#### Demo 실시간 구독

```http
GET /change-history/demo/:id/stream
```

#### Order 실시간 구독

```http
GET /change-history/order/:id/stream
```

#### Item 재고 실시간 구독

```http
GET /change-history/item/:id/stream
```

### SSE 이벤트 형식

#### Demo/Order 상태 변경 이벤트
```
event: change
data: {"id":1,"action":"status_change","field":"demoStatus","fieldLabel":"상태","oldValue":{"demoStatus":"요청"},"newValue":{"demoStatus":"승인"},"userName":"홍길동","createdAt":"2025-12-19T10:30:00.000Z"}

event: heartbeat
data: {"timestamp":"2025-12-19T10:30:30.000Z"}
```

#### Item 재고 변경 이벤트
```
event: change
data: {"id":5,"action":"quantity_change","field":"itemQuantity","fieldLabel":"수량","oldValue":{"itemQuantity":100},"newValue":{"itemQuantity":80},"userName":"김철수","createdAt":"2025-12-19T11:00:00.000Z"}

event: heartbeat
data: {"timestamp":"2025-12-19T11:00:30.000Z"}
```

### 프론트엔드 SSE 구현 예시

```typescript
// SSE 연결 (EventSource API 사용)
const connectSSE = (demoId: number, token: string) => {
  const eventSource = new EventSource(
    `${API_URL}/change-history/demo/${demoId}/stream`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 변경 이벤트 수신
  eventSource.addEventListener('change', (event) => {
    const data = JSON.parse(event.data);
    console.log('새 변경 이력:', data);
    // UI 업데이트 로직
  });

  // 연결 상태 확인용 heartbeat
  eventSource.addEventListener('heartbeat', (event) => {
    console.log('연결 유지 중...');
  });

  // 에러 처리
  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error);
    eventSource.close();
    // 재연결 로직 (브라우저가 자동 재연결하지만, 필요 시 수동 처리)
  };

  return eventSource;
};

// 컴포넌트에서 Demo/Order SSE 사용
useEffect(() => {
  const eventSource = connectSSE(demoId, accessToken);

  return () => {
    eventSource.close(); // 컴포넌트 언마운트 시 연결 해제
  };
}, [demoId]);

// Item 재고 SSE 연결 (별도 함수)
const connectItemSSE = (itemId: number, token: string) => {
  const eventSource = new EventSource(
    `${API_URL}/change-history/item/${itemId}/stream`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  eventSource.addEventListener('change', (event) => {
    const data = JSON.parse(event.data);
    console.log('재고 변경 이력:', data);
    // 재고 현황 UI 업데이트 로직
  });

  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error);
    eventSource.close();
  };

  return eventSource;
};
```

### SSE 사용 시나리오

1. **Demo 상세 페이지**: 해당 Demo의 실시간 변경 알림
2. **Order 상세 페이지**: 해당 Order의 실시간 변경 알림
3. **Item 상세 페이지**: 해당 Item의 재고 변동 실시간 알림
4. **대시보드**: 전체 변경 사항 실시간 모니터링

### SSE 구현 시 주의사항

- 페이지 이탈 시 반드시 `eventSource.close()` 호출
- 토큰 만료 시 재연결 로직 필요
- 네트워크 불안정 시 자동 재연결 (브라우저 기본 동작)

---

## 팀별 SSE 스트림

> **구현 상태**: ✅ 구현 완료 (v3.0)

### 개요

특정 팀에 속한 모든 변경 이력(Demo, Order, Item)을 실시간으로 수신하는 기능입니다.

**사용 시나리오:**
- 팀 대시보드에서 해당 팀의 모든 활동을 실시간 모니터링
- 팀 리더가 팀원들의 작업 현황을 확인
- 영업팀 담당자가 자기 팀의 주문/시연 변경 사항을 실시간 확인

### 엔드포인트

```http
GET /change-history/team/:teamId/stream
```

**Path Parameters:**

| 파라미터 | 타입   | 필수 | 설명    |
| -------- | ------ | :--: | ------- |
| `teamId` | number |  ✅  | Team ID |

**Query Parameters:**

| 파라미터 | 타입   | 기본값           | 설명                                      |
| -------- | ------ | ---------------- | ----------------------------------------- |
| `types`  | string | demo,order,item  | 필터링할 타입 (쉼표 구분: demo, order, item) |

**요청 예시:**

```http
# 모든 타입 수신
GET /change-history/team/1/stream

# Demo, Order만 수신
GET /change-history/team/1/stream?types=demo,order

# Item만 수신
GET /change-history/team/1/stream?types=item
```

### 이벤트 형식

#### 변경 이벤트

```
data: {"entityType":"order","entityId":123,"teamId":1,"id":456,"action":"status_change","field":"status","fieldLabel":"상태","oldValue":{"status":"대기"},"newValue":{"status":"확정"},"userName":"홍길동","createdAt":"2025-12-22T12:00:00Z"}

data: {"entityType":"demo","entityId":789,"teamId":1,"id":101,"action":"create","userName":"김철수","createdAt":"2025-12-22T12:00:05Z"}

data: {"entityType":"item","entityId":555,"teamId":1,"id":202,"action":"quantity_change","field":"itemQuantity","fieldLabel":"재고 수량","oldValue":{"itemQuantity":100},"newValue":{"itemQuantity":80},"userName":"이영희","createdAt":"2025-12-22T12:00:10Z"}
```

#### Heartbeat 이벤트 (30초 간격)

```
data: {"type":"heartbeat","timestamp":"2025-12-22T12:00:30Z"}
```

### 프론트엔드 구현 예시

```typescript
// 팀별 SSE 연결
const connectTeamSSE = (teamId: number, token: string, types?: string[]) => {
  const typesParam = types ? `?types=${types.join(',')}` : '';
  const eventSource = new EventSource(
    `${API_URL}/change-history/team/${teamId}/stream${typesParam}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // 변경 이벤트 수신
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // heartbeat 이벤트 처리
    if (data.type === 'heartbeat') {
      console.log('연결 유지 중:', data.timestamp);
      return;
    }

    // 변경 이력 처리
    console.log(`[${data.entityType}] ${data.action}:`, data);

    // UI 업데이트
    switch (data.entityType) {
      case 'demo':
        updateDemoList(data);
        break;
      case 'order':
        updateOrderList(data);
        break;
      case 'item':
        updateInventory(data);
        break;
    }
  };

  // 에러 처리
  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error);
    // EventSource는 자동 재연결 시도
  };

  return eventSource;
};

// 컴포넌트에서 사용
useEffect(() => {
  const eventSource = connectTeamSSE(
    teamId,
    accessToken,
    ['demo', 'order']  // Demo, Order만 수신
  );

  return () => {
    eventSource.close();
  };
}, [teamId]);
```

### 팀 연결 방식

| 엔티티 | 팀 연결 방식 | 설명 |
| ------ | ------------ | ---- |
| Demo   | `Demo → Warehouse → Team` | Demo의 warehouse를 통해 teamId 조회 |
| Order  | `Order → Warehouse → Team` | Order의 warehouse를 통해 teamId 조회 |
| Item   | `Item → TeamItem → Team` | TeamItem 테이블을 통해 연결된 모든 팀에 전송 |

---

## SSE 연결 관리

### 연결 추적

서버는 모든 활성 SSE 연결을 추적하여 관리합니다.

| 항목 | 설명 |
| ---- | ---- |
| 연결 ID | UUID로 각 연결 고유 식별 |
| 팀 ID | 구독 중인 팀 (팀별 스트림인 경우) |
| 사용자 ID | 연결한 사용자 |
| 연결 시작 시간 | 연결 유지 시간 계산용 |

### Heartbeat 메커니즘

| 항목 | 설정값 | 설명 |
| ---- | ------ | ---- |
| 간격 | 30초 | 연결 유지 확인 |
| 이벤트 타입 | heartbeat | 클라이언트에서 구분 가능 |
| 데이터 | timestamp | 서버 시간 전송 |

### 연결 종료 처리

서버는 다음 상황에서 연결을 자동으로 정리합니다:

| 시나리오 | 트리거 | 서버 동작 |
| -------- | ------ | --------- |
| 클라이언트 명시적 종료 | `eventSource.close()` | 연결 정리 및 로깅 |
| 브라우저 탭/창 닫기 | 브라우저 이벤트 | 연결 정리 및 로깅 |
| 네트워크 끊김 | TCP 연결 끊김 | 에러 로깅 후 정리 |
| 서버 재시작 | 프로세스 종료 | 모든 연결 graceful shutdown |

### 서버 측 관리 기능

```typescript
// 활성 연결 수 조회
getActiveConnectionCount(): number

// 특정 연결 강제 종료
forceDisconnect(connectionId: string): boolean

// 특정 팀의 모든 연결 종료
forceDisconnectByTeam(teamId: number): number

// 특정 사용자의 모든 연결 종료 (로그아웃 시)
forceDisconnectByUser(userId: number): number
```

### 연결 로그 예시

```
[INFO] SSE 연결 시작: abc-123, Team: 1, User: 5, Types: demo,order
[INFO] SSE 연결 종료: abc-123, 사유: client_close, 유지 시간: 1823초
[INFO] SSE 연결 정리 완료: abc-123, 연결 유지 시간: 1823초
```

---

## 응답 형식

### 성공 응답 (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "action": "status_change",
      "field": "demoStatus",
      "fieldLabel": "상태",
      "oldValue": { "demoStatus": "요청" },
      "newValue": { "demoStatus": "승인" },
      "userName": "홍길동",
      "userEmail": "hong@example.com",
      "accessLevel": "moderator",
      "remarks": null,
      "createdAt": "2025-12-03T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### 응답 필드 설명

#### data[] 항목

| 필드          | 타입             | 설명                               |
| ------------- | ---------------- | ---------------------------------- |
| `id`          | number           | 이력 고유 ID                       |
| `action`      | string           | 변경 유형                          |
| `field`       | string \| null   | 변경된 필드명 (영문)               |
| `fieldLabel`  | string \| null   | 변경된 필드명 (한글)               |
| `oldValue`    | object \| null   | 이전 값 (`{ fieldName: value }`)   |
| `newValue`    | object \| null   | 새 값 (`{ fieldName: value }`)     |
| `userName`    | string           | 변경자 이름                        |
| `userEmail`   | string           | 변경자 이메일                      |
| `accessLevel` | string           | 변경자 권한 (user/moderator/admin) |
| `remarks`     | string \| null   | 변경 사유 (선택 입력 시)           |
| `createdAt`   | string (ISO8601) | 변경 일시                          |

#### meta

| 필드         | 타입   | 설명            |
| ------------ | ------ | --------------- |
| `total`      | number | 전체 항목 수    |
| `page`       | number | 현재 페이지     |
| `limit`      | number | 페이지당 항목수 |
| `totalPages` | number | 전체 페이지 수  |

### 에러 응답

```json
// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Demo not found"
}
```

---

## 필드명 매핑

### Demo 필드

| field (영문)       | fieldLabel (한글) |
| ------------------ | ----------------- |
| `demoStatus`       | 상태              |
| `demoDate`         | 시연 날짜         |
| `demoTime`         | 시연 시간         |
| `demoAddress`      | 시연 주소         |
| `demoManager`      | 시연 담당자       |
| `demoManagerPhone` | 담당자 연락처     |
| `demoItems`        | 시연 품목         |
| `memo`             | 메모              |
| `companyName`      | 회사명            |
| `eventStartDate`   | 행사 시작일       |
| `eventEndDate`     | 행사 종료일       |
| `eventStartTime`   | 행사 시작 시간    |
| `eventEndTime`     | 행사 종료 시간    |

### Order 필드

| field (영문)      | fieldLabel (한글) |
| ----------------- | ----------------- |
| `status`          | 상태              |
| `receiver`        | 수령인            |
| `receiverPhone`   | 수령인 연락처     |
| `deliveryAddress` | 배송 주소         |
| `deliveryDate`    | 배송 희망일       |
| `deliveryMemo`    | 배송 메모         |
| `orderItems`      | 주문 품목         |
| `memo`            | 메모              |
| `trackingNumber`  | 운송장 번호       |
| `deliveryCompany` | 택배사            |

### Item(아이템 재고) 필드

| field (영문)    | fieldLabel (한글) |
| --------------- | ----------------- |
| `itemQuantity`  | 재고 수량         |
| `itemName`      | 품목명            |
| `itemCode`      | 품목 코드         |
| `warehouseName` | 창고명            |

---

## UI 가이드

### 액션별 표시

| Action            | 표시 텍스트 | 색상 제안          |
| ----------------- | ----------- | ------------------ |
| `create`          | 생성        | 초록색 (`#22c55e`) |
| `update`          | 수정        | 파란색 (`#3b82f6`) |
| `status_change`   | 상태 변경   | 보라색 (`#8b5cf6`) |
| `delete`          | 삭제        | 빨간색 (`#ef4444`) |
| `quantity_change` | 재고 변동   | 주황색 (`#f97316`) |

### 권한별 배지

| accessLevel | 표시 텍스트 | 스타일 제안 |
| ----------- | ----------- | ----------- |
| `admin`     | 관리자      | 빨간색 배지 |
| `moderator` | 운영자      | 파란색 배지 |
| `user`      | 일반        | 회색 배지   |

### 값 표시 로직

```typescript
// oldValue/newValue에서 값 추출
const extractValue = (
  valueObj: Record<string, any> | null,
  field: string | null
): string => {
  if (!valueObj || !field) return '-';
  const value = valueObj[field];

  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) return `${value.length}개 항목`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
```

---

## 참고 사항

1. **정렬**: 이력은 항상 최신순(`createdAt DESC`)으로 정렬됩니다.
2. **oldValue/newValue 형식**: 항상 `{ fieldName: value }` 형태의 객체입니다.
3. **create/delete 액션**: `field`, `oldValue`, `newValue`가 모두 `null`입니다.
4. **상태 변경**: `status_change` 액션에서 `field`는 Demo의 경우 `demoStatus`, Order의 경우 `status`입니다.
5. **하위 호환성**: 기존 API 응답은 변경 없음. 이력은 백엔드에서 자동 생성됨.
6. **재고 변동**: `quantity_change` 액션에서 `field`는 `itemQuantity`이며, `oldValue`/`newValue`에 이전/이후 수량이 기록됩니다.

---

## TypeScript 타입 정의

```typescript
interface ChangeHistoryItem {
  id: number;
  action: 'create' | 'update' | 'status_change' | 'delete' | 'quantity_change';
  field: string | null;
  fieldLabel: string | null;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  userName: string;
  userEmail: string;
  accessLevel: 'user' | 'moderator' | 'admin';
  remarks: string | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type ChangeHistoryResponse = PaginatedResponse<ChangeHistoryItem>;

// 팀별 SSE 이벤트 타입
interface TeamHistoryEvent {
  entityType: 'demo' | 'order' | 'item';
  entityId: number;
  teamId: number;
  id: number;
  action: 'create' | 'update' | 'status_change' | 'delete' | 'quantity_change';
  field?: string;
  fieldLabel?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  userName: string;
  userEmail: string;
  createdAt: string;
}

// Heartbeat 이벤트 타입
interface HeartbeatEvent {
  type: 'heartbeat';
  timestamp: string;
}

// SSE 이벤트 유니온 타입
type SSEEvent = TeamHistoryEvent | HeartbeatEvent;
```

---

## 문의

백엔드 관련 문의: 백엔드 개발팀
