# 메인 페이지 탭 상태 관리 명세

## 개요
메인 페이지(`/menu`)의 탭 상태를 Zustand + localStorage를 통해 영구 저장하여, 사용자가 다른 페이지로 이동했다가 뒤로가기로 돌아와도 이전에 선택한 탭이 유지되도록 합니다.

## 주요 파일

### 상태 관리
- **경로**: `src/store/menuTabStore.ts`
- **역할**: 메인 페이지 탭 상태 관리 (Zustand + persist 미들웨어)
- **저장소**: localStorage (키: `menu-tab-storage`)

### 페이지 컴포넌트
- **경로**: `src/app/menu/page.tsx`
- **역할**: 메인 메뉴 페이지 (라우팅용)

### 메인 컴포넌트
- **경로**: `src/components/menu/MainMenu.tsx`
- **역할**: 메인 메뉴 탭 UI 및 로직
- **주요 기능**:
  - 권한별 탭 표시 (supplier: 2개, 일반: 2개, admin/moderator: 4개)
  - Framer Motion 애니메이션
  - 탭 상태 초기화 및 검증

## 탭 구조

### 모든 사용자 공통 (2개)
1. **재고 관리** (`stock`)
   - 재고 조회
   - 입출고 내역
   - 업체 관리

2. **발주 & 시연** (`order`)
   - 발주 시작하기
   - 발주 기록
   - 시연 요청 (supplier 제외)
   - 시연 기록 (supplier 제외)

### Admin/Moderator 전용 (추가 2개)
3. **판매 & 구매** (`analytics`)
   - 구매 내역
   - 판매 내역

4. **관리** (`admin`)
   - 전체 물품, 카테고리 등록
   - 창고별 관리물품 등록
   - 패키지 등록 및 관리
   - 관리 - 팀멤버, 창고 관리
   - 팀 활동 모니터링

## 상태 관리 구조

### menuTabStore 인터페이스
```typescript
interface MenuTabState {
  activeTab: string;                          // 현재 활성 탭 ID
  setActiveTab: (tab: string) => void;        // 탭 변경
  resetTab: () => void;                       // 기본 탭으로 리셋
  setTabForUser: (userAccessLevel: string) => void;  // 권한별 탭 유효성 검사
}
```

### 기본 탭 결정 로직
```typescript
const getDefaultTab = (userAccessLevel?: string) => {
  // supplier는 order 탭이 기본, 나머지는 stock 탭이 기본
  return userAccessLevel === "supplier" ? "order" : "stock";
};
```

### 탭 유효성 검사 로직
```typescript
const isValidTabForUser = (tab: string, userAccessLevel: string) => {
  if (userAccessLevel === "supplier") {
    return tab === "order";  // supplier는 order 탭만 접근 가능
  }
  // admin/moderator는 모든 탭 접근 가능
  if (userAccessLevel === "admin" || userAccessLevel === "moderator") {
    return ["stock", "order", "analytics", "admin"].includes(tab);
  }
  // user는 stock, order 탭만 접근 가능
  return ["stock", "order"].includes(tab);
};
```

### setTabForUser 동작 방식
```typescript
setTabForUser: (userAccessLevel: string) => {
  const currentTab = get().activeTab;

  // 현재 탭이 사용자 권한에 맞지 않으면 기본 탭으로 변경
  if (!isValidTabForUser(currentTab, userAccessLevel)) {
    const defaultTab = getDefaultTab(userAccessLevel);
    set({ activeTab: defaultTab });
  }
  // 현재 탭이 유효하면 유지 (localStorage 값 유지)
}
```

## 데이터 흐름

### 초기 로딩 시
```
1. 사용자 로그인 → /menu 페이지 접근
   ↓
2. MainMenu 컴포넌트 마운트
   ↓
3. menuTabStore에서 activeTab 읽기
   ↓
4. localStorage에서 이전 탭 상태 복원 (persist 미들웨어)
   ↓
5. useEffect에서 setTabForUser(user.accessLevel) 호출
   ↓
6. 현재 탭이 권한에 맞는지 검증
   ↓
7a. 권한에 맞으면 → localStorage 탭 유지
7b. 권한에 맞지 않으면 → 기본 탭으로 변경
   ↓
8. 탭 UI 렌더링
```

### 탭 선택 시
```
1. 사용자가 탭 클릭
   ↓
2. setActiveTab(tab.id) 호출
   ↓
3. Zustand 상태 업데이트
   ↓
4. persist 미들웨어가 localStorage에 자동 저장
   ↓
5. UI 리렌더링 (Framer Motion 애니메이션)
```

### 다른 페이지 이동 후 복귀 시
```
1. 메인 페이지에서 탭 선택 (예: "판매 & 구매")
   ↓
2. localStorage에 "analytics" 저장됨
   ↓
3. "판매 내역" 메뉴 클릭 → /sales 페이지로 이동
   ↓
4. 브라우저 뒤로가기 또는 router.push('/menu')
   ↓
5. MainMenu 컴포넌트 재마운트
   ↓
6. menuTabStore에서 activeTab 읽기
   ↓
7. localStorage에서 "analytics" 복원
   ↓
8. setTabForUser로 권한 검증 (admin/moderator는 통과)
   ↓
9. "판매 & 구매" 탭이 활성화된 상태로 렌더링 ✅
```

## 이벤트 구독

### 로그아웃 시 탭 리셋
```typescript
// 로그아웃 시 탭 상태 초기화
subscribeToEvent(EVENTS.AUTH_LOGOUT, () => {
  menuTabStore.getState().resetTab();
});
```

### 팀 변경 시
```typescript
// 팀 변경 시에는 탭 상태 유지 (사용자 권한은 동일하므로)
```

## UI 애니메이션

### Framer Motion 설정
- **layoutId**: `"activeTab"` - 탭 간 슬라이딩 애니메이션
- **transition**: `{ type: "spring", bounce: 0.2, duration: 0.6 }`
- **whileHover**: `{ scale: 1.02, y: -2 }` - 호버 시 살짝 확대 및 위로 이동
- **whileTap**: `{ scale: 0.98 }` - 클릭 시 살짝 축소

### 탭 스타일
```typescript
// 활성 탭
className={`${tab.bgColor} ${tab.textColor} shadow-sm`}

// 비활성 탭
className="text-gray-600 hover:text-gray-800 hover:bg-white"
```

## 권한별 탭 색상

### 재고 관리 (stock)
- 배경: `bg-blue-50`
- 텍스트: `text-blue-800`
- 테두리: `border-blue-500`
- 아이콘 배경: `bg-blue-600`

### 발주 & 시연 (order)
- 배경: `bg-green-50`
- 텍스트: `text-green-800`
- 테두리: `border-green-500`
- 아이콘 배경: `bg-green-600`

### 판매 & 구매 (analytics)
- 배경: `bg-orange-50`
- 텍스트: `text-orange-800`
- 테두리: `border-orange-500`
- 아이콘 배경: `bg-orange-600`

### 관리 (admin)
- 배경: `bg-purple-50`
- 텍스트: `text-purple-800`
- 테두리: `border-purple-500`
- 아이콘 배경: `bg-purple-600`

## localStorage 구조

### 키
```
menu-tab-storage
```

### 값 (JSON)
```json
{
  "state": {
    "activeTab": "analytics"
  },
  "version": 0
}
```

## 성능 최적화

### Zustand persist 미들웨어
- **자동 동기화**: 탭 변경 시 즉시 localStorage에 저장
- **초기 로딩**: 페이지 마운트 시 localStorage에서 한 번만 읽기
- **메모리 효율**: 최소한의 상태만 저장 (activeTab 문자열)

### React 렌더링 최적화
```typescript
// useEffect 의존성 배열로 불필요한 재실행 방지
useEffect(() => {
  if (user?.accessLevel) {
    setTabForUser(user.accessLevel);
  }
}, [user?.accessLevel, setTabForUser]);
```

## 테스트 시나리오

### 시나리오 1: 기본 탭 복원
1. 로그인 → 메인 페이지
2. 확인: `stock` 탭 활성화 (user의 기본 탭)

### 시나리오 2: 탭 선택 후 복귀
1. 메인 페이지에서 `analytics` 탭 선택
2. `/sales` 페이지로 이동
3. 뒤로가기
4. 확인: `analytics` 탭 활성화 유지 ✅

### 시나리오 3: 새로고침
1. 메인 페이지에서 `admin` 탭 선택
2. 페이지 새로고침 (F5)
3. 확인: `admin` 탭 활성화 유지 ✅

### 시나리오 4: 권한 검증
1. admin으로 로그인 → `analytics` 탭 선택
2. 로그아웃 → supplier로 로그인
3. 메인 페이지 접근
4. 확인: `order` 탭 활성화 (supplier는 analytics 접근 불가)

### 시나리오 5: 로그아웃 후 리셋
1. 메인 페이지에서 `admin` 탭 선택
2. 로그아웃
3. 다시 로그인 → 메인 페이지
4. 확인: `stock` 탭 활성화 (리셋됨)

## 주의사항

### 권한 변경 시
- 사용자 권한이 변경되면 `setTabForUser`가 자동으로 호출되어 탭 유효성 재검증
- 유효하지 않은 탭이면 기본 탭으로 자동 변경

### localStorage 용량
- 현재 저장 용량: ~50 bytes (매우 작음)
- localStorage 제한: 5MB (충분함)

### 브라우저 호환성
- Zustand persist: 모든 현대 브라우저 지원 (IE11+)
- localStorage: 모든 현대 브라우저 지원
- Framer Motion: React 18 지원

## 개선 필요 사항

### 기능 개선
- [ ] 탭 히스토리 기록 (뒤로가기/앞으로가기 지원)
- [ ] 탭별 스크롤 위치 복원
- [ ] 탭 드래그 앤 드롭 순서 변경

### UX 개선
- [ ] 탭 전환 시 haptic feedback (모바일)
- [ ] 탭 뱃지 (알림 개수 표시)
- [ ] 탭별 단축키 (Ctrl+1, Ctrl+2 등)

### 성능 개선
- [ ] 탭 컨텐츠 lazy loading
- [ ] 탭 pre-fetching (다음 탭 데이터 미리 로딩)

## 관련 문서
- [Zustand 공식 문서](https://github.com/pmndrs/zustand)
- [Framer Motion 공식 문서](https://www.framer.com/motion/)
- [React Router 공식 문서](https://reactrouter.com/)

## 버전 히스토리

### v2.2.2 (2026-02-11)
- 메인 페이지 탭 상태 기억 기능 개선
- `analytics` 탭 유효성 검사 추가
- 뒤로가기 시 탭 상태 복원 보장
