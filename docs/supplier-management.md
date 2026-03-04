# KARS 고객 관리 시스템 (v3.1 - E-006 통합)

> **용어 정의**: "Supplier"는 코드상 타입명이나, UI에서는 **"고객"**으로 표시됩니다.
> **중요**: v3.1부터 고객 = Supplier로 완전 통합. 기존 User 기반 고객 관리(`/customers`)는 삭제됨.

## 개요

고객(Supplier) 관리 시스템은 발주 및 시연 업무의 핵심 기준 정보입니다.

### 주요 기능
- 고객 정보 등록/수정/조회 (기본 정보 + 고객관리 필드)
- 발주 시스템 연동 (필수 선택)
- 시연 시스템 연동
- 고객별 매출/매입 내역 조회
- **고객 서류 관리** (처방전, 수급자 서류, 영수증, 세금계산서)
- **재구매 예정 고객 관리** (재구매 주기/예정일 기반)

---

## 데이터 구조

### Supplier 인터페이스

```typescript
interface Supplier {
  id: number;
  teamId: number;
  supplierName: string;           // 고객명 (필수)
  email?: string;                 // 이메일
  supplierPhoneNumber?: string;   // 연락처
  supplierAddress?: string;       // 주소
  representativeName?: string;    // 대표자명
  registrationNumber?: string;    // 사업자등록번호
  memo?: string;                  // 메모

  // 고객관리 필드 (v3.1 - E-006)
  customerType?: "b2c" | "b2b" | null;  // 고객 유형
  isRecipient?: boolean;                 // 수급자 여부
  depositorName?: string | null;         // 입금자명
  residentId?: string | null;            // 주민등록번호
  repurchaseCycleMonths?: number | null; // 재구매 주기 (개월)
  repurchaseDueDate?: string | null;     // 재구매 예정일
}
```

### CustomerType
| 값 | 의미 | 설명 |
|----|------|------|
| `b2c` | B2C (개인) | 개인 고객 |
| `b2b` | B2B (기업) | 기업 고객 |
| `null` | 미설정 | 고객 유형 미분류 |

---

## 페이지 구조

### `/supplier` — 고객 목록
- **역할**: 전체 고객 목록 조회/등록/수정/삭제
- **접근 권한**: admin, moderator, user, supplier
- **API**: `supplierApi.getAllSuppliersByTeamId(teamId)`

### `/supplier/[id]` — 고객 상세
5개 탭 구성:

| 탭 | 설명 | 컴포넌트 |
|----|------|----------|
| 매출 내역 | 고객별 매출 기록 (날짜 필터) | `SupplierSalesTab` |
| 매입 내역 | 고객별 매입 기록 (날짜 필터) | `SupplierPurchaseTab` |
| 고객 정보 | 고객관리 필드 조회/수정 | `CustomerInfoCard` + `CustomerInfoEditModal` |
| 고객 서류 | 서류 업로드/조회/삭제 | `CustomerDocumentSection` |
| 발주 이력 | supplierId 기반 발주 내역 | `CustomerOrderHistory` |

### `/repurchase` — 재구매 예정 고객
- **역할**: 재구매 예정일이 지난 고객 목록
- **데이터**: `useRepurchaseDueSuppliers(teamId)`
- **필터**: B2C/B2B/미분류
- **엑셀 내보내기** 지원

---

## 메뉴 구성 (E-006 통합 후)

"고객관리" 탭에 **단일 메뉴**:
- **고객 관리** → `/supplier`

기존 "거래처 관리" 메뉴 항목은 제거됨 (고객 관리로 통합).

---

## API 구조

### 기본 CRUD
- `POST /supplier` — 고객 생성
- `GET /supplier/team/:teamId` — 팀별 고객 목록
- `GET /supplier/:id` — 단일 고객 조회
- `PATCH /supplier/:id` — 고객 수정 (고객관리 필드 포함)
- `DELETE /supplier/:id` — 고객 삭제

### 서류 관리 (v3.1)
- `POST /supplier/:id/documents/upload` — 서류 업로드
- `GET /supplier/:id/documents?documentType=` — 서류 목록
- `DELETE /supplier/:id/documents/:docId` — 서류 삭제

### 재구매 (v3.1)
- `GET /supplier/repurchase-due?teamId=` — 재구매 예정 고객

> **백엔드 마이그레이션 상세**: `/docs/backend-customer-migration.md` 참조

---

## 컴포넌트 구조

### 고객 정보 관련
| 컴포넌트 | 위치 | Props |
|----------|------|-------|
| `CustomerInfoCard` | `src/components/customer/` | `supplier: Supplier, canEdit, onEdit` |
| `CustomerInfoEditModal` | `src/components/customer/` | `supplier: Supplier, isOpen, onClose` |
| `CustomerDocumentSection` | `src/components/orderRecord/` | `supplierId: number` |
| `CustomerOrderHistory` | `src/components/customer/` | `supplierId: number` |

### 훅
| 훅 | 파일 | 역할 |
|----|------|------|
| `useTeamCustomers()` | `useCustomers.ts` | 팀 고객(Supplier) 목록 |
| `useCustomerOrders(supplierId)` | `useCustomers.ts` | 고객별 발주 이력 |
| `useSupplierDocuments(supplierId)` | `useCustomerDocuments.ts` | 고객 서류 목록 |
| `useUploadSupplierDocument()` | `useCustomerDocuments.ts` | 서류 업로드 |
| `useDeleteSupplierDocument()` | `useCustomerDocuments.ts` | 서류 삭제 |
| `useRepurchaseDueSuppliers(teamId)` | `useCustomerDocuments.ts` | 재구매 예정 고객 |

---

## 에러 처리 (백엔드 미반영 대비)

- **서류 API 실패**: "서류 기능 준비 중입니다" 안내 (에러 팝업 X)
- **재구매 API 실패**: 배너/카운트 자동 숨김
- **고객 필드 미존재**: optional chaining + 기본값 사용
- **훅 레벨**: `retry: false` + catch 후 빈 배열 반환

---

## 레거시 정리 (향후)

| 항목 | 상태 | 비고 |
|------|------|------|
| `IUser` 고객 필드 | `@deprecated` 표시 | `src/types/(auth)/user.ts` |
| `RepurchaseDueUser` | `@deprecated` 표시 | `src/types/customer-document.ts` |
| `useUserDocuments` 등 | 레거시 별칭 유지 | `useCustomerDocuments.ts` |
| `/user/:userId/documents` API | 백엔드에서 유지 중 | 프론트 전환 완료 후 제거 |
