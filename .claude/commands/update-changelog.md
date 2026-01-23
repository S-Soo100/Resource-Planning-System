# 업데이트 기록 자동 작성

최근 git 커밋들을 분석하여 CHANGELOG.md에 새 버전 항목을 추가하고, 버전 번호를 자동으로 올립니다.

## 작업 단계

### 1. 최근 커밋 분석
- `git log --oneline -n 20` 실행하여 최근 20개 커밋 확인
- 마지막 업데이트 이후의 커밋들 식별
- 각 커밋 메시지를 분석하여 변경 유형 분류:
  - `feat:`, `feature:` → "추가됨 (Added)"
  - `fix:`, `bugfix:` → "수정됨 (Fixed)"
  - `refactor:`, `improve:` → "개선됨 (Improved)"
  - `security:`, `sec:` → "보안 (Security)"
  - `remove:`, `delete:` → "제거됨 (Removed)"
  - `change:`, `update:` → "변경됨 (Changed)"

### 2. 현재 버전 확인
- `src/constants/version.ts` 파일에서 현재 버전 읽기
- 버전 형식: `1.16.1` (major.minor.patch)

### 3. 버전 증가 결정
사용자에게 어떤 버전을 올릴지 질문:
- **patch** (1.16.1 → 1.16.2): 버그 수정, 작은 개선
- **minor** (1.16.1 → 1.17.0): 새 기능 추가, 큰 개선
- **major** (1.16.1 → 2.0.0): 대규모 변경, 하위 호환성 깨짐

### 4. CHANGELOG.md 업데이트
- 현재 날짜 자동 생성 (YYYY-MM-DD 형식)
- Keep a Changelog 형식에 맞춰 새 버전 섹션 추가
- 커밋 메시지들을 변경 유형별로 그룹화
- 제목과 상세 설명을 분리하여 가독성 있게 작성

### 5. 버전 파일 업데이트
- `src/constants/version.ts`의 `APP_VERSION` 상수 업데이트

### 6. 확인 및 커밋
- 변경된 CHANGELOG.md 내용을 사용자에게 보여주기
- 사용자가 확인 후 수정을 원하면 직접 수정 가능
- 완료되면 자동으로 커밋할지 물어보기

## 예시 출력 형식

```markdown
## v1.17.0 (2026-01-23)

### 추가됨 (Added)

- **업데이트 자동화 커맨드**: 최근 커밋 분석하여 CHANGELOG 자동 생성
  - git log 분석 및 변경 유형 자동 분류
  - 버전 번호 자동 증가 (patch/minor/major)
  - Keep a Changelog 형식 준수
  - version.ts 자동 업데이트

### 개선됨 (Improved)

- **개발자 경험 향상**: 수동 작업 최소화로 업데이트 관리 효율화
```

## 주의사항

- 커밋 메시지가 명확하지 않으면 사용자에게 확인 요청
- CHANGELOG.md 파일 맨 위 헤더 부분은 건드리지 않기
- 기존 버전 기록들은 그대로 유지
- 날짜는 한국 시간대(KST) 기준으로 생성
- 변경사항이 없으면 경고 메시지 출력

## 실행 방법

```bash
/update-changelog
```

또는 버전 유형을 직접 지정:

```bash
/update-changelog patch    # 1.16.1 → 1.16.2
/update-changelog minor    # 1.16.1 → 1.17.0
/update-changelog major    # 1.16.1 → 2.0.0
```
