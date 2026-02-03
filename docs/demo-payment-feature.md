# 시연 대금 관리 기능

> **⚠️ 초안 문서 (Draft)**
>
> 이 문서는 시연 대금 관리 기능의 초기 버전을 설명합니다.
> 백엔드 API, 비즈니스 정책, 결제 프로세스 등은 아직 확정되지 않았으며,
> 향후 변경될 수 있습니다.

## 1. 개요

시연 기록 페이지에서 현재 페이지에 표시된 유료 시연들의 대금 정보를 한눈에 확인할 수 있는 기능입니다.

### 1.1 주요 기능

- **현재 페이지 유료 시연 집계**: 페이지네이션 기준으로 현재 보이는 시연들만 계산
- **시연 기간 표시**: 유료 시연들의 시작일~종료일 범위 및 일수 계산
- **총 대금 계산**: 유료 시연 대금의 합계 자동 계산 (천 단위 구분)
- **결제 유형별 통계**: 결제 방법(현금, 카드 등)별 건수 및 금액 집계

### 1.2 표시 위치

```
시연 기록 페이지
  ├── 헤더 (제목 + 새로고침)
  ├── 검색 및 필터
  ├── 탭 (진행중 | 장기 시연 | 시연종료)
  ├── 탭별 기록 수 표시
  ├── **📊 유료 시연 대금 정보 카드**  ← 여기!
  └── 시연 기록 테이블/리스트
```

## 2. 데이터 모델

### 2.1 시연 대금 관련 필드

```typescript
// src/types/demo/demo.ts
interface Demo {
  // ... 기존 필드들 ...

  // 대금 관련 필드
  demoPaymentType?: string;      // 결제 유형 (예: "현금", "카드", "계좌이체", "미지정")
  demoPrice?: number;            // 시연 대금 (0 이상의 숫자, 0이면 무료)
  demoPaymentDate?: Date;        // 결제 예정일 (선택 사항)
  demoCurrencyUnit?: string;     // 화폐 단위 (예: "원", "USD", "JPY")
}
```

### 2.2 유료 시연 판단 기준

```typescript
// 유료 시연 여부 확인
const isPaidDemo = (record: DemoResponse): boolean => {
  return record.demoPrice !== undefined &&
         record.demoPrice !== null &&
         record.demoPrice > 0;
};
```

## 3. UI/UX 구성

### 3.1 대금 정보 카드 레이아웃

```
┌─────────────────────────────────────────────────────────┐
│ 📅 시연 기간: 2024-01-01 ~ 2024-01-15 (15일)             │
├─────────────────────────────────────────────────────────┤
│ 💰 현재 페이지 유료 시연    │    총 대금: 1,500,000원   │
│    3건                       │                           │
├─────────────────────────────────────────────────────────┤
│ 현금 · 2건 · 500,000원    카드 · 1건 · 1,000,000원       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 시각적 디자인

- **배경**: 파란색 그라데이션 (`from-blue-50 to-indigo-50`)
- **테두리**: 파란색 경계선 (`border-blue-100`)
- **아이콘**: 돈 아이콘 (💰) + 캘린더 아이콘 (📅)
- **색상 체계**: 파란색 계열로 통일하여 정보성 강조

### 3.3 반응형 디자인

- **데스크톱**: 모든 정보를 한 줄에 표시
- **모바일**: 자동 줄바꿈으로 가독성 유지
- **결제 유형 뱃지**: flex-wrap으로 자동 배치

## 4. 구현 상세

### 4.1 기간 계산 로직

```typescript
// 유료 시연들의 날짜 범위 계산
const paidRecords = currentRecords.filter(
  record => record.demoPrice && record.demoPrice > 0
);

const dates = paidRecords
  .map(record => record.demoStartDate || record.createdAt)
  .filter(date => date)
  .map(date => new Date(date))
  .sort((a, b) => a.getTime() - b.getTime());

const startDate = dates[0];
const endDate = dates[dates.length - 1];

// 일수 계산 (양끝 포함)
const days = Math.ceil(
  (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
);
```

### 4.2 총 대금 계산

```typescript
// 현재 페이지의 유료 시연 총 대금 계산
const totalAmount = currentRecords
  .filter(record => record.demoPrice && record.demoPrice > 0)
  .reduce((sum, record) => sum + (record.demoPrice || 0), 0);

// 한국 원화 형식으로 표시
const formattedAmount = totalAmount.toLocaleString('ko-KR');
```

### 4.3 결제 유형별 집계

```typescript
// 결제 유형별 통계 계산
const paymentTypes = paidRecords.reduce((acc, record) => {
  const type = record.demoPaymentType || '미지정';
  if (!acc[type]) {
    acc[type] = { count: 0, amount: 0 };
  }
  acc[type].count += 1;
  acc[type].amount += record.demoPrice || 0;
  return acc;
}, {} as Record<string, { count: number; amount: number }>);
```

## 5. 페이지네이션 연동

### 5.1 현재 페이지 기준 계산

```typescript
// currentRecords는 현재 페이지에 표시되는 시연들만 포함
const currentRecords = sortedRecords.slice(
  (currentPage - 1) * recordsPerPage,
  currentPage * recordsPerPage
);

// 유료 시연 대금 정보는 currentRecords 기준으로만 계산
// ✅ 전체 데이터가 아닌 현재 페이지 데이터만 집계
```

### 5.2 실시간 업데이트

- **페이지 변경 시**: 자동으로 해당 페이지의 대금 정보 재계산
- **탭 변경 시**: 각 탭(진행중/장기 시연/시연종료)별로 독립적으로 계산
- **검색/필터 시**: 필터링된 결과에서만 대금 집계

## 6. 제약사항 및 향후 개선사항

### 6.1 현재 제약사항

- ⚠️ **백엔드 API 미확정**: 대금 관련 API 엔드포인트가 확정되지 않음
- ⚠️ **결제 프로세스 미정의**: 실제 결제 처리 흐름이 정의되지 않음
- ⚠️ **정책 미확립**: 대금 관련 비즈니스 정책(환불, 할인 등)이 없음
- ⚠️ **권한 정책 미정의**: 대금 정보 열람 권한이 명확하지 않음

### 6.2 향후 개선 계획

#### 백엔드 연동
```typescript
// 향후 추가 가능한 API
export const getDemoPaymentSummary = async (teamId: number, params: {
  startDate?: string;
  endDate?: string;
  status?: DemoStatus;
}) => {
  // 서버에서 집계된 대금 정보 조회
};
```

#### 상세 통계 기능
- 월별/분기별/연도별 대금 통계
- 결제 완료/미완료 상태 구분
- 대금 입금 예정일 알림
- 엑셀 내보내기 기능

#### 권한 관리
```typescript
// 대금 정보 열람 권한 체크
const canViewPaymentInfo = (): boolean => {
  // Admin, Moderator만 열람 가능
  return userAccessLevel === 'admin' || userAccessLevel === 'moderator';
};
```

#### 필터링 옵션
- 결제 상태별 필터 (완료/대기/취소)
- 결제 방법별 필터
- 금액 범위 필터 (예: 100만원 이상)
- 기간 범위 선택

## 7. 사용 예시

### 7.1 기본 사용 시나리오

```
1. 사용자가 시연 기록 페이지 접속
2. "진행중" 탭에서 현재 진행중인 시연 목록 확인
3. 유료 시연 대금 정보 카드에서 다음 정보 확인:
   - 시연 기간: 2024-01-01 ~ 2024-01-15 (15일)
   - 유료 시연 건수: 5건
   - 총 대금: 3,500,000원
   - 결제 유형별:
     * 현금: 2건 (1,000,000원)
     * 카드: 2건 (2,000,000원)
     * 계좌이체: 1건 (500,000원)
```

### 7.2 페이지 이동 시나리오

```
1. 첫 페이지 (1-10번 시연):
   - 유료 시연 3건, 총 1,500,000원

2. 다음 페이지로 이동 (11-20번 시연):
   - 유료 시연 5건, 총 2,800,000원
   ✅ 자동으로 새로운 페이지의 대금 정보 계산

3. "장기 시연" 탭으로 이동:
   - 해당 탭의 유료 시연만 독립적으로 집계
```

## 8. 참고사항

### 8.1 관련 파일

```
src/
├── components/
│   └── demonstration/
│       └── DemonstrationRecordTabs.tsx  # 대금 정보 표시 컴포넌트
├── types/
│   └── demo/
│       └── demo.ts                      # Demo 타입 정의
└── utils/
    └── dateUtils.ts                     # 날짜 포맷팅 유틸
```

### 8.2 테스트 고려사항

- [ ] 유료 시연이 없을 때 카드 숨김 처리 확인
- [ ] 단일 날짜 시연만 있을 때 기간 표시 확인
- [ ] 페이지네이션 동작 확인
- [ ] 숫자 포맷팅 (천 단위 쉼표) 확인
- [ ] 결제 유형별 집계 정확성 확인
- [ ] 모바일 반응형 레이아웃 확인

---

**📝 업데이트 이력:**

- **2025-02-02**: 초안 작성 - 기본 대금 집계 및 표시 기능 구현
- **향후 예정**: 백엔드 API 연동, 권한 관리, 상세 통계 기능 추가

**🔗 관련 문서:**

- [시연 시스템 비즈니스 로직](./demo-system-business-logic.md)
- [시연 상세 페이지 분석](./demo-record-detail-page-analysis.md)
