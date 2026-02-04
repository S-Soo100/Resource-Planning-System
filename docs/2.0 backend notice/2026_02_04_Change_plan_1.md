# 백엔드 API 변경사항 프론트엔드 적용 계획

> **작성일**: 2026-02-04
> **참조 문서**: [2026_02_04_FRONTEND_API_CHANGES 1.md](./2026_02_04_FRONTEND_API_CHANGES%201.md)
> **적용 우선순위**: 🟡 중간 (하위 호환성 유지, 선택적 적용 가능)

---

## 📋 변경사항 요약

백엔드에서 전달받은 API 변경사항은 **모두 하위 호환**되므로, 기존 코드 수정 없이도 동작합니다.
다만 새로운 기능을 활용하려면 프론트엔드 코드 업데이트가 필요합니다.

| 기능             | 추가 필드    | 타입              | 기본값  | 필수 여부 |
| ---------------- | ------------ | ----------------- | ------- | --------- |
| 장기시연 구분    | `isLongTerm` | `boolean`         | `false` | ❌ 선택   |
| 창고 정렬 순서   | `sortOrder`  | `number \| null`  | `null`  | ❌ 선택   |
| 아이템 입고 기록 | (내부 로직)  | -                 | -       | ❌ 없음   |

---

## 🏗️ 프론트엔드 현재 구조 분석

### Demo (시연) 관련

#### 타입 정의
- **파일**: `src/types/demo/demo.ts`
- **주요 타입**:
  - `DemoResponse` - 서버 응답 데이터
  - `CreateDemoRequest` - 시연 생성 요청
  - `PatchDemoRequest` - 시연 수정 요청
  - `DemonstrationFormData` - 폼 입력 데이터

#### API 호출
- **파일**: `src/api/demo-api.ts`
- **함수**: `createDemo`, `updateDemoById`, `getDemoById`, `getDemoByTeamId`

#### React Query 훅
- **디렉토리**: `src/hooks/(useDemo)/`
- **파일**: `useDemoQueries.ts`, `useDemoMutations.ts`

#### UI 컴포넌트
- `src/components/demonstration/SimpleDemonstrationForm.tsx` - 시연 생성 폼
- `src/components/demonstration/DemoEditModal.tsx` - 시연 수정 모달
- `src/components/demonstration/DemoRecordTable.tsx` - 시연 목록 테이블

---

### Warehouse (창고) 관련

#### 타입 정의
- **파일**: `src/types/warehouse.ts`
- **주요 타입**:
  - `Warehouse` - 창고 데이터
  - `CreateWarehouseDto` - 창고 생성 요청
  - `UpdateWarehouseRequest` - 창고 수정 요청

#### API 호출
- **파일**: `src/api/warehouse-api.ts`
- **함수**: `createWarehouse`, `updateWarehouse`, `getWarehouse`, `getAllWarehouses`

#### React Query 훅
- **파일**: `src/hooks/useWarehouseItems.ts`
- **기능**: 팀별 창고 목록 조회, 권한 기반 필터링

#### UI 컴포넌트
- `src/components/admin/WarehouseManagement.tsx` - 창고 관리 페이지
- `src/components/admin/WarehouseModal.tsx` - 창고 생성/수정 모달
- `src/components/stock/components/WarehouseCard.tsx` - 창고 카드 UI
- `src/components/stock/components/WarehouseSummary.tsx` - 창고 요약 UI

---

## 🎯 단계별 적용 전략

### Phase 1: 타입 정의 업데이트 (필수) 🔴

백엔드 배포 전 **반드시** 적용해야 하는 단계입니다.
타입 정의를 업데이트하지 않으면 TypeScript 오류가 발생할 수 있습니다.

#### 1-1. Demo 타입 업데이트

**파일**: `src/types/demo/demo.ts`

##### 수정 필요한 인터페이스 및 위치

**1. DemoResponse** (라인 77-184)

서버에서 반환하는 시연 데이터 타입 - **필수 필드**로 추가

```typescript
export interface DemoResponse {
  id: number;
  requester: string;
  demoTitle: string;
  teamId: number;
  // ... 기존 필드들 ...
  isLongTerm: boolean; // 🆕 추가 (필수 필드, 기본값: false)
  createdAt: string;
  updatedAt: string;
}
```

**2. CreateDemoRequest** (라인 205-234)

시연 생성 요청 타입 - **선택적 필드**로 추가

```typescript
export interface CreateDemoRequest {
  requester: string;
  demoTitle: string;
  teamId: number;
  // ... 기존 필드들 ...
  isLongTerm?: boolean; // 🆕 추가 (선택적, 미전송 시 false)
}
```

**3. DemonstrationFormData** (라인 237-265)

폼 입력 데이터 타입 - **필수 필드**로 추가

```typescript
export interface DemonstrationFormData {
  requester: string;
  demoTitle: string;
  // ... 기존 필드들 ...
  isLongTerm: boolean; // 🆕 추가 (필수 필드, 폼 상태 관리용)
}
```

**4. PatchDemoRequest** (라인 268-295)

시연 수정 요청 타입 - **선택적 필드**로 추가

```typescript
export interface PatchDemoRequest {
  requester?: string;
  demoTitle?: string;
  // ... 기존 필드들 ...
  isLongTerm?: boolean; // 🆕 추가 (선택적)
}
```

##### 주의사항

- `DemoResponse`: 서버 응답이므로 **필수** 필드 (`boolean`)
- `CreateDemoRequest`, `PatchDemoRequest`: 하위 호환성을 위해 **선택적** 필드 (`boolean?`)
- `DemonstrationFormData`: 폼 상태 관리를 위해 **필수** 필드 (`boolean`, 기본값 `false`)

---

#### 1-2. Warehouse 타입 업데이트

**파일**: `src/types/warehouse.ts`

##### 수정 필요한 인터페이스 및 위치

**1. Warehouse** (라인 11-24)

서버에서 반환하는 창고 데이터 타입 - **필수 필드**로 추가

```typescript
export interface Warehouse {
  id: number;
  warehouseName: string;
  warehouseAddress: string | null;
  teamId: number;
  sortOrder: number | null; // 🆕 추가 (필수 필드, null = 순서 미지정)
  createdAt: string;
  updatedAt: string;
}
```

**2. CreateWarehouseDto** (라인 33-38)

창고 생성 요청 타입 - **선택적 필드**로 추가

```typescript
export interface CreateWarehouseDto {
  warehouseName: string;
  warehouseAddress?: string;
  teamId: number;
  sortOrder?: number | null; // 🆕 추가 (선택적, 미전송 시 null)
}
```

**3. UpdateWarehouseRequest** (라인 40-45)

창고 수정 요청 타입 - **선택적 필드**로 추가

```typescript
export interface UpdateWarehouseRequest {
  warehouseName?: string;
  warehouseAddress?: string;
  teamId?: number;
  sortOrder?: number | null; // 🆕 추가 (선택적)
}
```

##### 주의사항

- `sortOrder`는 `number | null` 타입
  - **숫자 값**: 0부터 시작 (0 = 첫 번째, 1 = 두 번째, ...)
  - **null 값**: "순서 미지정"을 의미하며, 맨 아래에 표시됨
- 최소값: 0 (음수 불가)
- 하위 호환성: 기존 창고는 모두 `sortOrder: null`로 설정됨

---

### Phase 2: UI 컴포넌트 추가 (권장) 🟡

사용자가 새로운 필드를 입력/수정할 수 있도록 UI를 추가합니다.
백엔드 배포 후 적용을 권장합니다.

#### 2-1. Demo 생성 폼에 장기시연 체크박스 추가

**파일**: `src/components/demonstration/SimpleDemonstrationForm.tsx`

##### 수정 위치 1: formData 초기값 (라인 89~116)

```typescript
const [formData, setFormData] = useState<DemonstrationFormData>({
  requester: "",
  demoTitle: "",
  teamId: user?.teamId || 0,
  // ... 기존 필드들 ...
  isLongTerm: false, // 🆕 추가
});
```

##### 수정 위치 2: UI 추가 (라인 925~980, "시연/행사 기본 정보" 섹션)

```tsx
{/* 기존 "시연/행사 기본 정보" 섹션 내부에 추가 */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* 기존 입력 필드들 */}

  {/* 🆕 장기시연 체크박스 추가 */}
  <div className="flex items-center gap-2 md:col-span-2">
    <input
      type="checkbox"
      id="isLongTerm"
      checked={formData.isLongTerm}
      onChange={(e) =>
        setFormData({ ...formData, isLongTerm: e.target.checked })
      }
      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
    />
    <label htmlFor="isLongTerm" className="text-sm font-medium text-gray-700">
      장기 시연 (1개월 이상)
    </label>
  </div>
</div>
```

##### 수정 위치 3: submitData 생성 (라인 520~564)

```typescript
const submitData: CreateDemoRequest = {
  requester: formData.requester,
  demoTitle: formData.demoTitle,
  // ... 기존 필드들 ...
  isLongTerm: formData.isLongTerm, // 🆕 추가
};
```

---

#### 2-2. Demo 수정 모달에 장기시연 체크박스 추가

**파일**: `src/components/demonstration/DemoEditModal.tsx`

##### 수정 위치 1: formData 초기값 (라인 112~135)

```typescript
const [formData, setFormData] = useState<DemonstrationFormData>({
  requester: "",
  demoTitle: "",
  // ... 기존 필드들 ...
  isLongTerm: false, // 🆕 추가
});
```

##### 수정 위치 2: 기존 데이터 로드 (라인 248)

```typescript
useEffect(() => {
  if (demoData) {
    setFormData({
      requester: demoData.requester,
      demoTitle: demoData.demoTitle,
      // ... 기존 필드들 ...
      isLongTerm: demoData.isLongTerm ?? false, // 🆕 추가 (기본값 false)
    });
  }
}, [demoData]);
```

##### 수정 위치 3: UI 추가 (라인 1085~1229, "시연/행사 기본 정보" 섹션)

```tsx
{/* SimpleDemonstrationForm과 동일한 체크박스 UI 추가 */}
<div className="flex items-center gap-2 md:col-span-2">
  <input
    type="checkbox"
    id="isLongTerm"
    checked={formData.isLongTerm}
    onChange={(e) =>
      setFormData({ ...formData, isLongTerm: e.target.checked })
    }
    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
  />
  <label htmlFor="isLongTerm" className="text-sm font-medium text-gray-700">
    장기 시연 (1개월 이상)
  </label>
</div>
```

##### 수정 위치 4: submitData 생성 (라인 677~720)

```typescript
const submitData: PatchDemoRequest = {
  requester: formData.requester,
  demoTitle: formData.demoTitle,
  // ... 기존 필드들 ...
  isLongTerm: formData.isLongTerm, // 🆕 추가
};
```

---

#### 2-3. Warehouse 모달에 sortOrder 입력 필드 추가

**파일**: `src/components/admin/WarehouseModal.tsx`

##### 수정 위치 1: warehouseData 상태 (라인 36~43)

```typescript
const [warehouseData, setWarehouseData] = useState<CreateWarehouseDto>({
  warehouseName: "",
  warehouseAddress: "",
  teamId: user?.teamId || 0,
  sortOrder: null, // 🆕 추가 (기본값 null)
});
```

##### 수정 위치 2: 수정 모드 데이터 로드 (라인 46~75)

```typescript
useEffect(() => {
  if (editingWarehouse) {
    setWarehouseData({
      warehouseName: editingWarehouse.warehouseName,
      warehouseAddress: editingWarehouse.warehouseAddress || "",
      teamId: editingWarehouse.teamId,
      sortOrder: editingWarehouse.sortOrder ?? null, // 🆕 추가
    });
  } else {
    setWarehouseData({
      warehouseName: "",
      warehouseAddress: "",
      teamId: user?.teamId || 0,
      sortOrder: null, // 🆕 추가
    });
  }
}, [editingWarehouse, user]);
```

##### 수정 위치 3: UI 추가 (라인 134~178, 폼 내부)

```tsx
{/* 기존 입력 필드 아래에 추가 */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    정렬 순서 (선택)
  </label>
  <input
    type="number"
    min="0"
    value={warehouseData.sortOrder ?? ""}
    onChange={(e) =>
      setWarehouseData({
        ...warehouseData,
        sortOrder: e.target.value ? parseInt(e.target.value, 10) : null,
      })
    }
    placeholder="미입력 시 맨 아래에 표시"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <p className="text-xs text-gray-500 mt-1">
    0부터 시작 (0 = 첫 번째, 미입력 = 맨 아래)
  </p>
</div>
```

##### 수정 위치 4: 제출 데이터 (라인 86~100)

```typescript
// createWarehouse 또는 updateWarehouse 호출 시 sortOrder 포함
const submitData = {
  warehouseName: warehouseData.warehouseName,
  warehouseAddress: warehouseData.warehouseAddress || undefined,
  teamId: warehouseData.teamId,
  sortOrder: warehouseData.sortOrder, // 🆕 추가
};
```

---

### Phase 3: 정렬 및 표시 로직 추가 (선택) 🟢

새로운 필드를 활용한 추가 기능을 구현합니다.
사용자 경험 개선을 위해 적용을 권장하지만, 필수는 아닙니다.

#### 3-1. Demo 테이블에 장기시연 뱃지 표시

**파일**: `src/components/demonstration/DemoRecordTable.tsx`

##### 수정 위치: 테이블 행 렌더링 (라인 138~163)

```tsx
{/* 시연 제목 옆에 뱃지 추가 */}
<div className="flex items-center gap-2">
  <span className="font-medium text-gray-900">
    {record.demoTitle}
  </span>
  {record.isLongTerm && (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
      장기시연
    </span>
  )}
</div>
```

---

#### 3-1-2. Demo 장기시연 탭 필터링 구현 ⭐ 중요

**파일**: `src/components/demonstration/DemonstrationRecordTabs.tsx`

##### 현재 구조

시연 기록 페이지는 **3개의 탭**으로 구성되어 있습니다:

```typescript
type TabType = "ongoing" | "long-term" | "completed";
```

1. **진행중 탭 ("ongoing")**: 완료되지 않은 시연만 표시
2. **장기 시연 탭 ("long-term")**: ⚠️ **현재 미구현** (빈 배열 반환)
3. **시연종료 탭 ("completed")**: 완료된 시연만 표시

##### 현재 문제점

**라인 207-209**: 장기 시연 탭은 UI는 구현되어 있으나, 필터링 로직이 빈 배열을 반환합니다.

```typescript
else if (activeTab === "long-term") {
  // 장기 시연 탭 - 현재는 빈 배열 (추후 isLongTerm 필터링 예정)
  return [];
}
```

##### 수정 방법: 필터링 로직 구현 (라인 207-209)

**옵션 A: 장기시연 전용 탭 (Exclusive)**

장기 시연 탭에만 장기시연 항목을 표시하고, 다른 탭에서는 제외합니다.

```typescript
const demoRecords = useMemo((): DemoResponse[] => {
  if (activeTab === "ongoing") {
    // 진행 중이면서 장기시연이 아닌 것만 표시
    return allDemoRecords.filter((record: DemoResponse) => {
      const isNotCompleted = ![
        "demoCompleted",
        "demoCompletedAndReturned",
        "rejected",
        "rejectedByShipper",
      ].includes(record.demoStatus);

      // 🆕 장기시연은 제외
      return isNotCompleted && !record.isLongTerm;
    });
  } else if (activeTab === "long-term") {
    // 🆕 장기시연만 표시 (진행 여부 무관)
    return allDemoRecords.filter((record: DemoResponse) => {
      return record.isLongTerm === true;
    });
  } else {
    // 시연종료이면서 장기시연이 아닌 것만 표시
    return allDemoRecords.filter((record: DemoResponse) => {
      const isCompleted = [
        "demoCompleted",
        "demoCompletedAndReturned",
        "rejected",
        "rejectedByShipper",
      ].includes(record.demoStatus);

      // 🆕 장기시연은 제외
      return isCompleted && !record.isLongTerm;
    });
  }
}, [allDemoRecords, activeTab]);
```

**장점**: 장기시연이 별도 카테고리로 명확히 구분됨
**단점**: 장기시연의 진행 상태를 확인하려면 탭 전환 필요

---

**옵션 B: 장기시연 중복 표시 (Inclusive, 권장)**

장기 시연도 진행중/시연종료 탭에 함께 표시하고, 장기 시연 탭은 모든 장기시연을 모아서 보여줍니다.

```typescript
const demoRecords = useMemo((): DemoResponse[] => {
  if (activeTab === "ongoing") {
    // 진행 중인 시연만 표시 (장기시연 포함)
    return allDemoRecords.filter((record: DemoResponse) => {
      return ![
        "demoCompleted",
        "demoCompletedAndReturned",
        "rejected",
        "rejectedByShipper",
      ].includes(record.demoStatus);
    });
  } else if (activeTab === "long-term") {
    // 🆕 장기시연만 표시 (진행 여부 무관)
    return allDemoRecords.filter((record: DemoResponse) => {
      return record.isLongTerm === true;
    });
  } else {
    // 시연종료 (장기시연 포함)
    return allDemoRecords.filter((record: DemoResponse) => {
      return [
        "demoCompleted",
        "demoCompletedAndReturned",
        "rejected",
        "rejectedByShipper",
      ].includes(record.demoStatus);
    });
  }
}, [allDemoRecords, activeTab]);
```

**장점**: 장기시연의 진행 상태를 각 탭에서 확인 가능, 장기 시연 탭에서 한눈에 모든 장기시연 조회 가능
**단점**: 장기시연이 여러 탭에 중복 표시됨

---

##### 권장 사항

**옵션 B (Inclusive)** 를 권장합니다.

**이유**:
- 장기 시연도 진행 상태 관리가 필요함 (진행중/완료)
- 장기 시연 탭은 "필터 뷰"로 활용 (특정 카테고리만 모아보기)
- 일반적인 워크플로우를 방해하지 않음

##### 추가 개선 사항 (선택)

장기시연 항목에 뱃지를 추가하여 다른 탭에서도 구분 가능하도록 합니다.
(Phase 3-1 "Demo 테이블에 장기시연 뱃지 표시" 참조)

---

#### 3-2. Warehouse 목록 sortOrder 기준 정렬 ⭐ 중요

**파일**: `src/hooks/useWarehouseItems.ts`

##### 현재 문제점

**라인 132-135**: 창고 목록에 **정렬 로직이 전혀 없음**

```typescript
const accessibleWarehouses = useMemo(() => {
  if (!user || !allWarehousesData?.warehouses) return [];
  return filterAccessibleWarehouses(user, allWarehousesData.warehouses);
  // 정렬 없이 그대로 반환 → 데이터베이스 순서 또는 임의 순서
}, [user, allWarehousesData?.warehouses]);
```

**영향**:
- 사용자가 원하는 순서대로 창고를 배치할 수 없음
- 데이터베이스 반환 순서에 의존 (일관성 없음)

##### 영향받는 UI 컴포넌트

1. **StockTable.tsx** (라인 366-370)
   - 재고 관리 페이지의 창고 선택 드롭다운
   - `accessibleWarehouses.map()`으로 순회하여 `<option>` 생성

2. **WarehouseManagement.tsx** (라인 165-210)
   - 관리자 페이지의 창고 카드 목록
   - `warehouses.map()`으로 순회하여 창고 카드 렌더링

3. **WarehouseCard.tsx**
   - 개별 창고 카드 UI (간접 영향)

##### 수정 방법: 정렬 로직 추가 (라인 132~135)

**기본 구현** (sortOrder null은 원래 순서 유지):

```typescript
const accessibleWarehouses = useMemo(() => {
  if (!user || !allWarehousesData?.warehouses) return [];

  const filtered = filterAccessibleWarehouses(user, allWarehousesData.warehouses);

  // 🆕 sortOrder 기준 정렬 추가
  return filtered.sort((a, b) => {
    // sortOrder가 모두 null인 경우 원래 순서 유지
    if (a.sortOrder === null && b.sortOrder === null) return 0;
    // a만 null인 경우 뒤로
    if (a.sortOrder === null) return 1;
    // b만 null인 경우 뒤로
    if (b.sortOrder === null) return -1;
    // 둘 다 숫자인 경우 오름차순
    return a.sortOrder - b.sortOrder;
  });
}, [user, allWarehousesData?.warehouses]);
```

**정렬 규칙**:
- `sortOrder: 0` → 1번째 표시
- `sortOrder: 1` → 2번째 표시
- `sortOrder: 2` → 3번째 표시
- `sortOrder: null` → 맨 아래 표시 (원래 순서 유지)
- `sortOrder: null` → 맨 아래 표시 (원래 순서 유지)

**정렬 동작 예시**:

```
입력: [
  { id: 1, name: "A창고", sortOrder: null },
  { id: 2, name: "B창고", sortOrder: 1 },
  { id: 3, name: "C창고", sortOrder: 0 },
  { id: 4, name: "D창고", sortOrder: null },
]

출력 (정렬 후): [
  { id: 3, name: "C창고", sortOrder: 0 },      // 1번째
  { id: 2, name: "B창고", sortOrder: 1 },      // 2번째
  { id: 1, name: "A창고", sortOrder: null },   // 맨 아래 (원래 순서)
  { id: 4, name: "D창고", sortOrder: null },   // 맨 아래 (원래 순서)
]
```

---

##### 개선 구현 (권장) ⭐

**sortOrder가 null인 경우 `createdAt` 기준으로 정렬**하여 일관성을 보장합니다.

```typescript
const accessibleWarehouses = useMemo(() => {
  if (!user || !allWarehousesData?.warehouses) return [];

  const filtered = filterAccessibleWarehouses(user, allWarehousesData.warehouses);

  // 🆕 sortOrder 기준 정렬 추가
  return filtered.sort((a, b) => {
    // sortOrder가 모두 null인 경우 → createdAt 기준 정렬 (오름차순)
    if (a.sortOrder === null && b.sortOrder === null) {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    // a만 null인 경우 뒤로
    if (a.sortOrder === null) return 1;
    // b만 null인 경우 뒤로
    if (b.sortOrder === null) return -1;
    // 둘 다 숫자인 경우 오름차순
    return a.sortOrder - b.sortOrder;
  });
}, [user, allWarehousesData?.warehouses]);
```

**개선 효과**:
- `sortOrder: null`인 창고들도 생성일 순으로 일관되게 표시됨
- 사용자가 예측 가능한 순서를 경험함

**정렬 규칙 (개선 버전)**:
- `sortOrder: 0` → 1번째
- `sortOrder: 1` → 2번째
- `sortOrder: null` → 맨 아래 (생성일 오름차순)

**정렬 동작 예시 (개선 버전)**:

```
입력: [
  { id: 1, name: "A창고", sortOrder: null, createdAt: "2026-01-15" },
  { id: 2, name: "B창고", sortOrder: 1, createdAt: "2026-01-10" },
  { id: 3, name: "C창고", sortOrder: 0, createdAt: "2026-01-05" },
  { id: 4, name: "D창고", sortOrder: null, createdAt: "2026-01-01" },
]

출력 (정렬 후): [
  { id: 3, name: "C창고", sortOrder: 0 },                        // 1번째
  { id: 2, name: "B창고", sortOrder: 1 },                        // 2번째
  { id: 4, name: "D창고", sortOrder: null, createdAt: "2026-01-01" },  // 3번째 (오래된 것)
  { id: 1, name: "A창고", sortOrder: null, createdAt: "2026-01-15" },  // 4번째 (최근 것)
]
```

---

#### 3-3. Warehouse 관리 페이지에 sortOrder 표시 (선택)

**파일**: `src/components/admin/WarehouseManagement.tsx`

##### 수정 위치: 창고 카드 렌더링 (라인 165~210)

```tsx
{/* 창고 정보 표시 영역에 추가 */}
<div className="text-sm text-gray-600">
  <p>주소: {warehouse.warehouseAddress || "미등록"}</p>
  {warehouse.sortOrder !== null && (
    <p className="text-xs text-blue-600 mt-1">
      정렬 순서: {warehouse.sortOrder + 1}번째
    </p>
  )}
</div>
```

---

## ✅ 테스트 체크리스트

백엔드 배포 후 다음 항목들을 테스트해주세요.

### Demo 관련
- [ ] 시연 생성 시 `isLongTerm` 체크박스가 표시되는가?
- [ ] 체크박스를 선택하여 장기시연 생성 가능한가?
- [ ] 시연 수정 시 기존 `isLongTerm` 값이 로드되는가?
- [ ] 시연 목록에서 장기시연 뱃지가 표시되는가? (Phase 3 적용 시)
- [ ] `isLongTerm` 미전송 시 기본값 `false`로 생성되는가?

### Warehouse 관련
- [ ] 창고 생성 시 `sortOrder` 입력 필드가 표시되는가?
- [ ] `sortOrder: 0`으로 생성 시 첫 번째에 표시되는가?
- [ ] `sortOrder: null`로 생성 시 맨 아래에 표시되는가?
- [ ] 창고 수정 시 `sortOrder` 변경 가능한가?
- [ ] 같은 순서 지정 시 기존 항목이 자동으로 밀리는가?
- [ ] 창고 목록이 `sortOrder` 기준으로 정렬되는가? (Phase 3 적용 시)

### 하위 호환성
- [ ] 기존 시연 데이터가 정상적으로 조회되는가? (isLongTerm: false로 표시)
- [ ] 기존 창고 데이터가 정상적으로 조회되는가? (sortOrder: null로 표시)
- [ ] `isLongTerm`, `sortOrder` 미전송 시에도 생성/수정 가능한가?

---

## 🚀 배포 전 확인사항

### 1. 타입 체크
```bash
npm run type-check
```
- TypeScript 오류가 없는지 확인

### 2. 빌드 테스트
```bash
npm run build
```
- 빌드가 성공하는지 확인

### 3. 린트
```bash
npm run lint
```
- ESLint 오류가 없는지 확인

### 4. 개발 서버 테스트
```bash
npm run dev
```
- 로컬 환경에서 새로운 필드 입력/조회 테스트

---

## 📌 주요 주의사항

### 날짜 처리 규칙 준수
- 빈 값 입력 시 `undefined` 반환 (빈 문자열 금지)
- 서버 전송 전 undefined 필드 제거
- KST 시간대 형식: `YYYY-MM-DDTHH:MM:SS+09:00`

### sortOrder 유효성 검사
- 최소값: 0 (음수 불가)
- `null` 또는 미전송 시 맨 아래 표시
- 숫자 입력 필드 사용 시 `parseInt()` 처리 필수

### React Query 캐시 무효화
- 생성/수정 후 `queryClient.invalidateQueries` 호출
- Demo: `['demo', teamId]`
- Warehouse: `['warehouses', teamId]`

### 테마 색상 규칙
- 일반 기능: 파란색 계열 (`blue-500`, `blue-600`)
- 휠체어 발주: 보라색 계열 (`purple-500`, `purple-600`)
- 장기시연 뱃지: 보라색 계열 권장 (`purple-100`, `purple-800`)

---

## 🔄 업데이트 관리

변경사항 적용 후 다음을 업데이트해주세요:

1. **CHANGELOG.md** - Keep a Changelog 형식 준수
2. **src/constants/version.ts** - APP_VERSION 업데이트
3. **/update 페이지** - CHANGELOG.md에서 자동 생성
4. **/docs 폴더 문서** - 비즈니스 로직 변경 시

### 자동 업데이트 (권장)
```bash
# 새 기능 추가이므로 minor 버전 업데이트
/update-changelog minor
```

또는 대화형 모드:
```bash
/update-changelog
```

---

## 📖 참고 자료

- [백엔드 API 변경사항 문서](./2026_02_04_FRONTEND_API_CHANGES%201.md)
- [Keep a Changelog 형식](https://keepachangelog.com/ko/1.0.0/)
- [프로젝트 코딩 스타일 가이드](../../CLAUDE.md)

---

## 🧪 사용자 시나리오 기반 테스트 가이드

백엔드 배포 후 다음 시나리오를 순서대로 테스트하여 기능이 정상 작동하는지 확인하세요.

### 시나리오 1: 장기시연 등록 및 관리 📋

#### 1-1. 장기시연 신규 등록
1. **페이지 접근**: `/demonstration` (시연/행사 신청 페이지)
2. **필수 정보 입력**:
   - 시연/행사 명: "2026 상반기 장기 전시회"
   - 신청자: (자동 입력)
   - 사내 담당자: "김개발"
   - 시연기관 담당자: "박시연"
   - 담당자 연락처: "010-1234-5678"
3. **장기시연 체크박스 확인**:
   - ✅ "장기 시연 (1개월 이상)" 체크박스가 표시되는지 확인
   - 체크박스를 선택
4. **나머지 정보 입력** (배송 정보, 시연품 선택 등)
5. **신청 완료**: "신청하기" 버튼 클릭
6. **결과 확인**:
   - 시연 생성 성공 메시지 표시
   - `/demonstration-record` 페이지로 이동

**예상 결과**:
- ✅ 장기시연 체크박스가 정상적으로 작동함
- ✅ 시연이 성공적으로 생성됨

---

#### 1-2. 장기시연 탭에서 확인
1. **페이지 접근**: `/demonstration-record` (시연 기록 페이지)
2. **탭 전환**: "장기 시연" 탭 클릭
3. **확인 사항**:
   - 방금 생성한 "2026 상반기 장기 전시회" 시연이 목록에 표시되는지
   - 시연 제목 옆에 **보라색 "장기시연" 뱃지**가 표시되는지

**예상 결과**:
- ✅ 장기 시연 탭에 해당 시연이 표시됨
- ✅ 보라색 "장기시연" 뱃지가 표시됨

---

#### 1-3. 진행중 탭에서도 확인 (중복 표시 검증)
1. **탭 전환**: "진행중" 탭 클릭
2. **확인 사항**:
   - 장기시연이 "진행중" 탭에도 함께 표시되는지
   - 뱃지가 여전히 표시되는지

**예상 결과**:
- ✅ 장기시연이 "진행중" 탭에도 표시됨 (옵션 B - Inclusive 방식)
- ✅ "장기시연" 뱃지가 표시됨

---

#### 1-4. 장기시연 수정
1. **시연 클릭**: 목록에서 "2026 상반기 장기 전시회" 클릭
2. **수정 모달 확인**:
   - "장기 시연 (1개월 이상)" 체크박스가 체크된 상태로 로드되는지
3. **체크박스 해제**: 장기시연 체크박스 해제
4. **저장**: "수정" 버튼 클릭
5. **결과 확인**:
   - 장기 시연 탭에서 해당 시연이 사라지는지
   - 진행중 탭에서는 여전히 표시되지만 뱃지가 사라지는지

**예상 결과**:
- ✅ 수정 모달에서 기존 `isLongTerm` 값이 정상 로드됨
- ✅ 체크박스 해제 후 장기시연 상태가 해제됨

---

### 시나리오 2: 창고 정렬 순서 관리 🏢

#### 2-1. 기존 창고 확인
1. **페이지 접근**: `/admin` (관리자 페이지) → "창고 관리" 클릭
2. **현재 창고 목록 확인**:
   - 창고들이 어떤 순서로 표시되는지 확인
   - 기존 창고들은 `sortOrder: null`이므로 생성일 순으로 표시됨

**예상 결과**:
- ✅ 기존 창고들이 생성일 오름차순으로 표시됨

---

#### 2-2. 새 창고 생성 (정렬 순서 지정)
1. **창고 추가**: "+ 새 창고 추가" 버튼 클릭
2. **정보 입력**:
   - 창고명: "우선 배송 창고"
   - 주소 검색 및 입력
   - **정렬 순서**: `0` 입력
3. **저장**: "추가" 버튼 클릭
4. **결과 확인**:
   - 새 창고가 **첫 번째**에 표시되는지

**예상 결과**:
- ✅ "정렬 순서 (선택)" 입력 필드가 표시됨
- ✅ `sortOrder: 0`으로 생성된 창고가 맨 위에 표시됨

---

#### 2-3. 추가 창고 생성 (다른 순서)
1. **창고 추가**: "새 창고 추가" 버튼 클릭
2. **정보 입력**:
   - 창고명: "두 번째 창고"
   - 주소 입력
   - **정렬 순서**: `1` 입력
3. **저장**: "추가" 버튼 클릭
4. **결과 확인**:
   - 창고 순서: "우선 배송 창고" (0) → "두 번째 창고" (1) → 기존 창고들 (null)

**예상 결과**:
- ✅ 창고들이 `sortOrder` 순으로 정렬됨
- ✅ `sortOrder: null`인 창고들은 맨 아래에 표시됨

---

#### 2-4. 창고 순서 수정
1. **창고 수정**: "우선 배송 창고" 편집 버튼 클릭
2. **정렬 순서 변경**: `0` → `5`로 변경
3. **저장**: "수정" 버튼 클릭
4. **결과 확인**:
   - "두 번째 창고" (1)가 첫 번째로 이동
   - "우선 배송 창고" (5)가 뒤로 이동

**예상 결과**:
- ✅ 수정 모달에서 기존 `sortOrder` 값이 정상 로드됨
- ✅ 순서 변경 후 목록이 재정렬됨

---

#### 2-5. 재고 관리 페이지에서 창고 순서 확인
1. **페이지 접근**: `/stock` (재고 관리 페이지)
2. **창고 선택 드롭다운 확인**:
   - 드롭다운의 창고 목록이 `sortOrder` 순으로 정렬되어 있는지

**예상 결과**:
- ✅ 드롭다운에서도 `sortOrder` 순으로 창고가 표시됨

---

### 시나리오 3: 하위 호환성 검증 ⚙️

#### 3-1. 기존 시연 데이터 조회
1. **페이지 접근**: `/demonstration-record`
2. **진행중 탭 확인**:
   - 백엔드 배포 전에 생성된 시연들이 정상 표시되는지
   - `isLongTerm` 뱃지가 없는지 (기본값 `false`)

**예상 결과**:
- ✅ 기존 시연 데이터가 정상 조회됨
- ✅ `isLongTerm: false`로 처리되어 뱃지가 표시되지 않음

---

#### 3-2. 기존 창고 데이터 조회
1. **페이지 접근**: `/admin` → "창고 관리"
2. **기존 창고 확인**:
   - 백엔드 배포 전에 생성된 창고들이 정상 표시되는지
   - `sortOrder: null`로 처리되어 맨 아래에 표시되는지

**예상 결과**:
- ✅ 기존 창고 데이터가 정상 조회됨
- ✅ `sortOrder: null`로 처리되어 생성일 순으로 맨 아래 표시됨

---

#### 3-3. 필드 미전송 시 생성 테스트
1. **개발자 도구 열기**: F12 → Network 탭
2. **시연 생성**: 장기시연 체크박스를 **체크하지 않고** 시연 생성
3. **요청 확인**:
   - `isLongTerm` 필드가 `false` 또는 미전송되는지 확인
4. **서버 응답 확인**:
   - 시연이 정상 생성되는지 (`isLongTerm: false`)

**예상 결과**:
- ✅ `isLongTerm` 미전송 또는 `false` 전송 시 정상 생성됨
- ✅ 서버가 기본값 `false`로 처리함

---

## 🔍 필수 검토 항목 체크리스트

백엔드 배포 전후로 다음 항목들을 반드시 검토하세요.

### 1. 타입 정의 검증 ✅

- [ ] **demo.ts**
  - [ ] `DemoResponse.isLongTerm: boolean` (필수 필드)
  - [ ] `CreateDemoRequest.isLongTerm?: boolean` (선택 필드)
  - [ ] `DemonstrationFormData.isLongTerm: boolean` (필수 필드)
  - [ ] `PatchDemoRequest.isLongTerm?: boolean` (선택 필드)

- [ ] **warehouse.ts**
  - [ ] `Warehouse.sortOrder: number | null` (필수 필드)
  - [ ] `CreateWarehouseDto.sortOrder?: number | null` (선택 필드)
  - [ ] `CreateWarehouseProps.sortOrder?: number | null` (선택 필드)
  - [ ] `UpdateWarehouseRequest.sortOrder?: number | null` (선택 필드)

### 2. UI 컴포넌트 검증 ✅

- [ ] **SimpleDemonstrationForm.tsx**
  - [ ] formData 초기값에 `isLongTerm: false` 포함
  - [ ] 체크박스 UI 렌더링 확인
  - [ ] submitData에 `isLongTerm` 전송 확인
  - [ ] 테스트 데이터 생성 시 `isLongTerm` 포함 확인

- [ ] **DemoEditModal.tsx**
  - [ ] formData 초기값에 `isLongTerm: false` 포함
  - [ ] 기존 데이터 로드 시 `isLongTerm` 값 설정 확인
  - [ ] 체크박스 UI 렌더링 확인
  - [ ] submitData에 `isLongTerm` 전송 확인

- [ ] **WarehouseModal.tsx**
  - [ ] warehouseData 초기값에 `sortOrder: null` 포함
  - [ ] 수정 모드 데이터 로드 시 `sortOrder` 값 설정 확인
  - [ ] 숫자 입력 필드 UI 렌더링 확인
  - [ ] submitData에 `sortOrder` 전송 확인
  - [ ] `parseInt()` 처리 확인 (빈 값 → `null`)

### 3. 표시 로직 검증 ✅

- [ ] **DemoRecordTable.tsx**
  - [ ] `record.isLongTerm`이 `true`일 때 보라색 뱃지 표시
  - [ ] 뱃지 스타일: `bg-purple-100 text-purple-800`
  - [ ] NEW 뱃지와 함께 표시되는지 확인

- [ ] **DemonstrationRecordTabs.tsx**
  - [ ] 장기 시연 탭 클릭 시 `isLongTerm === true`인 항목만 필터링
  - [ ] 진행중/시연종료 탭에 장기시연도 함께 표시 (옵션 B)
  - [ ] 빈 배열이 아닌 실제 데이터 반환 확인

- [ ] **useWarehouseItems.ts**
  - [ ] `sortOrder` 기준 정렬 확인
  - [ ] `sortOrder: null`인 창고는 맨 아래 표시
  - [ ] `sortOrder: null` 끼리는 `createdAt` 기준 정렬
  - [ ] 모든 창고 목록 UI에 정렬이 반영되는지 확인

### 4. 빌드 및 타입 체크 ✅

- [ ] **타입 체크 통과**
  ```bash
  npx tsc --noEmit
  ```
  - 출력: 에러 없음

- [ ] **빌드 성공**
  ```bash
  npm run build
  ```
  - 출력: ✓ Compiled successfully

- [ ] **린트 통과**
  ```bash
  npm run lint
  ```
  - 출력: 에러/경고 없음

### 5. 하위 호환성 검증 ✅

- [ ] **기존 시연 데이터**
  - [ ] 조회 시 `isLongTerm: false`로 자동 설정되는지
  - [ ] 뱃지가 표시되지 않는지
  - [ ] 진행중/시연종료 탭에 정상 표시되는지

- [ ] **기존 창고 데이터**
  - [ ] 조회 시 `sortOrder: null`로 자동 설정되는지
  - [ ] 맨 아래 위치에 표시되는지
  - [ ] 생성일 순으로 정렬되는지

- [ ] **새 데이터 생성 시**
  - [ ] `isLongTerm` 미전송 시 `false`로 처리되는지
  - [ ] `sortOrder` 미전송 시 `null`로 처리되는지
  - [ ] 서버 오류 없이 정상 생성되는지

### 6. 엣지 케이스 검증 ✅

- [ ] **sortOrder 중복 값**
  - [ ] 같은 `sortOrder` 값을 가진 창고 생성 시 백엔드 자동 재정렬 확인
  - [ ] 기존 창고들이 +1씩 밀리는지 확인

- [ ] **sortOrder 음수 값**
  - [ ] 음수 입력 시 `min="0"` 제약으로 입력 불가 확인
  - [ ] 또는 서버 유효성 검증으로 거부되는지 확인

- [ ] **장기시연 상태 변경**
  - [ ] 일반 시연 → 장기시연 변경 시 탭 필터링 반영 확인
  - [ ] 장기시연 → 일반 시연 변경 시 뱃지 제거 확인

- [ ] **권한별 접근**
  - [ ] Admin: 모든 창고 조회 및 정렬 확인
  - [ ] Moderator: 읽기 전용 + 정렬 확인
  - [ ] User: 본인 팀 창고만 조회 및 정렬 확인
  - [ ] Supplier: 발주 관련 창고만 조회 및 정렬 확인

### 7. 성능 및 UX 검증 ✅

- [ ] **정렬 성능**
  - [ ] 창고 개수가 많을 때 (10개 이상) 정렬 속도 확인
  - [ ] 페이지 로딩 시 버벅임 없는지 확인

- [ ] **UI 반응성**
  - [ ] 체크박스 클릭 시 즉시 반응하는지
  - [ ] 숫자 입력 필드에서 `parseInt()` 처리가 정상 작동하는지
  - [ ] 빈 값 입력 시 `null`로 처리되는지

- [ ] **뱃지 시인성**
  - [ ] 보라색 뱃지가 다른 뱃지(NEW)와 겹치지 않는지
  - [ ] 텍스트가 명확히 읽히는지

---

## 🚨 배포 후 즉시 확인 항목

백엔드 배포 직후 **5분 이내**에 다음을 확인하세요:

1. **브라우저 콘솔 에러 확인**
   - F12 → Console 탭
   - TypeScript 타입 오류, API 호출 오류 확인

2. **시연 생성 테스트**
   - 장기시연 체크박스가 표시되는지
   - 시연이 정상 생성되는지

3. **장기시연 탭 확인**
   - 빈 배열이 아닌 실제 데이터가 표시되는지

4. **창고 정렬 확인**
   - 창고 목록이 `sortOrder` 순으로 표시되는지

5. **기존 데이터 조회**
   - 기존 시연/창고 데이터가 정상 조회되는지

---

**작성자**: Claude Code
**최종 수정일**: 2026-02-04
**검토 가이드 추가일**: 2026-02-04
