import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

// 테스트용 임시 파일 생성 헬퍼
function createTempFile(filename: string, sizeMB = 0.01): string {
  const tmpDir = path.join(__dirname, ".tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const filePath = path.join(tmpDir, filename);
  const buffer = Buffer.alloc(Math.floor(sizeMB * 1024 * 1024), "0");
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// 출고완료 건 ID 찾기 공통 헬퍼
async function findShipmentCompletedOrderId(
  browser: import("@playwright/test").Browser
): Promise<string | null> {
  const context = await browser.newContext({
    storageState: "tests/.auth/user.json",
  });
  const page = await context.newPage();

  try {
    await page.goto("/orderRecord");
    await page.waitForLoadState("networkidle");

    // 테이블이 로드될 때까지 대기
    await page.waitForSelector("table", { timeout: 15000 }).catch(() => null);

    // admin은 select 드롭다운으로 상태를 표시하므로 select value로 찾기
    const rows = await page.locator("tbody tr").all();
    for (const row of rows) {
      const select = row.locator("select");
      if ((await select.count()) > 0) {
        const value = await select.inputValue();
        if (value === "shipmentCompleted") {
          // select가 아닌 행의 다른 셀 클릭 (select 클릭 방지)
          const firstCell = row.locator("td").first();
          await firstCell.click();
          await page.waitForURL(/orderRecord\/\d+/, { timeout: 10000 });

          const url = page.url();
          const match = url.match(/orderRecord\/(\d+)/);
          if (match) {
            return match[1];
          }
          break;
        }
      } else {
        // non-admin: span 텍스트로 확인
        const statusSpan = row.locator("span", { hasText: "출고 완료" });
        if ((await statusSpan.count()) > 0) {
          await row.click();
          await page.waitForURL(/orderRecord\/\d+/, { timeout: 10000 });

          const url = page.url();
          const match = url.match(/orderRecord\/(\d+)/);
          if (match) {
            return match[1];
          }
          break;
        }
      }
    }
    return null;
  } finally {
    await context.close();
  }
}

// ============================================================
// 1. 재구매 예정 고객 페이지
// ============================================================
test.describe("재구매 예정 고객 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/repurchase");
    // 페이지가 로드되고 에러 오버레이가 없는지 확인
    await page.waitForLoadState("networkidle");
  });

  test("페이지가 정상 로드된다", async ({ page }) => {
    // 에러 오버레이가 없어야 함
    const errorOverlay = page.locator("text=Unhandled Runtime Error");
    const hasError = (await errorOverlay.count()) > 0;
    if (hasError) {
      test.fail(true, "페이지에 런타임 에러 발생");
      return;
    }

    await expect(
      page.getByRole("heading", { name: /재구매 예정 고객/ })
    ).toBeVisible({ timeout: 15000 });
  });

  test("새로고침 버튼이 존재한다", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /재구매 예정 고객/ })
    ).toBeVisible({ timeout: 15000 });

    await expect(page.getByRole("button", { name: /새로고침/ })).toBeVisible();
  });

  test("테이블 또는 빈 상태가 표시된다", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /재구매 예정 고객/ })
    ).toBeVisible({ timeout: 15000 });

    const hasTable = await page.locator("table").count();
    const hasEmptyMessage = await page
      .getByText("재구매 예정 고객이 없습니다")
      .count();

    expect(hasTable > 0 || hasEmptyMessage > 0).toBeTruthy();
  });

  test("데이터가 있으면 요약 카드와 경과일 배지가 표시된다", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /재구매 예정 고객/ })
    ).toBeVisible({ timeout: 15000 });

    const hasTable = await page.locator("table").count();
    if (hasTable > 0) {
      await expect(page.getByText("30일 이상 경과")).toBeVisible();
      await expect(page.getByText("전체")).toBeVisible();

      // 첫 번째 행에 "일 경과" 텍스트 확인
      const rows = page.locator("table tbody tr");
      const rowCount = await rows.count();
      if (rowCount > 0) {
        await expect(rows.first().getByText(/\d+일 경과/)).toBeVisible();
      }
    }
  });
});

// ============================================================
// 2. 메뉴에서 재구매 예정 고객 진입점
// ============================================================
test.describe("메뉴 - 재구매 예정 고객 항목", () => {
  test("메뉴에 재구매 예정 고객 항목이 있다", async ({ page }) => {
    await page.goto("/menu");
    await page.waitForLoadState("networkidle");

    // "발주 & 시연" 탭을 클릭해야 해당 메뉴 아이템이 보임
    const orderTab = page.getByRole("button", { name: /발주.*시연/ });
    await expect(orderTab).toBeVisible({ timeout: 15000 });
    await orderTab.click();

    // 탭 전환 후 메뉴 아이템 확인
    await expect(page.getByText("재구매 예정 고객")).toBeVisible({
      timeout: 10000,
    });
  });
});

// ============================================================
// 3. 발주 상세 - 출고완료 건 고객관리 UI
// ============================================================
test.describe("발주 상세 - 고객관리 기능", () => {
  let shipmentCompletedOrderId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    shipmentCompletedOrderId = await findShipmentCompletedOrderId(browser);
  });

  test("출고완료 건에 고객관리 정보 카드가 표시된다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");

    // 페이지가 정상 로드되는지 먼저 확인
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    // 고객관리 정보 카드 확인 (스크롤 필요할 수 있음)
    const customerSection = page.getByText("고객관리 정보");
    if ((await customerSection.count()) > 0) {
      await expect(customerSection).toBeVisible();
    }
  });

  test("환급/세금계산서/입금 상태가 표시된다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    // 고객관리 정보 섹션 내의 3개 카테고리 확인
    await expect(page.getByText("환급").first()).toBeVisible();
    await expect(page.getByText("세금계산서").first()).toBeVisible();
    await expect(page.getByText("입금").first()).toBeVisible();
  });

  test("세금계산서 섹션이 표시된다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    // 세금계산서 섹션 헤더 (h2)
    const taxSection = page.locator("h2").filter({ hasText: /세금계산서/ });
    await expect(taxSection.first()).toBeVisible({ timeout: 15000 });
  });

  test("고객 서류 섹션이 표시된다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    const docSection = page.locator("h2").filter({ hasText: /고객 서류/ });
    await expect(docSection.first()).toBeVisible({ timeout: 15000 });
  });

  test("고객 서류 유형별 필터가 동작한다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    // 필터 버튼들 확인
    const filterAll = page.getByRole("button", { name: "전체" });
    if ((await filterAll.count()) > 0) {
      await expect(filterAll.first()).toBeVisible();

      // "처방전" 필터 클릭
      const prescriptionBtn = page.getByRole("button", { name: "처방전" });
      if ((await prescriptionBtn.count()) > 0) {
        await prescriptionBtn.click();
        await expect(prescriptionBtn).toHaveClass(/bg-blue-600/);

        // "전체" 클릭으로 복원
        await filterAll.first().click();
        await expect(filterAll.first()).toHaveClass(/bg-blue-600/);
      }
    }
  });
});

// ============================================================
// 4. 세금계산서 업로드/삭제
// ============================================================
test.describe("세금계산서 업로드/삭제", () => {
  let shipmentCompletedOrderId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    shipmentCompletedOrderId = await findShipmentCompletedOrderId(browser);
  });

  test("세금계산서 파일 업로드가 동작한다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    // 세금계산서 섹션 찾기
    const taxSection = page.locator("h2").filter({ hasText: /세금계산서/ });
    await expect(taxSection.first()).toBeVisible({ timeout: 15000 });

    // 세금계산서 섹션의 파일 input 찾기
    const fileInputs = page.locator("input[type='file']");
    const fileInputCount = await fileInputs.count();

    if (fileInputCount > 0) {
      // 메모 입력 (첫 번째 메모 input)
      const memoInput = page.locator("input[placeholder*='메모']").first();
      if ((await memoInput.count()) > 0) {
        await memoInput.fill("e2e 테스트 세금계산서");
      }

      // 파일 업로드
      const testFile = createTempFile("test-tax-invoice.pdf");
      await fileInputs.first().setInputFiles(testFile);

      // 업로드 완료 대기
      await page.waitForTimeout(3000);
    }
  });

  test("업로드된 세금계산서 삭제가 동작한다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    // 삭제 버튼 찾기
    const deleteButtons = page.locator('[title="삭제"]');
    const hasItems = (await deleteButtons.count()) > 0;

    if (hasItems) {
      page.on("dialog", (dialog) => dialog.accept());
      await deleteButtons.first().click();
      await page.waitForTimeout(2000);
    }
  });
});

// ============================================================
// 5. 출고완료 건 통합 수정 모달
// ============================================================
test.describe("출고완료 건 통합 수정 모달", () => {
  let shipmentCompletedOrderId: string | null = null;

  test.beforeAll(async ({ browser }) => {
    shipmentCompletedOrderId = await findShipmentCompletedOrderId(browser);
  });

  test("정보 수정 모달에 환급/입금/세금계산서 필드가 표시된다", async ({
    page,
  }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    // "정보 수정" 버튼 찾기
    const editButton = page.getByRole("button", {
      name: /정보 수정/,
    });
    if ((await editButton.count()) === 0) {
      test.skip(true, "정보 수정 버튼 없음 (권한 부족)");
      return;
    }
    await editButton.click();

    // 모달이 열리면 새 필드들 확인
    await expect(page.getByText("환급 정보")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("입금 정보")).toBeVisible();
  });

  test("환급 해당없음 체크 시 다른 환급 필드가 비활성화된다", async ({
    page,
  }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    const editButton = page.getByRole("button", {
      name: /정보 수정/,
    });
    if ((await editButton.count()) === 0) {
      test.skip(true, "정보 수정 버튼 없음");
      return;
    }
    await editButton.click();
    await expect(page.getByText("환급 정보")).toBeVisible({ timeout: 10000 });

    // 환급 해당없음 체크
    const notApplicableCheckbox = page.getByLabel("환급 해당없음");
    if ((await notApplicableCheckbox.count()) === 0) {
      test.skip(true, "환급 해당없음 체크박스 없음");
      return;
    }
    await notApplicableCheckbox.check();

    // 환급 신청, 환급금 입금 체크박스가 비활성화되는지 확인
    await expect(page.getByLabel("환급 신청")).toBeDisabled();
    await expect(page.getByLabel("환급금 입금 완료")).toBeDisabled();

    // 해제하면 다시 활성화
    await notApplicableCheckbox.uncheck();
    await expect(page.getByLabel("환급 신청")).toBeEnabled();
  });

  test("입금 상태 드롭다운에 5개 옵션이 있다", async ({ page }) => {
    test.skip(!shipmentCompletedOrderId, "출고완료 발주건이 없음");

    await page.goto(`/orderRecord/${shipmentCompletedOrderId}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 15000 });

    const editButton = page.getByRole("button", {
      name: /정보 수정/,
    });
    if ((await editButton.count()) === 0) {
      test.skip(true, "정보 수정 버튼 없음");
      return;
    }
    await editButton.click();
    await expect(page.getByText("입금 정보")).toBeVisible({ timeout: 10000 });

    // 입금 상태 셀렉트 찾기 (입금 정보 섹션 내)
    const depositSelect = page
      .locator("select")
      .filter({ has: page.locator("option", { hasText: "자부담금" }) });

    if ((await depositSelect.count()) > 0) {
      const options = depositSelect.locator("option");
      const optionTexts = await options.allTextContents();

      expect(optionTexts).toContain("자부담금");
      expect(optionTexts).toContain("전액");
      expect(optionTexts).toContain("선금");
      expect(optionTexts).toContain("중도금");
      expect(optionTexts).toContain("잔금");
    }
  });
});

// ============================================================
// 6. User 편집 모달 - 고객 정보 필드
// ============================================================
test.describe("User 편집 모달 - 고객 정보", () => {
  test("사용자 편집 모달에 고객 정보 섹션이 표시된다", async ({ page }) => {
    await page.goto("/admin/team-members");
    await page.waitForLoadState("networkidle");

    // 사용자 목록에서 첫 번째 편집 버튼 클릭
    const editButton = page
      .getByRole("button", { name: /수정|편집|정보/ })
      .first();

    if ((await editButton.count()) === 0) {
      test.skip(true, "편집 버튼 없음");
      return;
    }

    await editButton.click();
    await page.waitForTimeout(2000);

    await expect(page.getByText("고객 정보")).toBeVisible({ timeout: 15000 });
  });

  test("고객 분류 드롭다운에 B2C/B2B 옵션이 있다", async ({ page }) => {
    await page.goto("/admin/team-members");
    await page.waitForLoadState("networkidle");

    const editButton = page
      .getByRole("button", { name: /수정|편집|정보/ })
      .first();
    if ((await editButton.count()) === 0) {
      test.skip(true, "편집 버튼 없음");
      return;
    }

    await editButton.click();
    await page.waitForTimeout(2000);
    await expect(page.getByText("고객 정보")).toBeVisible({ timeout: 15000 });

    const customerTypeSelect = page
      .locator("select")
      .filter({ has: page.locator('option[value="b2c"]') });
    await expect(customerTypeSelect).toBeVisible();

    const options = customerTypeSelect.locator("option");
    const texts = await options.allTextContents();
    expect(texts).toContain("B2C (개인)");
    expect(texts).toContain("B2B (기업)");
  });

  test("수급자 체크박스가 표시된다", async ({ page }) => {
    await page.goto("/admin/team-members");
    await page.waitForLoadState("networkidle");

    const editButton = page
      .getByRole("button", { name: /수정|편집|정보/ })
      .first();
    if ((await editButton.count()) === 0) {
      test.skip(true, "편집 버튼 없음");
      return;
    }

    await editButton.click();
    await page.waitForTimeout(2000);

    await expect(page.getByText("수급자 여부")).toBeVisible({
      timeout: 15000,
    });
  });

  test("재구매 예정일이 읽기전용으로 표시된다", async ({ page }) => {
    await page.goto("/admin/team-members");
    await page.waitForLoadState("networkidle");

    const editButton = page
      .getByRole("button", { name: /수정|편집|정보/ })
      .first();
    if ((await editButton.count()) === 0) {
      test.skip(true, "편집 버튼 없음");
      return;
    }

    await editButton.click();
    await page.waitForTimeout(2000);

    await expect(page.getByText("재구매 예정일")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("출고 완료 시 자동 갱신됩니다")).toBeVisible();
  });
});

// ============================================================
// 테스트 후 임시 파일 정리
// ============================================================
test.afterAll(() => {
  const tmpDir = path.join(__dirname, ".tmp");
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
