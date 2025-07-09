# 창고 접근 제한 비즈니스 로직 분석 및 개선 방안

## 📋 현재 시스템 분석

### 1. 창고 접근 제한 구조

#### 1.1 데이터 구조

```typescript
interface IUser {
  id: number;
  email: string;
  name: string;
  restrictedWhs: string | number[]; // 제한된 창고 ID 목록
  accessLevel: "user" | "admin" | "supplier" | "moderator";
  isAdmin: boolean;
  // ...
}
```

#### 1.2 권한 레벨별 창고 접근 정책

| 권한 레벨     | 창고 제한 적용 | 접근 가능 창고     | 특이사항         |
| ------------- | -------------- | ------------------ | ---------------- |
| **Admin**     | ❌             | 모든 창고          | 제한 없음        |
| **Moderator** | ✅             | 제한되지 않은 창고 | 읽기 전용 모드   |
| **User**      | ✅             | 제한되지 않은 창고 | 기본 사용자      |
| **Supplier**  | ✅             | 제한되지 않은 창고 | 발주 메뉴만 접근 |

### 2. 현재 구현된 기능

#### 2.1 권한 검증 시스템

- `src/utils/warehousePermissions.ts`: 창고 접근 권한 검증 유틸리티
- `hasWarehouseAccess()`: 사용자가 특정 창고에 접근 가능한지 확인
- `filterAccessibleWarehouses()`: 접근 가능한 창고만 필터링
- `getRestrictedWarehouseIds()`: 제한된 창고 ID 목록 반환

#### 2.2 적용 영역

1. **재고 관리**: 제한된 창고의 재고 정보 숨김
2. **발주 요청**: 제한된 창고 선택 불가
3. **발주 기록**: 제한된 창고의 발주 기록 숨김
4. **품목 관리**: 제한된 창고의 품목 정보 숨김

#### 2.3 관리자 기능

- **UserEditModal**: 기존 사용자의 창고 접근 제한 설정
- **UserManagementModal**: 새 사용자 생성 시 창고 접근 제한 설정

## 🔍 현재 시스템의 문제점

### 1. 데이터 타입 불일치

```typescript
restrictedWhs: string | number[]; // 타입이 일관되지 않음
```

- **문제**: 문자열과 배열 타입이 혼재하여 파싱 로직이 복잡함
- **영향**: 타입 안전성 저하, 버그 발생 가능성 증가

### 2. UI/UX 문제점

1. **명확성 부족**: "선택된 창고는 접근이 제한됩니다"라는 설명이 모호함
2. **시각적 피드백 부족**: 제한된 창고와 접근 가능한 창고의 구분이 어려움
3. **일관성 부족**: 각 페이지마다 다른 방식으로 제한 표시

### 3. 비즈니스 로직 문제점

1. **제한 로직의 모호함**: "제한된 창고"가 접근 불가인지 숨김인지 불분명
2. **권한 레벨과 창고 제한의 관계**: Admin이 제한을 받는지 여부가 불분명
3. **에러 처리 부족**: 권한 없음 상황에서의 사용자 경험 개선 필요

### 4. 성능 및 유지보수 문제

1. **중복 로직**: 여러 컴포넌트에서 동일한 권한 검증 로직 반복
2. **캐싱 부족**: 권한 정보가 매번 새로 계산됨
3. **테스트 어려움**: 복잡한 권한 로직으로 인한 테스트 복잡성

## 🚀 개선 방안

### 1. 데이터 구조 개선

#### 1.1 타입 통일

```typescript
// 개선된 타입 정의
interface IUser {
  id: number;
  email: string;
  name: string;
  restrictedWarehouseIds: number[]; // 명확한 배열 타입
  accessLevel: "user" | "admin" | "supplier" | "moderator";
  isAdmin: boolean;
  // ...
}

// 권한 정책 타입
interface WarehouseAccessPolicy {
  type: "allow_all" | "restrict_specific" | "allow_specific";
  warehouseIds: number[];
}
```

#### 1.2 마이그레이션 계획

```typescript
// 기존 데이터 변환 함수
function migrateRestrictedWhs(oldValue: string | number[]): number[] {
  if (Array.isArray(oldValue)) {
    return oldValue.map((id) => (typeof id === "string" ? parseInt(id) : id));
  }
  if (typeof oldValue === "string") {
    return oldValue
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
  }
  return [];
}
```

### 2. UI/UX 개선

#### 2.1 UserEditModal 개선

```typescript
// 개선된 창고 접근 제한 UI
const WarehouseAccessSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">창고 접근 권한</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">접근 가능한 창고</span>
          <span className="text-sm font-medium text-blue-600">
            {accessibleWarehouses.length}개
          </span>
        </div>
      </div>

      {/* 권한 레벨별 안내 */}
      <div className="p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          {accessLevel === "admin"
            ? "관리자는 모든 창고에 접근 가능합니다."
            : "체크된 창고는 접근이 제한됩니다."}
        </p>
      </div>

      {/* 창고 목록 */}
      <div className="space-y-2">
        {warehouses.map((warehouse) => (
          <WarehouseAccessItem
            key={warehouse.id}
            warehouse={warehouse}
            isRestricted={selectedWarehouses.includes(warehouse.id)}
            onToggle={handleWarehouseToggle}
            disabled={accessLevel === "admin"}
          />
        ))}
      </div>
    </div>
  );
};
```

#### 2.2 시각적 개선

```typescript
// 창고 접근 아이템 컴포넌트
const WarehouseAccessItem = ({
  warehouse,
  isRestricted,
  onToggle,
  disabled,
}) => {
  return (
    <div
      className={`
      flex items-center p-3 rounded-md border transition-colors
      ${
        isRestricted
          ? "bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }
      ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:bg-gray-50"
      }
    `}
    >
      <input
        type="checkbox"
        checked={isRestricted}
        onChange={() => onToggle(warehouse.id)}
        disabled={disabled}
        className="mr-3"
      />
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {warehouse.warehouseName}
        </div>
        <div className="text-sm text-gray-500">
          {warehouse.warehouseAddress}
        </div>
      </div>
      <div
        className={`
        px-2 py-1 text-xs rounded-full
        ${
          isRestricted
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }
      `}
      >
        {isRestricted ? "접근 제한" : "접근 가능"}
      </div>
    </div>
  );
};
```

### 3. 비즈니스 로직 개선

#### 3.1 권한 검증 시스템 개선

```typescript
// 개선된 권한 검증 시스템
class WarehouseAccessManager {
  private static instance: WarehouseAccessManager;
  private cache = new Map<string, boolean>();

  static getInstance(): WarehouseAccessManager {
    if (!WarehouseAccessManager.instance) {
      WarehouseAccessManager.instance = new WarehouseAccessManager();
    }
    return WarehouseAccessManager.instance;
  }

  hasAccess(user: IUser, warehouseId: number): boolean {
    const cacheKey = `${user.id}-${warehouseId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const hasAccess = this.calculateAccess(user, warehouseId);
    this.cache.set(cacheKey, hasAccess);

    return hasAccess;
  }

  private calculateAccess(user: IUser, warehouseId: number): boolean {
    // Admin은 모든 창고에 접근 가능
    if (user.accessLevel === "admin") {
      return true;
    }

    // 제한된 창고 목록에 포함되어 있으면 접근 불가
    return !user.restrictedWarehouseIds.includes(warehouseId);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

#### 3.2 권한 정책 시스템

```typescript
// 권한 정책 정의
interface AccessPolicy {
  readonly type: "admin" | "moderator" | "user" | "supplier";
  readonly canAccessAllWarehouses: boolean;
  readonly canModifyWarehouseAccess: boolean;
  readonly restrictedFeatures: string[];
}

const ACCESS_POLICIES: Record<string, AccessPolicy> = {
  admin: {
    type: "admin",
    canAccessAllWarehouses: true,
    canModifyWarehouseAccess: true,
    restrictedFeatures: [],
  },
  moderator: {
    type: "moderator",
    canAccessAllWarehouses: false,
    canModifyWarehouseAccess: false,
    restrictedFeatures: ["warehouse_modification", "user_creation"],
  },
  user: {
    type: "user",
    canAccessAllWarehouses: false,
    canModifyWarehouseAccess: false,
    restrictedFeatures: ["admin_panel", "warehouse_modification"],
  },
  supplier: {
    type: "supplier",
    canAccessAllWarehouses: false,
    canModifyWarehouseAccess: false,
    restrictedFeatures: [
      "admin_panel",
      "warehouse_modification",
      "inventory_modification",
    ],
  },
};
```

### 4. 성능 최적화

#### 4.1 React Query 활용

```typescript
// 권한 정보 캐싱
export const useWarehouseAccess = (warehouseId: number) => {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ["warehouse-access", user?.id, warehouseId],
    queryFn: () =>
      WarehouseAccessManager.getInstance().hasAccess(user!, warehouseId),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  });
};
```

#### 4.2 메모이제이션

```typescript
// 접근 가능한 창고 목록 메모이제이션
export const useAccessibleWarehouses = () => {
  const { user } = useCurrentUser();
  const { warehouses } = useWarehouseItems();

  return useMemo(() => {
    if (!user || !warehouses) return [];

    return warehouses.filter((warehouse) =>
      WarehouseAccessManager.getInstance().hasAccess(user, warehouse.id)
    );
  }, [user, warehouses]);
};
```

### 5. 에러 처리 및 사용자 경험 개선

#### 5.1 권한 없음 상황 처리

```typescript
// 권한 없음 컴포넌트
const AccessDeniedMessage = ({ warehouseName }: { warehouseName: string }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-center">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
        <div>
          <h3 className="text-sm font-medium text-red-800">
            접근 권한이 없습니다
          </h3>
          <p className="text-sm text-red-700 mt-1">
            '{warehouseName}' 창고에 대한 접근 권한이 제한되어 있습니다.
            관리자에게 문의하세요.
          </p>
        </div>
      </div>
    </div>
  );
};
```

#### 5.2 점진적 권한 해제

```typescript
// 권한 해제 확인 다이얼로그
const ConfirmAccessRemoval = ({
  warehouseName,
  onConfirm,
  onCancel,
}: {
  warehouseName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          창고 접근 제한 해제
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          '{warehouseName}' 창고에 대한 접근 제한을 해제하시겠습니까? 이
          사용자는 해당 창고의 모든 정보에 접근할 수 있게 됩니다.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            해제
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 📋 구현 우선순위

### Phase 1: 긴급 개선 (1-2주)

1. **타입 안전성 개선**: `restrictedWhs` 타입 통일
2. **UI 명확성 개선**: UserEditModal의 창고 접근 제한 UI 개선
3. **에러 처리 강화**: 권한 없음 상황에서의 사용자 경험 개선

### Phase 2: 중기 개선 (2-4주)

1. **권한 검증 시스템 리팩토링**: WarehouseAccessManager 클래스 구현
2. **성능 최적화**: React Query 캐싱 및 메모이제이션 적용
3. **일관성 개선**: 모든 페이지에서 동일한 권한 표시 방식 적용

### Phase 3: 장기 개선 (1-2개월)

1. **권한 정책 시스템**: 체계적인 권한 관리 시스템 구축
2. **모니터링 및 로깅**: 권한 관련 활동 추적 시스템
3. **테스트 자동화**: 권한 관련 테스트 케이스 작성

## 🎯 기대 효과

### 1. 사용자 경험 개선

- 명확한 권한 표시로 혼란 감소
- 일관된 UI/UX로 학습 곡선 단축
- 적절한 에러 메시지로 문제 해결 시간 단축

### 2. 개발자 경험 개선

- 타입 안전성으로 버그 발생률 감소
- 재사용 가능한 컴포넌트로 개발 속도 향상
- 체계적인 권한 관리로 유지보수성 향상

### 3. 시스템 안정성 향상

- 권한 검증 로직의 일관성 확보
- 캐싱을 통한 성능 향상
- 체계적인 에러 처리로 시스템 안정성 향상

## 📝 결론

현재 창고 접근 제한 시스템은 기본적인 기능은 제공하지만, 타입 안전성, UI/UX, 성능 면에서 개선의 여지가 많습니다. 제안된 개선 방안을 단계적으로 적용하면 더 안정적이고 사용자 친화적인 권한 관리 시스템을 구축할 수 있을 것입니다.

특히 Phase 1의 긴급 개선사항은 현재 발생하고 있는 오류들을 해결하고 사용자 경험을 즉시 개선할 수 있어 우선적으로 구현하는 것을 권장합니다.
