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
- **상태**: [x]
- **설명**: 판매 요약 카드에 입금완료/미입금 건수, 총 미수금액, 수금률 표시. 매출 채권 현황 즉시 파악 가능.
- **관련 파일**: `SalesSummary.tsx`, `sales.ts`, `sales/page.tsx`

### E-002: 발주기록 출고완료 모바일 카드에 입금/환급 정보 추가
- **우선순위**: Low
- **상태**: [x]
- **설명**: `OrderRecordTabs` 모바일 카드 뷰에 입금/환급/세금계산서 상태 미반영.
- **관련 파일**: `OrderRecordTabs.tsx`

### E-003: 판매 내역 & 마진 분석 UI 개선
- **우선순위**: High
- **상태**: [x]
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
- **상태**: [x]
- **설명**: 데스크톱 테이블 + 모바일 카드에 입금액 컬럼 추가. 입금 금액이 있으면 녹색으로 표시.
- **관련 파일**: `sales/page.tsx`

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

### E-008: User → Supplier 마이그레이션 레거시 코드 정리
- **우선순위**: Medium
- **상태**: [x]
- **설명**: 백엔드 마이그레이션 완료에 따라 프론트엔드 레거시 코드 정리
- **작업 내용**:
  - [x] **E-008-1**: user-api.ts 레거시 서류/재구매 메서드 제거 (삭제된 엔드포인트)
  - [x] **E-008-2**: useCustomerDocuments.ts 레거시 별칭(useUserDocuments 등) 제거
  - [x] **E-008-3**: User 타입에서 고객 필드 6개 제거 + UserEditModal 고객 섹션 제거
  - [x] **E-008-4**: OrderSupplier 타입에 고객 필드 6개 추가 (백엔드 응답 반영)
- **관련 파일**:
  - `src/api/user-api.ts`
  - `src/hooks/useCustomerDocuments.ts`
  - `src/types/(auth)/user.ts`
  - `src/types/(order)/order.ts`
  - `src/components/admin/UserEditModal.tsx`

### E-009: 고객 유형(B2B/B2C)별 UI 분기 및 표시 개선
- **우선순위**: High
- **상태**: [x]
- **설명**: customerType 필드는 저장/편집 가능하지만 UI에서 충분히 활용되지 않음. B2B/B2C별 조건부 필드 표시, 목록 배지, 필터 등 UX 전반 개선.

#### 필드 표시 규칙 (핵심)
> 상세: `docs/supplier-management.md` "고객 유형별 필드 표시 규칙" 참조

| 필드 | B2B | B2C (비수급자) | B2C (수급자) | 미설정 |
|------|-----|---------------|-------------|--------|
| 사업자등록번호 | ✅ | ❌ | ❌ | ✅ |
| 대표자명 | ✅ | ❌ | ❌ | ✅ |
| 주민등록번호 | ❌ | ✅ | ✅ | ✅ |
| 수급자 여부 | ❌ | ✅ | ✅ | ✅ |
| 입금자명 | ❌ | ❌ | ✅ | ✅ |
| 재구매 주기 | ❌ | ❌ | ✅ | ✅ |
| 재구매 예정일 | ❌ | ❌ | ✅ | ✅ |

- **입금자명**: 수급자일 경우, 지자체에서 수급자 비용을 회사 통장에 환급할 때 사용하는 입금자명 (수급자 전용)
- **재구매 주기/예정일**: 보조기기 수급자 재지급 주기 관리용 (수급자 전용)

#### Phase 1: 조회 화면 — 조건부 필드 표시 + 배지
- [x] **E-009-1**: `CustomerInfoCard.tsx` — B2B/B2C별 조건부 필드 표시 (위 규칙 적용)
- [x] **E-009-2**: `supplier/page.tsx` 고객 목록 — 고객명 옆 B2B/B2C 배지 + 수급자 배지 추가
- [x] **E-009-3**: `SelectSupplierModal.tsx` — 고객 카드에 B2B/B2C + 수급자 배지 추가
- [x] **E-009-4**: `SupplierDetailHeader.tsx` — 헤더에 고객 유형 배지 추가

#### Phase 2: 생성/편집 — 유형별 필드 동적 표시
- [x] **E-009-5**: `SupplierFormModal` (supplier/page.tsx 내부) — 고객 분류 셀렉트 + 유형별 필드 동적 표시
- [x] **E-009-6**: `AddSupplierModal.tsx` — 고객 분류 + 유형별 필드 동적 표시
- [x] **E-009-7**: `CustomerInfoEditModal.tsx` — 고객 분류별 조건부 필드 표시

#### Phase 3: 필터링
- [x] **E-009-8**: `supplier/page.tsx` — B2B/B2C/수급자/미분류 필터 추가
- [x] **E-009-9**: `SelectSupplierModal.tsx` — 고객 유형별 필터 추가

#### Phase 4: 발주 상세 페이지 연동
- [x] **E-009-10**: `orderRecord/[id]/page.tsx` — 고객관리 정보 섹션에서 위 필드 표시 규칙 적용 (환급 섹션, 입금자명, 재구매 정보 조건부 렌더링)

- **참고**: `/repurchase/page.tsx`의 B2B/B2C 배지 및 필터 패턴을 모델로 활용
- **관련 파일**:
  - `src/components/customer/CustomerInfoCard.tsx`
  - `src/components/customer/CustomerInfoEditModal.tsx`
  - `src/app/supplier/page.tsx`
  - `src/components/supplier/SelectSupplierModal.tsx`
  - `src/components/supplier/AddSupplierModal.tsx`
  - `src/components/supplier/SupplierDetailHeader.tsx`
  - `src/app/orderRecord/[id]/page.tsx`

### E-011: 발주 상세 거래 정보 섹션 UX 향상
- **우선순위**: Medium
- **상태**: [x]
- **설명**: `/orderRecord/[id]` 거래 정보 섹션의 사용성 향상. 입금 진행률 시각화, 세금계산서 발행 체크+파일 업로드 통합, 거래 완결 상태 한눈에 파악 가능하도록 개선.

#### 하위 티켓
- [x] **E-011-1**: 입금금액 vs 총 거래금액 비교 — 프로그레스 바 + 잔액 텍스트 표시
- [x] **E-011-2**: 세금계산서 발행 체크박스를 파일 업로드 영역 헤더로 이동하여 통합
- [x] **E-011-3**: 섹션 헤더에 거래 완결 상태 배지 표시 (환급/세금계산서/입금 완료 현황)

- **관련 파일**:
  - `src/app/orderRecord/[id]/page.tsx` — 발주 상세 페이지
  - `src/components/orderRecord/TaxInvoiceSection.tsx` — 세금계산서 컴포넌트

### E-012: 세금계산서 섹션 거래 정보에서 분리 및 UI 개선
- **우선순위**: High
- **상태**: [x]
- **설명**: 세금계산서가 거래 정보 카드 안에 `border-t`로만 분리되어 있어, 환급/입금 상태 정보와 파일 업로드 UI가 뒤섞임. 특히 업로드 영역의 "메모" 입력이 발주 메모와 혼동됨. 세금계산서를 독립 카드로 분리하고, 업로드 영역을 접이식으로 변경.

#### 작업 내용
- [x] **E-012-1**: 세금계산서를 거래 정보 카드에서 꺼내 독립 카드로 분리
- [x] **E-012-2**: 업로드 영역을 접이식(collapse)으로 변경 — "[+ 세금계산서 업로드]" 클릭 시 확장
- [x] **E-012-3**: "메모" 라벨을 "파일 메모"로 명확화
- [x] **E-012-4**: embedded prop 제거 및 TaxInvoiceSection 단순화

- **관련 파일**:
  - `src/app/orderRecord/[id]/page.tsx` — 거래 정보 섹션
  - `src/components/orderRecord/TaxInvoiceSection.tsx` — 세금계산서 컴포넌트

### E-013: "고객 변경" 버튼 제거 및 발주 수정으로 통합
- **우선순위**: High
- **상태**: [x]
- **설명**: 발주 상세 페이지의 "고객 변경" 버튼(DetailsEditModal)이 supplierId만 변경하고 배송 정보(수령자/연락처/주소)는 그대로 남겨 데이터 불일치 발생. OrderEditModal에 이미 고객 선택 + 자동 채우기가 구현되어 있으므로, DetailsEditModal은 중복이며 불완전함. 완전 제거.

#### 작업 내용
- [x] **E-013-1**: "고객 변경" 버튼 및 관련 state 제거
- [x] **E-013-2**: DetailsEditModal import 및 렌더링 제거
- [x] **E-013-3**: DetailsEditModal 컴포넌트 파일 삭제

- **관련 파일**:
  - `src/app/orderRecord/[id]/page.tsx` — 버튼 + 모달 사용처
  - `src/components/orderRecord/DetailsEditModal.tsx` — 삭제 대상

### E-010: 고객 상세 페이지 UX 개선 (인라인 편집 + 레이아웃 컴팩트화)
- **우선순위**: High
- **상태**: [x]
- **설명**: 고객 상세 페이지(`/supplier/[id]`)의 사용성 전면 개선.

#### 변경 내역
- [x] **E-010-1**: 모달 편집 → 인라인 편집 전환 — `CustomerInfoCard`에서 모든 필드를 클릭하여 즉시 수정 (모달 제거)
- [x] **E-010-2**: 빈 값 UX — "-" 대신 `"[placeholder] 입력"` + 점선 테두리 + 넓은 클릭 영역 + 호버 피드백
- [x] **E-010-3**: 기본 탭을 "고객 정보"로 변경 (기존: 매출 내역)
- [x] **E-010-4**: 요약 통계 항상 표시 + 1줄 컴팩트 레이아웃 (기존: 매출/매입 탭에서만 카드 그리드)
- [x] **E-010-5**: 조회 기간 필터 항상 표시 + 1줄 컴팩트 pill 버튼 (기존: 매출/매입 탭에서만 표시)
- [x] **E-010-6**: `SupplierDetailHeader`에서 "정보 수정" 버튼 제거 (인라인 편집으로 대체)
- [x] **E-010-7**: API 응답 래핑 대응 — `getSupplier`, `getDocuments`에 `{ success, data }` 자동 언래핑
- [x] **E-010-8**: 고객 서류/발주 이력 404 에러 방어 — `retry: false` + `Array.isArray` 검증

- **관련 파일**:
  - `src/components/customer/CustomerInfoCard.tsx` (인라인 편집 전면 재작성)
  - `src/components/supplier/SupplierDetailSummary.tsx` (1줄 컴팩트)
  - `src/components/supplier/SupplierDetailHeader.tsx` (편집 버튼 제거)
  - `src/app/supplier/[id]/page.tsx` (탭 순서, 레이아웃, 모달 제거)
  - `src/api/supplier-api.ts` (응답 래핑 대응)
  - `src/hooks/useCustomers.ts` (에러 방어)
  - `src/hooks/useCustomerDocuments.ts` (에러 방어)

### E-016: 팀 멤버 관리 테이블에서 "기본 권한" 컬럼 제거
- **우선순위**: Medium
- **상태**: [x]
- **설명**: E-015 팀 권한 전환 완료에 따라, 팀 멤버 관리 테이블의 "기본 권한"(`User.accessLevel`) 컬럼이 더 이상 의미 없음. 실제 시스템이 사용하는 "팀 권한"만 표시하도록 정리. 팀 권한 미설정 시 "미설정" 안내로 설정 유도.
- **작업 내용**:
  - [x] **E-016-1**: 테이블 헤더에서 "기본 권한" 컬럼 제거
  - [x] **E-016-2**: 테이블 바디에서 `User.accessLevel` 표시 제거
  - [x] **E-016-3**: 팀 권한 미설정 시 "기본 권한 사용" → "미설정" + 설정 유도 문구로 변경
- **관련 파일**:
  - `src/components/admin/TeamMembers.tsx`

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

### E-015: 전체 메뉴/페이지 팀 권한 전환 점검 (Team-Permission Audit)
- **우선순위**: High
- **상태**: [x]
- **설명**: 모든 메뉴/버튼/페이지의 권한 체크가 `user.accessLevel`(레거시)이 아닌 `usePermission()` 훅(팀 권한 기반)을 사용하도록 전환. CLAUDE.md에 "User.accessLevel / auth.isAdmin 직접 참조 금지"로 명시되어 있지만, 아직 10곳 이상에서 레거시 패턴이 사용 중.

#### 현재 문제점
- `MainMenu.tsx`: 메뉴 탭 표시/숨김이 `user.accessLevel` 직접 참조로 제어됨
- `warehousePermissions.ts`: 창고 접근 유틸리티가 `user.accessLevel === 'admin'` 직접 체크
- `calendar/page.tsx`, `ioHistory/page.tsx`: 라우트 가드가 `user.accessLevel` 직접 체크
- `WheelchairOrderForm.tsx`: supplier 체크가 `user.accessLevel` 직접 참조
- `how-to-use/page.tsx`: 권한별 표시 로직이 `user.accessLevel` 직접 참조
- `account/page.tsx`, `Appbar.tsx`: 권한 표시가 `user.accessLevel` 직접 참조

#### 유일한 예외
- `team-select/page.tsx`: 팀 선택 전이므로 `serverUser?.isAdmin` 사용 허용 (문서화된 예외)

#### 하위 티켓

**Phase 1: 핵심 — 메뉴 & 라우트 가드 (접근 제어 직결)**
- [x] **E-015-1**: `MainMenu.tsx` — 메뉴 탭 표시/숨김/접근 제어를 `usePermission()` 기반으로 전환
  - `setTabForUser(user.accessLevel)` → `usePermission()` 활용
  - `allowedAccessLevels.includes(user.accessLevel)` → permission 헬퍼 사용
  - `user.accessLevel !== "supplier"` → `!isSupplier` 사용
  - `item.accessLevel.includes(user.accessLevel)` → permission 기반 매핑
- [x] **E-015-2**: `calendar/page.tsx` — `user.accessLevel === "supplier"` 체크를 `useRequireAuth()` 또는 `usePermission()` 전환
- [x] **E-015-3**: `ioHistory/page.tsx` — `user.accessLevel === "supplier"` 체크를 `useRequireAuth()` 또는 `usePermission()` 전환

**Phase 2: 유틸리티 & 폼 로직**
- [x] **E-015-4**: `warehousePermissions.ts` — `user.accessLevel === 'admin'` 직접 체크를 permission 객체 기반으로 리팩토링
  - `hasWarehouseAccess()`: isAdmin 파라미터 받도록 변경
  - `filterAccessibleWarehouses()`: 동일하게 변경
  - 호출부도 함께 수정
- [x] **E-015-5**: `WheelchairOrderForm.tsx` — `user.accessLevel === "supplier"` → `usePermission().isSupplier` 전환

**Phase 3: 표시용 (기능 영향 낮음)**
- [x] **E-015-6**: `how-to-use/page.tsx` — 권한별 콘텐츠 표시를 `usePermission()` 기반으로 전환
- [x] **E-015-7**: `account/page.tsx` — 권한 레벨 표시를 `usePermission()` 기반으로 전환
- [x] **E-015-8**: `Appbar.tsx` — 권한 레벨 한글 표시를 `usePermission()` 기반으로 전환

**Phase 4: 정리**
- [x] **E-015-9**: 주석 처리된 레거시 코드 제거 (`demoRecord/[id]/page.tsx`, `OrderRecordTabs.tsx`)
- [x] **E-015-10**: `usePermission()` 훅의 fallback 로직 검토 — 팀 권한 없을 때 `user.accessLevel` fallback이 적절한지 확인

- **관련 파일**:
  - `src/components/menu/MainMenu.tsx` — 메뉴 접근 제어 (핵심)
  - `src/utils/warehousePermissions.ts` — 창고 접근 유틸리티
  - `src/app/calendar/page.tsx` — 캘린더 페이지 가드
  - `src/app/ioHistory/page.tsx` — 입출고 이력 페이지 가드
  - `src/components/orderWheelchair/WheelchairOrderForm.tsx` — 휠체어 발주 폼
  - `src/app/how-to-use/page.tsx` — 사용법 페이지
  - `src/app/account/page.tsx` — 계정 페이지
  - `src/components/appbar/Appbar.tsx` — 앱바
  - `src/hooks/usePermission.ts` — 권한 훅 (수정 검토)
  - `src/app/demoRecord/[id]/page.tsx` — 레거시 주석 정리
  - `src/components/orderRecord/OrderRecordTabs.tsx` — 레거시 주석 정리

---

### E-017: 판매 상세 페이지 window.location.reload() 제거
- **우선순위**: Medium
- **상태**: [ ]
- **설명**: `salesRecord/[id]/page.tsx`에서 상태 업데이트, 파일 업로드/삭제, 수정 모달 닫기 후 `window.location.reload()` 6회 사용 중. `queryClient.invalidateQueries()`로 전환 필요.
- **관련 파일**: `src/app/salesRecord/[id]/page.tsx`

### E-018: 입고 레코드 삭제 기능 + completed/레거시 삭제 차단
- **우선순위**: Medium
- **상태**: [ ]
- **설명**: 현재 프론트에 입고 레코드 삭제 UI가 없음. 삭제 기능 추가 시 `inboundStatus === "completed"` 또는 `null`(레거시)인 레코드는 삭제 차단해야 함 (결정사항 #3). 백엔드 차단 로직도 필요.
- **관련 파일**: `IoHistoryList.tsx`, `InventoryRecordDetail.tsx`

### E-019: TeamItemModal 가격 필드 권한 체크 추가
- **우선순위**: Medium
- **상태**: [ ]
- **설명**: TeamItemModal에서 `usePermission()`을 호출하지 않아 모든 사용자에게 costPrice/notifiedPrice/consumerPrice 노출. `canViewCostPrice` 기반 조건부 표시 필요.
- **관련 파일**: `src/components/admin/TeamItemModal.tsx`

### E-020: inboundStatus null vs completed 구분 보강
- **우선순위**: Low
- **상태**: [ ]
- **설명**: "즉시 입고완료" 시 서버에 `undefined` 전송 → 기존 레거시(null)와 구분 불가. 서버에서 `completed`로 명시 저장하도록 백엔드 협의 필요.
- **관련 파일**: `InboundModal.tsx`, `IoHistoryList.tsx`

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
