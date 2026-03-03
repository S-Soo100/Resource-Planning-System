import { test, expect } from "@playwright/test";

test.describe("입출고 모달 - 고객 선택 조건부 표시", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ioHistory");
    await page.waitForLoadState("networkidle");
  });

  test("입고 모달에서 구매 입고 선택 시 고객 선택이 표시된다", async ({
    page,
  }) => {
    // 입고 버튼 클릭 (첫 번째 창고)
    const inboundBtn = page.getByRole("button", { name: /입고/ }).first();
    if (await inboundBtn.isVisible()) {
      await inboundBtn.click();
      // 구매 입고가 기본 선택 → 고객 선택 필수 표시
      await expect(page.getByText("고객 선택")).toBeVisible();
    }
  });

  test("입고 모달에서 재고 조정 선택 시 고객 선택이 숨겨진다", async ({
    page,
  }) => {
    const inboundBtn = page.getByRole("button", { name: /입고/ }).first();
    if (await inboundBtn.isVisible()) {
      await inboundBtn.click();
      // 재고 조정 선택
      await page.getByRole("button", { name: "재고 조정" }).click();
      // 고객 선택이 사라져야 함
      await expect(page.getByText("고객 선택")).not.toBeVisible();
      // 입고처 폼은 바로 표시되어야 함
      await expect(page.getByPlaceholder("입고처를 입력하세요")).toBeVisible();
    }
  });

  test("출고 모달에서 창고 간 이동 선택 시 고객 선택이 숨겨진다", async ({
    page,
  }) => {
    const outboundBtn = page.getByRole("button", { name: /출고/ }).first();
    if (await outboundBtn.isVisible()) {
      await outboundBtn.click();
      // 창고 간 이동 선택
      await page.getByRole("button", { name: "창고 간 이동" }).click();
      // 고객 선택이 사라져야 함
      await expect(page.getByText("고객 선택")).not.toBeVisible();
      // 출고처 폼은 바로 표시되어야 함
      await expect(page.getByPlaceholder("출고처를 입력하세요")).toBeVisible();
    }
  });
});
