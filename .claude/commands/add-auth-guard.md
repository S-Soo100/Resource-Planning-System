# 권한 가드 추가

사용자가 요청한 페이지에 적절한 권한 체크를 추가합니다.

## 사용 방법

1. 권한을 추가할 페이지 파일 경로를 알려주세요
2. 어떤 권한 레벨이 접근 가능한지 알려주세요:
   - 모든 로그인 사용자: "로그인 체크만"
   - Admin, Moderator만: "관리자"
   - Admin, Moderator, User (Supplier 제외): "팀 멤버"

## 권한 레벨 가이드

### 로그인 체크만 (모든 권한)
- 발주 요청, 시연 요청, 재고 조회 등
- allowedLevels 미지정

### 팀 멤버 (Supplier 제외)
- 판매/구매 분석, 거래명세서 등
- `allowedLevels: ['admin', 'moderator', 'user']`

### 관리자 전용
- 업체 관리, 패키지 관리, 품목 관리 등
- `allowedLevels: ['admin', 'moderator']`

### Admin만
- 팀 멤버 추가 등
- `allowedLevels: ['admin']`

## 구현 방법

기본적으로 `withAuth` HOC를 사용하여 구현합니다.
필요시 직접 구현 패턴도 제공할 수 있습니다.

참고: `/check-permissions` 커맨드로 상세 가이드를 확인하세요.
