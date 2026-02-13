# KARS 고객 관리 시스템

> **용어 정의**: "Supplier"는 코드상 타입명이나, UI에서는 "고객"으로 표시됩니다.

## 📌 개요

고객(Supplier) 관리 시스템은 발주 및 시연 업무의 핵심 기준 정보입니다.

### 주요 기능
- 고객 정보 등록/수정/조회
- 발주 시스템 연동 (필수 선택)
- 시연 시스템 연동
- 고객별 발주 내역 필터링

---

## 🔧 데이터 구조

### Supplier 인터페이스

```typescript
interface Supplier {
  id: number;
  teamId: number;
  supplierName: string;              // 고객명 (필수)
  supplierPhoneNumber?: string;      // 고객 전화번호
  supplierAddress?: string;          // 고객 주소
  representativeName?: string;       // 대표자명
  businessRegistrationNumber?: string; // 사업자등록번호 (v2.2)
  companyRegistrationNumber?: string;  // 법인등록번호 (v2.2)
  email?: string;                    // 이메일 (v2.2)
  faxNumber?: string;                // 팩스번호 (v2.2)
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
```

### 필수 필드
- `supplierName`: 고객명 (최소 1자 이상)
- `teamId`: 소속 팀 ID (자동 설정)

### 선택 필드
모든 연락처 및 주소 정보는 선택 사항입니다.

---

## 📦 주요 컴포넌트

### AddSupplierModal.tsx

고객 등록 전용 모달 컴포넌트

#### Props
```typescript
interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;  // 등록 성공 시 콜백
  focusRingColor?: string; // 테마 색상 (blue/purple)
}
```

#### 기능
- **필수 필드 검증**: 고객명만 필수
- **중복 확인**: 동일 팀 내 고객명 중복 방지 (선택적)
- **즉시 반영**: 등록 후 onSuccess 콜백 실행
- **React Query 캐시 무효화**: `queryClient.invalidateQueries` 사용

#### 사용 예시
```typescript
const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

const handleAddSupplierSuccess = () => {
  // React Query가 자동으로 고객 목록 갱신
  setIsAddSupplierModalOpen(false);
  toast.success("고객이 등록되었습니다");
};

<AddSupplierModal
  isOpen={isAddSupplierModalOpen}
  onClose={() => setIsAddSupplierModalOpen(false)}
  onSuccess={handleAddSupplierSuccess}
  focusRingColor="blue"
/>
```

### SelectSupplierModal.tsx

고객 선택 전용 모달 컴포넌트 (v2.3.1)

#### Props
```typescript
interface SelectSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  onSelect: (supplier: Supplier) => void;
  selectedSupplierId?: number | null;
  focusRingColor?: string;
  onAddSupplier?: () => void; // 고객 추가 버튼 핸들러
}
```

#### 기능
- **실시간 검색**: 고객명, 전화번호, 주소로 필터링
- **카드 레이아웃**: 고객 정보 미리보기
- **즉시 선택**: 클릭 한 번으로 선택 완료 (확인 버튼 없음)
- **인라인 등록**: 모달 내 "새 고객 등록" 버튼
- **테마 지원**: blue (일반) / purple (휠체어 발주)

#### 검색 최적화
```typescript
const filteredSuppliers = useMemo(() => {
  if (!searchTerm.trim()) return suppliers;

  const lowerSearch = searchTerm.toLowerCase();
  return suppliers.filter(
    (supplier) =>
      supplier.supplierName.toLowerCase().includes(lowerSearch) ||
      supplier.supplierPhoneNumber?.toLowerCase().includes(lowerSearch) ||
      supplier.supplierAddress?.toLowerCase().includes(lowerSearch)
  );
}, [suppliers, searchTerm]);
```

#### 즉시 선택 로직
```typescript
const handleSelect = (supplier: Supplier) => {
  onSelect(supplier);
  onClose(); // 선택과 동시에 모달 닫기
};
```

### SupplierSection.tsx

발주 폼 내 고객 선택 섹션 컴포넌트

#### Props
```typescript
interface SupplierSectionProps {
  suppliers: Supplier[];
  selectedSupplierId?: number | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  focusRingColor?: string;
  onAddSupplier?: () => void;
  onOpenSelectModal?: () => void;
}
```

#### 렌더링 조건

**고객 선택 전:**
- "고객 선택하기" 버튼 (애니메이션 효과)
- 경고 메시지: "⚠️ 고객을 선택해주세요"

**고객 선택 후:**
- 선택된 고객 정보 표시 (녹색 테두리)
  - 고객명 (대제목)
  - 전화번호
  - 주소
  - 대표자명
- "변경" 버튼
- 안내 메시지: "💡 배송지를 변경하려면 아래 수령인 정보를 직접 수정하세요"

---

## 🔄 발주 시스템 통합

### 필수 선택 정책 (v2.3+)

발주 생성 시 고객 선택은 **필수**입니다.

#### 검증 레이어

**1. UI 레이어 (OrderRequestForm.tsx)**
```typescript
const validateForm = (): boolean => {
  if (!formData.supplierId) {
    toast.error("고객을 선택해주세요");
    return false;
  }
  // ... 기타 검증
  return true;
};
```

**2. 서비스 레이어 (orderService.ts)**
```typescript
export const orderService = {
  createOrderDto: async ({ formData, orderItems }) => {
    if (!formData.supplierId) {
      throw new Error("고객을 선택해주세요");
    }

    const orderData: CreateOrderDto = {
      supplierId: formData.supplierId,
      // ...
    };
  }
};
```

**3. 타입 시스템**
```typescript
interface CreateOrderDto {
  supplierId: number; // nullable 불가
  // ...
}
```

### 자동 채우기

고객 선택 시 수령인 정보가 자동으로 입력됩니다:

```typescript
const handleSupplierSelect = (supplier: Supplier) => {
  setFormData({
    ...formData,
    supplierId: supplier.id,
    receiver: supplier.representativeName || supplier.supplierName || "",
    receiverPhone: supplier.supplierPhoneNumber || "",
    address: supplier.supplierAddress || "",
    detailAddress: "", // 상세주소는 사용자가 직접 입력
  });
};
```

#### 자동 채우기 규칙
- **수령인**: 대표자명 우선, 없으면 고객명
- **수령인 연락처**: 고객 전화번호
- **수령지 주소**: 고객 주소
- **상세 주소**: 빈 값 (사용자 입력 필요)

#### 수동 수정 허용
자동 입력된 정보는 모두 수정 가능합니다.

**사용 사례:**
- "OO의료기기" 고객 선택
- 주소 자동 입력: "서울시 강남구..."
- 배송지를 "대구지점"으로 수동 변경 가능

### 권한별 접근

| 계정 유형   | 고객 선택 | 고객 등록 | 고객 수정 | 고객 삭제 |
|------------|----------|----------|----------|----------|
| Admin      | ✅       | ✅       | ✅       | ✅       |
| Moderator  | ✅       | ✅       | ✅       | ❌       |
| User       | ✅       | ✅       | ❌       | ❌       |
| Supplier   | ✅       | ✅       | ❌       | ❌       |

> **v2.3.1 변경사항**: Supplier 계정도 고객 선택/등록 가능 (기존에는 제한됨)

---

## 🎨 UI/UX 가이드

### 모달 z-index 관리

```
SelectSupplierModal (z-50)  ← 고객 선택 모달
  └─ AddSupplierModal (z-60) ← 고객 등록 모달
```

**규칙:**
- SelectSupplierModal에서 "새 고객 등록" 클릭
- AddSupplierModal이 위에 표시 (z-60)
- AddSupplierModal 백드롭 클릭 시 자신만 닫힘 (SelectSupplierModal은 유지)

### 테마 색상

**일반 발주 (파란색):**
```typescript
focusRingColor="blue"
// blue-500, blue-600, blue-50, blue-100
```

**휠체어 발주 (보라색):**
```typescript
focusRingColor="purple"
// purple-500, purple-600, purple-50, purple-100
```

### 검색 UX

- **자동 포커스**: 모달 열리면 검색 입력창에 자동 포커스
- **실시간 필터링**: 입력과 동시에 결과 업데이트
- **결과 카운트**: "N개의 고객이 검색되었습니다"
- **빈 상태 처리**:
  - 검색 결과 없음: "검색 결과가 없습니다"
  - 등록된 고객 없음: "등록된 고객이 없습니다"

### 선택 피드백

- **클릭 한 번**: 고객 클릭 → 즉시 선택 → 모달 닫기
- **선택된 상태 표시**: 파란색/보라색 테두리, "선택됨" 배지
- **안내 메시지**: "💡 고객을 클릭하면 바로 선택됩니다"

---

## 🔧 기술적 구현

### React Query 통합

#### 고객 목록 조회
```typescript
const { useGetSuppliers } = useSupplier();
const { data: suppliers, isLoading } = useGetSuppliers(teamId);
```

#### 고객 생성
```typescript
const { useCreateSupplier } = useSupplier();
const { mutate: createSupplier } = useCreateSupplier();

createSupplier(newSupplierData, {
  onSuccess: () => {
    queryClient.invalidateQueries(['suppliers', teamId]);
    toast.success("고객이 등록되었습니다");
  }
});
```

### 캐시 무효화 전략

**DO:**
```typescript
// 고객 등록 후 캐시 무효화
queryClient.invalidateQueries(['suppliers', teamId]);
```

**DON'T:**
```typescript
// 페이지 새로고침 금지 (폼 데이터 손실)
window.location.reload(); // ❌
```

### 폼 데이터 보존

고객 등록/선택 과정에서 기존 폼 데이터가 손실되지 않도록:

```typescript
const handleAddSupplierSuccess = () => {
  // React Query 자동 갱신만 사용
  queryClient.invalidateQueries(['suppliers', teamId]);

  // 모달만 닫기 (폼 상태 유지)
  setIsAddSupplierModalOpen(false);
};
```

---

## 📊 사용 통계 및 필터링

### 고객별 발주 내역 조회

발주 기록 페이지에서 고객별 필터링:

```typescript
const filteredOrders = orders.filter(
  order => order.supplierId === selectedSupplierId
);
```

**OrderRecordTabs.tsx:**
- "전체" 탭: 모든 발주
- "내 발주" 탭: 현재 사용자의 발주
- "고객별" 탭: 특정 고객의 발주 (예정)

### 통계 정보 (예정)

- 고객별 발주 횟수
- 고객별 총 거래액
- 최근 발주일
- 자주 주문하는 품목

---

## 🚨 주의사항

### 필수 선택 정책
- **모든 발주**는 반드시 고객을 선택해야 함
- supplierId가 null인 경우 에러 발생
- UI, 서비스, 타입 3개 레이어에서 검증

### 데이터 무결성
- 고객 삭제 시 관련 발주 건 처리 필요 (Soft Delete 권장)
- 고객 정보 수정 시 기존 발주 건에는 영향 없음 (스냅샷 방식)

### 성능 최적화
- 고객 목록은 React Query로 캐싱
- 검색 필터링은 useMemo로 최적화
- 대용량 고객 목록 시 가상화 스크롤 고려 (100개 이상)

### 보안
- 팀별 데이터 격리 (teamId 기반)
- API 레벨 권한 검증
- XSS 방지 (입력값 검증)

---

## 📝 개발 예정 기능

### v2.4 (예정)
- [ ] 고객 정보 일괄 수정
- [ ] 고객 병합 기능
- [ ] 고객별 발주 통계 대시보드
- [ ] Excel/CSV 고객 정보 일괄 등록

### v2.5 (예정)
- [ ] 고객 그룹 관리
- [ ] 고객별 특별 가격 설정
- [ ] 고객별 배송지 다중 관리
- [ ] 고객 담당자 관리

---

## 🔗 관련 문서

- [발주 관리 시스템](/docs/order-management.md)
- [시연 관리 시스템](/docs/demonstration-management.md)
- [판매 관리](/docs/sales-management.md)

---

**마지막 업데이트**: 2026-02-13 (v2.3.1)
