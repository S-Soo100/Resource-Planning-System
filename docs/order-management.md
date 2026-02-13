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
│   ├── OrderPriceEditModal.tsx   # 가격 전용 수정 모달 (중간관리자 이상)
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
  totalPrice?: number | null; // 주문 총 판매가격
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

interface OrderItem {
  id: number;
  orderId: number;
  itemId: number;
  quantity: number;
  memo?: string;
  sellingPrice?: number | null; // 품목별 판매가
  vat?: number | null; // 품목별 VAT (부가가치세)
  item: Item;
}
```

### OrderRequestFormData

```typescript
type OrderRequestFormData = {
  title: string; // 발주 제목
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
  demoCost?: string; // 시연 비용 (문자열 입력)
  totalPrice?: string; // 주문 총 판매가격 (문자열 입력)
};

type OrderItemWithDetails = {
  teamItem: TeamItem;
  quantity: number;
  stockAvailable?: boolean;
  stockQuantity?: number;
  memo?: string; // 품목별 개별 메모
  sellingPrice?: string; // 주문 품목 판매가 (문자열 입력)
  vat?: string; // 주문 품목 세금 (문자열 입력)
};
```

## 🏗️ 주요 컴포넌트 구조

### OrderRequestForm.tsx

- **역할**: 패키지/개별 품목/휠체어 발주 공통 폼
- **Props**: `isPackageOrder`, `title`, `warehousesList`, `warehouseItems`, `restrictedWarehouseId`, `restrictedCategoryId`
- **상태**: `formData`, `orderItems`, `files`, `isSubmitting`
- **검증**: 필수 입력 항목, 최소 품목 선택, 재고 확인, **거래처 필수 선택 (v2.3)**
- **제한사항**: 특정 창고/카테고리로 제한 가능 (휠체어 발주 시 사용)

#### 거래처(Supplier) 필수 정책 (v2.3)

**목적:**
- 발주 내역 필터링 및 거래처별 조회
- 데이터 일관성 및 관리 효율성 향상

**동작:**
1. **필수 선택**: 발주 생성 시 거래처를 반드시 선택해야 함
2. **자동 입력**: 거래처 선택 시 수령인 정보(이름, 연락처, 주소) 자동 입력
3. **수정 가능**: 자동 입력된 수령인 정보는 이후 자유롭게 수정 가능
   - 예: "OO의료기기" 선택 후 → 배송지를 "OO의료기기 대구지점"으로 변경 가능
4. **필터링 용도**: `supplierId`는 주로 발주 기록 필터링 및 거래처별 조회에 사용

**UI 개선:**
- 거래처 선택 드롭다운: "거래처 선택 *" (필수 표시)
- 선택된 거래처 정보 미리보기
- 배송지 변경 안내 메시지
- 거래처 미선택 시 경고 표시

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
- **수정 가능**: 수령인 정보, 배송 정보, 품목/수량, 판매가, VAT, 메모
- **권한**:
  - **Admin**: 모든 발주 수정 가능 (상태 무관)
  - **일반 사용자**: 자신의 requested 상태 발주만 수정 가능
- **파일 관리**: 기존 파일 삭제/다운로드, 새 파일 업로드
- **창고 제한**: 기존 발주의 창고 변경 불가 (비즈니스 규칙)
- **품목 테이블 레이아웃**: 엑셀 스타일 그리드 테이블
  - 컬럼: 품목명 | 품목코드 | 수량 | 판매가 | VAT | 메모 | 소계 | 작업
  - 호버 효과, 테두리로 셀 구분 명확화
  - 인라인 입력 필드로 즉시 수정 가능

### OrderPriceEditModal.tsx

- **역할**: 가격 정보만 별도로 수정하는 모달
- **권한**: 중간관리자(Moderator) 이상만 접근 가능
- **수정 가능**: 주문 총 판매가격, 품목별 판매가/VAT
- **특징**:
  - **모든 상태에서 수정 가능**: 출고완료 등 일반 수정이 불가능한 상태에서도 가격만 수정 가능
  - **VAT 자동 계산 버튼**: 판매가의 10%를 자동 계산하는 편의 기능 제공
  - **독립적 수정**: 총 판매가격과 품목별 가격을 독립적으로 수정 가능
  - **변경 이력 자동 기록**: 모든 가격 수정 내역은 자동으로 변경이력에 기록됨

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

### 발주 상세 페이지 첨부파일 관리 (v1.9.1)

발주 상세 페이지(`/orderRecord/[id]`)에서 첨부파일 관리 기능이 개선되었습니다.

#### 주요 개선사항

1. **첨부파일 섹션 항상 표시**
   - 기존: 첨부파일이 있을 때만 섹션 표시
   - 개선: 첨부파일 0개일 때도 섹션 표시
   - 이유: 파일 추가 버튼에 항상 접근 가능하도록 개선

2. **발주 수정 없이 파일 추가/삭제 가능**
   - 기존: 발주 수정 모달을 통해서만 파일 관리 가능
   - 개선: 발주 상세 페이지에서 직접 파일 추가/삭제
   - 권한: 모든 사용자가 접근한 발주에 대해 파일 추가 가능
   - 삭제: 업로드된 모든 파일에 대해 삭제 버튼 제공

#### 첨부파일 섹션 UI 구조

```
┌─────────────────────────────────────────────────────┐
│ 📎 첨부파일 (2)                     [+ 파일 추가]   │
├─────────────────────────────────────────────────────┤
│ 📄 견적서.pdf                [다운로드] [삭제]      │
│ 📄 계약서.pdf                [다운로드] [삭제]      │
└─────────────────────────────────────────────────────┘

또는 (파일이 없을 때)

┌─────────────────────────────────────────────────────┐
│ 📎 첨부파일 (0)                     [+ 파일 추가]   │
├─────────────────────────────────────────────────────┤
│  첨부된 파일이 없습니다.                            │
│  위의 '파일 추가' 버튼을 눌러 파일을 업로드하세요.  │
└─────────────────────────────────────────────────────┘
```

#### 파일 관리 API

```typescript
// 파일 업로드
const handleFileUpload = async (files: FileList | null) => {
  const response = await uploadMultipleOrderFileById(orderId, fileArray);
  // 성공 시 페이지 새로고침하여 업데이트된 파일 목록 표시
};

// 파일 삭제
const handleFileDelete = async (fileId: number) => {
  const response = await deleteOrderFile(orderId, fileId);
  // 성공 시 페이지 새로고침하여 업데이트된 파일 목록 표시
};
```

#### 사용자 경험 개선

- **즉각적인 피드백**: 파일 업로드/삭제 시 토스트 메시지 표시
- **로딩 상태**: 업로드 중 "업로드 중...", 삭제 중 "삭제 중..." 표시
- **확인 다이얼로그**: 파일 삭제 전 확인 요청
- **자동 새로고침**: 파일 추가/삭제 후 자동으로 페이지 새로고침하여 최신 상태 반영

#### 기술적 구현

```typescript
// 상태 관리
const [isUploadingFiles, setIsUploadingFiles] = useState(false);
const [isDeletingFile, setIsDeletingFile] = useState<number | null>(null);

// 파일 업로드 핸들러
const handleFileUpload = async (files: FileList | null) => {
  if (!files || files.length === 0 || !order) return;

  setIsUploadingFiles(true);
  try {
    const fileArray = Array.from(files);
    const response = await uploadMultipleOrderFileById(order.id, fileArray);

    if (response.success) {
      toast.success(`${fileArray.length}개 파일이 업로드되었습니다.`);
      window.location.reload();
    }
  } finally {
    setIsUploadingFiles(false);
  }
};

// 파일 삭제 핸들러
const handleFileDelete = async (fileId: number) => {
  if (!window.confirm("이 파일을 삭제하시겠습니까?")) return;

  setIsDeletingFile(fileId);
  try {
    const response = await deleteOrderFile(order.id, fileId);

    if (response.success) {
      toast.success("파일이 삭제되었습니다.");
      window.location.reload();
    }
  } finally {
    setIsDeletingFile(null);
  }
};
```

#### 주의사항

- 파일 업로드/삭제는 발주 수정 권한과 무관하게 동작
- 파일 추가 시 기존 발주 정보는 변경되지 않음
- 대용량 파일 업로드 시 네트워크 상태에 따라 시간이 소요될 수 있음
- 파일 삭제는 즉시 반영되며 복구 불가능

## 💰 가격 정보 관리

### 가격 필드 구조 (v2.0.0)

발주 시스템에 가격 정보 관리 기능이 추가되었습니다.

#### 가격 필드 정의

**Order 레벨:**
- `totalPrice`: 주문 총 판매가격 (선택 입력)
  - 타입: `number | null`
  - 용도: 전체 주문의 최종 판매 금액
  - 입력: 발주 요청 시 또는 가격 수정 모달에서 입력 가능

**OrderItem 레벨:**
- `sellingPrice`: 품목별 판매가 (단가)
  - 타입: `number | null`
  - 용도: 해당 품목의 단위당 판매 가격
- `vat`: 품목별 VAT (부가가치세)
  - 타입: `number | null`
  - 용도: 해당 품목의 단위당 부가세
  - **중요**: 자동 계산 없음, 사용자 직접 입력 필수
  - 이유: 영세율(0%) 품목 등 다양한 세율 적용 가능

#### VAT 처리 정책

**자동 계산 금지:**
- VAT는 절대 자동으로 10% 계산하지 않음
- 모든 VAT는 사용자가 직접 입력해야 함
- 영세율(0%) 품목: VAT를 0으로 입력
- 일반 과세 품목: 판매가의 10%를 수동 계산하여 입력

**VAT 자동 계산 버튼 (편의 기능):**
- OrderPriceEditModal에서만 제공
- 모든 품목의 VAT를 판매가의 10%로 일괄 계산
- 사용자가 버튼을 명시적으로 클릭해야 실행됨
- 계산 후에도 개별 품목의 VAT는 수정 가능

#### 소계 계산 로직

```typescript
// 품목별 소계 = (판매가 + VAT) × 수량
const sellingPrice = item.sellingPrice ?? 0;
const vat = item.vat ?? 0;
const subtotal = (sellingPrice + vat) * item.quantity;
```

### 가격 입력 방식

#### 1. 발주 요청 시 입력

**OrderRequestForm / WheelchairOrderForm:**
- 품목 테이블에 판매가, VAT 컬럼 표시
- 각 품목별로 판매가, VAT 직접 입력
- 입력 타입: 문자열 (`string`)
- 제출 시 `parseInt()`로 숫자 변환

```typescript
// API 제출 데이터
orderItems: orderItems.map((item) => ({
  itemId: item.warehouseItemId,
  quantity: item.quantity,
  memo: item.memo || "",
  sellingPrice: item.sellingPrice ? parseInt(item.sellingPrice, 10) : undefined,
  vat: item.vat ? parseInt(item.vat, 10) : undefined,
}))
```

#### 2. 발주 수정 시 입력

**OrderEditModal:**
- 엑셀 스타일 테이블 레이아웃
- 품목별 판매가, VAT 인라인 수정
- 기존 가격 정보가 있으면 초기값으로 표시
- 수정 권한: Admin (모든 발주) / 일반 사용자 (자신의 requested 발주만)

#### 3. 가격 전용 수정

**OrderPriceEditModal (중간관리자 이상):**
- 가격 정보만 수정하는 전용 모달
- 모든 발주 상태에서 수정 가능 (출고완료 포함)
- 주문 총 판매가격 입력
- 품목별 판매가, VAT 입력
- VAT 자동 계산 (10%) 버튼 제공
- 권한: Moderator 이상

### 가격 수정 권한

#### OrderEditModal (일반 수정)
- **Admin**: 모든 발주의 가격 수정 가능 (상태 무관)
- **일반 사용자**: 자신의 requested 상태 발주만 수정 가능
- **제한 사항**: approved 이상의 상태에서는 일반 사용자 수정 불가

#### OrderPriceEditModal (가격 전용 수정)
- **Moderator 이상**: 모든 발주의 가격 수정 가능 (상태 무관)
- **일반 사용자**: 접근 불가 (모달 자체가 표시되지 않음)
- **장점**: 출고완료 등 일반 수정이 불가능한 상태에서도 가격만 수정 가능

### 가격 정보 표시

#### 발주 상세 페이지

**가격 정보 섹션:**
- 주문 총 판매가격 표시 (파란색 배경 강조)
- 품목별 가격 상세 테이블
  - 품목명, 수량, 판매가, VAT, 소계
  - 가격 미입력 시 노란색 배경으로 경고 표시
- 가격 수정 버튼 (중간관리자 이상에게만 표시)

**VAT 표시 로직:**
```typescript
const sellingPrice = item.sellingPrice ?? 0;
const vat = item.vat ?? (sellingPrice > 0 ? Math.round(sellingPrice * 0.1) : 0);
// 주의: 표시용 폴백 로직일 뿐, 실제 저장은 사용자 입력값만 사용
```

### API 엔드포인트

#### 가격 수정 전용 API

```typescript
PATCH /order/:id/price

// 요청 바디
{
  totalPrice?: number;
  orderItems?: Array<{
    itemId: number;
    sellingPrice: number;
    vat?: number;
  }>;
}

// 권한: Moderator 이상
// 상태: 모든 상태에서 수정 가능
```

### 주의사항

1. **VAT 자동 계산 금지**
   - 폼 제출 시 자동으로 VAT를 계산하지 않음
   - 사용자가 직접 입력한 값만 저장
   - 영세율(0%) 품목 처리 가능

2. **입력 타입 변환**
   - 폼: 문자열 타입 (`string`)
   - 저장: 숫자 타입 (`number`)
   - 빈 값: `undefined`로 처리 (null이나 빈 문자열 금지)

3. **소계 계산**
   - 소계 = (판매가 + VAT) × 수량
   - 판매가만 있고 VAT가 없는 경우: vat를 0으로 계산

4. **폴백 표시**
   - 가격 표시 시 vat가 없으면 판매가의 10%로 표시 (폴백)
   - 단, 저장은 사용자 입력값만 사용

## 💰 거래금액 관리 (개발 중)

### 현재 상태 (v1.18.x)

발주 기록 조회 페이지에 거래금액 표시 기능이 임시로 구현되었습니다.

#### 구현 내역

**OrderRecordTable.tsx:**
- **거래금액 컬럼 추가**: 테이블 헤더에 '거래금액' 컬럼 표시
- **임시 데이터**: 모든 발주 건에 대해 100원으로 하드코딩
- **합계 행 추가**: 테이블 하단에 합계 및 기간 정보 표시
  - 현재 페이지의 발주 건수 × 100원 자동 계산
  - 생성일 기준 최소/최대 날짜 범위 표시 (예: 2026.01.01 ~ 2026.02.02)

```typescript
// 거래금액 표시 (임시 하드코딩)
<td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
  100원
</td>

// 합계 행
<tr className="bg-blue-50 border-t-2 border-blue-200">
  <td colSpan={6} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
    <div className="flex flex-col items-end gap-1">
      <span>합계</span>
      <span className="text-xs font-normal text-gray-600">
        {getPeriodInfo()} {/* 예: 2026.01.01 ~ 2026.02.02 */}
      </span>
    </div>
  </td>
  <td className="px-6 py-4 text-sm font-bold text-blue-700 text-right">
    {records.length * 100}원
  </td>
  ...
</tr>
```

### 향후 계획

#### Backend 연동 (예정)

- **거래금액 필드 추가**: Order 타입에 `transactionAmount` 필드 추가
- **API 응답 포함**: 발주 조회 시 거래금액 데이터 포함
- **실제 금액 표시**: 하드코딩된 100원을 실제 거래금액으로 대체

#### 정책 확정 필요 사항

다음 사항들이 확정되면 본격적으로 개발 진행:

1. **거래금액 입력 시점**
   - 발주 요청 시 입력?
   - 승인 시 입력?
   - 출고 완료 시 입력?

2. **거래금액 계산 방식**
   - 품목별 단가 × 수량 자동 계산?
   - 수동 입력?
   - 품목별 단가 정보 관리 필요?

3. **거래금액 수정 권한**
   - Admin만 수정 가능?
   - 발주자도 특정 상태에서 수정 가능?

4. **합계 계산 기준**
   - 현재 페이지 합계만 표시?
   - 전체 합계 표시?
   - 기간별 필터링 후 합계?

5. **모바일 화면 표시**
   - OrderRecordTabsMobile에도 동일하게 표시?
   - 간소화된 형태로 표시?

#### 구현 예정 기능

- [ ] Order 타입에 거래금액 필드 추가
- [ ] 발주 요청 폼에 거래금액 입력 필드 추가
- [ ] 발주 수정 모달에 거래금액 수정 기능 추가
- [ ] 거래금액 권한 제어 로직 구현
- [ ] 모바일 화면 거래금액 표시
- [ ] 거래금액 필터링/정렬 기능
- [ ] 거래금액 통계/리포트 기능

### 기술적 고려사항

#### 데이터 타입

```typescript
// 향후 예정
interface Order {
  // ... 기존 필드
  transactionAmount?: number; // 거래금액 (원)
  // 또는
  transactionAmount?: {
    amount: number;
    currency: string; // "KRW"
    updatedAt: string; // 마지막 수정 시간
    updatedBy: number; // 수정한 사용자 ID
  };
}
```

#### UI 개선 방향

- 금액 포맷팅: 천 단위 콤마 (예: 1,234,567원)
- 합계 강조: 색상 및 폰트 크기로 시각적 구분
- 기간별 통계: 월별/분기별 거래금액 집계
- 엑셀 내보내기: 거래금액 포함하여 데이터 추출

### 참고사항

- 현재 구현은 **임시 UI 프로토타입**이며, Backend API 연동 전까지 하드코딩된 값 사용
- 정책 확정 후 본격적인 개발 진행
- 기존 발주 데이터에 거래금액 정보 없는 경우 처리 방안 필요
