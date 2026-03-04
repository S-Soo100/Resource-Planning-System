# [Feature] 매출마진 관리 페이지에 유료 시연 데이터 통합

- **유형**: Feature
- **우선순위**: P2
- **영역**: 매출마진 관리 (`/sales`) / 시연 관리 (`/demonstration-record`) / 데이터 통합
- **상태**: 열림
- **생성일**: 2026-03-03

---

## 요구사항

현재 매출마진 관리 페이지(`/sales`)는 **발주(Order) 데이터만** 표시한다.
**유료 시연(Paid Demo)** 건수도 매출 테이블에 포함시켜 전체 매출을 정확하게 파악하고자 한다.

---

## 현재 아키텍처

```
Order (발주)                          Demo (시연)
├── getOrdersByTeamId                 ├── getDemoByTeamId
├── /sales 페이지에 표시               ├── /demonstration-record 페이지에만 표시
└── 마진 분석 대상                     └── 매출/마진과 무관 (독립적)
```

**매출 페이지의 데이터 소스**: `useSalesData.ts` → `getOrdersByTeamId` **만** 사용
**시연 데이터**: 완전히 별도 API (`getDemoByTeamId`)

---

## 유료 시연 데이터 구조

```typescript
// src/types/demo/demo.ts
interface DemoResponse {
  id: number;
  demoPaymentType: string;    // "유료" | "무료"
  demoPrice?: number;          // 시연 가격 (유료 시에만)
  demoPaymentDate?: string;    // 결제 예정일
  demoCurrencyUnit: string;    // 화폐 단위
  demoStatus: DemoStatus;      // 상태 (requested → ... → demoCompleted)
  // 품목 정보
  items: DemoItem[];           // 시연 품목 목록
  createdAt: string;
  updatedAt: string;
}
```

**유료 시연 필터 조건**: `demoPaymentType === "유료"` AND 적절한 상태 필터

---

## 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useSalesData.ts` | Demo API 호출 추가, 유료 시연 데이터 병합 |
| `src/app/sales/page.tsx` | 시연 데이터 표시를 위한 UI 구분 (발주 vs 유료 시연) |
| `src/types/sales.ts` | SalesRecord 타입에 데이터 출처(source) 필드 추가 |
| `src/types/margin-analysis.ts` | MarginAnalysisRecord에 시연 데이터 포함 여부 |
| `src/components/margin/MarginSummary.tsx` | 마진 요약에 유료 시연 매출 반영 |

---

## 완료 조건 (Acceptance Criteria)

- [ ] **AC-1**: 매출 테이블에 유료 시연(`demoPaymentType === "유료"`) 건수가 표시됨
- [ ] **AC-2**: 발주 매출과 시연 매출이 시각적으로 구분 가능함 (라벨, 아이콘, 색상 등)
- [ ] **AC-3**: 마진 요약(합계)에 유료 시연 금액이 포함됨
- [ ] **AC-4**: 기존 날짜/고객 필터가 시연 데이터에도 동일하게 적용됨
- [ ] **AC-5**: 유료 시연의 원가(costPrice) 처리 방안이 결정되어 마진 계산에 반영됨

---

## 제안 해결 방안

### 데이터 통합 방식

**방안 A: 프론트엔드 병합 (권장)**
```typescript
// useSalesData.ts에서 두 API 병렬 호출 후 병합
const { data: orders } = useOrdersByTeam(teamId);
const { data: demos } = useDemosByTeam(teamId);

const salesRecords = [
  ...transformOrdersToSales(orders),         // 기존 발주 매출
  ...transformPaidDemosToSales(paidDemos),   // 유료 시연 매출 추가
].sort((a, b) => /* 날짜순 정렬 */);
```

**방안 B: 백엔드 통합 API**
새 엔드포인트 `/api/sales/combined`에서 Order + Paid Demo를 합쳐서 반환.

### SalesRecord 타입 확장

```typescript
interface SalesRecord {
  // 기존 필드...
  source: 'order' | 'demo';  // 데이터 출처 구분
  demoId?: number;            // 시연 ID (source === 'demo'일 때)
}
```

---

## 미결 사항 (Discussion Needed)

1. **유료 시연의 원가 계산**: 시연 품목의 `costPrice`를 어떻게 산정할 것인가?
   - 발주와 동일한 `TeamItem.costPrice` 사용?
   - 시연 전용 원가 필드 추가?
2. **어떤 상태의 유료 시연을 포함할 것인가?**
   - `demoCompleted`만? 또는 `shipmentCompleted` 이상?
3. **거래명세서 생성**: 유료 시연도 거래명세서 발행 대상인가?

---

## 참고 문서
- `/docs/margin-analysis.md` — 마진 분석 데이터 소스 및 계산 로직
- `/docs/demonstration-management.md` — 시연 프로세스, 유료/무료 구분
- `/docs/sales-management.md` — 판매 내역 데이터 구조

## 관련 이슈
- #005 매출마진 관리 페이지 UX 개선 (별도 이슈)

## 예상 작업량
L (Large) — 데이터 소스 통합, 타입 확장, UI 구분, 마진 계산 수정
