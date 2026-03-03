# [Improve] 입출고 모달 - 재고조정/창고이동 시 고객 선택 불필요하게 변경

- **유형**: Improvement
- **우선순위**: P1
- **영역**: 재고 관리 (입고/출고)
- **상태**: 완료

---

## 현재 동작

입고/출고 모달에서 `recordPurpose`와 관계없이 고객(supplier) 선택이 필수로 강제됨.
재고조정(`adjustment`)이나 창고간 이동(`transfer`)처럼 실제 거래가 아닌 경우에도 고객을 반드시 선택해야 해서 불편하고, 의미 없는 데이터가 입력됨.

## 개선 후 동작

`recordPurpose`가 `transfer`, `adjustment`, `other`인 경우 고객 선택 필드를 숨기고 `supplierId: undefined`로 전송.
`purchase`(구매 입고), `sale`(판매 출고)인 경우에만 고객 선택 필수 유지.

## 개선 이유

- 재고조정/창고이동에 고객 정보는 불필요한 데이터
- 조정 작업 시 "고객을 선택해주세요" 에러로 인해 작업 흐름이 끊김
- 실제 거래와 내부 조정의 성격이 다름을 UI에 반영

## 완료 조건 (Acceptance Criteria)

- [ ] `recordPurpose`가 `transfer`, `adjustment`, `other`일 때 고객 선택 영역 숨김
- [ ] 고객 미선택 시에도 입고처/출고처, 주소 폼은 직접 입력 가능
- [ ] `purchase`(입고), `sale`(출고)일 때는 기존과 동일하게 고객 필수
- [ ] 목적 변경 시 고객 관련 상태 초기화 (`supplierId: undefined`)
- [ ] API 호출 시 `supplierId: undefined` 전송 정상 동작 확인
- [ ] InboundModal, OutboundModal 둘 다 적용

## 기술 분석

- **수정 파일**: `InboundModal.tsx`, `OutboundModal.tsx`
- **API 타입**: `CreateInventoryRecordDto.supplierId`는 이미 optional (`?`) → 백엔드 호환 문제 없음
- **InventoryRecord 응답**: `supplierId: number | null` → null 허용됨
- **수정 내용**:
  - `handleSubmit`의 `supplierId` 필수 검증을 `recordPurpose` 조건부로 변경
  - 고객 선택 UI를 `recordPurpose` 조건부 렌더링
  - 목적 변경 시 `supplierId` 초기화 로직 추가
- **부수 수정**: 모달 오픈 시 `supplierId`가 초기화되지 않는 버그도 함께 수정
- **예상 작업량**: S
