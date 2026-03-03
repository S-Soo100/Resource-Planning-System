import { test, expect } from "@playwright/test";

test.describe("Smoke Tests - 핵심 페이지 접근", () => {
  test("팀 선택 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/team-select");
    await expect(page.getByText("환영합니다")).toBeVisible({ timeout: 10000 });
  });

  test("팀 선택 후 메인 메뉴로 이동한다", async ({ page }) => {
    await page.goto("/team-select");
    // 첫 번째 팀 카드 클릭
    const teamCard = page.locator("[class*='cursor-pointer']").first();
    await teamCard.click();
    // 메인 메뉴 로드 확인
    await expect(page.getByText("환영합니다")).toBeVisible({ timeout: 10000 });
  });

  test("재고 현황 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/stock");
    await expect(page).toHaveURL(/stock/);
    // 페이지 콘텐츠가 로드될 때까지 대기
    await page.waitForLoadState("networkidle");
  });

  test("입출고 내역 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/ioHistory");
    await expect(page).toHaveURL(/ioHistory/);
    await page.waitForLoadState("networkidle");
  });

  test("발주 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/orderRecord");
    await expect(page).toHaveURL(/orderRecord/);
    await page.waitForLoadState("networkidle");
  });

  test("판매 내역 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/sales");
    await expect(page.getByText("판매 내역")).toBeVisible({ timeout: 10000 });
  });
});
