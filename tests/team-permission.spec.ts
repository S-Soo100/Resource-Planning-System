import { test, expect } from "@playwright/test";

test.describe("E-015: 팀 권한 기반 메뉴/페이지 접근 검증", () => {
  test("메인 메뉴 탭이 정상 렌더링된다 (admin 권한)", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // 환영 메시지 확인
    await expect(page.getByText(/환영합니다/)).toBeVisible({ timeout: 10000 });

    // 기본 탭들이 모두 보여야 함
    await expect(page.getByRole("button", { name: "재고 관리" })).toBeVisible();
    await expect(page.getByRole("button", { name: "고객관리" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "발주 & 시연" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "판매 & 구매" })
    ).toBeVisible();
    // admin/moderator에게만 보이는 관리 탭
    await expect(
      page.getByRole("button", { name: "관리", exact: true })
    ).toBeVisible();
  });

  test("메인 메뉴에서 캘린더 버튼이 보인다 (non-supplier)", async ({
    page,
  }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/환영합니다/)).toBeVisible({ timeout: 10000 });

    // 캘린더 버튼 확인 (supplier가 아니면 보여야 함)
    await expect(page.getByRole("button", { name: /캘린더/ })).toBeVisible();
  });

  test("캘린더 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/calendar");
    await page.waitForLoadState("networkidle");

    // 캘린더 헤더가 보여야 함
    await expect(page.getByRole("heading", { name: "캘린더" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("입출고 내역 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/ioHistory");
    await page.waitForLoadState("networkidle");

    // 페이지가 로드되고 리다이렉트되지 않아야 함
    await expect(page).toHaveURL(/ioHistory/, { timeout: 10000 });
  });

  test("사용법 안내 페이지에서 권한 정보가 표시된다", async ({ page }) => {
    await page.goto("/how-to-use");
    await page.waitForLoadState("networkidle");

    // 현재 권한 정보가 표시되어야 함
    await expect(page.getByText("현재 권한:")).toBeVisible({ timeout: 10000 });
  });

  test("내 계정 페이지에서 권한 레벨이 표시된다", async ({ page }) => {
    await page.goto("/account");
    await page.waitForLoadState("networkidle");

    // 권한 레벨 섹션이 보여야 함
    await expect(page.getByRole("heading", { name: "권한 레벨" })).toBeVisible({
      timeout: 10000,
    });
  });

  test("재고 관리 페이지에서 창고 목록이 정상 로드된다", async ({ page }) => {
    await page.goto("/stock");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/stock/);

    // 창고 관련 UI가 로드되어야 함 (에러 없이)
    // 페이지가 크래시하지 않으면 warehousePermissions 리팩토링이 정상 동작
    await page.waitForTimeout(2000);
    // JS 에러가 없어야 함
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    expect(errors.length).toBe(0);
  });

  test("발주 기록 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/orderRecord");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/orderRecord/);
  });

  test("메인 메뉴 탭 전환이 정상 동작한다", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/환영합니다/)).toBeVisible({ timeout: 10000 });

    // 각 탭 클릭 시 에러 없이 전환되어야 함
    await page.getByRole("button", { name: "고객관리" }).click();
    await expect(page.getByText("고객 관리")).toBeVisible();

    await page.getByRole("button", { name: "발주 & 시연" }).click();
    await expect(page.getByText("발주 시작하기")).toBeVisible();

    await page.getByRole("button", { name: "판매 & 구매" }).click();
    await expect(page.getByText("구매 내역")).toBeVisible();

    await page.getByRole("button", { name: "관리", exact: true }).click();
    await expect(page.getByText("팀 멤버 관리")).toBeVisible();

    // 재고 관리 탭으로 돌아오기
    await page.getByRole("button", { name: "재고 관리" }).click();
    await expect(page.getByText("재고 조회")).toBeVisible();
  });
});
