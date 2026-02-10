# 권한 레벨 비교 (Admin, Moderator, User, Supplier)

> **최종 업데이트**: 2026-02-10
> **버전**: 2.0
> **상태**: ✅ 구현 완료

## 1. 권한 레벨 개요

### 1.1 관리자 (Admin)

- 시스템의 최고 권한을 가진 사용자
- 모든 기능에 대한 읽기/쓰기 권한 보유
- 시스템 설정 및 데이터 수정 가능
- **모든 창고에 접근 가능** (창고 접근 제한 미적용)

### 1.2 1차승인권자 (Moderator)

- 관리자의 권한을 일부 제한한 형태
- 주로 조회와 승인 기능에 중점
- 데이터 수정이나 시스템 설정 변경 제한
- 관리 페이지는 **읽기 전용 모드**로 접근
- 창고 접근 제한 적용 (restrictedWhs 설정에 따름)

### 1.3 일반 사용자 (User)

- 기본적인 시스템 사용 권한
- 재고 조회 및 발주 요청 기능 사용 가능
- **판매/구매 분석 페이지 접근 가능** (v2.0 변경)
- 관리 기능 접근 제한
- 창고 접근 제한 적용 (restrictedWhs 설정에 따름)

### 1.4 외부업체 (Supplier)

- 발주 및 시연 관련 기능 접근
- 재고 조회 및 발주 요청 기능 사용 가능
- **판매/구매 분석 페이지 접근 불가** (v2.0 신규)
- 내부 관리 기능 접근 제한
- 창고 접근 제한 적용 (restrictedWhs 설정에 따름)

## 2. 기능별 권한 비교

### 2.1 재고 관리

| 기능             | Admin | Moderator | User | Supplier | 구현 파일 |
| ---------------- | ----- | --------- | ---- | -------- | --------- |
| 재고 조회        | ✅    | ✅        | ✅   | ✅       | `src/app/stock/page.tsx` |
| 재고 수량 수정   | ✅    | ❌        | ❌   | ❌       | 재고 테이블 내부 |
| 입출고 기록 조회 | ✅    | ✅        | ✅   | ✅       | `src/app/ioHistory/page.tsx` |

### 2.2 발주 관리

| 기능                | Admin | Moderator | User | Supplier | 구현 파일 |
| ------------------- | ----- | --------- | ---- | -------- | --------- |
| 패키지 발주 요청    | ✅    | ✅        | ✅   | ✅       | `src/app/packageOrder/page.tsx` |
| 개별 품목 발주 요청 | ✅    | ✅        | ✅   | ✅       | `src/app/orderRequest/page.tsx` |
| 휠체어 발주 요청    | ✅    | ✅        | ✅   | ✅       | `src/app/orderWheelchair/page.tsx` |
| 발주 기록 확인      | ✅    | ✅        | ✅   | ✅       | `src/app/orderRecord/page.tsx` |
| 발주 상태 변경      | ✅    | ✅        | ❌   | ❌       | OrderRecordTabs 내부 |

### 2.3 시연 관리

| 기능           | Admin | Moderator | User | Supplier | 구현 파일 |
| -------------- | ----- | --------- | ---- | -------- | --------- |
| 시연 요청      | ✅    | ✅        | ✅   | ✅       | `src/app/demonstration/page.tsx` |
| 시연 기록 조회 | ✅    | ✅        | ✅   | ✅       | `src/app/demonstration-record/page.tsx` |

### 2.4 분석 및 보고 (v2.0 신규)

| 기능         | Admin | Moderator | User | Supplier | 구현 파일 |
| ------------ | ----- | --------- | ---- | -------- | --------- |
| 판매 내역    | ✅    | ✅        | ✅   | ❌       | `src/app/sales/page.tsx` |
| 구매 내역    | ✅    | ✅        | ✅   | ❌       | `src/app/purchase/page.tsx` |
| 거래명세서   | ✅    | ✅        | ✅   | ❌       | SalesPage 내부 |

### 2.5 시스템 관리

| 기능                  | Admin | Moderator | User | Supplier | 구현 파일 |
| --------------------- | ----- | --------- | ---- | -------- | --------- |
| 업체 관리             | ✅    | ✅ (읽기) | ❌   | ❌       | `src/app/supplier/page.tsx` |
| 패키지 관리           | ✅    | ✅ (읽기) | ❌   | ❌       | `src/app/package/page.tsx` |
| 창고별 품목 관리      | ✅    | ✅ (읽기) | ❌   | ❌       | `src/app/warehouse-items/page.tsx` |
| 카테고리 및 품목 관리 | ✅    | ✅ (읽기) | ❌   | ❌       | `src/app/team-items/page.tsx` |
| 팀멤버, 창고 관리     | ✅    | ✅ (읽기) | ❌   | ❌       | `src/app/admin/page.tsx` |
| 팀 멤버 추가          | ✅    | ❌        | ❌   | ❌       | Admin 페이지 내부 |

## 3. 제한사항

### 3.1 1차승인권자 (Moderator)

- ✅ **구현 완료**: 관리 페이지 읽기 전용 모드
- ✅ **구현 완료**: 재고 수량 직접 수정 불가
- ✅ **구현 완료**: 팀 멤버 추가 기능 사용 불가
- ✅ **구현 완료**: 관리자 페이지 접근 시 "1차 승인권자 권한으로는 조회만 가능합니다" 메시지 표시
- ✅ **구현 완료**: 창고 접근 제한 적용 (restrictedWhs)

### 3.2 일반 사용자 (User)

- ✅ **구현 완료**: 재고 조회 및 발주 요청 가능
- ✅ **구현 완료**: 판매/구매 분석 페이지 접근 가능
- ✅ **구현 완료**: 관리 기능 접근 불가 (Admin/Moderator 전용)
- ✅ **구현 완료**: 발주 상태 변경 불가
- ✅ **구현 완료**: 창고 접근 제한 적용 (restrictedWhs)

### 3.3 외부업체 (Supplier)

- ✅ **구현 완료**: 발주 및 시연 관련 기능만 사용 가능
- ✅ **구현 완료**: 판매/구매 분석 페이지 접근 차단
- ✅ **구현 완료**: 내부 관리 기능 접근 불가
- ✅ **구현 완료**: 발주 상태 변경 불가
- ✅ **구현 완료**: 창고 접근 제한 적용 (restrictedWhs)
- ⚠️ **부분 구현**: 메뉴 필터링 (MainMenu에서 일부 구현)

## 4. 창고 접근 제한 (v2.0 신규)

### 4.1 개요
- 사용자별로 특정 창고에 대한 접근을 제한할 수 있는 기능
- `IUser.restrictedWhs` 필드를 통해 관리
- **구현 파일**: `src/utils/warehousePermissions.ts`

### 4.2 권한별 적용 정책

| 권한 레벨 | 창고 제한 적용 | 설명 |
| --------- | -------------- | ---- |
| Admin | ❌ | 모든 창고에 무조건 접근 가능 |
| Moderator | ✅ | restrictedWhs 설정에 따라 제한 |
| User | ✅ | restrictedWhs 설정에 따라 제한 |
| Supplier | ✅ | restrictedWhs 설정에 따라 제한 |

### 4.3 주요 함수

```typescript
// 특정 창고 접근 가능 여부 확인
hasWarehouseAccess(user: IUser, warehouseId: number): boolean

// 접근 가능한 창고 목록 필터링
filterAccessibleWarehouses(user: IUser, warehouses: Warehouse[]): Warehouse[]

// 제한된 창고 ID 목록 반환
getRestrictedWarehouseIds(user: IUser): number[]
```

## 5. UI 표시

- **AppBar**에서 각 권한 레벨별 표시:
  - Admin: "관리자"
  - Moderator: "1차승인권자"
  - User: "일반 사용자"
  - Supplier: "외부업체"

- **권한 없음 화면** 공통 디자인:
  - 🔒 아이콘 표시
  - 명확한 권한 필요 메시지
  - "메인으로 돌아가기" 버튼

## 6. 권한 체크 구현 방법

### 6.1 재사용 가능한 유틸리티 (v2.0 신규)

#### HOC (Higher-Order Component)
```typescript
import { withAuth } from '@/utils/withAuth';

// 모든 로그인 사용자 허용
export default withAuth(MyPage);

// Admin, Moderator만 허용
export default withAuth(AdminPage, {
  allowedLevels: ['admin', 'moderator']
});
```

#### 커스텀 훅
```typescript
import { useRequireAuth } from '@/hooks/useRequireAuth';

function MyPage() {
  const { user, isAuthorized } = useRequireAuth({
    allowedLevels: ['admin', 'moderator']
  });

  if (!isAuthorized) return null;
  // ...
}
```

### 6.2 직접 구현 패턴
```typescript
const { user, isLoading } = useCurrentUser();

// 로딩 체크
if (isLoading) return <LoadingSpinner />;

// 권한 체크
if (!user || user.accessLevel === 'supplier') {
  return <AccessDenied />;
}
```

## 7. 요약

- **관리자(Admin)**: 시스템의 모든 기능에 대한 완전한 접근 권한, 모든 창고 접근 가능
- **1차승인권자(Moderator)**: 관리자 권한의 제한된 버전, 주로 조회와 승인 기능, 읽기 전용 모드
- **일반 사용자(User)**: 기본적인 시스템 사용 권한 + 판매/구매 분석, 관리 기능 제한
- **외부업체(Supplier)**: 발주 및 시연 기능에만 제한된 접근, 판매/구매 분석 차단

## 8. 변경 이력

### v2.0 (2026-02-10)
- ✅ 판매/구매 페이지 권한 체크 추가 (Admin, Moderator, User만)
- ✅ 창고 접근 제한 기능 실제 구현
- ✅ 재사용 가능한 권한 체크 HOC/훅 생성
- ✅ URL 직접 접근 시 권한 차단 구현
- ✅ 10개 페이지 권한 체크 추가

### v1.0 (초기 버전)
- 기본 권한 시스템 설계
- 메뉴 필터링 구현
