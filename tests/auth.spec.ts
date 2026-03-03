import { test, expect } from "@playwright/test";

test.describe("인증 플로우", () => {
  // 이 테스트는 인증 setup을 사용하지 않고 직접 로그인 테스트
  test.use({ storageState: { cookies: [], origins: [] } });

  test("로그인 페이지가 정상 표시된다", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  });

  test("잘못된 자격증명으로 로그인 실패", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("이메일").fill("wrong@example.com");
    await page.getByLabel("비밀번호").fill("wrongpassword");
    await page.getByRole("button", { name: "로그인" }).click();

    // 로그인 실패 시 signin 페이지에 남아있어야 함
    await expect(page).toHaveURL(/signin/, { timeout: 5000 });
  });

  test("올바른 자격증명으로 로그인 성공 후 팀 선택 페이지로 이동", async ({
    page,
  }) => {
    await page.goto("/signin");
    await page.getByLabel("이메일").fill(process.env.E2E_ADMIN_ID!);
    await page.getByLabel("비밀번호").fill(process.env.E2E_ADMIN_PW!);
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page).toHaveURL(/team-select/, { timeout: 15000 });
  });

  test("미인증 사용자는 보호된 페이지에 접근할 수 없다", async ({ page }) => {
    await page.goto("/stock");
    // 로그인 페이지로 리다이렉트되거나 로그인 모달이 표시되어야 함
    await expect(page.getByRole("button", { name: "로그인" })).toBeVisible({
      timeout: 10000,
    });
  });
});
