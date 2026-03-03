# #007 유료 시연 탭 데이터 미표시 - API 응답 파싱 구조 불일치

## 유형: Bug

## 증상

`/sales` 페이지의 유료 시연 탭에서 데이터가 표시되지 않음.
`/demonstration-record` 페이지에는 해당 기간 유료 시연이 정상 표시됨.

## 원인 분석

`useDemoSalesData.ts`에서 API 응답 파싱 시 **이중 중첩 접근** 오류.

### 실제 API 응답 구조

`getDemoByTeamId()` → `ApiResponse<DemoArrayResponse>`:

```
response = { success: true, data: DemoResponse[] }
```

즉, `response.data`가 **이미 배열**임.

### 문제 코드 (useDemoSalesData.ts:119)

```typescript
// ❌ response.data.data → undefined (배열에는 .data 속성 없음)
const demos = (response.data as { data: DemoResponse[] }).data || [];
```

### 정상 동작 코드 (DemonstrationRecordTabs.tsx)

```typescript
// ✅ response.data를 바로 배열로 사용
const data = demosResponse.data as unknown as DemoResponse[];
```

## 수정 방안

```typescript
// 안전한 파싱: 배열이면 직접 사용, 아니면 .data 접근
const rawData = response.data;
const demos: DemoResponse[] = Array.isArray(rawData)
  ? rawData
  : (rawData as any)?.data || [];
```

## 영향 범위

- `src/hooks/useDemoSalesData.ts` (1파일)

## 관련 이슈

- #006 매출마진 페이지 유료 시연 통합
