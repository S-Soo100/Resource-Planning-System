# 팀별 역할/권한 관리 시스템

> **버전**: 2.3
> **최종 수정일**: 2026-02-23
> **백엔드 문서**: [TEAM_ROLE_API.md](./2.3.%20backend/TEAM_ROLE_API.md)

---

## 📌 개요

사용자가 **팀마다 다른 권한**을 가질 수 있도록 하는 시스템입니다.

### 핵심 변경사항

- **기존**: `User` 테이블에만 권한 → 모든 팀에서 동일한 권한 적용
- **신규**: `TeamUserMap`에 팀별 권한 필드 추가 → **팀마다 다른 권한** 설정 가능
- **하위 호환**: 팀별 권한이 설정되지 않으면 기존 User 권한으로 폴백

---

## 🎯 권한 체계

### 권한 레벨 (`accessLevel`)

| 값         | 설명            | 주요 권한                    |
| ---------- | --------------- | ---------------------------- |
| `user`     | 일반 사용자     | 조회, 기본 CRUD              |
| `moderator`| 중간 관리자     | 주문/시연 승인, 팀원 관리    |
| `admin`    | 관리자          | 모든 기능 접근 가능          |
| `supplier` | 납품처          | 발주 관련만                  |

### 관리자 여부 (`isAdmin`)

| 값      | 설명                                                   |
| ------- | ------------------------------------------------------ |
| `true`  | 관리자 — 역할 체크 bypass, 모든 창고 접근 가능       |
| `false` | 비관리자 — `accessLevel`과 `restrictedWhs`에 따라 제한 |

### 제한 창고 (`restrictedWhs`)

| 값        | 설명                                          |
| --------- | --------------------------------------------- |
| `null`    | 제한 없음 — 모든 창고 접근 가능              |
| `"1,2,3"` | 쉼표 구분된 창고 ID 목록 — 해당 창고만 접근 |

### 권한 우선순위

```
1. TeamUserMap에 팀별 권한이 설정되어 있으면 → 팀별 권한 사용
2. TeamUserMap.accessLevel이 null이면 → User 테이블 권한으로 폴백
3. TeamUserMap 레코드 자체가 없으면 → User 테이블 권한으로 폴백
```

---

## 🛠️ 구현 가이드

### 1. 타입 정의

#### `src/types/mappingUser.ts`

```typescript
export interface IMappingUser {
  id: number;
  mapping_id: string;
  userId: number;
  teamId: number;
  // 팀별 권한 필드 (v2.3)
  accessLevel?: "user" | "moderator" | "admin" | "supplier";
  isAdmin?: boolean;
  restrictedWhs?: string | null;
  user: {
    id: number;
    email: string;
    name: string;
  };
}
```

#### `src/types/team.ts`

```typescript
// 팀별 유효 권한 응답
export interface TeamRoleResponse {
  accessLevel: "user" | "moderator" | "admin" | "supplier";
  isAdmin: boolean;
  restrictedWhs: string | null;
}

// 팀별 권한 수정 요청
export interface UpdateTeamRoleRequest {
  accessLevel?: "user" | "moderator" | "admin" | "supplier";
  isAdmin?: boolean;
  restrictedWhs?: string;
}

// 창고 접근 권한 응답
export interface WarehouseAccessResponse {
  canAccess: boolean;
}
```

---

### 2. API 함수

#### `src/api/team-role-api.ts`

```typescript
import { api, ApiResponse } from "./api";
import {
  TeamRoleResponse,
  UpdateTeamRoleRequest,
  WarehouseAccessResponse,
} from "@/types/team";

export const teamRoleApi = {
  // 팀별 유효 권한 조회
  getTeamRole: async (
    teamId: number,
    userId: number
  ): Promise<ApiResponse<TeamRoleResponse>> => {
    // GET /team-role/:teamId/user/:userId
  },

  // 팀별 권한 수정
  updateTeamRole: async (
    teamId: number,
    userId: number,
    data: UpdateTeamRoleRequest
  ): Promise<ApiResponse<{ count: number }>> => {
    // PATCH /team-role/:teamId/user/:userId
  },

  // 창고 접근 권한 확인
  checkWarehouseAccess: async (
    teamId: number,
    userId: number,
    warehouseId: number
  ): Promise<ApiResponse<WarehouseAccessResponse>> => {
    // GET /team-role/:teamId/user/:userId/warehouse-access?warehouseId={id}
  },
};
```

---

### 3. 커스텀 훅

#### `src/hooks/useTeamRole.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamRoleApi } from "@/api/team-role-api";

export const useTeamRole = (teamId: number, userId: number) => {
  const queryClient = useQueryClient();

  // 팀별 유효 권한 조회
  const { data: teamRole, isLoading, error } = useQuery({
    queryKey: ["team-role", teamId, userId],
    queryFn: async () => {
      const response = await teamRoleApi.getTeamRole(teamId, userId);
      if (!response.success || !response.data) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!teamId && !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // 팀별 권한 수정
  const updateRoleMutation = useMutation({
    mutationFn: async (data: UpdateTeamRoleRequest) => {
      const response = await teamRoleApi.updateTeamRole(teamId, userId, data);
      // ...
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-role", teamId, userId] });
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      // ...
    },
  });

  return {
    teamRole,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,
  };
};
```

#### 창고 접근 권한 확인 훅

```typescript
export const useWarehouseAccess = (
  teamId: number,
  userId: number,
  warehouseId: number
) => {
  const { data: accessData, isLoading } = useQuery({
    queryKey: ["warehouse-access", teamId, userId, warehouseId],
    queryFn: async () => {
      const response = await teamRoleApi.checkWarehouseAccess(
        teamId,
        userId,
        warehouseId
      );
      if (!response.success || !response.data) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!teamId && !!userId && !!warehouseId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    canAccess: accessData?.canAccess || false,
    isLoading,
  };
};
```

---

### 4. UI 컴포넌트

#### 팀 멤버 목록 (`TeamMembers.tsx`)

```tsx
// 기본 권한과 팀 권한을 모두 표시
<td className="px-6 py-4">
  <span className={`badge ${accessLevelColor(userLevel)}`}>
    {accessLevelLabel(userLevel)}
  </span>
</td>
<td className="px-6 py-4">
  {member.accessLevel ? (
    <>
      <span className={`badge ${accessLevelColor(member.accessLevel)}`}>
        {accessLevelLabel(member.accessLevel)}
      </span>
      {member.isAdmin && (
        <span className="badge badge-admin">팀 관리자</span>
      )}
      {member.restrictedWhs && (
        <span className="text-xs text-gray-500">
          창고 제한: {member.restrictedWhs}
        </span>
      )}
    </>
  ) : (
    <span className="text-xs text-gray-500 italic">기본 권한 사용</span>
  )}
</td>
```

#### 팀 권한 수정 모달 (`TeamRoleEditModal.tsx`)

```tsx
<TeamRoleEditModal
  isOpen={isRoleEditModalOpen}
  onClose={handleCloseRoleEditModal}
  member={selectedMember}
  isReadOnly={isReadOnly}
/>
```

**주요 기능:**
- ✅ 권한 레벨 드롭다운 (user/moderator/admin/supplier)
- ✅ 관리자 여부 체크박스
- ✅ 창고 접근 제한 멀티셀렉트
- ✅ 변경사항 저장 및 캐시 무효화

---

## 📖 사용 예시

### 1. 팀별 권한 조회

```typescript
const { teamRole, isLoading } = useTeamRole(teamId, userId);

if (teamRole?.isAdmin) {
  // 관리자 권한 처리
  showAdminMenu();
} else if (teamRole?.accessLevel === "moderator") {
  // 중간 관리자 권한 처리
  showModeratorMenu();
} else {
  // 일반 사용자 권한 처리
  showUserMenu();
}
```

### 2. 팀별 권한 수정

```typescript
const { updateRole } = useTeamRole(teamId, userId);

await updateRole({
  accessLevel: "moderator",
  isAdmin: false,
  restrictedWhs: "1,3,5",
});
```

### 3. 창고 접근 권한 확인

```typescript
const { canAccess, isLoading } = useWarehouseAccess(teamId, userId, warehouseId);

if (canAccess) {
  // 창고 접근 허용
  showWarehouseContent();
} else {
  // 접근 거부
  showAccessDeniedMessage();
}
```

### 4. UI에서 권한별 분기

```typescript
// 창고 필터링 (restrictedWhs 기반)
if (teamRole?.restrictedWhs) {
  const allowedIds = teamRole.restrictedWhs.split(",").map(Number);
  const filteredWarehouses = warehouses.filter((w) =>
    allowedIds.includes(w.id)
  );
  showWarehouses(filteredWarehouses);
} else {
  showWarehouses(warehouses); // 전체 표시
}
```

---

## 🎨 UI 가이드

### 권한 레벨 라벨

| `accessLevel` | 한글 표시       | 색상 클래스                               |
| ------------- | --------------- | ----------------------------------------- |
| `admin`       | 관리자          | `bg-Primary-Container text-Primary-Main`  |
| `moderator`   | 1차승인권자     | `bg-Back-Mid-20 text-Text-High-90`        |
| `supplier`    | 납품처          | `bg-Back-Mid-20 text-Text-Low-70`         |
| `user`        | 일반 사용자     | `bg-Back-Low-10 text-Text-Low-70`         |

### 관리자 뱃지

```tsx
{member.isAdmin && (
  <span className="badge bg-Error-Container text-Error-Main">
    팀 관리자
  </span>
)}
```

### 창고 제한 표시

```tsx
{member.restrictedWhs && (
  <span className="text-xs text-Text-Low-70">
    창고 제한: {member.restrictedWhs}
  </span>
)}
```

---

## 🔄 캐시 무효화 전략

팀별 권한 수정 시 다음 캐시를 무효화합니다:

```typescript
queryClient.invalidateQueries({ queryKey: ["team-role", teamId, userId] });
queryClient.invalidateQueries({ queryKey: ["team", teamId] });
queryClient.invalidateQueries({ queryKey: ["user", userId] });
```

**이유:**
- `team-role`: 수정된 권한 정보 즉시 반영
- `team`: 팀 멤버 목록에 최신 권한 표시
- `user`: 사용자 상세 정보에 최신 권한 표시

---

## 📋 체크리스트

### 필수 변경

- [x] `IMappingUser` 타입에 팀별 권한 필드 추가
- [x] `team-role-api.ts` API 함수 추가
- [x] `useTeamRole` 훅 생성
- [x] `TeamMembers` 컴포넌트에 팀별 권한 표시
- [x] `TeamRoleEditModal` 컴포넌트 생성

### 권장 변경

- [x] `useWarehouseAccess` 훅 생성
- [ ] 창고 관련 기능에 접근 권한 체크 추가
- [ ] 권한별 UI 분기 (메뉴/기능 제한)

### 선택적 변경

- [ ] 권한 변경 히스토리 추적
- [ ] 권한 변경 알림 기능

---

## 🚨 주의사항

1. **하위 호환**: 기존 코드는 수정 없이 정상 동작합니다. TeamUserMap에 권한 필드가 없으면 User 테이블 권한을 사용합니다.

2. **캐시 무효화**: 권한 수정 후 반드시 캐시를 무효화하여 UI에 최신 정보를 표시해야 합니다.

3. **권한 체크**: 백엔드에서 `TeamRoleGuard`로 권한을 검증하므로, 프론트엔드 권한 체크는 UI 분기 용도로만 사용합니다.

4. **팀 소속 확인**: 권한 수정 시 `count`가 0이면 해당 팀에 소속되지 않은 사용자입니다.

---

## 📚 관련 문서

- [백엔드 TEAM_ROLE_API 문서](./2.3.%20backend/TEAM_ROLE_API.md)
- [팀 관리 문서](./team-management.md) (작성 예정)
- [권한 시스템 개요](../CLAUDE.md#권한-시스템)

---

## 🔗 관련 파일

### 타입 정의
- [src/types/mappingUser.ts](../src/types/mappingUser.ts)
- [src/types/team.ts](../src/types/team.ts)

### API
- [src/api/team-role-api.ts](../src/api/team-role-api.ts)

### 훅
- [src/hooks/useTeamRole.ts](../src/hooks/useTeamRole.ts)

### 컴포넌트
- [src/components/admin/TeamMembers.tsx](../src/components/admin/TeamMembers.tsx)
- [src/components/admin/TeamRoleEditModal.tsx](../src/components/admin/TeamRoleEditModal.tsx)

### 페이지
- [src/app/admin/team-members/page.tsx](../src/app/admin/team-members/page.tsx)
