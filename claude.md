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

## 업데이트 필수 사항
변경 시 반드시 업데이트:
1. `CHANGELOG.md` - Keep a Changelog 형식
2. `/update` 페이지 - `src/app/update/page.tsx`
3. `/docs` 폴더 문서 (비즈니스 로직 변경 시)
4. 커밋을 해야 할 때는,빌드를 수행해보고 문제가 없다면 커밋하기