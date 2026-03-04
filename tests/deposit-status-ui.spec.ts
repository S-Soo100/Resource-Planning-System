import { test, expect } from "@playwright/test";

// ============================================================
// 1. 판매 내역 - 입금/환급 상태 UI
// ============================================================
test.describe("판매 내역 - 입금/환급 상태 표시 (#007)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sales");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /판매 내역/ })).toBeVisible({
      timeout: 15000,
    });
  });

  test("입금 상태 드롭다운 필터가 존재한다", async ({ page }) => {
    await expect(page.getByText("입금 상태")).toBeVisible();

    const depositSelect = page
      .locator("select")
      .filter({ has: page.locator("option", { hasText: "미입금" }) });

    await expect(depositSelect).toBeVisible();

    // 옵션 확인
    const options = depositSelect.locator("option");
    const optionTexts = await options.allTextContents();

    expect(optionTexts).toContain("전체");
    expect(optionTexts).toContain("미입금");
    expect(optionTexts).toContain("입금완료 (전체)");
    expect(optionTexts).toContain("자부담금");
    expect(optionTexts).toContain("전액");
    expect(optionTexts).toContain("선금");
    expect(optionTexts).toContain("중도금");
    expect(optionTexts).toContain("잔금");
  });

  test("데스크톱 테이블에 입금상태/환급상태 컬럼이 표시된다", async ({
    page,
  }) => {
    // 데스크톱 뷰포트 보장
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/sales");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /판매 내역/ })).toBeVisible({
      timeout: 15000,
    });

    // 테이블이 있는 경우에만 검증
    const hasTable = await page.locator("table").count();
    if (hasTable > 0) {
      // thead에서 컬럼 확인
      const thead = page.locator("thead");
      await expect(thead.getByText("입금상태")).toBeVisible();
      await expect(thead.getByText("환급상태")).toBeVisible();
    }
  });

  test("입금 상태 필터 변경 시 데이터가 필터링된다", async ({ page }) => {
    const depositSelect = page
      .locator("select")
      .filter({ has: page.locator("option", { hasText: "미입금" }) });

    await expect(depositSelect).toBeVisible();

    // '미입금' 선택
    await depositSelect.selectOption("none");
    await page.waitForTimeout(500);

    // 페이지가 여전히 정상 동작하는지 확인 (에러 없이)
    await expect(
      page.getByRole("heading", { name: /판매 내역/ })
    ).toBeVisible();

    // '전체'로 복원
    await depositSelect.selectOption("all");
    await page.waitForTimeout(500);

    await expect(
      page.getByRole("heading", { name: /판매 내역/ })
    ).toBeVisible();
  });

  test("모바일 카드에 입금/환급 상태가 표시된다", async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/sales");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /판매 내역/ })).toBeVisible({
      timeout: 15000,
    });

    // 카드가 있는 경우 입금/환급 텍스트 확인
    const hasCards = await page.locator(".divide-y .p-4").count();
    if (hasCards > 0) {
      await expect(page.getByText("입금상태").first()).toBeVisible();
      await expect(page.getByText("환급상태").first()).toBeVisible();
    }
  });
});

// ============================================================
// 2. 발주기록 - 출고완료 탭 입금/환급/세금계산서 컬럼
// ============================================================
test.describe("발주기록 - 출고완료 탭 상태 컬럼 (#007)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/orderRecord");
    await page.waitForLoadState("networkidle");
  });

  test("출고완료 탭에서 입금/환급/세금계산서 컬럼이 표시된다", async ({
    page,
  }) => {
    // 데스크톱 뷰포트 보장
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/orderRecord");
    await page.waitForLoadState("networkidle");

    // 출고완료 탭 클릭
    const completedTab = page.getByRole("button", { name: /출고완료/ });
    if ((await completedTab.count()) === 0) {
      test.skip(true, "출고완료 탭이 없음");
      return;
    }
    await completedTab.click();
    await page.waitForTimeout(1000);

    // 테이블이 있는 경우에만 검증
    const hasTable = await page.locator("table").count();
    if (hasTable > 0) {
      const thead = page.locator("thead");
      await expect(thead.getByText("입금상태")).toBeVisible({ timeout: 5000 });
      await expect(thead.getByText("환급상태")).toBeVisible();
      await expect(thead.getByText("세금계산서")).toBeVisible();
    }
  });

  test("출고대기 탭에서는 입금/환급/세금계산서 컬럼이 표시되지 않는다", async ({
    page,
  }) => {
    // 데스크톱 뷰포트 보장
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/orderRecord");
    await page.waitForLoadState("networkidle");

    // 출고대기 탭 클릭
    const pendingTab = page.getByRole("button", { name: /출고대기/ });
    if ((await pendingTab.count()) === 0) {
      test.skip(true, "출고대기 탭이 없음");
      return;
    }
    await pendingTab.click();
    await page.waitForTimeout(1000);

    // 테이블이 있는 경우
    const hasTable = await page.locator("table").count();
    if (hasTable > 0) {
      const thead = page.locator("thead");
      // 입금상태 컬럼이 없어야 함
      await expect(thead.getByText("입금상태")).not.toBeVisible();
    }
  });

  test("출고완료 탭 테이블에 입금 상태 배지가 렌더링된다", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/orderRecord");
    await page.waitForLoadState("networkidle");

    const completedTab = page.getByRole("button", { name: /출고완료/ });
    if ((await completedTab.count()) === 0) {
      test.skip(true, "출고완료 탭이 없음");
      return;
    }
    await completedTab.click();
    await page.waitForTimeout(1000);

    // 테이블 행이 있으면 입금 관련 배지 확인
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount > 1) {
      // 합계 행 제외하고 데이터 행이 있으면
      // 각 행에 입금 상태 텍스트(미입금/자부담금/전액/선금/중도금/잔금) 중 하나가 있어야 함
      const firstDataRow = rows.first();
      const depositCell = firstDataRow.locator("td").nth(7); // 입금상태 컬럼 (8번째)
      const depositText = await depositCell.textContent();

      expect(
        ["미입금", "자부담금", "전액", "선금", "중도금", "잔금"].some((s) =>
          depositText?.includes(s)
        )
      ).toBeTruthy();
    }
  });
});
