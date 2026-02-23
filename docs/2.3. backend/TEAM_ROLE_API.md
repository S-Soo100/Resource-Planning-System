# 팀별 역할/권한 API 문서

> **버전**: 1.0
> **최종 수정일**: 2025-02-19
> **대상**: 프론트엔드 개발자

---

## 목차

1. [개요](#개요)
2. [권한 체계](#권한-체계)
3. [API 엔드포인트](#api-엔드포인트)
4. [기존 API 응답 변경사항](#기존-api-응답-변경사항)
5. [권한 가드 동작 방식](#권한-가드-동작-방식)
6. [UI 가이드](#ui-가이드)
7. [마이그레이션 가이드](#마이그레이션-가이드)

---

## 개요

사용자가 팀마다 다른 권한(`accessLevel`, `isAdmin`, `restrictedWhs`)을 가질 수 있도록 하는 **팀별 역할/권한 시스템**입니다.

### 핵심 변경사항

- 기존에는 `User` 테이블에만 권한이 있어 **모든 팀에서 동일한 권한**이 적용됨
- 이제 `TeamUserMap`에 권한 필드가 추가되어 **팀마다 다른 권한** 설정 가능
- **하위 호환**: 팀별 권한이 설정되지 않으면 기존 User 권한으로 폴백

### 인증

모든 API는 JWT 인증이 필요합니다.

```
Authorization: Bearer {accessToken}
```

---

## 권한 체계

### 권한 레벨 (`accessLevel`)

| 값 | 설명 | 주요 권한 |
|---|---|---|
| `user` | 일반 사용자 (기본값) | 조회, 기본 CRUD |
| `moderator` | 중간 관리자 | 주문/시연 승인, 팀원 관리 |
| `admin` | 관리자 | 모든 기능 접근 가능 |

### 관리자 여부 (`isAdmin`)

| 값 | 설명 |
|---|---|
| `true` | 관리자 — 역할 체크 bypass, 모든 창고 접근 가능 |
| `false` | 비관리자 — `accessLevel`과 `restrictedWhs`에 따라 접근 제한 |

### 제한 창고 (`restrictedWhs`)

| 값 | 설명 |
|---|---|
| `null` | 제한 없음 — 모든 창고 접근 가능 |
| `"1,2,3"` | 쉼표 구분된 창고 ID 목록 — 해당 창고만 접근 가능 |

### 권한 우선순위

```
1. TeamUserMap에 팀별 권한이 설정되어 있으면 → 팀별 권한 사용
2. TeamUserMap.accessLevel이 null이면  → User 테이블 권한으로 폴백
3. TeamUserMap 레코드 자체가 없으면     → User 테이블 권한으로 폴백
```

---

## API 엔드포인트

### 1. 팀별 유효 권한 조회

사용자의 특정 팀에서의 유효 권한을 조회합니다.

```
GET /team-role/:teamId/user/:userId
```

#### 요청

| 파라미터 | 위치 | 타입 | 필수 | 설명 |
|---------|------|------|------|------|
| `teamId` | Path | number | ✅ | 팀 ID |
| `userId` | Path | number | ✅ | 사용자 ID |

#### 요청 예시

```http
GET /team-role/1/user/5
Authorization: Bearer {accessToken}
```

#### 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "accessLevel": "moderator",
    "isAdmin": false,
    "restrictedWhs": "1,3,5"
  }
}
```

#### 응답 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `accessLevel` | `string` | 유효 권한 레벨 (`user` / `moderator` / `admin`) |
| `isAdmin` | `boolean` | 관리자 여부 |
| `restrictedWhs` | `string \| null` | 접근 가능한 창고 ID 목록 (쉼표 구분). `null`이면 전체 접근 |

#### 에러 응답

| 상태 코드 | 설명 |
|----------|------|
| 401 | 인증 토큰 누락 또는 만료 |
| 404 | 사용자 또는 팀 없음 (data가 `null`) |

---

### 2. 팀별 권한 수정

사용자의 특정 팀에서의 권한을 수정합니다.

```
PATCH /team-role/:teamId/user/:userId
```

#### 요청

| 파라미터 | 위치 | 타입 | 필수 | 설명 |
|---------|------|------|------|------|
| `teamId` | Path | number | ✅ | 팀 ID |
| `userId` | Path | number | ✅ | 사용자 ID |

#### 요청 Body

모든 필드 **선택적(optional)** — 변경할 필드만 전송합니다.

| 필드 | 타입 | 필수 | 설명 | 허용 값 |
|------|------|------|------|--------|
| `accessLevel` | `string` | ❌ | 권한 레벨 | `"user"`, `"moderator"`, `"admin"` |
| `isAdmin` | `boolean` | ❌ | 관리자 여부 | `true`, `false` |
| `restrictedWhs` | `string` | ❌ | 제한 창고 목록 | 쉼표 구분 창고 ID (예: `"1,2,3"`) |

#### 요청 예시

```http
PATCH /team-role/1/user/5
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "accessLevel": "moderator",
  "isAdmin": false,
  "restrictedWhs": "1,3"
}
```

#### 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "count": 1
  }
}
```

#### 응답 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `count` | `number` | 수정된 레코드 수. `0`이면 해당 팀에 소속되지 않은 사용자 |

#### 에러 응답

| 상태 코드 | 설명 |
|----------|------|
| 400 | 잘못된 요청 (유효하지 않은 accessLevel 등) |
| 401 | 인증 토큰 누락 또는 만료 |

---

### 3. 창고 접근 권한 확인

사용자가 특정 팀의 특정 창고에 접근 가능한지 확인합니다.

```
GET /team-role/:teamId/user/:userId/warehouse-access?warehouseId={id}
```

#### 요청

| 파라미터 | 위치 | 타입 | 필수 | 설명 |
|---------|------|------|------|------|
| `teamId` | Path | number | ✅ | 팀 ID |
| `userId` | Path | number | ✅ | 사용자 ID |
| `warehouseId` | Query | number | ✅ | 확인할 창고 ID |

#### 요청 예시

```http
GET /team-role/1/user/5/warehouse-access?warehouseId=3
Authorization: Bearer {accessToken}
```

#### 응답 (200 OK)

```json
{
  "success": true,
  "data": {
    "canAccess": true
  }
}
```

#### 응답 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `canAccess` | `boolean` | 접근 가능 여부 |

#### 접근 판단 로직

```
1. isAdmin이 true → 항상 접근 가능
2. restrictedWhs가 null → 제한 없음, 접근 가능
3. restrictedWhs에 warehouseId가 포함 → 접근 가능
4. 그 외 → 접근 거부
```

#### 에러 응답

| 상태 코드 | 설명 |
|----------|------|
| 400 | warehouseId 누락 또는 유효하지 않은 값 |
| 401 | 인증 토큰 누락 또는 만료 |

---

## 기존 API 응답 변경사항

### TeamUserMap 포함 API에 필드 추가

아래 API들의 응답에서 `teamUserMap` 객체에 **3개 필드가 추가**되었습니다.

#### 영향받는 API

| API | 엔드포인트 |
|-----|-----------|
| 팀 목록 조회 | `GET /team` |
| 팀 상세 조회 | `GET /team/:id` |
| 사용자 목록 조회 | `GET /user` |
| 주문 목록 조회 | `GET /order` |
| 주문 상세 조회 | `GET /order/:id` |
| 사용자별 주문 조회 | `GET /order/user/:userId` |
| 공급업체별 주문 조회 | `GET /order/supplier/:supplierId` |
| 팀별 주문 조회 | `GET /order/team/:teamId` |
| 패키지별 주문 조회 | `GET /order/package/:packageId` |
| 시연 목록 조회 | `GET /demo` |
| 시연 상세 조회 | `GET /demo/:id` |
| 팀별 시연 조회 | `GET /demo/team/:teamId` |

#### 변경 전 TeamUserMap 응답

```json
{
  "id": 1,
  "mapping_id": "맵핑-123",
  "userId": 5,
  "teamId": 1,
  "user": {
    "id": 5,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

#### 변경 후 TeamUserMap 응답

```json
{
  "id": 1,
  "mapping_id": "맵핑-123",
  "userId": 5,
  "teamId": 1,
  "accessLevel": "moderator",
  "isAdmin": false,
  "restrictedWhs": "1,3,5",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

#### 추가된 필드

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `accessLevel` | `string` | `"user"` | 팀별 권한 레벨 |
| `isAdmin` | `boolean` | `false` | 팀별 관리자 여부 |
| `restrictedWhs` | `string \| null` | `null` | 팀별 제한 창고 목록 |

> **하위 호환**: 기존에 이 필드들을 사용하지 않던 프론트엔드 코드는 **수정 없이** 정상 동작합니다. 추가 필드만 무시하면 됩니다.

---

### 팀에 사용자 추가 시 자동 권한 복사

팀에 사용자 추가 API를 호출하면, 해당 사용자의 User 테이블 권한이 TeamUserMap에 자동으로 복사됩니다.

- `POST /team/:teamId/user/:userId` (Path param 방식)
- `POST /team/:id/users` (Body에 userId 전달 방식)

```
User.accessLevel → TeamUserMap.accessLevel
User.isAdmin     → TeamUserMap.isAdmin
User.restrictedWhs → TeamUserMap.restrictedWhs
```

프론트엔드에서 별도 처리는 불필요합니다.

---

## 권한 가드 동작 방식

### TeamRoleGuard (AdminGuard 대체)

기존 `AdminGuard`가 `TeamRoleGuard`로 교체되었습니다. 프론트엔드 API 호출에는 변경이 없습니다.

#### teamId가 있는 요청

```
요청에 teamId 존재 (params/query/body)
  → TeamUserMap에서 팀 소속 확인
    → 미소속: 403 "팀에 소속되어 있지 않습니다"
    → 소속: 팀별 유효 권한으로 역할 체크
```

#### teamId가 없는 요청

```
요청에 teamId 없음
  → User 테이블 기본 권한 사용 (기존 AdminGuard와 동일 동작)
```

#### 에러 응답

| 상태 코드 | 메시지 | 설명 |
|----------|--------|------|
| 403 | `사용자 인증이 필요합니다` | JWT 토큰 누락 |
| 403 | `팀에 소속되어 있지 않습니다` | teamId가 있지만 해당 팀에 미소속 |
| 403 | `권한이 부족합니다` | 필요한 역할(accessLevel)이 부족 |

---

## UI 가이드

### 1. 팀 멤버 목록에서 권한 표시

팀 상세 조회 API 응답의 `teamUserMap` 배열에서 각 멤버의 권한을 표시합니다.

```typescript
// 팀 멤버 권한 표시 예시
interface TeamMember {
  userId: number;
  accessLevel: 'user' | 'moderator' | 'admin';
  isAdmin: boolean;
  restrictedWhs: string | null;
  user: { id: number; email: string; name: string };
}

// 권한 레벨 한글 표시
const accessLevelLabel = {
  user: '일반 사용자',
  moderator: '중간 관리자',
  admin: '관리자',
};
```

### 2. 팀별 권한 수정 UI

```typescript
// 권한 수정 요청 예시
const updateTeamRole = async (teamId: number, userId: number) => {
  const response = await fetch(`/team-role/${teamId}/user/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessLevel: 'moderator',
      restrictedWhs: '1,3',
    }),
  });

  const result = await response.json();
  if (result.data.count === 0) {
    alert('해당 팀에 소속되지 않은 사용자입니다.');
  }
};
```

### 3. 창고 접근 권한 확인

특정 창고 관련 기능을 보여주기 전에 접근 권한을 확인합니다.

```typescript
// 창고 접근 권한 확인 예시
const checkAccess = async (teamId: number, userId: number, warehouseId: number) => {
  const response = await fetch(
    `/team-role/${teamId}/user/${userId}/warehouse-access?warehouseId=${warehouseId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  const result = await response.json();
  return result.data.canAccess; // true or false
};
```

### 4. 권한에 따른 UI 분기 예시

```typescript
// 팀별 유효 권한 조회 후 UI 분기
const role = await getEffectiveRole(teamId, userId);

if (role.isAdmin || role.accessLevel === 'admin') {
  // 전체 관리 메뉴 표시
  showAdminMenu();
} else if (role.accessLevel === 'moderator') {
  // 승인/관리 메뉴 표시
  showModeratorMenu();
} else {
  // 기본 메뉴만 표시
  showUserMenu();
}

// 창고 필터링 (restrictedWhs 기반)
if (role.restrictedWhs) {
  const allowedIds = role.restrictedWhs.split(',').map(Number);
  const filteredWarehouses = warehouses.filter(w => allowedIds.includes(w.id));
  showWarehouses(filteredWarehouses);
} else {
  showWarehouses(warehouses); // 전체 표시
}
```

---

## 마이그레이션 가이드

### 프론트엔드 변경 필요 사항

#### 필수 변경 (없음)

기존 API 호출은 **변경 없이 정상 동작**합니다. 하위 호환이 유지됩니다.

#### 권장 변경

| 우선순위 | 작업 | 설명 |
|---------|------|------|
| 높음 | 팀 멤버 목록에 권한 표시 | `teamUserMap.accessLevel`, `isAdmin` 필드 활용 |
| 높음 | 팀별 권한 수정 UI 추가 | `PATCH /team-role/:teamId/user/:userId` 호출 |
| 중간 | 창고 접근 권한 체크 | 창고 관련 기능 진입 전 `warehouse-access` API 호출 |
| 낮음 | 권한별 UI 분기 | `accessLevel`에 따른 메뉴/기능 제한 |

#### 타입 정의 추가

```typescript
// 기존 TeamUserMap 타입에 추가
interface TeamUserMap {
  id: number;
  mapping_id?: string;
  userId: number;
  teamId: number;
  accessLevel: 'user' | 'moderator' | 'admin';  // 추가
  isAdmin: boolean;                                // 추가
  restrictedWhs: string | null;                    // 추가
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

// 팀별 유효 권한 응답
interface TeamRoleResponse {
  accessLevel: 'user' | 'moderator' | 'admin';
  isAdmin: boolean;
  restrictedWhs: string | null;
}

// 권한 수정 요청
interface UpdateTeamRoleRequest {
  accessLevel?: 'user' | 'moderator' | 'admin';
  isAdmin?: boolean;
  restrictedWhs?: string;
}

// 창고 접근 권한 응답
interface WarehouseAccessResponse {
  canAccess: boolean;
}
```

---

## API 요약

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `GET` | `/team-role/:teamId/user/:userId` | 팀별 유효 권한 조회 |
| `PATCH` | `/team-role/:teamId/user/:userId` | 팀별 권한 수정 |
| `GET` | `/team-role/:teamId/user/:userId/warehouse-access?warehouseId={id}` | 창고 접근 권한 확인 |
