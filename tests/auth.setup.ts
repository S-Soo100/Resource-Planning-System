import { test as setup, expect } from "@playwright/test";

const authFile = "tests/.auth/user.json";

setup("로그인 후 인증 상태 저장", async ({ page }) => {
  // 로그인 페이지 이동
  await page.goto("/signin");

  // 이메일, 비밀번호 입력
  await page.getByLabel("이메일").fill(process.env.E2E_ADMIN_ID!);
  await page.getByLabel("비밀번호").fill(process.env.E2E_ADMIN_PW!);

  // 로그인 버튼 클릭
  await page.getByRole("button", { name: "로그인" }).click();

  // 팀 선택 페이지로 리다이렉트 확인
  await expect(page).toHaveURL(/team-select/, { timeout: 15000 });

  // 인증 상태 저장 (쿠키 + localStorage)
  await page.context().storageState({ path: authFile });
});
