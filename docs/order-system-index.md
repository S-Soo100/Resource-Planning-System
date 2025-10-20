# KARS 발주 시스템 구조 및 비즈니스 로직

## 📁 파일 구조

### 페이지 컴포넌트

```
src/app/
├── order-guide/          # 발주 가이드 페이지
├── orderWheelchair/      # 휠체어 전용 발주 요청 페이지
├── orderRequest/         # 개별 품목 발주 요청 페이지
├── packageOrder/         # 패키지 발주 요청 페이지
└── orderRecord/          # 발주 기록 조회 페이지
```

### 컴포넌트

```
src/components/
├── orderRequest/
│   └── OrderRequestForm.tsx      # 발주 요청 폼 (공통)
├── orderWheelchair/
│   └── WheelchairOrderForm.tsx   # 휠체어 발주 요청 폼 (개별 품목 발주와 동일한 구조)
├── orderRecord/
│   ├── OrderRecordTabs.tsx       # 발주 기록 탭 (데스크톱)
│   ├── OrderRecordTabsMobile.tsx # 발주 기록 탭 (모바일)
│   ├── OrderEditModal.tsx        # 발주 수정 모달
│   └── OrderCommentModal.tsx     # 발주 댓글 모달 (예정)
├── demonstration/
│   └── DemonstrationRequestForm.tsx # 시연 요청 폼
└── comment/
    ├── CommentList.tsx           # 댓글 목록 (예정)
    ├── CommentForm.tsx           # 댓글 작성 폼 (예정)
    └── CommentItem.tsx           # 댓글 아이템 (예정)
```

### 타입 정의

```
src/types/(order)/
├── order.ts                    # 발주 기본 타입
├── orderRecord.ts              # 발주 기록 타입
├── orderRequestFormData.ts     # 발주 요청 폼 데이터 타입
└── orderComment.ts             # 발주 댓글 타입
```

### 훅 및 서비스

```
src/hooks/
├── useOrder.ts                 # 발주 관련 훅 통합
├── (useOrder)/
│   ├── useOrderQueries.ts      # 발주 조회 훅
│   └── useOrderMutations.ts    # 발주 변경 훅
└── usePackages.ts              # 패키지 관련 훅

src/services/
└── orderService.ts             # 발주 서비스 로직

src/api/
├── order-api.ts                # 발주 관련 API 호출
└── comment-api.ts              # 댓글 관련 API 호출 (예정)
```

## 🔧 핵심 타입 정의

### OrderStatus

```typescript
enum OrderStatus {
  requested = "requested", // 요청 (초기 상태)
  approved = "approved", // 승인 (1차승인권자)
  rejected = "rejected", // 반려 (1차승인권자)
  confirmedByShipper = "confirmedByShipper", // 출고자 확인 (관리자)
  shipmentCompleted = "shipmentCompleted", // 출고 완료 (관리자)
  rejectedByShipper = "rejectedByShipper", // 출고자 반려 (관리자)
}
```

### OrderComment 인터페이스

```typescript
interface OrderComment {
  id: number;
  orderId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

### Order 인터페이스

```typescript
interface Order {
  id: number;
  userId: number;
  supplierId: number;
  packageId: number;
  warehouseId: number;
  requester: string;
  receiver: string;
  receiverPhone: string;
  receiverAddress: string;
  purchaseDate: string;
  outboundDate: string;
  installationDate: string;
  manager: string;
  status: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: OrderUser;
  supplier: OrderSupplier;
  package: OrderPackage;
  warehouse: OrderWarehouse; // 출고 창고 정보
  orderItems: OrderItem[];
  files: OrderFile[];
  comments?: OrderComment[]; // 발주 댓글 목록
}
```

### OrderRequestFormData

```typescript
type OrderRequestFormData = {
  supplierId?: number | null;
  packageId?: number | null;
  warehouseId?: number | null;
  requester: string;
  receiver: string;
  receiverPhone: string;
  address: string;
  detailAddress: string;
  requestDate: string;
  setupDate: string;
  notes: string;
  manager: string;
};
```

## 🏗️ 주요 컴포넌트 구조

### OrderRequestForm.tsx

- **역할**: 패키지/개별 품목/휠체어 발주 공통 폼
- **Props**: `isPackageOrder`, `title`, `warehousesList`, `warehouseItems`, `restrictedWarehouseId`, `restrictedCategoryId`
- **상태**: `formData`, `orderItems`, `files`, `isSubmitting`
- **검증**: 필수 입력 항목, 최소 품목 선택, 재고 확인
- **제한사항**: 특정 창고/카테고리로 제한 가능 (휠체어 발주 시 사용)

### OrderRecordTabs.tsx

- **역할**: 발주 기록 조회 및 관리 (데스크톱)
- **탭**: 전체/내 발주/거래처별 발주
- **기능**: 필터링, 페이지네이션, 상태 변경, 수정 모달
- **권한**: 사용자별 접근 제한 및 기능 제어
- **창고 정보**: 출고팀이 확인할 수 있도록 출고 창고명 표시
- **UI 개선** (v1.7.0):
  - **상세보기 버튼**: 기존 화살표 버튼을 명확한 '상세보기' 버튼으로 교체
  - **카드 토글 기능**: 상세보기 버튼 외 카드 클릭 시 발주 기간, 창고, 배송 주소, 담당자, 품목, 메모 등 상세 정보 표시
  - **메모 표시**: 발주 메모를 노란색 하이라이트로 명확히 표시
  - **향상된 사용자 경험**: 클릭 영역 분리로 상세보기와 정보 확장 기능 구분

### OrderRecordTabsMobile.tsx

- **역할**: 발주 기록 조회 (모바일)
- **레이아웃**: 카드 형태, 확장/축소 가능
- **최적화**: 모바일 화면에 맞는 간소화된 정보 표시
- **창고 정보**: 모바일에서도 출고 창고명 표시
- **UI 개선** (v1.7.0):
  - **데스크톱 패리티**: 데스크톱과 동일한 카드 토글 및 상세보기 기능 구현
  - **반응형 디자인**: 모바일 환경에 최적화된 정보 표시 및 인터랙션
  - **터치 친화적**: 모바일 터치 인터페이스에 맞는 버튼 크기 및 간격

### OrderEditModal.tsx

- **역할**: 발주 정보 수정 모달
- **수정 가능**: 수령인 정보, 배송 정보, 품목/수량, 메모
- **권한**:
  - **Admin**: 모든 발주 수정 가능 (상태 무관)
  - **일반 사용자**: 자신의 requested 상태 발주만 수정 가능
- **파일 관리**: 기존 파일 삭제/다운로드, 새 파일 업로드
- **창고 제한**: 기존 발주의 창고 변경 불가 (비즈니스 규칙)

## 🔄 비즈니스 로직

### 발주 워크플로우

```
1. 사용자 발주 요청 (requested) ← 일반 사용자: 수정/삭제 가능 | Admin: 수정/삭제 가능
   ↓
2. 1차승인권자 검토
   ├─ 승인 (approved) ← 일반 사용자: 수정/삭제 불가 | Admin: 수정/삭제 가능
   └─ 반려 (rejected) ← 일반 사용자: 수정/삭제 불가 | Admin: 수정/삭제 가능
   ↓
3. 관리자 출고 처리
   ├─ 출고자 확인 (confirmedByShipper) ← 일반 사용자: 수정/삭제 불가 | Admin: 수정/삭제 가능
   ├─ 출고 완료 (shipmentCompleted) ← 일반 사용자: 수정/삭제 불가 | Admin: 수정/삭제 가능
   └─ 출고 반려 (rejectedByShipper) ← 일반 사용자: 수정/삭제 불가 | Admin: 수정/삭제 가능
```

### 휠체어 발주 시스템

휠체어 발주는 기존 개별 품목 발주 시스템과 동일한 구조를 사용하되, 다음과 같은 제한사항을 가집니다:

#### 휠체어 발주 특징

- **창고 제한**: 휠체어 전용 창고로만 발주 가능
- **카테고리 제한**: 휠체어 카테고리의 품목만 선택 가능
- **워크플로우**: 기존 발주 시스템과 동일한 승인 프로세스
- **권한**: 기존 발주 시스템과 동일한 권한 체계 적용

#### 휠체어 발주 구현 방식

```typescript
// WheelchairOrderForm.tsx에서 OrderRequestForm 컴포넌트를 재사용
<OrderRequestForm
  isPackageOrder={false}
  title="휠체어 발주"
  warehousesList={wheelchairWarehouses} // 휠체어 전용 창고만 필터링
  warehouseItems={wheelchairItems} // 휠체어 카테고리 품목만 필터링
  restrictedWarehouseId={WHEELCHAIR_WAREHOUSE_ID} // 특정 창고 ID로 제한
  restrictedCategoryId={WHEELCHAIR_CATEGORY_ID} // 특정 카테고리 ID로 제한
/>
```

#### 휠체어 발주 페이지 구현

- **경로**: `/orderWheelchair`
- **컴포넌트**: `WheelchairOrderForm.tsx`
- **기능**: 기존 `OrderRequestForm` 컴포넌트 재사용
- **제한사항**:
  - 창고 선택 불가 (휠체어 전용 창고로 고정)
  - 카테고리 선택 불가 (휠체어 카테고리로 고정)
  - 해당 창고의 휠체어 카테고리 품목만 표시

### 발주 수정/삭제 권한 제어

#### 권한별 수정/삭제 가능 조건

**Admin 사용자:**

- 모든 발주 수정/삭제 가능 (상태 무관)
- 본인/타인 발주 구분 없음

**일반 사용자:**

- 자신이 작성한 발주만 수정/삭제 가능
- `requested` (승인 이전) 상태에서만 가능

#### 수정/삭제 권한 매트릭스

| 사용자 타입     | 본인 발주 (requested) | 타인 발주 (requested) | 본인 발주 (승인됨) | 타인 발주 (승인됨) |
| --------------- | --------------------- | --------------------- | ------------------ | ------------------ |
| **일반 사용자** | ✅ 수정/삭제 가능     | ❌ 수정/삭제 불가     | ❌ 수정/삭제 불가  | ❌ 수정/삭제 불가  |
| **Admin**       | ✅ 수정/삭제 가능     | ✅ 수정/삭제 가능     | ✅ 수정/삭제 가능  | ✅ 수정/삭제 가능  |

- **삭제 확인**: 발주자, 수령자, 상태 정보와 함께 확인 다이얼로그 표시
- **실시간 반영**: 수정/삭제 후 발주 목록 자동 새로고침

#### 모달 접근 권한 세부 사항

**OrderEditModal 진입 조건:**

- **Admin**: 모든 발주에 대해 수정 모달 진입 가능
- **일반 사용자**: 자신의 requested 상태 발주만 수정 모달 진입 가능

**권한 검증 흐름:**

1. **OrderRecordTabs**: 수정 버튼 표시 여부 결정
2. **OrderEditModal**: 모달 내부에서 재검증 후 폼 활성화
3. **에러 메시지**:
   - **Admin**: 모든 발주에서 수정 폼 활성화 (에러 메시지 없음)
   - **일반 사용자**: 권한 없는 경우 "수정 권한이 없습니다." 또는 "요청 상태가 아닌 주문은 수정할 수 없습니다." 표시

### 권한별 기능 제한

#### 발주 상태 변경 권한

**Admin:**
- **모든 상태** 변경 가능 (requested, approved, rejected, confirmedByShipper, shipmentCompleted, rejectedByShipper)
- 모든 발주 건의 상태를 변경할 수 있음
- 출고 완료(shipmentCompleted) 상태의 발주도 변경 가능

**Moderator:**
- **초기 승인 단계**만 변경 가능 (requested, approved, rejected)
- 본인이 작성한 발주는 승인/반려 불가 (이해 충돌 방지)
- 출고 단계 상태는 변경 불가

**User/Supplier:**
- 상태 변경 권한 없음 (조회만 가능)

#### 발주 수정/삭제 권한

- **User**: 발주 요청, 자신의 발주 조회, 자신의 requested 상태 발주 수정 가능
- **Moderator**: 발주 승인/반려, 전체 발주 조회, 자신의 requested 상태 발주 수정 가능
- **Admin**: 모든 발주 관리, 모든 상태 변경 가능, 모든 발주 수정/삭제 (상태 무관)
- **Supplier**: 관련 발주 조회만 가능

**발주 삭제 권한:**
- **Admin 전용**: 상태와 무관하게 모든 발주 삭제 가능
- 삭제 버튼은 발주 상세 페이지에만 표시됨 (목록 페이지에는 노출되지 않음)
- 삭제 시 확인 다이얼로그로 발주자, 수령자, 상태 정보 표시

#### 상태 변경 매트릭스

| 권한 | requested | approved | rejected | confirmedByShipper | shipmentCompleted | rejectedByShipper |
|------|-----------|----------|----------|--------------------|-------------------|-------------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Moderator** | ✅ | ✅ (본인 발주 제외) | ✅ (본인 발주 제외) | ❌ | ❌ | ❌ |
| **User** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Supplier** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 재고 확인 로직

- 출고 관련 상태 변경 시 재고 수량 확인
- 재고 부족 시 상세한 부족 품목 목록과 함께 에러 메시지
- 패키지 발주 시 패키지 내 모든 품목의 재고 확인

### 패키지 관리

- 패키지 선택 시 자동으로 패키지 내 품목들 설정
- 패키지 수량 변경 시 모든 패키지 아이템 수량 동기화
- 패키지 내 개별 품목 수정 불가 (비즈니스 규칙)

### 창고 관리

- **창고 정보 표시**: 발주 기록에서 출고 창고명을 명확히 표시
- **창고 변경 제한**: 기존 발주 건의 창고 변경 금지 (비즈니스 규칙)
- **창고 권한**: 창고별 접근 권한 확인 및 검증
- **출고 프로세스**: 출고팀이 올바른 창고에서 물품을 출고할 수 있도록 지원

### 댓글 기능 권한별 제한

- **Admin**: 모든 댓글 조회/작성/수정/삭제 가능
- **Moderator**: 모든 댓글 조회/작성 가능, 자신의 댓글만 수정/삭제 가능
- **User**: 관련 발주의 댓글 조회/작성 가능, 자신의 댓글만 수정/삭제 가능
- **Supplier**: 자신이 관련된 발주의 댓글 조회/작성 가능, 자신의 댓글만 수정/삭제 가능

### 댓글 관리 로직

- **댓글 작성**: 로그인한 사용자만 댓글 작성 가능
- **댓글 조회**: 해당 발주에 접근 권한이 있는 사용자만 조회 가능
- **실시간 업데이트**: 댓글 작성/수정/삭제 시 관련 사용자들에게 실시간 반영

#### 댓글 수정/삭제 권한 세부 규칙

| 사용자 타입     | 본인 댓글       | 타인 댓글       |
| --------------- | --------------- | --------------- |
| **일반 사용자** | 수정 ✅ 삭제 ✅ | 수정 ❌ 삭제 ❌ |
| **Admin**       | 수정 ✅ 삭제 ✅ | 수정 ❌ 삭제 ✅ |

- **수정 권한**: 오직 댓글 작성자 본인만 가능 (Admin도 타인 댓글 수정 불가)
- **삭제 권한**: 작성자 본인 + Admin은 모든 댓글 삭제 가능
- **UI 표시**: 권한 없는 버튼은 화면에 표시되지 않음

## 📊 상태 관리

### React Query 훅

```typescript
// 발주 조회
const { useGetOrders } = useOrder();
const { data: orders, isLoading } = useGetOrders(teamId);

// 발주 생성
const { useCreateOrder } = useOrder();
const { mutate: createOrder } = useCreateOrder();

// 발주 수정
const { useUpdateOrder } = useOrder();
const { mutate: updateOrder } = useUpdateOrder();

// 발주 상태 변경
const { useUpdateOrderStatus } = useOrder();
const { mutate: updateOrderStatus } = useUpdateOrderStatus();

// 댓글 조회 (예정)
const { useGetOrderComments } = useOrderComments();
const { data: comments, isLoading } = useGetOrderComments(orderId);

// 댓글 작성 (예정)
const { useCreateComment } = useOrderComments();
const { mutate: createComment } = useCreateComment();

// 댓글 수정 (예정)
const { useUpdateComment } = useOrderComments();
const { mutate: updateComment } = useUpdateComment();

// 댓글 삭제 (예정)
const { useDeleteComment } = useOrderComments();
const { mutate: deleteComment } = useDeleteComment();
```

### 캐시 관리

- 쿼리 키: `["orders", "team", teamId]`
- 발주 생성/수정/삭제 시 관련 쿼리 무효화
- 팀별 데이터 격리

### 댓글 캐시 관리

- 쿼리 키: `["comments", "order", orderId]`
- 댓글 생성/수정/삭제 시 관련 댓글 쿼리 무효화
- 발주별 댓글 데이터 격리

## 🔐 보안 및 권한

### 접근 제어

- 팀 기반 데이터 격리
- 권한별 기능 제한
- API 레벨 권한 검증

### 데이터 검증

- 클라이언트/서버 양쪽 검증
- 타입 안전성 보장
- SQL Injection 방지

### 파일 업로드

- 파일 크기 제한 (50MB)
- 파일명 안전화 (한글 인코딩 문제 해결)
- 파일 타입 검증
