# 마진 분석 기능 명세

## 개요
마진 분석 페이지는 발주(Order) 데이터와 품목 원가(TeamItem.costPrice)를 결합하여 품목별 마진율을 분석하는 기능을 제공합니다. 판매가와 원가를 비교하여 수익성을 분석하고, 역마진 품목을 식별할 수 있습니다.

**버전**: v1.0
**작성일**: 2026-02-20

---

## 주요 파일

### 페이지 컴포넌트
- **경로**: `src/app/margin-analysis/page.tsx`
- **역할**: 마진 분석 데이터 조회 및 표시
- **주요 기능**:
  - 월 단위 필터링 (기본값: 이번 달)
  - 품목 검색 (품목코드, 품목명)
  - 역마진만 보기 필터
  - 원가/판매가 미입력만 보기 필터
  - 정렬 기능 (품목코드, 품목명, 판매수량, 판매가합계, 원가합계, 마진액, 마진율)
  - 엑셀 다운로드
  - 역마진 경고 안내

### 데이터 훅
- **경로**: `src/hooks/useMarginData.ts`
- **역할**: 마진 분석 데이터 조회 및 캐싱
- **데이터 소스**:
  - 판매 데이터: 팀별 발주 데이터 (`getOrdersByTeamId`)
  - 원가 데이터: OrderItem.item.teamItem.costPrice
- **쿼리 키**: `['margin-analysis', params, teamId]`
- **반환 데이터**:
  - `records`: 마진 분석 레코드 배열
  - `summary`: 마진 분석 요약 정보
- **데이터 변환**: Order → 품목별 집계 → MarginAnalysisRecord 변환
- **필터링**: 클라이언트 사이드에서 월, 검색어, 역마진, 미입력 필터링

### 타입 정의
- **경로**: `src/types/margin-analysis.ts`
- **주요 타입**:
  - `MarginAnalysisRecord`: 마진 분석 레코드 (품목별)
  - `MarginSummary`: 마진 분석 요약 정보
  - `MarginFilterParams`: 필터 파라미터
  - `MarginSortConfig`: 정렬 설정

### 컴포넌트
- **MarginSummary** (`src/components/margin/MarginSummary.tsx`)
  - 마진 분석 요약 정보 카드 (4개)
  - 총 품목 수, 평균 마진율, 총 마진액, 역마진 건수 표시
  - 원가/판매가 미입력 건수 경고 표시

### 유틸리티
- **exportMarginToExcel** (`src/utils/exportMarginToExcel.ts`)
  - 마진 분석 데이터 엑셀 다운로드
  - SheetJS(xlsx) 라이브러리 사용
  - 3개 시트: 마진 분석, 역마진 품목, 원가/판매가 미입력

---

## 데이터 구조

### MarginAnalysisRecord
```typescript
{
  itemCode: string;              // 품목코드
  itemName: string;              // 품목명
  categoryName: string;          // 카테고리명
  categoryColor?: string;        // 카테고리 색상 (선택)
  salesQuantity: number;         // 판매 수량
  salesAmount: number | null;    // 판매가 합계 (null: 미입력)
  costAmount: number | null;     // 원가 합계 (null: 미입력)
  marginAmount: number | null;   // 마진액 (판매가 - 원가)
  marginRate: number | null;     // 마진율 (%)
  hasSalesPrice: boolean;        // 판매가 입력 여부
  hasCostPrice: boolean;         // 원가 입력 여부
  isNegativeMargin: boolean;     // 역마진 여부 (마진율 < 0)
  teamItemId?: number;           // 팀 물품 ID (원가 미입력 시 팀 물품 관리로 이동용)
}
```

**참고**:
- `marginRate` = (판매가 - 원가) / 판매가 × 100
- 역마진: `marginRate < 0` (원가가 판매가보다 높음)
- 판매가 또는 원가가 미입력인 경우 마진 계산 불가능

### MarginSummary
```typescript
{
  totalItems: number;            // 총 품목 수
  averageMarginRate: number;     // 평균 마진율 (%)
  totalMarginAmount: number;     // 총 마진액
  negativeMarginCount: number;   // 역마진 건수
  missingCostCount: number;      // 원가 미입력 건수
  missingSalesCount: number;     // 판매가 미입력 건수
}
```

---

## 마진 계산 로직

### 마진율 계산 공식
```
마진율 (%) = (판매가 - 원가) / 판매가 × 100
```

**예시**:
- 판매가: ₩100,000, 원가: ₩80,000
- 마진액: ₩100,000 - ₩80,000 = ₩20,000
- 마진율: (₩20,000 / ₩100,000) × 100 = 20%

### 역마진 (Negative Margin)
- **정의**: 원가가 판매가보다 높은 경우 (마진율 < 0)
- **예시**: 판매가 ₩80,000, 원가 ₩100,000 → 마진율 -25%
- **UI 표시**: 빨간색 배경 강조 (`bg-Error-Container`)

### 데이터 집계 방식
1. **발주 필터링**: 요청, 반려, 출고자반려 상태 제외
2. **품목별 집계**: 동일 품목코드(itemCode)를 기준으로 수량과 금액 합산
3. **판매가 계산**: OrderItem.sellingPrice × quantity
4. **원가 계산**: OrderItem.item.teamItem.costPrice × quantity
5. **마진 계산**: (판매가 합계 - 원가 합계) / 판매가 합계 × 100

---

## 주요 기능

### 1. 월 단위 필터링
- **형식**: YYYY-MM (예: 2026-02)
- **기본값**: 이번 달
- **필터링 기준**: Order.purchaseDate의 연월 부분

### 2. 품목 검색
- **검색 대상**: 품목코드, 품목명
- **검색 방식**: 대소문자 구분 없이 부분 일치

### 3. 역마진 필터
- **체크박스**: "역마진만 보기"
- **필터링 조건**: `marginRate < 0`

### 4. 미입력 필터
- **체크박스**: "미입력만 보기"
- **필터링 조건**: `!hasCostPrice || !hasSalesPrice`

### 5. 정렬
- **정렬 가능 컬럼**:
  - 품목코드 (itemCode)
  - 품목명 (itemName)
  - 판매수량 (salesQuantity)
  - 판매가합계 (salesAmount)
  - 원가합계 (costAmount)
  - 마진액 (marginAmount)
  - 마진율 (marginRate)
- **기본 정렬**: 마진율 내림차순

### 6. 엑셀 다운로드
- **파일명**: `마진분석_YYYY-MM_YYYYMMDD_HHmmss.xlsx`
- **시트 구성**:
  - Sheet 1: 마진 분석 (전체 데이터 + 합계)
  - Sheet 2: 역마진 품목
  - Sheet 3: 원가/판매가 미입력

---

## 권한 관리

### 접근 권한
- **허용**: Admin, Moderator
- **거부**: User, Supplier

### 권한 체크 로직
```typescript
if (!user || (user.accessLevel !== 'admin' && user.accessLevel !== 'moderator')) {
  // 접근 거부 페이지 표시
}
```

---

## UI/UX

### 디자인 시스템
- **테마**: Material Design 3 (MD3)
- **색상**:
  - Primary: 인디고/바이올렛 (`Primary-Main`)
  - Error: 빨간색 (`Error-Main`)
  - Background: `Back-Low-10`
  - Border: `Outline-Variant`

### 테이블 스타일
- **헤더**: `bg-Back-Low-10`
- **행 구분선**: `divide-Outline-Variant`
- **호버**: `hover:bg-Back-Low-10`
- **역마진 행**: `bg-Error-Container`

### 미입력 배지
- **판매가 미입력**:
  - 배지: `bg-Error-Container text-Error-Main rounded-full`
  - 클릭 시: 발주 기록 페이지로 이동
- **원가 미입력**:
  - 배지: `bg-Error-Container text-Error-Main rounded-full`
  - 클릭 시: 팀 물품 관리 페이지로 이동 (teamItemId 하이라이트)

### 역마진 경고
- **위치**: 테이블 하단
- **스타일**: `bg-Error-Container border-l-4 border-Error-Main`
- **내용**: 역마진 품목 개수 및 가격 정책 검토 안내

---

## 데이터 흐름

### 조회 흐름
```
1. 사용자가 월 선택 (yearMonth)
2. useMarginData(filters) 호출
3. getOrdersByTeamId() → 발주 데이터 조회
4. 월별 필터링 (purchaseDate.substring(0, 7))
5. 품목별 집계 (aggregateItemSalesData)
   - 동일 itemCode별로 수량, 판매가 합산
   - costPrice 참조 (OrderItem.item.teamItem.costPrice)
6. 마진 분석 레코드 변환 (transformToMarginRecord)
   - 마진액 = 판매가 합계 - 원가 합계
   - 마진율 = (마진액 / 판매가 합계) × 100
7. 검색, 역마진, 미입력 필터링
8. 요약 정보 계산 (calculateMarginSummary)
9. UI 렌더링
```

### 엑셀 다운로드 흐름
```
1. 사용자가 "엑셀 다운로드" 버튼 클릭
2. exportMarginToExcel(records, yearMonth) 호출
3. 3개 시트 생성:
   - Sheet 1: 마진 분석 (전체 데이터 + 합계 행)
   - Sheet 2: 역마진 품목 (marginRate < 0)
   - Sheet 3: 원가/판매가 미입력
4. 파일명 생성: 마진분석_YYYY-MM_YYYYMMDD_HHmmss.xlsx
5. 다운로드
```

---

## 개선 사항 (TODO)

### v1.1 (예정)
- [ ] 카테고리별 마진율 분석 추가
- [ ] 공급처별 마진율 분석 추가
- [ ] 마진율 추이 차트 (월별 비교)
- [ ] 목표 마진율 설정 기능

### v1.2 (예정)
- [ ] 마진율 기반 가격 추천 기능
- [ ] 역마진 품목 자동 알림
- [ ] 마진율 상위/하위 품목 하이라이트

---

## 주의사항

### 데이터 정합성
1. **원가 정보**: TeamItem.costPrice가 null인 경우 마진 계산 불가능
2. **판매가 정보**: OrderItem.sellingPrice가 null인 경우 마진 계산 불가능
3. **발주 상태**: requested, rejected, rejectedByShipper 상태는 자동 제외

### 성능 최적화
- **React Query 캐싱**: 5분 (staleTime: 1000 * 60 * 5)
- **클라이언트 사이드 필터링**: 서버 부하 최소화
- **useMemo**: 정렬 및 집계 연산 최적화

### 보안
- **권한 체크**: Admin, Moderator만 접근 가능
- **데이터 검증**: 클라이언트 & 서버 모두에서 검증

---

## 참고 문서
- [판매 관리 기능 명세](/docs/sales-management.md)
- [구매 관리 기능 명세](/docs/purchase-management.md)
- [발주 관리 기능 명세](/docs/order-management.md)

---

## 변경 이력

### v1.0 (2026-02-20)
- ✅ 초기 버전 구현
- ✅ 품목별 마진율 분석
- ✅ 역마진 필터 및 경고
- ✅ 원가/판매가 미입력 필터
- ✅ 엑셀 다운로드 (3개 시트)
- ✅ MD3 디자인 시스템 적용
