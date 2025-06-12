# Changelog

모든 주목할 만한 변경사항이 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 기반으로 하며,
이 프로젝트는 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)을 준수합니다.

## [1.3.0] - 2025-06-11

### 추가됨 (Added)

- /ioHistory 페이지에 입고/출고 버튼 및 기능 추가
- 입고/출고 처리 후 실시간 기록 반영 기능
- 입고/출고 기록 조회와 작업이 한 페이지에서 가능한 통합 UI
- AttachedFile 타입을 공통 타입으로 분리하여 재사용성 향상

### 변경됨 (Changed)

- /stock 페이지에서 입고/출고 버튼 제거 (재고 조회/수정 기능만 유지)
- /stock 페이지의 카테고리 토글이 기본적으로 열린 상태로 변경
- 입고/출고 기능을 /ioHistory 페이지로 이동하여 논리적 구조 개선
- AttachedFile 타입을 `/src/types/common.ts`로 이동

### 수정됨 (Fixed)

- 출고 관련 모든 메시지에서 "발주" → "출고" 워딩 수정
- 출고 모달 제목 및 버튼 텍스트 정확성 개선
- TypeScript 빌드 에러 해결 (AttachedFile 타입 import 오류)
- 출고 처리 시 일관된 용어 사용으로 사용자 혼란 방지

### 개선됨 (Improved)

- 사용자 경험 향상: 입출고 작업과 이력 확인이 한 곳에서 가능
- 코드 구조 개선: 관심사 분리를 통한 유지보수성 향상
- 즉시 반영: 입고/출고 처리 후 바로 기록 목록에서 확인 가능
- 타입 일관성: 공통 타입 사용으로 코드 중복 제거

### 보안 (Security)

- 입고/출고 기능에서 권한 제어 유지 (user 권한은 버튼 숨김)

## [1.2.0] - 2025-05-31

### 추가됨 (Added)

- 사용자별 창고 접근 권한 관리 시스템 (`restrictedWhs`) 구현
- UserManagementModal에 창고 접근 제한 설정 UI 추가
- 창고 권한 체크 유틸리티 함수 (`utils/warehousePermissions.ts`) 추가
- 권한 기반 창고 필터링 기능 (useWarehouseItems 훅에 통합)
- 발주 시스템에서 권한 기반 창고 접근 제어
- 발주 기록에서 권한 기반 데이터 필터링

### 변경됨 (Changed)

- IOrderRecord 타입에 warehouseId 필드 추가
- NewUserForm 인터페이스에 restrictedWhs 필드 추가
- OrderRequestForm에서 접근 불가 창고 비활성화 처리
- UserManagementModal 크기를 lg로 확대하여 창고 선택 UI 공간 확보
- 사용자 역할별 권한 체계 재정의 (Admin, Moderator, User, Supplier)

### 개선됨 (Improved)

- 사용자 생성 시 창고 접근 권한을 직관적으로 설정할 수 있는 체크박스 UI
- 접근 불가능한 창고 선택 시 명확한 에러 메시지 표시
- 권한에 따른 시각적 구분 (비활성화, 색상 변경 등)
- 타입 안전성 강화 및 TypeScript 일관성 개선

### 보안 (Security)

- 창고 접근 권한 검증 로직을 프론트엔드와 백엔드에서 이중으로 적용
- Admin이 아닌 사용자의 데이터 접근 범위 제한 강화

## [1.1.0] - 2025-05-23

### 추가됨 (Added)

- 발주 요청 후 부드러운 페이지 전환 기능
- 발주 상세 정보 확장 표시 기능
- 발주 요청 완료 후 자동 페이지 이동 기능

### 변경됨 (Changed)

- 발주 완료 후 재고 자동 반영 로직 개선

### 개선됨 (Improved)

- 발주 요청 UX 개선 (로딩 표시 추가)
- 발주 기록 페이지 사용성 향상

## [1.0.0] - 2025-04-29

### 추가됨 (Added)

- 초기 KARS 시스템 출시
- 재고 관리 시스템
- 발주 관리 시스템
- 패키지 관리 시스템
- 사용자 관리 시스템
- 역할 기반 접근 제어 (RBAC)
- 실시간 재고 업데이트
- 재고 알림 시스템
- 카테고리별 재고 관리
- 반응형 디자인
- 모바일 최적화

### 기술 스택 (Tech Stack)

- React 18.2.0
- TypeScript 5
- Next.js 15.1.3
- Tailwind CSS 3.4.1
- Zustand 5.0.3
- TanStack React Query 5.71.1
- Axios 1.7.9
- Lucide React 0.469.0

---

## 형식 안내

- **추가됨 (Added)**: 새로운 기능
- **변경됨 (Changed)**: 기존 기능의 변경사항
- **더 이상 사용되지 않음 (Deprecated)**: 곧 제거될 기능
- **제거됨 (Removed)**: 이번 버전에서 제거된 기능
- **수정됨 (Fixed)**: 버그 수정
- **보안 (Security)**: 보안 관련 변경사항
- **개선됨 (Improved)**: 기존 기능의 개선사항
