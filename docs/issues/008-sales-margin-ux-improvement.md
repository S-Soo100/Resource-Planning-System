# #008 판매 내역 & 마진 분석 페이지 UX 개선

## 유형: Improvement

## 요구사항

### 1. 요약 카드에 유료 시연 포함 안내 표시

현재 "총 판매 금액", "총 마진액" 등의 요약 카드에 유료 시연 금액이 합산되어 있지만,
사용자에게 유료 시연이 포함되어 있다는 사실을 명시적으로 보여주지 않음.

**현재 상태:**
- 총 판매 건수: `발주 N건 / 시연 N건` 소분류만 표시됨
- 총 판매 금액, 총 마진액: 합산 금액만 표시, 시연 포함 여부 알 수 없음

**개선 방향:**
- 총 판매 금액 카드에 `시연 매출 포함: ₩X` 서브텍스트 추가
- 총 마진액 카드에 `시연 마진 포함: ₩X` 서브텍스트 추가
- 시연 데이터가 0건이면 서브텍스트 미표시

### 2. 시연명 클릭 → 상세 페이지 이동 (확인 완료)

유료 시연 탭에서 시연명 클릭 시 `/demoRecord/{demoId}` 상세 페이지로 이동하는 기능은
**이미 구현 완료** 상태 (DemoSalesTable.tsx:65-66, 모바일/데스크톱 양쪽).

→ 추가 작업 불필요, 동작 확인만 완료.

---

## 구현 계획

### 수정 파일

| 파일 | 작업 |
|------|------|
| `src/components/sales/SalesSummary.tsx` | 총 판매 금액, 총 마진액 카드에 시연 포함 서브텍스트 추가 |

### 상세 변경

**SalesSummary.tsx — 총 판매 금액 카드:**

```tsx
{/* 총 판매 금액 */}
<div>
  <div className="text-sm text-gray-500 mb-1">총 판매 금액</div>
  <div className="text-2xl font-bold text-blue-600">
    ₩{summary.totalSales.toLocaleString()}
  </div>
  {/* 시연 매출 포함 안내 */}
  {summary.demoSalesAmount !== undefined && summary.demoSalesAmount > 0 && (
    <div className="text-xs text-purple-500 mt-1">
      시연 매출 포함: ₩{summary.demoSalesAmount.toLocaleString()}
    </div>
  )}
</div>
```

**SalesSummary.tsx — 총 마진액 카드:**

```tsx
{/* 총 마진액 */}
<div>
  ...기존 마진액 표시...
  {/* 시연 마진 포함 안내 (시연은 원가 0이므로 마진 = 매출) */}
  {summary.demoSalesAmount !== undefined && summary.demoSalesAmount > 0 && (
    <div className="text-xs text-purple-500 mt-1">
      시연 마진 포함: ₩{summary.demoSalesAmount.toLocaleString()}
    </div>
  )}
</div>
```

## 검증 항목

1. `npm run build` 통과
2. E2E 테스트 전체 통과
3. 시연 데이터가 있을 때: 서브텍스트 보라색으로 표시
4. 시연 데이터가 0건일 때: 서브텍스트 미표시
5. 시연명 클릭 → `/demoRecord/{id}` 정상 이동 확인

## 관련 이슈

- #006 매출마진 페이지 유료 시연 통합
- #007 유료 시연 탭 데이터 미표시 수정
