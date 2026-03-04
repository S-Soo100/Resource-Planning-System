# 팀 멤버 관리 시스템

> **버전**: 3.1.0
> **최종 수정일**: 2026-03-04
> **아키텍처**: 팀 권한 중심 (Team-based Permissions)
>
> **중요 (E-006)**: 팀 멤버(User) ≠ 고객(Supplier). 고객 관리는 `/supplier` 페이지에서 Supplier 기반으로 처리.
> 기존 IUser에 있던 고객 필드(customerType, isRecipient 등)는 `@deprecated` 처리되었으며,
> 신규 코드에서는 Supplier 타입의 고객 필드를 사용해야 합니다.

---

## 📌 목차

1. [개요](#개요)
2. [권한 아키텍처](#권한-아키텍처)
3. [핵심 컴포넌트](#핵심-컴포넌트)
4. [사용자 플로우](#사용자-플로우)
5. [API 통합](#api-통합)
6. [창고 접근 권한](#창고-접근-권한)
7. [개발 가이드](#개발-가이드)

---

## 개요

KARS의 팀 멤버 관리 시스템은 **팀별 권한 중심 아키텍처**를 사용합니다.

### 핵심 개념

- **기본 권한** (`User.accessLevel`): 레거시 개념, UI에서 수정 불가
- **팀 권한** (`TeamUserMapping.accessLevel`): 실제 사용되는 권한 시스템
- **팀별 차별화**: 사용자가 여러 팀에 속할 때 팀마다 다른 권한 가질 수 있음

### 주요 기능

1. ✅ **멤버 추가**: 신규 사용자 생성 또는 기존 사용자 추가
2. ✅ **팀 역할 관리**: 팀별 권한 레벨 및 관리자 여부 설정
3. ✅ **정보 수정**: 개인 정보 및 창고 접근 권한 관리
4. ✅ **멤버 제거**: 팀에서 사용자 제거

---

## 권한 아키텍처

### 권한 레벨

| 값 | 한글명 | 권한 |
|---|---|---|
| `user` | 일반 사용자 | 조회, 기본 CRUD |
| `moderator` | 1차 승인권자 | 주문/시연 승인, 팀원 관리 |
| `admin` | 관리자 | 모든 기능 접근 가능 |
| `supplier` | 납품처 | 발주 관련 기능만 |

### 권한 우선순위

```
1순위: TeamUserMapping.accessLevel (팀별 권한)
2순위: User.accessLevel (기본 권한, 레거시)
```

**예시:**
```typescript
User.accessLevel = "user"
TeamUserMapping.accessLevel = "admin"
→ 유효 권한: "admin" (팀별 권한 우선)
```

### 관리자 여부 (`isAdmin`)

| 값 | 설명 |
|---|---|
| `true` | 팀 관리자 - 모든 창고 접근 가능, 역할 체크 bypass |
| `false` | 일반 멤버 - `accessLevel`과 `restrictedWhs`에 따라 제한 |

**자동 설정:**
```typescript
accessLevel === "admin" → isAdmin = true (자동)
```

---

## 핵심 컴포넌트

### 1. TeamMembers.tsx
**역할**: 팀 멤버 목록 및 관리 메인 페이지

**주요 기능:**
- 팀 멤버 목록 표시 (기본 권한 + 팀 권한)
- 3개 버튼: "팀 역할", "정보 수정/조회", "제거"

**버튼 명칭:**
```typescript
// 일반 모드
"팀 역할"    → TeamRoleEditModal 오픈
"정보 수정"  → UserEditModal 오픈 (수정 모드)
"제거"       → 팀에서 사용자 제거

// 읽기 전용 모드 (Moderator)
"팀 역할"    → TeamRoleEditModal 오픈 (읽기 전용)
"정보 조회"  → UserEditModal 오픈 (읽기 전용)
```

**파일:** `src/components/admin/TeamMembers.tsx`

---

### 2. UserManagementModal.tsx
**역할**: 신규 멤버 추가 (사용자 생성 또는 기존 사용자 추가)

**주요 기능:**
- 2가지 모드: "새 사용자 생성" / "기존 사용자 추가"
- **팀 권한 입력**: 사용자가 현재 팀에서 가질 권한 선택
- **창고 접근 설정**: 체크 = 접근 가능 (직관적)

**새 사용자 생성 플로우:**
```
1. 사용자 정보 입력 (이름, 이메일, 비밀번호)
2. "이 팀에서의 권한" 선택 (user/moderator/admin/supplier)
3. 접근 가능한 창고 체크
4. 생성 → User 생성 + 팀 추가 + 팀 권한 자동 설정
```

**파일:** `src/components/admin/UserManagementModal.tsx`

---

### 3. TeamRoleEditModal.tsx
**역할**: 팀별 권한 수정 (팀 역할 관리)

**주요 기능:**
- 현재 권한 정보 표시
  - 팀 권한이 있으면 기본 권한 숨김 (혼란 제거)
  - 권한 레벨 한글 번역 (admin → 관리자)
- 권한 레벨 수정 (user/moderator/admin/supplier)
- isAdmin 자동 설정 (admin 선택 시 자동으로 true)
- 관리자 선택 시 안내 메시지 표시

**개선 사항:**
- ❌ isAdmin 체크박스 제거 (자동화)
- ❌ 창고 접근 설정 제거 (정보 수정 모달과 중복)
- ✅ 권한 레벨 한글 번역
- ✅ 명확한 라벨 ("권한 레벨 수정")

**파일:** `src/components/admin/TeamRoleEditModal.tsx`

---

### 4. UserEditModal.tsx
**역할**: 개인 정보 및 기본 창고 제한 관리

**주요 기능:**
- 개인 정보 수정 (이름, 이메일)
- 창고 접근 권한 설정 (기본 창고 제한)
  - 체크 = 접근 가능
  - 전체 - 선택 = 제한된 창고

**제거된 기능 (레거시):**
- ❌ 기본 권한 설정 섹션 (라디오 버튼)
- ❌ handleAccessLevelChange 함수
- ❌ formData.accessLevel / formData.isAdmin

**안내 문구 추가:**
```
"사용자의 기본 창고 접근 권한을 설정합니다.
권한은 '팀 역할' 버튼에서 설정할 수 있습니다."
```

**파일:** `src/components/admin/UserEditModal.tsx`

---

## 사용자 플로우

### 1. 멤버 추가 (신규 사용자)

```
[사용자 동작]
1. "멤버 추가" 버튼 클릭
2. "새 사용자 생성" 선택
3. 이메일, 이름, 비밀번호 입력
4. "이 팀에서의 권한" 선택 (user/moderator/admin/supplier)
5. 접근 가능한 창고 체크
6. "생성 및 추가" 클릭

[시스템 처리]
1. User 생성 (POST /user)
   - User.accessLevel = "user" (기본값)
   - User.isAdmin = false
   - User.restrictedWhs = (전체 창고 - 선택된 창고)
2. 팀 추가 (POST /team/:teamId/user/:userId)
   - User 권한이 TeamUserMapping에 자동 복사
3. 팀 권한 설정 (PATCH /team-role/:teamId/user/:userId)
   - TeamUserMapping.accessLevel = 사용자가 선택한 값
   - TeamUserMapping.isAdmin = (accessLevel === "admin")
   - TeamUserMapping.restrictedWhs = (전체 창고 - 선택된 창고)

[결과]
✅ 사용자 생성 완료
✅ 팀 권한 자동 설정됨 (사용자가 선택한 값)
✅ 창고 접근 권한 설정됨
```

---

### 2. 팀 역할 수정

```
[사용자 동작]
1. 멤버 행의 "팀 역할" 버튼 클릭
2. 권한 레벨 선택 (user/moderator/admin/supplier)
   - admin 선택 시 자동으로 isAdmin = true
   - 안내 메시지: "✓ 관리자는 모든 창고에 접근할 수 있습니다"
3. "저장" 클릭

[시스템 처리]
PATCH /team-role/:teamId/user/:userId
{
  "accessLevel": "admin",
  "isAdmin": true  // 자동 설정
}

[결과]
✅ 팀 권한 업데이트
✅ 캐시 무효화 → UI 자동 갱신
```

---

### 3. 정보 수정

```
[사용자 동작]
1. 멤버 행의 "정보 수정" 버튼 클릭
2. 이름, 이메일 수정
3. 접근 가능한 창고 체크/언체크
4. "수정 완료" 클릭

[시스템 처리]
PATCH /user/:userId
{
  "name": "홍길동",
  "email": "hong@example.com",
  "restrictedWhs": "4,5"  // 전체 - 선택 = 제한
}

[결과]
✅ 개인 정보 업데이트
✅ 창고 접근 권한 업데이트
```

---

## API 통합

### useTeamAdmin Hook

**파일:** `src/hooks/admin/useTeamAdmin.ts`

**주요 함수:**

#### 1. createUser (사용자 생성 + 팀 추가 + 팀 권한 설정)

```typescript
const createUser = useMutation({
  mutationFn: async (userData: CreateUserDto) => {
    // 1단계: User 생성
    const response = await userApi.createUser(userData);
    const userId = extractUserId(response.data);

    // 2단계: 팀 추가
    await teamApi.addUserToTeam(teamId, userId);

    // 3단계: 팀 권한 설정 (신규!)
    await teamRoleApi.updateTeamRole(teamId, userId, {
      accessLevel: userData.accessLevel,
      isAdmin: userData.isAdmin,
      restrictedWhs: userData.restrictedWhs || undefined,
    });

    return response.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["team", teamId] });
    toast.success("사용자가 생성되고 팀에 추가되었습니다.");
  },
});
```

**에러 처리:**
- 팀 권한 설정 실패 시 warn 로그만 출력 (사용자는 이미 생성됨)

#### 2. updateUser (사용자 정보 업데이트)

```typescript
const updateUser = useMutation({
  mutationFn: async ({ userId, userData }) => {
    return await userApi.updateUser(userId.toString(), userData);
  },
  onSuccess: (response, variables) => {
    queryClient.invalidateQueries({ queryKey: ["team", teamId] });
    queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    toast.success("사용자 정보가 성공적으로 수정되었습니다.");
  },
});
```

---

## 창고 접근 권한

### 로직 설계

**백엔드 필드:** `restrictedWhs` = "제한된 창고" (쉼표 구분)

**프론트엔드 UX:** "접근 가능한 창고" (체크 = 접근 가능)

### 변환 로직

#### 1. 데이터 로드 시 (백엔드 → 프론트)

```typescript
// 백엔드에서 받은 값
const restrictedWhs = "4,5";  // 제한된 창고

// 전체 창고
const allWarehouseIds = [1, 2, 3, 4, 5];

// 변환: 전체 - 제한 = 접근 가능
const restrictedIds = restrictedWhs.split(",").map(Number);  // [4, 5]
const accessibleIds = allWarehouseIds.filter(
  id => !restrictedIds.includes(id)
);  // [1, 2, 3]

setSelectedWarehouses(accessibleIds);  // 프론트 상태
```

#### 2. 데이터 저장 시 (프론트 → 백엔드)

```typescript
// 프론트 상태 (사용자가 체크한 창고)
const selectedWarehouses = [1, 2, 3];  // 접근 가능한 창고

// 전체 창고
const allWarehouseIds = [1, 2, 3, 4, 5];

// 변환: 전체 - 접근 가능 = 제한
const restrictedIds = allWarehouseIds.filter(
  id => !selectedWarehouses.includes(id)
);  // [4, 5]

// 백엔드 전송
const restrictedWhs = restrictedIds.length > 0
  ? restrictedIds.join(",")  // "4,5"
  : "";  // 빈 문자열 = 전체 접근 가능
```

### UI 표시

```tsx
{warehouses.map((warehouse) => {
  const isAccessible = selectedWarehouses.includes(warehouse.id);

  return (
    <div className={isAccessible ? "bg-green-50" : "bg-red-50"}>
      <input
        type="checkbox"
        checked={isAccessible}
        onChange={() => handleWarehouseToggle(warehouse.id)}
      />
      <span>{warehouse.warehouseName}</span>
      <span>{isAccessible ? "접근 가능" : "접근 제한"}</span>
    </div>
  );
})}
```

---

## 개발 가이드

### 타입 정의

```typescript
// 사용자 생성 DTO
interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  restrictedWhs: string;
  accessLevel: "user" | "supplier" | "moderator" | "admin";
  isAdmin: boolean;
}

// 팀 권한 업데이트 요청
interface UpdateTeamRoleRequest {
  accessLevel?: "user" | "moderator" | "admin" | "supplier";
  isAdmin?: boolean;
  restrictedWhs?: string;
}

// 팀 멤버 (TeamUserMapping)
interface IMappingUser {
  id: number;
  userId: number;
  teamId: number;
  accessLevel: "user" | "moderator" | "admin" | "supplier";
  isAdmin: boolean;
  restrictedWhs: string | null;
  user: IUser;
}
```

### 권한 레벨 번역 함수

```typescript
const getAccessLevelLabel = (level: string | undefined): string => {
  if (!level) return "기본 권한 사용";
  switch (level) {
    case "admin": return "관리자";
    case "moderator": return "1차 승인권자";
    case "supplier": return "납품처";
    case "user": return "일반 사용자";
    default: return level;
  }
};
```

### isAdmin 자동 설정

```typescript
// 팀 역할 모달
const handleAccessLevelChange = (newAccessLevel) => {
  setFormData({
    ...formData,
    accessLevel: newAccessLevel,
    isAdmin: newAccessLevel === "admin",  // 자동!
  });
};

// 멤버 추가 모달
const userData: CreateUserDto = {
  ...formData,
  isAdmin: formData.accessLevel === "admin",  // 자동!
};
```

### 주의사항

#### 1. 창고 체크박스 로직 일관성

**모든 모달에서 동일한 로직 사용:**
- UserEditModal
- UserManagementModal

```typescript
// ✅ 올바른 방식
selectedWarehouses = 접근 가능한 창고 ID 배열
restrictedWhs = 전체 창고 - selectedWarehouses

// ❌ 잘못된 방식
selectedWarehouses = 제한된 창고 ID 배열 (헷갈림)
```

#### 2. 팀 권한 설정 실패 처리

```typescript
// 사용자는 이미 생성되고 팀에 추가된 상태
// 팀 권한 설정 실패 시 에러를 throw하지 않고 경고만 출력
if (!roleResult.success) {
  console.warn("팀 권한 설정 실패 (계속 진행):", roleResult.error);
  // throw하지 않음!
}
```

#### 3. 캐시 무효화

```typescript
// 사용자 정보 수정 시 두 곳 무효화
onSuccess: (response, variables) => {
  queryClient.invalidateQueries({ queryKey: ["team", teamId] });
  queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
}
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|-----|------|----------|
| 2.5.0 | 2026-02-24 | 팀 권한 중심 아키텍처로 전환 |
| | | - 기본 권한 UI 제거 |
| | | - 팀 권한 자동 설정 추가 |
| | | - 창고 체크박스 로직 반전 |
| | | - isAdmin 자동 계산 |
| 2.4.0 | 2026-02-23 | 팀 역할 모달 개선 |
| | | - 권한 레벨 한글 번역 |
| | | - 팀 권한이 있으면 기본 권한 숨김 |
| 2.3.0 | 2026-02-19 | 팀별 권한 시스템 도입 (백엔드) |

---

## 참고 문서

- [백엔드 API 명세: TEAM_ROLE_API.md](./2.3.%20backend/TEAM_ROLE_API.md)
- [API 에러 처리 가이드](./api-error-handling.md)
