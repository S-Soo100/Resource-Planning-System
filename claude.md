# KARS - Claude Code 설정

## 프로젝트 정보
- **이름**: KARS (Kangsters Auto Resource-management System)
- **기술 스택**: React 18.2.0, TypeScript, Next.js 15.1.3, Tailwind CSS, Ant Design
- **상태 관리**: Zustand, React Query (@tanstack/react-query)

## 코딩 스타일
- React 함수형 컴포넌트 사용
- TypeScript strict 모드
- PascalCase for 컴포넌트, camelCase for 훅, kebab-case for 타입 파일
- Tailwind CSS 클래스 우선 사용

## 명명 규칙
- 컴포넌트: `OrderRequestForm.tsx`, `UserManagementModal.tsx`
- 훅: `useOrder.ts`, `useAuth.ts` (use 접두사 필수)
- 타입: `order-record.ts`, `inventory-record.ts`

## 중요 규칙
1. 친근한 반말 어투로 대화
2. 불확실한 내용은 명확히 표시
3. 단계적 사고 과정으로 답변
4. 한국어로 응답

## 기능별 참조 문서
기능 수정 또는 확장 시 반드시 해당 문서를 먼저 확인:

### 판매 & 구매 관리
- **판매 관리**: `/docs/sales-management.md`
  - 판매 내역 조회 및 분석
  - 거래명세서 출력 (인쇄/PDF)
  - 부가세 계산 로직 (10%)
  - 엑셀 다운로드

- **구매 관리**: `/docs/purchase-management.md`
  - 구매 내역 조회 및 분석
  - 원가 정보 관리
  - 엑셀 다운로드

### 발주 & 시연 관리
- **발주 관리**: `/docs/order-management.md` (작성 필요)
- **시연 관리**: `/docs/demonstration-management.md` (작성 필요)

### 재고 관리
- **입고 관리**: `/docs/inbound-management.md` (작성 필요)
- **출고 관리**: `/docs/outbound-management.md` (작성 필요)
- **재고 현황**: `/docs/inventory-management.md` (작성 필요)

### 기준 정보
- **품목 관리**: `/docs/item-management.md` (작성 필요)
- **창고 관리**: `/docs/warehouse-management.md` (작성 필요)
- **공급처 관리**: `/docs/supplier-management.md` (작성 필요)

## API 및 데이터 관리
- React Query 사용: `['resource', params]` 키 구조
- Axios로 API 통신
- JWT 인증, Zustand 상태 관리

## 날짜 처리 규칙
- 빈 값 입력 시 `undefined` 반환 (빈 문자열 금지)
- 서버 전송 전 undefined 필드 제거
- KST 시간대 형식: `YYYY-MM-DDTHH:MM:SS+09:00`

## 권한 시스템
- Admin: 모든 기능 접근
- Moderator: 읽기 전용 + 발주 승인
- User: 기본 기능
- Supplier: 발주 관련만

## 테마 색상
- 일반 기능: 파란색 계열 (`blue-500`, `blue-600`)
- 휠체어 발주: 보라색 계열 (`purple-500`, `purple-600`)
- 경고/에러: 빨간색 계열 (`red-500`, `red-600`)

## 주요 명령어
```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트
npm run lint
```

## 업데이트 관리

### 자동 업데이트 (권장)
`/update-changelog` 커맨드 사용:
```bash
# 대화형 모드
/update-changelog

# 버전 유형 직접 지정
/update-changelog patch    # 버그 수정 (1.16.1 → 1.16.2)
/update-changelog minor    # 새 기능 (1.16.1 → 1.17.0)
/update-changelog major    # 대규모 변경 (1.16.1 → 2.0.0)
```

커맨드가 자동으로 처리:
- 최근 커밋 분석 및 변경사항 분류
- CHANGELOG.md에 새 버전 섹션 추가
- src/constants/version.ts 버전 업데이트
- /update 페이지는 CHANGELOG.md에서 자동 생성됨

### 수동 업데이트
변경 시 반드시 업데이트:
1. `CHANGELOG.md` - Keep a Changelog 형식 준수
2. `src/constants/version.ts` - APP_VERSION 업데이트
3. `/update` 페이지는 자동 생성 (수정 불필요)
4. `/docs` 폴더 문서 (비즈니스 로직 변경 시)
5. 커밋 전 빌드 테스트 필수 (`npm run build`)