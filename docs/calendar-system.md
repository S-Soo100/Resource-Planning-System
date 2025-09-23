# 캘린더 시스템 개발 문서

## 개요

KARS 시스템의 관리자 전용 캘린더 기능으로, 발주와 시연 일정을 주별로 관리하고 메모를 작성할 수 있는 통합 캘린더 시스템입니다.

## 주요 기능

### 1. 주별 캘린더 뷰
- **데스크톱**: 7칸 그리드 형태의 주간 캘린더
- **모바일**: 세로 리스트 형태의 반응형 뷰
- 월요일~일요일 기준 주간 표시

### 2. 이벤트 타입
- **발주 일정** (파란색): 배송/설치 날짜 기준
- **시연 일정** (보라색): 시연 시작일 기준

### 3. 주별 메모 기능
- 로컬 스토리지 기반 메모 관리
- 자동 저장 (3초 지연)
- 주차별 독립적 메모

### 4. 반응형 UI
- `md` 브레이크포인트(768px) 기준 분기
- 모바일에서 [발주], [시연] 태그 표시
- 터치 친화적 인터페이스

## 기술 구조

### 컴포넌트 구조
```
src/components/calendar/
├── Calendar.tsx              # 메인 캘린더 컴포넌트
├── CalendarNavigation.tsx    # 주간 네비게이션
├── WeekView.tsx             # 데스크톱용 7칸 그리드 뷰
├── MobileWeekView.tsx       # 모바일용 리스트 뷰
├── WeeklyMemo.tsx           # 주별 메모 컴포넌트
└── EventItem.tsx            # 이벤트 아이템 표시
```

### 훅 및 유틸리티
```
src/hooks/calendar/
├── useWeekNavigation.ts     # 주간 네비게이션 관리
├── useCalendarData.ts       # 캘린더 데이터 조회 및 변환
├── useCalendarEvents.ts     # 이벤트 처리 및 날짜 정규화
└── useWeeklyMemo.ts         # 주별 메모 관리

src/utils/calendar/
└── calendarUtils.ts         # 날짜 처리 및 포맷팅 유틸리티
```

### 타입 정의
```typescript
// src/types/calendar/calendar.ts
export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD 형식
  type: 'order' | 'demo';
  status: string;
  details: OrderEventDetails | DemoEventDetails;
}

export interface DemoEventDetails {
  id: number;
  demoTitle: string;
  requester: string;
  demoManager: string;
  demoManagerPhone: string;
  demoAddress: string;
  demoStartDate: string;
  demoStartTime: string;
  demoEndDate: string;
  demoEndTime: string;
  demoStartDeliveryMethod: string; // 상차 방법
  demoEndDeliveryMethod: string;   // 하차 방법
  demoStatus: string;
  warehouseName: string;
}

export interface WeekInfo {
  year: number;
  weekNumber: number;
  weekKey: string; // 'YYYY-WW' 형식
  startDate: Date;
  endDate: Date;
  days: Date[]; // 월~일 7일
}
```

## 데이터 플로우

### 1. 데이터 조회
```typescript
// useCalendarData.ts
const { data: ordersResponse } = useAllOrders(teamId);
const { data: demosResponse } = useDemosByTeam(teamId);

// 발주 → 캘린더 이벤트 변환
const orderEvents = ordersResponse.data
  .filter(order => order.installationDate)
  .map(order => ({
    id: order.id,
    title: order.title,
    date: order.installationDate, // 설치일 기준
    type: 'order',
    // ...
  }));

// 시연 → 캘린더 이벤트 변환
const demoEvents = demosResponse.data
  .filter(demo => demo.demoStartDate)
  .map(demo => ({
    id: demo.id,
    title: demo.demoTitle,
    date: demo.demoStartDate, // 시연 시작일 기준
    type: 'demo',
    // ...
  }));
```

### 2. 날짜 정규화
```typescript
// useCalendarEvents.ts
events.forEach(event => {
  // ISO 날짜를 YYYY-MM-DD 형식으로 정규화
  const normalizedDate = event.date.split('T')[0];
  if (!grouped[normalizedDate]) {
    grouped[normalizedDate] = [];
  }
  grouped[normalizedDate].push(event);
});
```

### 3. 주간 필터링
```typescript
// useCalendarData.ts
const weekEvents = allEvents.filter(event => {
  return event.date >= weekStartStr && event.date <= weekEndStr;
});
```

## 날짜 포맷팅 시스템

### 한국어 날짜 포맷팅
```typescript
// calendarUtils.ts
export function formatDateTimeToKorean(
  dateString: string,     // "2025-10-02T00:00:00.000Z"
  timeString?: string,    // "17:00"
  deliveryMethod?: string // "직접 배송"
): string {
  // 결과: "2025년 10월 2일 17시00분 (직접 배송)"
}
```

### 주차 표시 형식
```typescript
export function getWeekTitle(weekInfo: WeekInfo): string {
  const year = weekInfo.year.toString().slice(-2);
  const startMonth = weekInfo.startDate.getMonth() + 1;
  const endMonth = weekInfo.endDate.getMonth() + 1;
  const startDate = weekInfo.startDate.getDate();
  const endDate = weekInfo.endDate.getDate();

  // 같은 월: "25년 9월 16일~22일"
  // 월 넘김: "25년 9월 29일~10월 5일"
  if (startMonth === endMonth) {
    return `${year}년 ${startMonth}월 ${startDate}일~${endDate}일`;
  } else {
    return `${year}년 ${startMonth}월 ${startDate}일~${endMonth}월 ${endDate}일`;
  }
}
```

## 반응형 디자인

### 분기점 설정
- **데스크톱** (`md` 이상, ≥768px): WeekView 컴포넌트
- **모바일** (`md` 미만, <768px): MobileWeekView 컴포넌트

### 모바일 최적화
```typescript
// MobileWeekView.tsx 주요 기능
- 날짜별 세로 리스트 표시
- 터치 확장/축소 인터렙션
- 이벤트 미리보기 및 도트 인디케이터
- [발주], [시연] 태그로 타입 구분
```

### CSS 클래스 예시
```css
/* 반응형 분기 */
.hidden.md:block    /* 데스크톱에서만 표시 */
.block.md:hidden    /* 모바일에서만 표시 */

/* 모바일 최적화 */
.text-xs.md:text-sm /* 모바일: 12px, 데스크톱: 14px */
.p-3.md:p-4         /* 모바일: 12px, 데스크톱: 16px */
```

## 주요 해결한 기술적 이슈

### 1. 날짜 형식 불일치 문제
**문제**: API에서 ISO 형식(`2025-09-23T00:00:00.000Z`)으로 받은 날짜를 `YYYY-MM-DD` 형식으로 검색할 때 매칭되지 않음

**해결**: `useCalendarEvents`에서 날짜 정규화
```typescript
const normalizedDate = event.date.split('T')[0]; // T 이전 부분만 추출
```

### 2. React Router 렌더링 오류
**문제**: 컴포넌트 렌더링 중 `router.push()` 호출로 인한 오류

**해결**: `useEffect`로 라우팅 로직 분리
```typescript
useEffect(() => {
  if (!userLoading) {
    if (!user) {
      router.push("/signin");
    } else if (user.accessLevel !== "admin") {
      router.push("/menu");
    }
  }
}, [user, userLoading, router]);
```

### 3. Null 참조 오류
**문제**: API 데이터의 `null` 값으로 인한 런타임 오류

**해결**: 옵셔널 체이닝과 기본값 설정
```typescript
supplierName: order.supplier?.supplierName || '업체 정보 없음',
receiverAddress: order.receiverAddress || '배송지 정보 없음',
```

## 성능 최적화

### 1. React Query 캐싱
```typescript
// useOrderQueries.ts
const CACHE_TIME = 30 * 60 * 1000; // 30분 캐싱
export const useAllOrders = (teamId: number) => {
  return useQuery({
    queryKey: ["orders", "team", teamId],
    queryFn: () => getOrdersByTeamId(teamId),
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
};
```

### 2. 메모리 효율적인 날짜 처리
```typescript
// 날짜별 이벤트 그룹화에서 useMemo 활용
const eventsByDate = useMemo(() => {
  const grouped: Record<string, CalendarEvent[]> = {};
  // 그룹화 로직
  return grouped;
}, [events]);
```

### 3. 컴포넌트 최적화
- `useState`를 활용한 로컬 상태 관리
- 불필요한 리렌더링 방지를 위한 이벤트 핸들러 최적화
- 모바일에서만 필요한 기능은 조건부 렌더링

## 접근 권한

### 외부업체 제외 모든 사용자 접근 가능
```typescript
// 메뉴에서 캘린더 버튼 표시 조건 (외부업체 제외)
{user.accessLevel !== "supplier" && (
  <button onClick={() => router.push("/calendar")}>
    <FaCalendarAlt className="text-lg" />
    캘린더
  </button>
)}

// 캘린더 페이지 접근 권한 체크 (외부업체만 차단)
useEffect(() => {
  if (!userLoading) {
    if (!user) {
      router.push("/signin");
    } else if (user.accessLevel === "supplier") {
      router.push("/menu");
    }
  }
}, [user, userLoading, router]);
```

### 권한별 접근 현황
- ✅ **Admin**: 모든 캘린더 기능 접근 가능
- ✅ **Moderator**: 모든 캘린더 기능 접근 가능
- ✅ **User**: 모든 캘린더 기능 접근 가능
- ❌ **Supplier**: 캘린더 기능 접근 불가 (발주/시연 일정 보안상 제한)

## 향후 개선 사항

### 1. API 연동
- 현재 로컬 스토리지 기반인 주별 메모를 서버 API 연동으로 변경
- 실시간 이벤트 업데이트 기능

### 2. 기능 확장
- 월별/연별 캘린더 뷰 추가
- 이벤트 드래그 앤 드롭으로 일정 변경
- 캘린더 내에서 바로 발주/시연 신청 기능

### 3. 성능 개선
- 가상화(virtualization)를 통한 대량 이벤트 처리
- 서버 사이드 페이지네이션
- 이미지 레이지 로딩

### 4. UX 개선
- 다크 모드 지원
- 키보드 네비게이션
- 접근성(a11y) 개선

## 테스트 시나리오

### 기능 테스트
1. **주간 네비게이션**: 이전주/다음주/오늘로 이동
2. **이벤트 표시**: 발주/시연 데이터 정상 표시 확인
3. **반응형**: 데스크톱/모바일 뷰 전환 확인
4. **메모 기능**: 작성/수정/삭제/자동저장 확인

### 엣지 케이스
1. **데이터 없음**: 이벤트가 없는 주 표시
2. **날짜 경계**: 월/년 경계를 넘나드는 주 처리
3. **권한**: 비관리자 접근 차단
4. **오류 처리**: API 오류 시 fallback UI

## 관련 파일 목록

### 컴포넌트 (7개)
- `src/components/calendar/Calendar.tsx`
- `src/components/calendar/CalendarNavigation.tsx`
- `src/components/calendar/WeekView.tsx`
- `src/components/calendar/MobileWeekView.tsx`
- `src/components/calendar/WeeklyMemo.tsx`
- `src/components/calendar/EventItem.tsx`
- `src/app/calendar/page.tsx`

### 훅 및 유틸리티 (5개)
- `src/hooks/calendar/useWeekNavigation.ts`
- `src/hooks/calendar/useCalendarData.ts`
- `src/hooks/calendar/useCalendarEvents.ts`
- `src/hooks/calendar/useWeeklyMemo.ts`
- `src/utils/calendar/calendarUtils.ts`

### 타입 정의 (1개)
- `src/types/calendar/calendar.ts`

---

**개발 기간**: 2025년 1월
**개발자**: Claude + 사용자 협업
**마지막 업데이트**: 2025년 1월 (모바일 UI 최적화 및 날짜 포맷팅 개선)