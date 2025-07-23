# KARS DemoRecord 디테일 페이지 기능 분석 및 구현 가이드

> **[2025-01-XX] OrderRecord 디테일 페이지 분석 기반**
>
> - OrderRecord 디테일 페이지의 모든 기능을 분석하여 DemoRecord 디테일 페이지 구현 가이드 작성
> - 시연 시스템의 특성에 맞게 수정이 필요한 부분 식별
> - 권한 시스템, 상태 관리, UI 컴포넌트 등 모든 기능 매핑

---

## 1. 개요

OrderRecord 디테일 페이지(`src/app/orderRecord/[id]/page.tsx`)의 기능을 분석하여 DemoRecord 디테일 페이지 구현을 위한 가이드를 작성합니다. 시연 시스템은 발주 시스템과 유사하지만 시연 전용의 특별한 기능들이 있습니다.

## 2. 핵심 기능 분석

### 2.1 페이지 구조 및 라우팅

#### 현재 OrderRecord 구조

```
src/app/orderRecord/[id]/page.tsx
├── URL 파라미터: [id] (발주 ID)
├── 쿼리 파라미터: teamId (팀 ID)
└── 동적 라우팅: /orderRecord/{orderId}?teamId={teamId}
```

#### DemoRecord 구조 (구현 예정)

```
src/app/demoRecord/[id]/page.tsx
├── URL 파라미터: [id] (시연 ID)
├── 쿼리 파라미터: teamId (팀 ID)
└── 동적 라우팅: /demoRecord/{demoId}?teamId={teamId}
```

### 2.2 상태 관리 및 데이터 흐름

#### OrderRecord 상태 관리

```typescript
// 상태 변수들
const [order, setOrder] = useState<IOrderRecord | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
```

#### DemoRecord 상태 관리 (예상)

```typescript
// 상태 변수들
const [demo, setDemo] = useState<IDemoRecord | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
```

### 2.3 인증 및 권한 시스템

#### 로그인 상태 확인

```typescript
// OrderRecord의 인증 로직
const { user: auth } = useCurrentUser();
const isAuthenticated = authStore.getState().isAuthenticated;

// 로그인되지 않은 경우 모달 표시
if (!currentAuth.isAuthenticated || !currentAuth.user) {
  setIsLoginModalOpen(true);
  return;
}
```

#### 권한별 기능 제어

**OrderRecord 권한 체계:**

- **Admin**: 모든 발주 수정/삭제 가능 (상태 무관)
- **Moderator**: 초기 승인 단계만 담당
- **User**: 자신의 requested 상태 발주만 수정/삭제 가능

**DemoRecord 권한 체계 (예상):**

- **Admin**: 모든 시연 수정/삭제 가능 (상태 무관)
- **Moderator**: 초기 승인 단계만 담당
- **User**: 자신의 requested 상태 시연만 수정/삭제 가능

### 2.4 상태 변경 시스템

#### OrderRecord 상태 변경 로직

```typescript
// 상태 변경 권한 확인
const hasPermissionToChangeStatus = () => {
  return auth?.accessLevel === "admin" || auth?.accessLevel === "moderator";
};

// 권한별 상태 변경 가능 여부
const canChangeStatus = (currentStatus: string) => {
  if (auth.accessLevel === "moderator") {
    return [
      OrderStatus.requested,
      OrderStatus.approved,
      OrderStatus.rejected,
    ].includes(currentStatus as OrderStatus);
  }
  if (auth.accessLevel === "admin") {
    return [
      OrderStatus.approved,
      OrderStatus.confirmedByShipper,
      OrderStatus.shipmentCompleted,
      OrderStatus.rejectedByShipper,
    ].includes(currentStatus as OrderStatus);
  }
  return false;
};
```

#### DemoRecord 상태 변경 로직 (예상)

```typescript
// 상태 변경 권한 확인
const hasPermissionToChangeStatus = () => {
  return auth?.accessLevel === "admin" || auth?.accessLevel === "moderator";
};

// 권한별 상태 변경 가능 여부
const canChangeStatus = (currentStatus: string) => {
  if (auth.accessLevel === "moderator") {
    return [
      DemoStatus.requested,
      DemoStatus.approved,
      DemoStatus.rejected,
    ].includes(currentStatus as DemoStatus);
  }
  if (auth.accessLevel === "admin") {
    return [
      DemoStatus.approved,
      DemoStatus.confirmedByShipper,
      DemoStatus.shipmentCompleted,
      DemoStatus.rejectedByShipper,
    ].includes(currentStatus as DemoStatus);
  }
  return false;
};
```

### 2.5 UI 컴포넌트 구조

#### OrderRecord UI 구조

```
1. 헤더 (뒤로가기 + 제목)
2. 현재 상태 표시 (색상별 아이콘)
3. 상태 변경 섹션 (권한별 표시)
4. 기본 정보 카드 (발주 ID, 생성일, 발주자, 담당자, 출고 창고)
5. 배송 정보 카드 (수령자, 연락처, 구매일, 출고예정일, 설치요청일)
6. 주소 정보
7. 품목 정보 (발주 품목 목록)
8. 메모 (있는 경우)
9. 첨부파일 (있는 경우)
10. 수정 버튼 (권한별 표시)
11. 수정 모달
```

#### DemoRecord UI 구조 (예상)

```
1. 헤더 (뒤로가기 + 제목)
2. 현재 상태 표시 (색상별 아이콘)
3. 상태 변경 섹션 (권한별 표시)
4. 기본 정보 카드 (시연 ID, 생성일, 요청자, 시연 담당자, 시연 창고)
5. 시연 정보 카드 (시연 제목, 시연 일정, 시연 주소, 결제 정보)
6. 시연 주소 정보
7. 시연품 정보 (시연 아이템 목록)
8. 메모 (있는 경우)
9. 첨부파일 (있는 경우)
10. 수정 버튼 (권한별 표시)
11. 수정 모달
```

## 3. 핵심 기능별 상세 분석

### 3.1 데이터 조회 및 에러 처리

#### OrderRecord 데이터 조회

```typescript
const fetchOrder = async () => {
  setIsLoading(true);

  // 로그인 상태 확인
  const currentAuth = authStore.getState();
  if (!currentAuth.isAuthenticated || !currentAuth.user) {
    setIsLoginModalOpen(true);
    setIsLoading(false);
    return;
  }

  try {
    const res = await getOrder(orderId);
    if (res.success && res.data) {
      setOrder(res.data as IOrderRecord);
    } else {
      alert("해당 발주를 찾을 수 없습니다.");
      router.push("/orderRecord");
    }
  } catch (error) {
    console.error("발주 조회 중 오류:", error);
    if (!currentAuth.isAuthenticated || !currentAuth.user) {
      setIsLoginModalOpen(true);
    } else {
      alert("발주 조회에 실패했습니다.");
      router.push("/orderRecord");
    }
  }
  setIsLoading(false);
};
```

#### DemoRecord 데이터 조회 (예상)

```typescript
const fetchDemo = async () => {
  setIsLoading(true);

  // 로그인 상태 확인
  const currentAuth = authStore.getState();
  if (!currentAuth.isAuthenticated || !currentAuth.user) {
    setIsLoginModalOpen(true);
    setIsLoading(false);
    return;
  }

  try {
    const res = await getDemo(demoId);
    if (res.success && res.data) {
      setDemo(res.data as IDemoRecord);
    } else {
      alert("해당 시연을 찾을 수 없습니다.");
      router.push("/demoRecord");
    }
  } catch (error) {
    console.error("시연 조회 중 오류:", error);
    if (!currentAuth.isAuthenticated || !currentAuth.user) {
      setIsLoginModalOpen(true);
    } else {
      alert("시연 조회에 실패했습니다.");
      router.push("/demoRecord");
    }
  }
  setIsLoading(false);
};
```

### 3.2 상태 변경 및 재고 연동

#### OrderRecord 상태 변경

```typescript
const handleStatusChange = async (newStatus: OrderStatus) => {
  if (!order) return;

  // moderator 권한 사용자가 본인이 생성한 발주를 승인/반려하려고 할 때 제한
  if (auth?.accessLevel === "moderator") {
    if (order.userId === auth?.id) {
      if (
        newStatus === OrderStatus.approved ||
        newStatus === OrderStatus.rejected
      ) {
        alert("요청자 본인 이외의 승인권자가 승인해야 합니다");
        return;
      }
    }
  }

  // 확인 다이얼로그
  if (
    !window.confirm(
      `정말 주문 상태를 '${getStatusText(newStatus)}'(으)로 변경하시겠습니까?`
    )
  ) {
    return;
  }

  try {
    setIsUpdatingStatus(true);
    await updateOrderStatusMutation.mutateAsync({
      id: orderId,
      data: { status: newStatus },
    });

    // 출고 완료 상태로 변경된 경우 재고 연동
    if (newStatus === OrderStatus.shipmentCompleted) {
      queryClient.invalidateQueries({
        queryKey: [
          ["warehouseItems"],
          ["inventoryRecords"],
          ["items"],
          ["warehouse"],
        ],
      });
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["warehouseItems"] }),
        queryClient.refetchQueries({ queryKey: ["inventoryRecords"] }),
      ]);
      setTimeout(async () => {
        await refetchWarehouseItems();
      }, 1000);
      alert("출고 완료, 재고에 반영 했습니다.");
      toast.success("출고 완료 처리되었습니다. 재고가 업데이트되었습니다.");
    } else {
      alert("주문 상태가 변경되었습니다.");
      toast.success("주문 상태가 변경되었습니다.");
    }

    window.location.reload();
  } catch (error) {
    console.error("상태 업데이트 실패:", error);
    alert("주문 상태 업데이트에 실패했습니다.");
  } finally {
    setIsUpdatingStatus(false);
  }
};
```

#### DemoRecord 상태 변경 (예상)

```typescript
const handleStatusChange = async (newStatus: DemoStatus) => {
  if (!demo) return;

  // moderator 권한 사용자가 본인이 생성한 시연을 승인/반려하려고 할 때 제한
  if (auth?.accessLevel === "moderator") {
    if (demo.userId === auth?.id) {
      if (
        newStatus === DemoStatus.approved ||
        newStatus === DemoStatus.rejected
      ) {
        alert("요청자 본인 이외의 승인권자가 승인해야 합니다");
        return;
      }
    }
  }

  // 확인 다이얼로그
  if (
    !window.confirm(
      `정말 시연 상태를 '${getStatusText(newStatus)}'(으)로 변경하시겠습니까?`
    )
  ) {
    return;
  }

  try {
    setIsUpdatingStatus(true);
    await updateDemoStatusMutation.mutateAsync({
      id: demoId,
      data: { status: newStatus },
    });

    // 시연 출고 완료 상태로 변경된 경우 재고 연동
    if (newStatus === DemoStatus.shipmentCompleted) {
      queryClient.invalidateQueries({
        queryKey: [
          ["warehouseItems"],
          ["inventoryRecords"],
          ["items"],
          ["warehouse"],
        ],
      });
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["warehouseItems"] }),
        queryClient.refetchQueries({ queryKey: ["inventoryRecords"] }),
      ]);
      setTimeout(async () => {
        await refetchWarehouseItems();
      }, 1000);
      alert("시연 출고 완료, 재고에 반영 했습니다.");
      toast.success(
        "시연 출고 완료 처리되었습니다. 재고가 업데이트되었습니다."
      );
    } else {
      alert("시연 상태가 변경되었습니다.");
      toast.success("시연 상태가 변경되었습니다.");
    }

    window.location.reload();
  } catch (error) {
    console.error("상태 업데이트 실패:", error);
    alert("시연 상태 업데이트에 실패했습니다.");
  } finally {
    setIsUpdatingStatus(false);
  }
};
```

### 3.3 권한별 수정/삭제 권한

#### OrderRecord 수정 권한

```typescript
const hasPermissionToEdit = (record: IOrderRecord) => {
  if (!auth) return false;
  const isAdmin = auth.isAdmin;
  const isAuthor = record.userId === auth.id;
  if (isAdmin) return true;
  const isRequestedStatus = record.status === OrderStatus.requested;
  return isAuthor && isRequestedStatus;
};
```

#### DemoRecord 수정 권한 (예상)

```typescript
const hasPermissionToEdit = (record: IDemoRecord) => {
  if (!auth) return false;
  const isAdmin = auth.isAdmin;
  const isAuthor = record.userId === auth.id;
  if (isAdmin) return true;
  const isRequestedStatus = record.status === DemoStatus.requested;
  return isAuthor && isRequestedStatus;
};
```

### 3.4 상태 표시 및 스타일링

#### OrderRecord 상태 표시

```typescript
// 상태 텍스트 변환
const getStatusText = (status: string): string => {
  switch (status) {
    case OrderStatus.requested:
      return "요청";
    case OrderStatus.approved:
      return "승인";
    case OrderStatus.rejected:
      return "반려";
    case OrderStatus.confirmedByShipper:
      return "출고팀 확인";
    case OrderStatus.shipmentCompleted:
      return "출고 완료";
    case OrderStatus.rejectedByShipper:
      return "출고 보류";
    default:
      return status;
  }
};

// 상태 색상 클래스
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case OrderStatus.requested:
      return "bg-yellow-100 text-yellow-800";
    case OrderStatus.approved:
      return "bg-green-100 text-green-800";
    case OrderStatus.rejected:
      return "bg-red-100 text-red-800";
    case OrderStatus.confirmedByShipper:
      return "bg-blue-100 text-blue-800";
    case OrderStatus.shipmentCompleted:
      return "bg-purple-100 text-purple-800";
    case OrderStatus.rejectedByShipper:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
```

#### DemoRecord 상태 표시 (예상)

```typescript
// 상태 텍스트 변환
const getStatusText = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "요청";
    case DemoStatus.approved:
      return "승인";
    case DemoStatus.rejected:
      return "반려";
    case DemoStatus.confirmedByShipper:
      return "출고팀 확인";
    case DemoStatus.shipmentCompleted:
      return "출고 완료";
    case DemoStatus.rejectedByShipper:
      return "출고 보류";
    case DemoStatus.demoCompleted:
      return "시연 종료";
    default:
      return status;
  }
};

// 상태 색상 클래스
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "bg-yellow-100 text-yellow-800";
    case DemoStatus.approved:
      return "bg-green-100 text-green-800";
    case DemoStatus.rejected:
      return "bg-red-100 text-red-800";
    case DemoStatus.confirmedByShipper:
      return "bg-blue-100 text-blue-800";
    case DemoStatus.shipmentCompleted:
      return "bg-purple-100 text-purple-800";
    case DemoStatus.rejectedByShipper:
      return "bg-orange-100 text-orange-800";
    case DemoStatus.demoCompleted:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
```

## 4. 시연 시스템 특화 기능

### 4.1 시연 전용 필드

#### 시연 정보 카드 (추가 필요)

```typescript
// 시연 정보 카드
<div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
  <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
    <Presentation size={20} />
    시연 정보
  </h2>
  <div className="space-y-3">
    <div className="flex justify-between">
      <span className="text-gray-600">시연 제목:</span>
      <span className="font-medium">{demo.demoTitle}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">시연 유형:</span>
      <span className="font-medium">{demo.demoNationType}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">결제 유형:</span>
      <span className="font-medium">{demo.demoPaymentType}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">시연 가격:</span>
      <span className="font-medium">
        {demo.demoPrice ? `${demo.demoPrice} ${demo.demoCurrencyUnit}` : "-"}
      </span>
    </div>
  </div>
</div>
```

#### 시연 일정 정보 (추가 필요)

```typescript
// 시연 일정 정보
<div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
  <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
    <Calendar size={20} />
    시연 일정
  </h2>
  <div className="space-y-3">
    <div className="flex justify-between">
      <span className="text-gray-600">상차 날짜:</span>
      <span className="font-medium">
        {demo.demoStartDate ? formatDate(demo.demoStartDate) : "-"}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">상차 시간:</span>
      <span className="font-medium">{demo.demoStartTime || "-"}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">하차 날짜:</span>
      <span className="font-medium">
        {demo.demoEndDate ? formatDate(demo.demoEndDate) : "-"}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">하차 시간:</span>
      <span className="font-medium">{demo.demoEndTime || "-"}</span>
    </div>
  </div>
</div>
```

### 4.2 시연 상태별 특별 처리

#### 시연 완료 상태 처리

```typescript
// 시연 완료 상태로 변경된 경우 재고 복구
if (newStatus === DemoStatus.demoCompleted) {
  queryClient.invalidateQueries({
    queryKey: [
      ["warehouseItems"],
      ["inventoryRecords"],
      ["items"],
      ["warehouse"],
    ],
  });
  await Promise.all([
    queryClient.refetchQueries({ queryKey: ["warehouseItems"] }),
    queryClient.refetchQueries({ queryKey: ["inventoryRecords"] }),
  ]);
  setTimeout(async () => {
    await refetchWarehouseItems();
  }, 1000);
  alert("시연 완료, 재고가 복구되었습니다.");
  toast.success("시연 완료 처리되었습니다. 재고가 복구되었습니다.");
}
```

## 5. 구현 체크리스트

### 5.1 필수 구현 항목

- [ ] **페이지 라우팅**: `/demoRecord/[id]/page.tsx` 생성
- [ ] **API 연동**: `getDemo`, `updateDemoStatus` API 호출
- [ ] **상태 관리**: 시연 데이터, 로딩, 에러 상태 관리
- [ ] **권한 시스템**: Admin/Moderator/User 권한별 기능 제어
- [ ] **상태 변경**: 시연 상태 변경 및 재고 연동
- [ ] **UI 컴포넌트**: 시연 정보 표시, 상태 표시, 수정 모달
- [ ] **에러 처리**: 로그인 실패, 데이터 조회 실패, 권한 부족 처리
- [ ] **로딩 상태**: 스켈레톤 UI 및 로딩 인디케이터

### 5.2 시연 시스템 특화 구현

- [ ] **시연 정보 카드**: 시연 제목, 유형, 결제 정보 표시
- [ ] **시연 일정 정보**: 상차/하차 일정 표시
- [ ] **시연 완료 처리**: 재고 복구 로직 구현
- [ ] **시연 전용 상태**: `demoCompleted` 상태 처리
- [ ] **시연 아이템 표시**: 시연품 목록 및 수량 표시

### 5.3 권한별 기능 구현

- [ ] **Admin**: 모든 시연 수정/삭제, 전체 상태 변경
- [ ] **Moderator**: 초기 승인 단계만 담당, 본인 시연 승인 제한
- [ ] **User**: 자신의 requested 상태 시연만 수정/삭제
- [ ] **Supplier**: 관련 시연 조회만 가능

## 6. 파일 구조

### 6.1 필요한 파일들

```
src/
├── app/
│   └── demoRecord/
│       └── [id]/
│           └── page.tsx                    # 시연 상세 페이지
├── components/
│   └── demoRecord/
│       ├── DemoEditModal.tsx              # 시연 수정 모달
│       └── DemoStatusDisplay.tsx          # 시연 상태 표시 컴포넌트
├── hooks/
│   └── (useDemo)/
│       ├── useDemoQueries.ts              # 시연 조회 훅
│       └── useDemoMutations.ts            # 시연 변경 훅
├── api/
│   └── demo-api.ts                        # 시연 API 호출
└── types/
    └── demo/
        └── demo.ts                        # 시연 타입 정의
```

### 6.2 수정이 필요한 기존 파일들

```
src/
├── api/
│   └── demo-api.ts                        # getDemo, updateDemoStatus 추가
├── hooks/
│   └── (useDemo)/
│       ├── useDemoQueries.ts              # useSingleDemo 추가
│       └── useDemoMutations.ts            # useUpdateDemoStatus 추가
└── types/
    └── demo/
        └── demo.ts                        # IDemoRecord 인터페이스 추가
```

## 7. 구현 우선순위

### 7.1 1단계: 기본 구조

1. 페이지 라우팅 및 기본 컴포넌트 구조
2. API 연동 및 데이터 조회
3. 기본 UI 렌더링

### 7.2 2단계: 권한 시스템

1. 로그인 상태 확인
2. 권한별 기능 제어
3. 상태 변경 로직

### 7.3 3단계: 시연 특화 기능

1. 시연 정보 카드
2. 시연 일정 정보
3. 시연 완료 처리

### 7.4 4단계: UI/UX 개선

1. 수정 모달
2. 에러 처리
3. 로딩 상태

---

**📝 참고사항:**

- OrderRecord와 DemoRecord는 유사한 구조를 가지지만 시연 시스템의 특성에 맞게 수정이 필요합니다
- 시연 완료 시 재고 복구 로직이 추가로 필요합니다
- 시연 전용 필드들(시연 제목, 일정, 결제 정보 등)이 추가로 표시되어야 합니다
- 권한 시스템은 동일하게 적용되지만 시연 전용 상태(`demoCompleted`)가 추가됩니다
