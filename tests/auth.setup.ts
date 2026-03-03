import { test as setup, expect } from "@playwright/test";

const authFile = "tests/.auth/user.json";

setup("로그인 후 인증 상태 저장", async ({ page }) => {
  // webpack dev 서버 첫 컴파일이 느릴 수 있으므로 충분한 타임아웃
  setup.setTimeout(120_000);

  // 로그인 페이지 이동 및 하이드레이션 완료 대기
  await page.goto("/signin");
  await page.waitForLoadState("networkidle");

  // 이메일, 비밀번호 입력
  await page.getByLabel("이메일").fill(process.env.E2E_ADMIN_ID!);
  await page.getByLabel("비밀번호").fill(process.env.E2E_ADMIN_PW!);

  // Enter 키로 폼 제출 (버튼 안정성 문제 회피)
  await page.getByLabel("비밀번호").press("Enter");

  // 로그인 후 signin이 아닌 다른 페이지로 이동 대기
  await expect(page).not.toHaveURL(/signin/, { timeout: 20000 });

  // 팀 선택 페이지인 경우 첫 번째 팀 선택
  if (page.url().includes("team-select")) {
    await page.waitForLoadState("networkidle");
    // 팀 카드 클릭 (테스트 팀)
    await page.getByText("테스트 팀").first().click();
    // 메인 대시보드 "환영합니다" 텍스트 대기 (첫 컴파일 포함 최대 90초)
    await expect(page.getByText(/환영합니다/)).toBeVisible({
      timeout: 90_000,
    });
  }

  // 인증 상태 저장 (쿠키 + localStorage)
  await page.context().storageState({ path: authFile });
});
