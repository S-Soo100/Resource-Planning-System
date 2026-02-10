# 권한 시스템 체크 가이드

이 커맨드는 KARS 프로젝트의 권한 시스템을 체크하고 새로운 페이지에 권한을 추가하는 방법을 안내합니다.

## 📋 권한 레벨 개요

### 권한 타입
- **Admin**: 모든 기능 접근 (창고 제한 미적용)
- **Moderator**: 읽기 전용 + 발주 승인 (창고 제한 적용)
- **User**: 기본 기능 + 판매/구매 분석 (창고 제한 적용)
- **Supplier**: 발주/시연만 (판매/구매 차단, 창고 제한 적용)

## 🎯 기능별 권한 매트릭스

### 접근 가능 여부
| 기능 | Admin | Moderator | User | Supplier |
|------|-------|-----------|------|----------|
| 판매/구매 분석 | ✅ | ✅ | ✅ | ❌ |
| 발주/시연 기록 | ✅ | ✅ | ✅ | ✅ |
| 업체/패키지 관리 | ✅ | ✅ (읽기) | ❌ | ❌ |
| 재고 조회 | ✅ | ✅ | ✅ | ✅ |

## 🔧 권한 체크 구현 방법

### 방법 1: HOC 사용 (권장)

```typescript
import { withAuth } from '@/utils/withAuth';

function MyPage() {
  return <div>페이지 내용</div>;
}

// 모든 로그인 사용자
export default withAuth(MyPage);

// Admin, Moderator만
export default withAuth(MyPage, {
  allowedLevels: ['admin', 'moderator']
});

// Supplier 제외
export default withAuth(MyPage, {
  allowedLevels: ['admin', 'moderator', 'user']
});
```

### 방법 2: 커스텀 훅 사용

```typescript
import { useRequireAuth } from '@/hooks/useRequireAuth';

function MyPage() {
  const { user, isAuthorized } = useRequireAuth({
    allowedLevels: ['admin', 'moderator']
  });

  if (!isAuthorized) return null;

  return <div>페이지 내용</div>;
}
```

### 방법 3: 직접 구현

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 권한 체크: Admin, Moderator만
  if (!user || (user.accessLevel !== 'admin' && user.accessLevel !== 'moderator')) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              접근 권한이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              이 페이지는 관리자만 접근할 수 있습니다.
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div>페이지 내용</div>;
}
```

## 🏢 창고 접근 제한

### 사용 방법

```typescript
import { hasWarehouseAccess, filterAccessibleWarehouses } from '@/utils/warehousePermissions';

// 특정 창고 접근 가능 여부
const canAccess = hasWarehouseAccess(user, warehouseId);

// 접근 가능한 창고만 필터링
const accessibleWarehouses = filterAccessibleWarehouses(user, allWarehouses);
```

### 권한별 적용
- **Admin**: 모든 창고 무조건 접근 가능
- **나머지**: `user.restrictedWhs` 설정에 따라 제한

## 📚 참고 문서

- **권한 비교표**: `/docs/access-level-comparison.md`
- **창고 접근 제한**: `/docs/warehouse-access-restriction-analysis.md`

## 🔍 권한 체크 필수 확인사항

1. ✅ 로그인 체크 (`!user`)
2. ✅ 권한 레벨 체크 (`user.accessLevel`)
3. ✅ 로딩 상태 처리 (`isLoading`)
4. ✅ URL 직접 접근 차단 (페이지 레벨 가드)
5. ✅ 창고 접근 제한 (필요한 경우)

## 💡 일반적인 권한 패턴

### 분석/보고 페이지
- 허용: Admin, Moderator, User
- 차단: Supplier
- 예: 판매 내역, 구매 내역

### 관리 페이지
- 허용: Admin, Moderator (읽기 전용)
- 차단: User, Supplier
- 예: 업체 관리, 패키지 관리

### 요청 페이지
- 허용: 모든 권한 레벨
- 예: 발주 요청, 시연 요청

### 기록 조회 페이지
- 허용: 모든 권한 레벨
- 예: 발주 기록, 시연 기록
