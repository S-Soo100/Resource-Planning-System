# 판매 관리 기능 명세

## 개요
판매 관리 페이지는 발주(Order) 데이터를 기반으로 판매 내역을 조회하고 분석하는 기능을 제공합니다. 발주 데이터를 판매 관점에서 재구성하여 표시하며, 거래명세서 출력 기능을 포함합니다.

## 주요 파일

### 페이지 컴포넌트
- **경로**: `src/app/sales/page.tsx`
- **역할**: 판매 내역 조회 및 표시
- **주요 기능**:
  - 반응형 디자인 (데스크톱: 테이블형, 모바일: 카드형)
  - 날짜 범위 필터 (기본값: 이번 달)
  - 판매처, 상태, 검색어 필터
  - 정렬 기능 (발주일자, 제목, 판매처, 금액, 상태)
  - 거래명세서 모달 열기
  - 엑셀 다운로드

### 데이터 훅
- **경로**: `src/hooks/useSalesData.ts`
- **역할**: 판매 데이터 조회 및 캐싱
- **데이터 소스**: 팀별 발주 데이터 (`getOrdersByTeamId`)
- **쿼리 키**: `['sales', params, teamId]`
- **반환 데이터**:
  - `records`: 판매 레코드 배열
  - `summary`: 판매 요약 정보
- **데이터 변환**: Order → SalesRecord 자동 변환
- **필터링**: 클라이언트 사이드에서 날짜, 판매처, 상태, 검색어 등 필터링

### 타입 정의
- **경로**: `src/types/sales.ts`
- **주요 타입**:
  - `SalesRecord`: 판매 레코드 (발주 기반)
  - `SalesSummary`: 판매 요약 정보
  - `SalesFilterParams`: 필터 파라미터
  - `SalesSortConfig`: 정렬 설정

### 컴포넌트
- **SalesSummary** (`src/components/sales/SalesSummary.tsx`)
  - 판매 요약 정보 카드
  - 총 발주 건수, 총 품목 수, 총 판매 수량, 총 판매 금액 표시

- **TransactionStatementModal** (`src/components/sales/TransactionStatementModal.tsx`)
  - 거래명세서 모달
  - 인쇄 및 PDF 다운로드 기능
  - 2장 1세트 레이아웃 (절취선 포함)

### 유틸리티
- **exportSalesToExcel** (`src/utils/exportSalesToExcel.ts`)
  - 판매 데이터 엑셀 다운로드
  - SheetJS(xlsx) 라이브러리 사용

## 데이터 구조

### SalesRecord
```typescript
{
  id: number;                    // 발주 ID
  purchaseDate: string;          // 발주일자 (YYYY-MM-DD)
  title: string;                 // 발주 제목
  supplierName: string;          // 판매처명 (없으면 receiver로 폴백)
  receiver: string;              // 수령인
  itemCount: number;             // 품목 종류 수
  totalQuantity: number;         // 총 수량
  totalPrice: number | null;     // 총 판매 금액 (null: 미입력)
  status: string;                // 발주 상태 (영문: requested, approved, etc.)
  manager: string;               // 담당자
  memo: string | null;           // 메모
  orderItems: OrderItem[];       // 품목 배열 (확장 행용)
  originalOrder: Order;          // 원본 발주 데이터
}
```

**참고**:
- `supplierName`이 비어있을 경우 UI에서 `receiver`로 대체하여 표시
- `status`는 영문 값으로 저장 (requested, approved, rejected, confirmedByShipper, shipmentCompleted, rejectedByShipper)

### SalesSummary
```typescript
{
  totalOrders: number;           // 총 발주 건수
  totalItems: number;            // 총 품목 수
  totalQuantity: number;         // 총 판매 수량
  totalSales: number;            // 총 판매 금액
  missingPriceCount: number;     // 판매가 미입력 건수
}
```

## 거래명세서 기능

### 개요
- **용도**: 판매 거래 내역 증빙 문서
- **레이아웃**: A4 세로, 2장 1세트 (절취선 포함)
- **출력 형식**: 인쇄, PDF 다운로드

### 구성 요소

#### 1. 헤더
- 문서명: "거래명세서"
- 파란색 배경 (#3B82F6)

#### 2. 발행 정보
- 발행일자: YYYY-MM-DD
- 문서번호: `KS_{YYYYMMDD}_{발주ID 4자리}`

#### 3. 공급자 정보 (좌측)
- 회사명: 내법인명
- 사업자번호: XXX-XX-XXXXX (실제 정보 입력 필요)
- 사업장주소: XXXXX (실제 정보 입력 필요)
- 업태: 제조업
- 종목: 의료기기
- 담당자: 발주 담당자
- 연락처: 공급처 연락처

#### 4. 공급받는자 정보 (우측)
- 회사명: 판매처명
- 사업자번호: - (추후 데이터 추가 시)
- 대표자: - (추후 데이터 추가 시)
- 사업장주소: 배송지 주소
- 담당자: 수령인
- 연락처: 수령인 연락처

#### 5. 품목 상세 테이블
- **컬럼 구조**:
  - No: 순번
  - 품목코드: 품목 코드 (teamItem.itemCode)
  - 품목명: 품목 명칭 (teamItem.itemName)
  - 수량: 발주 수량
  - 단가: 판매 단가 (sellingPrice)
  - 부가세: 단가 × 수량 × 10% (Math.round 적용)
  - 금액: (단가 × 수량) + 부가세
  - 비고: 품목별 메모

- **Footer (3행 구조)**:
  - 1행: 총 품목 정보 + 공급가액 (파란색 강조)
  - 2행: 부가세(10%)
  - 3행: 합계금액 (파란색 굵게 강조)

#### 6. 푸터
- 시스템 정보: "본 거래명세서는 KARS(Kangsters Auto Resource-management System)시스템으로 생성되었습니다."
- 발행일시: YYYY-MM-DD HH:mm:ss
- 저작권: © 2025 Kangsters. All rights reserved.

### 가격 계산 로직

```typescript
// 공급가액 (VAT 제외)
const supplyAmount = orderItems.reduce((sum, item) => {
  if (!item.sellingPrice) return sum;
  return sum + item.quantity * item.sellingPrice;
}, 0);

// 부가세 (10%)
const vat = Math.round(supplyAmount * 0.1);

// 합계금액 (공급가액 + 부가세)
const totalAmount = supplyAmount + vat;

// 품목별 부가세
const itemVat = item.sellingPrice
  ? Math.round(item.quantity * item.sellingPrice * 0.1)
  : 0;

// 품목별 금액 (공급가액 + 부가세)
const itemTotal = item.quantity * item.sellingPrice + itemVat;
```

### 스타일링
- **폰트 크기**:
  - 제목: 24px (xl)
  - 섹션 헤더: 12px (xs)
  - 테이블 헤더: 9px (text-[9px])
  - 테이블 본문: 8px (text-[8px])
  - 테이블 비고: 7px (text-[7px])
  - 푸터: 8px (text-[8px])

- **색상**:
  - 헤더: 파란색 배경 (blue-600)
  - 강조 텍스트: 파란색 (blue-600)
  - 테이블 헤더: 회색 배경 (gray-50)
  - 테이블 테두리: 회색 (gray-300)
  - Footer: 파란색 배경 (blue-50)

- **레이아웃**:
  - 페이지당 높이: 48vh
  - 절취선: 점선 (border-dashed) + "✂ 절 취 선 ✂" 텍스트

### 인쇄 설정
```css
@page {
  size: A4 portrait;
  margin: 0;
}
```

## API 명세

### 데이터 소스
판매 관리는 별도의 API 엔드포인트가 없으며, 발주 API를 활용합니다.

**사용 API**: `getOrdersByTeamId(teamId)` - 팀별 발주 데이터 조회

**클라이언트 필터 파라미터** (`SalesFilterParams`):
- `startDate`: 시작일 (YYYY-MM-DD, 기본값: 이번 달 시작일)
- `endDate`: 종료일 (YYYY-MM-DD, 기본값: 이번 달 마지막일)
- `supplierId`: 판매처 ID (선택)
- `status`: 발주 상태 (선택, 영문값)
- `orderType`: 발주 유형 (all/package/individual)
- `searchQuery`: 검색어 (선택, 제목/판매처/수령인/담당자)
- `showMissingPriceOnly`: 판매가 미입력만 보기 (선택)

**처리 흐름**:
1. 팀별 전체 발주 데이터 조회
2. 클라이언트에서 판매 레코드로 변환
3. 필터링 및 정렬 적용
4. 요약 정보 계산

**반환 데이터**:
```typescript
{
  records: SalesRecord[];  // 필터링된 판매 레코드
  summary: SalesSummary;   // 요약 정보
}
```

## 주요 기능 상세

### 1. 필터링
- **날짜 범위**: startDate ~ endDate (기본값: 이번 달)
- **상태 자동 제외**: 판매 집계에서 제외되는 상태
  - `requested` (요청): 아직 승인되지 않은 발주
  - `rejected` (반려): 반려된 발주
  - `rejectedByShipper` (출고자 반려): 출고자가 반려한 발주
- **판매처**: supplierId로 필터링
- **상태**: 발주 상태로 필터링
- **검색어**: 제목, 판매처명, 수령인, 담당자 검색
- **판매가 미입력**: totalPrice가 null인 건만 표시

### 2. 정렬
- **지원 필드**: purchaseDate, title, supplierName, totalPrice, status
- **방향**: asc(오름차순) / desc(내림차순)
- **기본값**: purchaseDate desc

### 3. 반응형 디자인
- **데스크톱 (≥760px)**: 테이블형 레이아웃
  - 컬럼: 판매일자 | 판매처 | 제목 | 담당자 | 품목 수 | 판매가 | [마진 정보*] | 거래명세서
  - *마진 정보: Admin/Moderator만 표시 (원가, 마진액, 마진율)
- **모바일 (<760px)**: 카드형 레이아웃
  - 표시 정보: 제목, 판매처, 판매일자, 담당자, 품목 수, 판매가, [마진 정보*], 거래명세서 버튼
- **미디어 쿼리**: `useMediaQuery` 훅 사용

### 4. 엑셀 다운로드
- **라이브러리**: SheetJS (xlsx)
- **파일명**: `판매내역_YYYYMMDD_HHmmss.xlsx`
- **시트명**: "판매 내역"
- **포함 데이터**: 모든 필터링된 레코드

### 5. 거래명세서
- **모달**: TransactionStatementModal
- **인쇄**: window.print() 사용
- **PDF**: 브라우저 인쇄 > PDF로 저장
- **레이아웃**: 2장 1세트 (절취선 포함)

## 데이터 흐름

```
1. 사용자가 필터 설정
   ↓
2. useSalesData 훅이 팀별 발주 데이터 조회
   ↓
3. 발주 데이터를 판매 레코드로 변환
   ↓
4. React Query가 데이터 캐싱
   ↓
5. 페이지 컴포넌트에서 요청/반려/출고자반려 상태 제외
   ↓
6. 정렬 및 필터링 적용
   ↓
7. 테이블/카드로 렌더링
   ↓
8. 사용자가 거래명세서 버튼 클릭
   ↓
9. TransactionStatementModal 열림
   ↓
10. 인쇄 또는 PDF 다운로드
```

## 개선 필요 사항

### 공급자 정보
- [ ] 사업자번호 실제 정보 입력
- [ ] 대표자명 실제 정보 입력
- [ ] 사업장주소 실제 정보 입력

### 공급받는자 정보
- [ ] 사업자번호 데이터 필드 추가
- [ ] 대표자명 데이터 필드 추가

### 부가세 처리
- [ ] 면세/과세 구분 기능 추가
- [ ] 부가세율 설정 기능 (현재 10% 고정)

### 법적 효력
- [ ] 법적 효력을 위한 필수 항목 검토
- [ ] 회계/세무 담당자 검토 필요
- [ ] 전자서명 기능 고려

### 추가 기능
- [ ] QR 코드: 발주 상세 페이지 링크
- [ ] 워터마크: "원본" 또는 "사본" 표시
- [ ] 다국어 지원: 영문 거래명세서 옵션
- [ ] 이메일 발송: PDF 생성 후 자동 발송

## 참고 문서
- [거래명세서 템플릿](./transaction-statement-template.md)
- [발주 관리 명세](./order-management.md)
- [품목 관리 명세](./item-management.md)
