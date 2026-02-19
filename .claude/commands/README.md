# Claude Code 커스텀 커맨드

이 디렉토리에는 KARS 프로젝트 전용 Claude Code 슬래시 커맨드가 포함되어 있습니다.

## 📝 사용 가능한 커맨드

### `/update-changelog` - 업데이트 기록 자동 작성

최근 git 커밋들을 분석하여 CHANGELOG.md에 새 버전 항목을 자동으로 추가하고, 버전 번호를 올립니다.

#### 사용 방법

```bash
# 대화형 모드 (버전 유형을 물어봄)
/update-changelog

# 직접 버전 유형 지정
/update-changelog patch    # 1.16.1 → 1.16.2 (버그 수정, 작은 개선)
/update-changelog minor    # 1.16.1 → 1.17.0 (새 기능, 큰 개선)
/update-changelog major    # 1.16.1 → 2.0.0 (대규모 변경)
```

#### 동작 방식

1. **최근 커밋 분석**: `git log`로 최근 20개 커밋 확인
2. **변경 유형 자동 분류**: 커밋 메시지의 접두사 기반
   - `feat:`, `feature:` → 추가됨
   - `fix:`, `bugfix:` → 수정됨
   - `refactor:`, `improve:` → 개선됨
   - `security:`, `sec:` → 보안
   - `remove:`, `delete:` → 제거됨
   - `change:`, `update:` → 변경됨
3. **버전 증가**: 사용자가 선택한 유형에 따라 자동 증가
4. **파일 업데이트**:
   - `CHANGELOG.md`: Keep a Changelog 형식으로 새 버전 섹션 추가
   - `src/constants/version.ts`: `APP_VERSION` 업데이트
5. **확인 및 커밋**: 변경사항 확인 후 선택적으로 커밋

#### 예시 출력

```markdown
## v1.17.0 (2026-01-23)

### 추가됨 (Added)

- **업데이트 자동화 커맨드**: 최근 커밋 분석하여 CHANGELOG 자동 생성
  - git log 분석 및 변경 유형 자동 분류
  - 버전 번호 자동 증가 (patch/minor/major)
  - Keep a Changelog 형식 준수

### 개선됨 (Improved)

- **개발자 경험 향상**: 수동 작업 최소화로 업데이트 관리 효율화
```

---

### `/design-review` - 디자인 패턴 검토 및 수정

파일의 하드코딩된 색상, 잘못된 shape, 구버전 패턴을 감지하여 KARS MD3 디자인 토큰으로 수정합니다.

#### 사용 방법

```bash
/design-review                               # 대화형 모드
/design-review src/app/some/page.tsx         # 특정 파일 검토
/design-review src/components/admin/         # 디렉토리 내 전체 검토
```

#### 감지 항목

- `bg-gray-*`, `bg-blue-*`, `bg-purple-*` → Primary/Back 토큰
- `text-gray-*` → Text-Highest-100 / Text-Low-70
- `rounded-lg` (카드) → `rounded-2xl` / `rounded-full` / `rounded-3xl`
- 그라디언트 탭 → Segment Control 패턴
- `bg-yellow-50` (폼) → `bg-Back-Low-10`

---

### `/design-apply` - 디자인 패턴 보일러플레이트 생성

새 파일 작성 시 KARS MD3 디자인 시스템이 적용된 보일러플레이트를 생성합니다.

#### 사용 방법

```bash
/design-apply                  # 대화형 (유형 선택)
/design-apply page             # 기본 페이지
/design-apply page admin       # Admin/Moderator 전용 페이지
/design-apply card             # 카드 컴포넌트
/design-apply table            # Excel-style 테이블
/design-apply modal            # 모달 컴포넌트
/design-apply segment          # Segment Control
/design-apply form             # 입력 폼
/design-apply empty            # 빈 상태(Empty State)
/design-apply badge            # 배지/태그 모음
```

---

## 🔧 커맨드 추가 방법

새로운 커스텀 커맨드를 추가하려면:

1. `.claude/commands/` 디렉토리에 `your-command.md` 파일 생성
2. 커맨드 설명과 실행할 작업을 마크다운으로 작성
3. Claude Code 재시작 (필요 시)
4. `/your-command` 형식으로 사용

## 📚 더 알아보기

- [Claude Code 공식 문서](https://github.com/anthropics/claude-code)
- [Slash Commands 가이드](https://docs.anthropic.com/claude-code/slash-commands)
