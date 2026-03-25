import { test, expect } from "@playwright/test";

test.describe("Smoke Tests - 핵심 페이지 접근", () => {
  test("메인 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // 환영 메시지 또는 메인 콘텐츠 확인
    await expect(page.getByText(/환영합니다/)).toBeVisible({
      timeout: 10000,
    });
  });

  test("재고 현황 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/stock");
    await expect(page).toHaveURL(/stock/);
    await page.waitForLoadState("networkidle");
  });

  test("입출고 내역 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/ioHistory");
    await expect(page).toHaveURL(/ioHistory/);
    await page.waitForLoadState("networkidle");
  });

  test("판매 기록 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/salesRecord");
    await expect(page).toHaveURL(/salesRecord/);
    await page.waitForLoadState("networkidle");
  });

  test("판매 내역 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/sales");
    await expect(page.getByRole("heading", { name: /판매 내역/ })).toBeVisible({
      timeout: 10000,
    });
  });
});
