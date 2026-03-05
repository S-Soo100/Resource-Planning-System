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

### 고객 유형별 필드 표시 규칙 (v3.2)

고객관리 필드는 `customerType`과 `isRecipient`에 따라 조건부로 표시해야 합니다.

| 필드 | B2B | B2C (비수급자) | B2C (수급자) | 미설정 |
|------|-----|---------------|-------------|--------|
| 사업자등록번호 (`registrationNumber`) | ✅ | ❌ | ❌ | ✅ |
| 대표자명 (`representativeName`) | ✅ | ❌ | ❌ | ✅ |
| 주민등록번호 (`residentId`) | ❌ | ✅ | ✅ | ✅ |
| 수급자 여부 (`isRecipient`) | ❌ | ✅ | ✅ | ✅ |
| 입금자명 (`depositorName`) | ❌ | ❌ | ✅ | ✅ |
| 재구매 주기 (`repurchaseCycleMonths`) | ❌ | ❌ | ✅ | ✅ |
| 재구매 예정일 (`repurchaseDueDate`) | ❌ | ❌ | ✅ | ✅ |

> **`depositorName` (입금자명) 비즈니스 정의**:
> 수급자일 경우, 회사 통장에 **지자체에서 수급자가 낸 비용을 환급**해줄 때 사용하는 입금자명.
> B2B 고객에는 해당 없으며, B2C 고객 중 `isRecipient=true`인 경우에만 의미 있는 필드.
>
> **재구매 주기/예정일 비즈니스 정의**:
> 보조기기는 수급자에게 일정 주기로 재지급되므로, 재구매 주기와 예정일은 **수급자 전용 필드**.
> B2B 고객이나 B2C 비수급자에게는 해당 없음.
>
> **미설정(`null`) 상태**: 아직 고객 유형이 분류되지 않은 상태이므로 모든 필드를 표시하여 정보 누락을 방지.

---

## 페이지 구조

### `/supplier` — 고객 목록
- **역할**: 전체 고객 목록 조회/등록/수정/삭제
- **접근 권한**: admin, moderator, user, supplier
- **API**: `supplierApi.getAllSuppliersByTeamId(teamId)`

### `/supplier/[id]` — 고객 상세

**상단 고정 영역** (탭과 무관하게 항상 표시):
- **헤더**: 고객명 + B2B/B2C 배지 + 수급자 배지 + 기본 연락처
- **조회 기간 필터**: 1줄 컴팩트 pill 버튼 (1개월/3개월/6개월/1년/전체)
- **요약 통계**: 1줄 컴팩트 (매출 N건 · ₩금액 | 매입 N건 · ₩금액 | 마진율)

> **UX 원칙**: 조회 기간과 요약 통계는 어떤 탭에서든 맥락 파악이 가능하도록 항상 노출.
> 카드형 그리드가 아닌 1줄 인라인 레이아웃으로 화면 점유를 최소화.

5개 탭 구성 (기본 탭: 고객 정보):

| 탭 | 설명 | 컴포넌트 |
|----|------|----------|
| 고객 정보 | 인라인 편집 (기본 탭) | `CustomerInfoCard` |
| 고객 서류 | 서류 업로드/조회/삭제 | `CustomerDocumentSection` |
| 매출 내역 | 고객별 매출 기록 (날짜 필터) | `SupplierSalesTab` |
| 매입 내역 | 고객별 매입 기록 (날짜 필터) | `SupplierPurchaseTab` |
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
| 컴포넌트 | 위치 | Props | 비고 |
|----------|------|-------|------|
| `CustomerInfoCard` | `src/components/customer/` | `supplier, canEdit` | **인라인 편집** (모달 없음) |
| `CustomerInfoEditModal` | `src/components/customer/` | `supplier, isOpen, onClose` | 레거시 — `AddSupplierModal`에서만 사용 |
| `CustomerDocumentSection` | `src/components/orderRecord/` | `supplierId: number` | |
| `CustomerOrderHistory` | `src/components/customer/` | `supplierId: number` | |
| `SupplierDetailSummary` | `src/components/supplier/` | `summary, isLoading` | 1줄 컴팩트 요약 |

### 유틸리티
| 유틸 | 위치 | 역할 |
|------|------|------|
| `getFieldVisibility()` | `src/utils/customerFieldUtils.ts` | B2B/B2C/수급자별 필드 표시 규칙 |
| `getCustomerTypeBadge()` | `src/utils/customerFieldUtils.ts` | B2B/B2C 배지 색상·텍스트 |
| `getRecipientBadge()` | `src/utils/customerFieldUtils.ts` | 수급자 배지 색상·텍스트 |

### 인라인 편집 패턴 (CustomerInfoCard)

> **설계 원칙**: 모달을 열지 않고 필드를 클릭하면 바로 편집 → Enter/blur로 저장.
> 각 필드 변경 시 즉시 `supplierApi.updateSupplier()` API 호출 + `queryClient.invalidateQueries()`.

| 필드 유형 | 컴포넌트 | 동작 |
|-----------|----------|------|
| 텍스트 (고객명, 이메일 등) | `InlineTextItem` | 클릭→input→Enter/blur 저장 |
| 숫자 (재구매 주기) | `InlineNumberItem` | 클릭→number input→Enter/blur 저장 |
| 선택 (고객 유형) | `<select>` | 드롭다운 변경 즉시 저장 |
| 토글 (수급자 여부) | `<checkbox>` | 체크 변경 즉시 저장 |

**빈 값 UX**: 데이터가 없으면 "-" 대신 `"[placeholder] 입력"` + 점선 테두리로 넓은 클릭 영역 제공.
호버 시 파란색 하이라이트로 편집 가능 피드백.

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

## 레거시 정리

| 항목 | 상태 | 비고 |
|------|------|------|
| `IUser` 고객 필드 | ✅ 제거 완료 (E-008) | `src/types/(auth)/user.ts` |
| `RepurchaseDueUser` | `@deprecated` 표시 | `src/types/customer-document.ts` |
| `useUserDocuments` 등 | ✅ 제거 완료 (E-008) | `useCustomerDocuments.ts` |
| `user-api.ts` 서류/재구매 메서드 | ✅ 제거 완료 (E-008) | `src/api/user-api.ts` |
| `/user/:userId/documents` API | 백엔드에서 유지 중 | 프론트에서 미사용 |
