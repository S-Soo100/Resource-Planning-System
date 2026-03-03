import { test, expect } from "@playwright/test";

test.describe("인증 플로우", () => {
  // 이 테스트는 인증 setup을 사용하지 않고 직접 로그인 테스트
  test.use({ storageState: { cookies: [], origins: [] } });

  test("로그인 페이지가 정상 표시된다", async ({ page }) => {
    await page.goto("/signin");
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("잘못된 자격증명으로 로그인 실패", async ({ page }) => {
    await page.goto("/signin");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("이메일").fill("wrong@example.com");
    await page.getByLabel("비밀번호").fill("wrongpassword");
    // Enter 키로 폼 제출 (버튼 안정성 문제 회피)
    await page.getByLabel("비밀번호").press("Enter");

    // 로그인 실패 시 signin 페이지에 남아있어야 함
    await expect(page).toHaveURL(/signin/, { timeout: 5000 });
  });

  test("올바른 자격증명으로 로그인 성공 후 페이지 이동", async ({ page }) => {
    await page.goto("/signin");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("이메일").fill(process.env.E2E_ADMIN_ID!);
    await page.getByLabel("비밀번호").fill(process.env.E2E_ADMIN_PW!);
    await page.getByLabel("비밀번호").press("Enter");

    // 로그인 성공 시 signin 페이지를 벗어남 (team-select 또는 메인 페이지)
    await expect(page).not.toHaveURL(/signin/, { timeout: 15000 });
  });

  test("미인증 사용자는 보호된 페이지에 접근할 수 없다", async ({ page }) => {
    await page.goto("/stock");
    // 로그인 필요 안내 메시지가 표시되어야 함
    await expect(page.getByText("로그인이 필요합니다")).toBeVisible({
      timeout: 10000,
    });
  });
});
