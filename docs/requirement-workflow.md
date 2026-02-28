# 요구사항 관리 워크플로우

> KARS 프로젝트의 Issue-Driven Development (IDD) 가이드

## 개요

모든 작업은 **GitHub Issue에서 시작하고, PR 머지로 끝난다.**

```
요구사항 발생 → 이슈 생성 → 분석 → 브랜치 생성 → 구현 → PR → CI → 리뷰 → 머지 → 이슈 자동 닫힘
```

---

## 1. 이슈 생성

### 방법 A: GitHub에서 직접 생성

GitHub Issues 탭 → "New Issue" → 템플릿 선택:

| 템플릿 | 용도 | 라벨 |
|--------|------|------|
| **Feature Request** | 새 기능 요청 | `feature` |
| **Bug Report** | 버그 발견 | `bug` |
| **Improvement** | 기존 기능 개선 | `improvement` |
| **Epic** | 여러 작업을 묶는 상위 단위 | `epic` |

### 방법 B: Claude Code로 생성 (추천)

```bash
# 자연어로 요구사항 설명
/new-ticket 발주 목록에서 납품처별 필터가 필요해요
/new-ticket 거래명세서 총액 계산이 안 맞아요
/new-ticket epic: 재고 실사 기능

# Claude가 자동으로:
# 1. 이슈 유형 판단 (Feature/Bug/Improve/Epic)
# 2. 코드베이스 탐색하여 기술 분석
# 3. 구조화된 이슈 본문 작성
# 4. 확인 후 gh CLI로 이슈 생성
```

---

## 2. 이슈 계층 구조

```
Epic (대규모 기능, 수주 단위)
 └── Feature/Improvement (개별 기능, 1~3일 단위)
      └── 구현 (브랜치 1개 = PR 1개)
```

### Epic 예시

```
[Epic] 재고 실사 기능 (#50)
 ├── [Feature] 실사 등록 화면 (#51)
 ├── [Feature] 실사 차이 분석 (#52)
 ├── [Feature] 실사 결과 반영 (#53)
 └── [Improve] 재고 현황 조회 성능 최적화 (#54)
```

---

## 3. 이슈 크기 기준

좋은 이슈는 **1~2일 내 완료 가능**한 크기야.

| 크기 | 기준 | 예시 |
|------|------|------|
| **S** (수시간) | 단일 컴포넌트 수정 | 버튼 텍스트 변경, 필터 추가 |
| **M** (1~2일) | 여러 파일 수정 | 새 모달 추가, API 연동 |
| **L** (3일+) | **쪼개야 함** → Epic으로 전환 | 새 페이지, 대규모 리팩토링 |

---

## 4. 구현 워크플로우

### Step 1: 브랜치 생성

```bash
# 이슈 번호를 브랜치명에 포함
git checkout -b feature/42-supplier-filter    # 기능
git checkout -b fix/43-total-price-calc       # 버그
git checkout -b improve/44-order-list-perf    # 개선
```

### Step 2: 개발 & 커밋

```bash
# commitlint 규칙에 맞게 커밋 (이슈 번호 포함)
git commit -m "feat: 발주 목록 납품처 필터 추가 (#42)"
git commit -m "fix: 거래명세서 총액 계산 오류 수정 (#43)"
```

### Step 3: PR 생성

```bash
git push origin feature/42-supplier-filter
gh pr create
```

PR 본문에 `closes #42`를 포함하면 머지 시 이슈가 자동으로 닫힘.

### Step 4: CI 확인 & 리뷰

PR 생성 시 자동으로:
1. TypeScript 타입 체크
2. ESLint 검사
3. 빌드 테스트
4. Vercel Preview 배포

### Step 5: 머지

CI 통과 + 리뷰 승인 → Squash & Merge → 이슈 자동 닫힘 → Vercel 프로덕션 배포

---

## 5. 라벨 체계

### 유형 라벨

| 라벨 | 색상 | 용도 |
|------|------|------|
| `feature` | 녹색 | 새 기능 |
| `bug` | 빨간색 | 버그 |
| `improvement` | 파란색 | 개선 |
| `epic` | 보라색 | Epic |
| `chore` | 회색 | 설정/빌드 |

### 우선순위 라벨

| 라벨 | 의미 |
|------|------|
| `P0` | 긴급 - 업무 차질 |
| `P1` | 높음 - 빠른 시일 내 |
| `P2` | 보통 - 다음 릴리스 |
| `P3` | 낮음 - 여유 있을 때 |

### 영역 라벨

| 라벨 | 영역 |
|------|------|
| `order` | 발주 관리 |
| `inventory` | 재고 관리 |
| `sales` | 판매/구매 |
| `demo` | 시연 관리 |
| `team` | 팀/사용자 관리 |
| `master-data` | 기준 정보 |
| `ui` | UI/UX 전반 |

### 상태 라벨

| 라벨 | 의미 |
|------|------|
| `triage` | 분류 대기 |
| `ready` | 작업 가능 |
| `in-progress` | 작업 중 |
| `blocked` | 차단됨 (의존성) |

---

## 6. 릴리스 사이클

```
이슈들 완료 → /update-changelog 실행 → 버전 태그 → 배포
```

1. 관련 이슈들이 모두 머지되면
2. `/update-changelog minor` 실행 (커밋 분석 → CHANGELOG 자동 생성)
3. 버전 커밋 & 푸시
4. Vercel 자동 배포

---

## Quick Reference

```bash
# 티켓 생성
/new-ticket 자연어로 요구사항 설명

# 구현 시작
git checkout -b feature/이슈번호-설명

# 커밋
git commit -m "feat: 설명 (#이슈번호)"

# PR 생성
gh pr create

# 릴리스
/update-changelog minor
```
