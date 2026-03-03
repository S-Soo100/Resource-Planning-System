# [Bug] 로그인 페이지 버튼 하이드레이션 불안정 (element not stable)

- **유형**: Bug
- **우선순위**: P3
- **영역**: 인증 / UI
- **상태**: 완료
- **발견 경위**: E2E 테스트 실제 브라우저 검증 중 발견
- **해결일**: 2026-03-03
- **적용 방안**: 방안 2 (framer-motion infinite 애니메이션 → CSS keyframes 교체)

---

## 버그 설명

`/signin` 페이지에서 로그인 버튼이 React 하이드레이션 과정에서 "not stable" 상태가 지속되어, 자동화 도구(Playwright)에서 클릭 액션이 60초 타임아웃으로 실패한다.

## 재현 단계

1. 브라우저에서 `/signin` 페이지 접근
2. 이메일, 비밀번호 입력
3. 로그인 버튼 클릭 시도
4. 버튼이 "not stable" 상태로 클릭 불가 (자동화 환경)

## Playwright 에러 로그

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '로그인' })
    - locator resolved to <button type="submit" class="...bg-Primary-Main...">로그인</button>
  - attempting click action
    34 × waiting for element to be visible, enabled and stable
       - element is not stable
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying
```

## 근본 원인 분석

1. **SSR → 하이드레이션**: Next.js가 서버에서 렌더링한 HTML을 클라이언트에서 하이드레이션할 때 버튼 요소가 교체됨
2. **애니메이션**: `framer-motion` 또는 `transition-all duration-200` CSS가 요소의 위치/크기를 변경하여 stability 체크 실패
3. **DOM 교체**: 하이드레이션 중 버튼이 detach → re-attach되면서 Playwright의 actionability 체크가 무한 재시도

## 영향 범위

- `/signin` 페이지의 로그인 버튼
- E2E 테스트 자동화의 안정성
- 사용자 체감: 일반 사용 시에는 문제 없음 (자동화 환경에서만 발생)

## 현재 임시 조치

E2E 테스트에서 버튼 클릭 대신 `Enter` 키로 폼 제출하여 우회:

```typescript
// 기존 (실패)
await page.getByRole("button", { name: "로그인" }).click();

// 수정 (성공)
await page.getByLabel("비밀번호").press("Enter");
```

## 제안 해결 방안

### 방안 1: 하이드레이션 완료 후 버튼 활성화 (권장)

```typescript
"use client";
import { useState, useEffect } from "react";

export default function SignInPage() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <button
      type="submit"
      disabled={!isHydrated || isSubmitting}
    >
      로그인
    </button>
  );
}
```

### 방안 2: 로그인 버튼에 CSS 애니메이션 제거

```css
/* 로그인 버튼에서 transition 제거 */
.login-button {
  transition: none; /* transform, duration-200 등 제거 */
}
```

### 방안 3: E2E 전용 data-testid 추가 (임시)

```tsx
<button data-testid="login-submit" type="submit">
  로그인
</button>
```

## 기술 분석

- **수정 파일**: `src/app/signin/page.tsx` 또는 로그인 폼 컴포넌트
- **관련 CSS 클래스**: `transition-all duration-200 transform active:scale-[0.98]`
- **예상 작업량**: XS
