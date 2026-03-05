# KARS 백로그

> 로컬 티켓 관리. GitHub Issues 사용하지 않음.

## 상태 규칙
- `[ ]` 대기
- `[~]` 진행중
- `[x]` 완료

---

## Enhancement

### E-001: 판매 요약 카드에 입금 현황(미수금) 집계 추가
- **우선순위**: Medium
- **상태**: [ ]
- **설명**: 판매 요약 카드에 입금완료/미입금 건수, 총 미수금액 표시. 매출 채권 현황 즉시 파악 가능.
- **관련 파일**: `SalesSummary.tsx`, `sales.ts`, `useSalesData.ts`

### E-002: 발주기록 출고완료 모바일 카드에 입금/환급 정보 추가
- **우선순위**: Low
- **상태**: [ ]
- **설명**: `OrderRecordTabs` 모바일 카드 뷰에 입금/환급/세금계산서 상태 미반영.
- **관련 파일**: `OrderRecordTabs.tsx`

### E-003: 판매 내역 & 마진 분석 UI 개선
- **우선순위**: High
- **상태**: [ ]
- **설명**:
  1. **환급상태 컬럼 삭제**: 판매 테이블에서 환급상태 컬럼 완전 제거 (테이블, 엑셀 내보내기 모두)
  2. **입금상태 인라인 수정**: 입금상태 클릭 시 드롭다운으로 변경 가능하도록 (1차 승인권자/관리자만 클릭 가능, 일반 사용자는 읽기 전용)
  3. **가격/마진 UI 개선**: 판매가, 원가, 마진액, 마진률 영역을 엑셀 스타일로 심플하고 가독성 좋게 개선 (눈 피로 감소)
- **관련 파일**:
  - `src/app/sales/page.tsx` — 판매 내역 메인 페이지
  - `src/components/orderRecord/OrderRecordTable.tsx` — 발주기록 테이블 (환급/입금 상태 컬럼)
  - `src/utils/depositUtils.ts` — 입금/환급 상태 유틸리티
  - `src/utils/exportSalesToExcel.ts` — 엑셀 내보내기 (환급상태 컬럼 제거)
  - `src/components/sales/DemoSalesTable.tsx` — 시연 판매 테이블 (마진 컬럼 UI)

### E-004: 판매 테이블에 입금액 컬럼 표시
- **우선순위**: Low
- **상태**: [ ]
- **설명**: 현재 입금 "상태"만 표시. 실제 `depositAmount` 금액도 보여줘야 수금 현황 파악 가능.
- **관련 파일**: `sales/page.tsx`, `OrderRecordTable.tsx`

### E-005: 발주 상세 페이지에서 고객 서류 섹션 제거
- **우선순위**: Medium
- **상태**: [x]
- **설명**: 발주 상세 페이지(`/orderRecord/[id]`)에 고객 서류(`CustomerDocumentSection`)가 표시되고 있음. 발주에는 이미 발주 파일 업로드 + 전자세금계산서 업로드 기능이 별도로 있어서, 고객 서류까지 같이 노출되면 역할이 혼재되고 사용자가 헷갈림. 고객 서류는 고객 상세 페이지(`/customers/[id]`)에서만 관리하도록 책임 분리.
- **작업 내용**:
  1. `src/app/orderRecord/[id]/page.tsx`에서 `CustomerDocumentSection` import 및 렌더링 제거 (1523~1529행 부근)
  2. `src/components/admin/UserEditModal.tsx`에서도 제거 여부 검토 (관리자 모달)
  3. 고객 서류 접근 경로: `/customers/[id]` 고객 서류 탭으로 단일화
- **관련 파일**:
  - `src/app/orderRecord/[id]/page.tsx` — 발주 상세 (제거 대상)
  - `src/components/admin/UserEditModal.tsx` — 팀 멤버 편집 (검토 대상)
  - `src/app/customers/[id]/page.tsx` — 고객 상세 (유지)
  - `src/components/orderRecord/CustomerDocumentSection.tsx` — 컴포넌트 자체는 유지

### E-007: 발주 상세 페이지 고객관리 정보 UX 개선
- **우선순위**: High
- **상태**: [x]
- **설명**: `/orderRecord/[id]` 페이지의 "정보수정" 버튼 뒤에 숨겨진 고객관리 정보(환급, 세금계산서, 입금)를 메인 페이지에서 직접 확인·수정할 수 있도록 UX 개선. 현재 DTO에는 데이터가 있지만 UI가 이를 제대로 노출하지 못하고 있음.

#### 현재 문제점
1. **"정보수정" 버튼명이 비직관적** — 무엇을 수정하는 건지 알 수 없음
2. **정보가 모달 뒤에 숨겨져 있음** — 환급/세금계산서/입금 정보를 보려면 모달을 열어야 함
3. **환급 정보 조건부 표시 필요** — 고객이 환급대상자(`isRecipient` 등)인 경우만 환급 섹션을 표시해야 하는데 현재 구분 없음
4. **입금 정보가 덜 눈에 띔** — 출고상태만큼 중요한 정보인데 하위 섹션에 묻혀 있음
5. **DTO 변경 대비 UI 미반영** — 데이터 모델은 업데이트됐지만 UI가 따라가지 못함

#### 작업 내용
- [x] **E-007-1**: 고객관리 정보 섹션을 메인 페이지에 인라인으로 표시 (모달 진입 없이 바로 확인 가능)
- [x] **E-007-2**: 입금 상태를 발주 상단 요약 영역에 배치 (출고상태와 동급 가시성 확보), 인라인 수정 지원
- [x] **E-007-3**: 환급 정보는 고객이 환급대상자인 경우에만 조건부 렌더링 (Supplier의 `isRecipient` 필드 기반)
- [x] **E-007-4**: 세금계산서 발행 상태 인라인 토글 (체크박스)
- [x] **E-007-5**: "정보수정" → "고객 변경"으로 역할 재정의 (DetailsEditModal을 고객 변경 전용으로 축소)
- [x] **E-007-6**: `status === "shipmentCompleted"` 조건 제거 — 모든 상태에서 고객관리 정보 표시

- **관련 파일**:
  - `src/app/orderRecord/[id]/page.tsx` — 발주 상세 메인 페이지
  - `src/components/orderRecord/DetailsEditModal.tsx` — 현재 정보수정 모달 (축소/제거 대상)
  - `src/types/(order)/orderRecord.ts` — OrderRecord DTO
  - `src/types/(order)/order.ts` — DepositStatus, UpdateOrderDetailsDto

---

## Bug

### B-001: SupplierSection.tsx suppliers undefined 방어 코드 누락
- **우선순위**: High
- **상태**: [x]
- **설명**: `suppliers` prop이 undefined일 때 `.find()`, `.length` 호출에서 런타임 에러 발생. `Array.isArray` 방어 코드 추가.
- **관련 파일**: `src/components/common/SupplierSection.tsx`

### B-002: InboundModal.tsx suppliers undefined 방어 코드 누락
- **우선순위**: High
- **상태**: [x]
- **설명**: `suppliers` prop이 undefined일 때 `.find()` 호출에서 런타임 에러 발생. `Array.isArray` 방어 코드 추가.
- **관련 파일**: `src/components/stock/modal/InboundModal.tsx`

### B-003: OutboundModal.tsx suppliers undefined 방어 코드 누락
- **우선순위**: High
- **상태**: [x]
- **설명**: `suppliers` prop이 undefined일 때 `.find()` 호출에서 런타임 에러 발생. `Array.isArray` 방어 코드 추가.
- **관련 파일**: `src/components/stock/modal/OutboundModal.tsx`

---

## Epic

### E-006: 고객관리 데이터 모델 리팩토링 (User → Supplier 통합)
- **우선순위**: High
- **상태**: [~]
- **설명**: "고객"은 Supplier(거래처)를 의미하지만, 현재 `/customers` 페이지가 IUser(팀 멤버)를 "고객"으로 잘못 사용 중. 고객 필드(customerType, isRecipient, residentId 등 6개)가 IUser 모델에, 고객 서류 API가 `/user/:id/documents`에 연결됨. Supplier 기반으로 통합하여 데이터 모델 정합성 확보.

#### 하위 티켓
- [~] **E-006-1**: 백엔드 변경 요구사항 문서 작성 (`docs/backend-customer-migration.md`)
- [~] **E-006-2**: Supplier 타입에 고객 필드 6개 추가 (`src/types/supplier.ts`)
- [~] **E-006-3**: customer-document.ts 타입 Supplier 기반으로 전환
- [~] **E-006-4**: supplier-api.ts에 서류/재구매 API 메서드 추가
- [~] **E-006-5**: useCustomers.ts Supplier 기반 재작성
- [~] **E-006-6**: useCustomerDocuments.ts supplierApi 기반 전환
- [~] **E-006-7**: `/customers` 디렉토리 삭제 + `/supplier/[id]` 페이지에 고객 탭 추가
- [~] **E-006-8**: 컴포넌트 IUser→Supplier 전환 (CustomerInfoCard, EditModal, DocumentSection, OrderHistory)
- [~] **E-006-9**: 메뉴 통합 + 문서 업데이트
