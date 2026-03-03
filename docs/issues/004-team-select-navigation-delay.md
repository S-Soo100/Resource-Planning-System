# [Improvement] 팀 선택 후 메인 페이지 네비게이션 지연 개선

- **유형**: Improvement
- **우선순위**: P3
- **영역**: 팀 선택 / 네비게이션 / 성능
- **상태**: 열림
- **발견 경위**: E2E 테스트 실제 브라우저 검증 중 발견

---

## 현재 동작

팀 선택 페이지(`/team-select`)에서 팀 카드를 클릭하면 "선택된 팀이 있습니다. 메뉴로 이동합니다" 로딩 화면이 표시되지만, **실제 메인 페이지로 이동까지 30초 이상** 소요되는 경우가 있다.

특히 dev 서버(webpack) 환경에서 첫 접근 시 메인 페이지 컴파일 시간이 길어서 로딩 화면이 장시간 지속됨.

## 개선 후 동작

팀 선택 후 메인 페이지로의 전환이 빠르게 이루어지거나, 긴 로딩 시에는 진행 상태 피드백을 제공.

## 개선 이유

- 첫 로그인 후 팀 선택 시 30초+ 대기는 UX 저하
- E2E 테스트에서 90초 타임아웃이 필요하여 테스트 시간 증가
- "잠시만 기다려주세요..." 메시지만으로는 진행 상태를 알 수 없음

## 관찰된 상황

| 환경 | 네비게이션 시간 | 비고 |
|---|---|---|
| Turbopack dev 서버 | ~5초 | 빠름 |
| webpack dev 서버 (첫 접근) | 30~60초 | 메인 페이지 첫 컴파일 |
| webpack dev 서버 (재접근) | ~5초 | 캐시됨 |
| 프로덕션 (Vercel) | ~2초 | 사전 빌드됨 |

## 완료 조건 (Acceptance Criteria)

- [ ] 팀 선택 후 로딩 화면에 타임아웃 처리 추가 (30초 초과 시 재시도 안내)
- [ ] 또는: 로딩 중 프로그레스 바/단계 표시 (API 호출 → 데이터 로드 → 페이지 전환)
- [ ] 또는: 팀 선택 로직 최적화 (prefetch, 병렬 로딩)

## 제안 해결 방안

### 방안 1: Next.js prefetch 활용

```typescript
// 팀 카드 hover 시 메인 페이지를 미리 prefetch
import { useRouter } from "next/navigation";

const router = useRouter();

const handleTeamHover = () => {
  router.prefetch("/"); // 메인 페이지 미리 컴파일
};
```

### 방안 2: 로딩 타임아웃 + 재시도

```typescript
// 15초 이상 걸리면 재시도 버튼 표시
const [showRetry, setShowRetry] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowRetry(true), 15000);
  return () => clearTimeout(timer);
}, []);
```

### 방안 3: Skeleton UI로 빠른 피드백

메인 페이지 로딩 중 skeleton UI를 표시하여 체감 로딩 시간 감소.

## 기술 분석

- **수정 파일**: `src/app/team-select/page.tsx` 또는 팀 선택 컴포넌트
- **근본 원인**: dev 서버에서 페이지 최초 컴파일 시간 (프로덕션에서는 사전 빌드)
- **예상 작업량**: S
