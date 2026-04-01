# 입금상태 자동 반영

> 입금액이 거래금액(totalPrice)에 도달하면 입금상태를 자동으로 "전액"으로 변경

## 배경

현재 거래정보(salesRecord) 상세 페이지에서 입금금액(`depositAmount`)과 입금상태(`depositStatus`)는 독립적으로 관리된다. 사용자가 입금금액을 거래금액(`totalPrice`)과 동일하게 입력해도 입금상태가 자동으로 변하지 않아 수동으로 "전액"을 선택해야 한다.

입금금액 변경 시 상태를 자동 반영하면 사용자의 반복 조작을 줄이고 데이터 정합성을 높일 수 있다.

## 수락 기준

- [x] 입금금액 저장 시, `depositAmount >= totalPrice`이면 `depositStatus`를 자동으로 "전액"으로 설정
- [x] 입금금액이 0 또는 빈 값이면 `depositStatus`를 초기화 (미입금 상태)
- [x] 입금금액이 0 < amount < totalPrice 이면 상태를 자동 변경하지 않음 (사용자가 선금/중도금 등 직접 선택)
- [x] 자동 변경 시 API에 `depositStatus`도 함께 전송
- [x] 자동 변경 시 토스트로 상태 변경 안내 (예: "전액 입금으로 상태가 변경되었습니다")
- [x] `tsc --noEmit` 성공

## 설계 메모

- 수정 대상: `src/app/salesRecord/[id]/page.tsx` — `handleDepositAmountSave` 함수 (line 546~571)
- 현재 `depositAmount`만 API에 전송 → `depositAmount + depositStatus`를 함께 전송하도록 변경
- `depositUtils.ts`의 `DEPOSIT_STATUS_OPTIONS` 참고: "자부담금", "전액", "선금", "중도금", "잔금"

## 참고

- `src/utils/depositUtils.ts` — 입금 상태 유틸리티, 상태 옵션
- `src/types/sales.ts` — `depositStatus`, `depositAmount`, `totalPrice` 필드 정의
- `/docs/sales-management.md` — 판매 관리 문서
