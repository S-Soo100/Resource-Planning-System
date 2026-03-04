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
