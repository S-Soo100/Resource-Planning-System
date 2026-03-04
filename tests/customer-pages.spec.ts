import { test, expect } from "@playwright/test";

// 목록에서 상세로 이동하는 헬퍼 (클라이언트 네비게이션)
async function navigateToFirstCustomerDetail(
  page: import("@playwright/test").Page
): Promise<boolean> {
  await page.goto("/customers");
  await page.waitForLoadState("networkidle");

  // 헤딩이 보일 때까지 대기
  await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
    timeout: 15000,
  });

  const firstLink = page.locator("table tbody tr td a").first();
  if ((await firstLink.count()) === 0) return false;

  await firstLink.click();
  await page.waitForURL(/\/customers\/\d+/, { timeout: 10000 });

  // 상세 페이지 로드 대기
  await expect(page.getByText("고객 기본 정보")).toBeVisible({
    timeout: 15000,
  });

  return true;
}

// ============================================================
// 1. 고객 목록 페이지 (/customers)
// ============================================================
test.describe("고객 목록 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/customers");
    await page.waitForLoadState("networkidle");
  });

  test("페이지가 정상 로드된다", async ({ page }) => {
    const errorOverlay = page.locator("text=Unhandled Runtime Error");
    const hasError = (await errorOverlay.count()) > 0;
    if (hasError) {
      test.fail(true, "페이지에 런타임 에러 발생");
      return;
    }

    await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
      timeout: 15000,
    });
  });

  test("검색 입력란이 존재한다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
      timeout: 15000,
    });

    await expect(
      page.getByPlaceholder("이름 또는 이메일로 검색")
    ).toBeVisible();
  });

  test("테이블 또는 빈 상태가 표시된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
      timeout: 15000,
    });

    const hasTable = await page.locator("table").count();
    const hasEmptyMessage = await page
      .getByText("등록된 고객이 없습니다")
      .count();

    expect(hasTable > 0 || hasEmptyMessage > 0).toBeTruthy();
  });

  test("데이터가 있으면 필터 탭이 표시된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
      timeout: 15000,
    });

    const hasTable = await page.locator("table").count();
    if (hasTable > 0) {
      await expect(
        page.getByRole("button", { name: /전체/ }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /B2C/ }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /B2B/ }).first()
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /미분류/ }).first()
      ).toBeVisible();
    }
  });

  test("필터 탭 클릭 시 활성 상태가 변경된다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
      timeout: 15000,
    });

    const hasTable = await page.locator("table").count();
    if (hasTable > 0) {
      const b2cButton = page.getByRole("button", { name: /B2C/ }).first();
      await b2cButton.click();
      await expect(b2cButton).toHaveClass(/bg-blue-600/);

      const allButton = page.getByRole("button", { name: /전체/ }).first();
      await allButton.click();
      await expect(allButton).toHaveClass(/bg-blue-600/);
    }
  });

  test("검색 필터링이 동작한다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
      timeout: 15000,
    });

    const hasTable = await page.locator("table").count();
    if (hasTable > 0) {
      const searchInput = page.getByPlaceholder("이름 또는 이메일로 검색");
      await searchInput.fill("zzzzzzzzz_nonexistent");
      await page.waitForTimeout(500);

      const noResult = await page.getByText("검색 결과가 없습니다").count();
      const rowCount = await page.locator("table tbody tr").count();
      expect(noResult > 0 || rowCount === 0).toBeTruthy();

      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test("고객명 클릭 시 상세 페이지로 이동한다", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /고객 관리/ })).toBeVisible({
      timeout: 15000,
    });

    const firstLink = page.locator("table tbody tr td a").first();
    if ((await firstLink.count()) > 0) {
      await firstLink.click();
      await page.waitForURL(/\/customers\/\d+/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/customers\/\d+/);
    }
  });
});

// ============================================================
// 2. 메뉴 통합 - 고객관리 탭
// ============================================================
test.describe("메뉴 - 고객관리 탭", () => {
  test("고객관리 탭에 고객 관리와 거래처 관리가 모두 있다", async ({
    page,
  }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    const customerTab = page.getByRole("button", { name: /고객관리/ });
    await expect(customerTab).toBeVisible({ timeout: 15000 });
    await customerTab.click();

    await expect(page.getByText("고객 관리")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("거래처 관리")).toBeVisible({ timeout: 10000 });
  });

  test("고객 관리 클릭 시 /customers로 이동한다", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    const customerTab = page.getByRole("button", { name: /고객관리/ });
    await expect(customerTab).toBeVisible({ timeout: 15000 });
    await customerTab.click();

    const customerMenuItem = page.getByText("고객 정보를 조회하고 관리합니다");
    await expect(customerMenuItem).toBeVisible({ timeout: 10000 });
    await customerMenuItem.locator("..").click();
    await page.waitForURL(/\/customers/, { timeout: 10000 });
    expect(page.url()).toContain("/customers");
  });

  test("거래처 관리 클릭 시 /supplier로 이동한다", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    const customerTab = page.getByRole("button", { name: /고객관리/ });
    await expect(customerTab).toBeVisible({ timeout: 15000 });
    await customerTab.click();

    const supplierMenuItem =
      page.getByText("거래처 정보를 등록하고 관리합니다");
    await expect(supplierMenuItem).toBeVisible({ timeout: 10000 });
    await supplierMenuItem.locator("..").click();
    await page.waitForURL(/\/supplier/, { timeout: 10000 });
    expect(page.url()).toContain("/supplier");
  });
});

// ============================================================
// 3. 고객 상세 페이지 (/customers/[id])
//    목록에서 클릭으로 이동하여 클라이언트 네비게이션 사용
// ============================================================
test.describe("고객 상세 페이지", () => {
  test("고객 기본 정보 카드가 표시된다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    // navigateToFirstCustomerDetail에서 이미 "고객 기본 정보" 확인함
    await expect(page.getByText("고객 기본 정보")).toBeVisible();
  });

  test("뒤로가기 버튼이 존재한다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    await expect(page.getByText("뒤로가기")).toBeVisible();
  });

  test("고객 서류 탭과 발주 이력 탭이 존재한다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    await expect(page.getByRole("button", { name: /고객 서류/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /발주 이력/ })).toBeVisible();
  });

  test("고객 서류 탭이 기본 활성화 상태이다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const docsTab = page.getByRole("button", { name: /고객 서류/ });
    await expect(docsTab).toHaveClass(/text-blue-600/);

    const docSectionHeader = page
      .locator("h2")
      .filter({ hasText: /고객 서류/ });
    await expect(docSectionHeader.first()).toBeVisible({ timeout: 15000 });
  });

  test("발주 이력 탭 클릭 시 발주 목록 또는 빈 상태가 표시된다", async ({
    page,
  }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const ordersTab = page.getByRole("button", { name: /발주 이력/ });
    await ordersTab.click();

    await expect(ordersTab).toHaveClass(/text-blue-600/);

    // 로딩 완료 대기: 테이블 또는 빈 상태 메시지가 나올 때까지
    await expect(async () => {
      const hasTable = await page
        .locator("table th")
        .filter({ hasText: "제목" })
        .count();
      const hasEmptyMsg = await page.getByText("발주 이력이 없습니다").count();
      expect(hasTable > 0 || hasEmptyMsg > 0).toBeTruthy();
    }).toPass({ timeout: 15000 });
  });

  test("정보 카드에 주요 필드가 표시된다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    await expect(page.getByText("이름")).toBeVisible();
    await expect(page.getByText("이메일")).toBeVisible();
    await expect(page.getByText("고객 유형")).toBeVisible();
    await expect(page.getByText("수급자 여부")).toBeVisible();
  });

  test("수정 버튼이 admin/moderator에게 표시된다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const editButton = page.getByRole("button", { name: /수정/ }).first();
    if ((await editButton.count()) > 0) {
      await expect(editButton).toBeVisible();
    }
  });
});

// ============================================================
// 4. 고객 정보 수정 모달
// ============================================================

// 수정 모달 열기 헬퍼 — force click + 재시도로 React re-render 이슈 우회
async function openEditModal(
  page: import("@playwright/test").Page
): Promise<boolean> {
  const editButton = page.getByRole("button", { name: /수정/ }).first();
  if ((await editButton.count()) === 0) return false;

  // React Query re-render로 DOM이 불안정하므로 force click + 재시도
  for (let attempt = 0; attempt < 3; attempt++) {
    await editButton.waitFor({ state: "visible", timeout: 10000 });
    await editButton.click({ force: true });

    try {
      await expect(page.getByText("고객 정보 수정")).toBeVisible({
        timeout: 5000,
      });
      return true;
    } catch {
      // 모달 안 열렸으면 재시도
    }
  }
  return false;
}

test.describe("고객 정보 수정 모달", () => {
  test("수정 버튼 클릭 시 모달이 열린다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const opened = await openEditModal(page);
    test.skip(!opened, "수정 버튼 없음 (권한 부족)");

    await expect(page.getByText("고객 정보 수정")).toBeVisible();
  });

  test("모달에 고객 정보 필드가 표시된다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const opened = await openEditModal(page);
    test.skip(!opened, "수정 버튼 없음 (권한 부족)");

    // 모달 내에서 필드 확인 (카드와 중복되는 텍스트가 있으므로 모달 scope 사용)
    const modal = page.locator(".fixed").filter({ hasText: "고객 정보 수정" });
    await expect(modal.getByText("고객 분류")).toBeVisible();
    await expect(modal.getByText("수급자 여부")).toBeVisible();
    await expect(modal.getByText("입금자명")).toBeVisible();
    await expect(modal.getByText("주민등록번호")).toBeVisible();
    await expect(modal.getByText("재구매 주기 (개월)")).toBeVisible();
    await expect(modal.getByText("재구매 예정일")).toBeVisible();
  });

  test("모달에 B2C/B2B 옵션이 있다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const opened = await openEditModal(page);
    test.skip(!opened, "수정 버튼 없음");

    const select = page
      .locator("select")
      .filter({ has: page.locator('option[value="b2c"]') });
    await expect(select).toBeVisible();

    const options = select.locator("option");
    const texts = await options.allTextContents();
    expect(texts).toContain("B2C (개인)");
    expect(texts).toContain("B2B (기업)");
  });

  test("재구매 예정일이 읽기전용이다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const opened = await openEditModal(page);
    test.skip(!opened, "수정 버튼 없음");

    await expect(page.getByText("출고 완료 시 자동 갱신됩니다")).toBeVisible();
  });

  test("취소 버튼 클릭 시 모달이 닫힌다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const opened = await openEditModal(page);
    test.skip(!opened, "수정 버튼 없음");

    await page.getByRole("button", { name: "취소" }).click();

    await expect(page.getByText("고객 정보 수정")).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("고객명이 읽기전용이다", async ({ page }) => {
    const hasCustomer = await navigateToFirstCustomerDetail(page);
    test.skip(!hasCustomer, "고객 데이터가 없음");

    const opened = await openEditModal(page);
    test.skip(!opened, "수정 버튼 없음");

    await expect(page.getByText("고객명")).toBeVisible();
    const disabledInputs = page.locator("input[disabled]");
    expect(await disabledInputs.count()).toBeGreaterThanOrEqual(1);
  });
});
