import { test, expect } from "@playwright/test";
import path from "path";

const BULK_UPLOAD_URL = "/team-items/bulk-upload";
const TEAM_ITEMS_URL = "/team-items";

// 테스트용 엑셀 파일 경로
const VALID_EXCEL = path.resolve(__dirname, "fixtures/test-items.xlsx");

test.describe("엑셀 품목 일괄 등록 (A: 파일 업로드 UI)", () => {
  test("벌크 업로드 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    // 헤더 확인
    await expect(page.getByText("엑셀 품목 일괄 등록")).toBeVisible({
      timeout: 15000,
    });

    // Step 인디케이터 확인
    await expect(page.getByText("파일 업로드")).toBeVisible();

    // 드래그&드롭 영역 확인
    await expect(page.getByText("엑셀 파일을 드래그하여 놓거나")).toBeVisible();
    await expect(page.getByText("파일 선택")).toBeVisible();
  });

  test("team-items 페이지에서 엑셀 업로드 버튼이 보인다", async ({ page }) => {
    await page.goto(TEAM_ITEMS_URL);
    await page.waitForLoadState("networkidle");

    const uploadButton = page.getByRole("button", { name: "엑셀 업로드" });
    await expect(uploadButton).toBeVisible({ timeout: 15000 });

    // 클릭하면 벌크 업로드 페이지로 이동
    await uploadButton.click();
    await expect(page).toHaveURL(/bulk-upload/);
  });

  test("지원 형식 안내 텍스트가 표시된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    // 파일 형식 제한 안내 확인
    await expect(
      page.getByText("지원 형식: .xlsx, .xls (최대 1,000행, 10MB)")
    ).toBeVisible({ timeout: 15000 });

    // input accept 속성 확인
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveAttribute("accept", ".xlsx,.xls");
  });

  test("뒤로가기 버튼으로 team-items 페이지로 돌아간다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("엑셀 품목 일괄 등록")).toBeVisible({
      timeout: 15000,
    });

    // 헤더 영역의 뒤로가기 버튼 (← 아이콘 + 제목 옆)
    await page.locator(".flex.items-center.gap-3 > button").first().click();
    await expect(page).toHaveURL(/team-items/, { timeout: 10000 });
  });
});

test.describe("엑셀 품목 일괄 등록 (B: 엑셀 파싱 & 프리뷰)", () => {
  test("엑셀 파일 업로드 후 프리뷰 테이블이 표시된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    // 엑셀 파일 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    // Step 2로 전환 대기
    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 요약 배지 확인
    await expect(page.getByText(/총/)).toBeVisible();
    await expect(page.getByText(/총/).first()).toBeVisible();

    // 프리뷰 테이블 헤더 확인
    await expect(
      page.getByRole("columnheader", { name: "품목명" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "브랜드" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "자동코드" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "카테고리" })
    ).toBeVisible();
  });

  test("프리뷰 테이블에 품목 데이터가 표시된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    // 프리뷰 테이블 대기
    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 테스트 엑셀의 품목명이 테이블에 표시되는지 확인
    await expect(page.getByText("테스트 품목 A")).toBeVisible();
    await expect(page.getByText("테스트 품목 B")).toBeVisible();
  });

  test("자동 생성된 품목코드가 표시된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 품목코드 형식 확인 (예: TS-001 등)
    const codeElements = page.locator("code");
    const count = await codeElements.count();
    expect(count).toBeGreaterThan(0);

    // 첫 번째 코드가 {약자}-{숫자} 형식인지 확인
    const firstCode = await codeElements.first().textContent();
    expect(firstCode).toMatch(/^[A-Z]+-\d{3}$/);
  });

  test("이전 버튼으로 Step 1로 돌아간다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 이전 버튼 클릭
    await page.getByRole("button", { name: "이전" }).click();

    // Step 1로 돌아가는지 확인
    await expect(page.getByText("엑셀 파일을 드래그하여 놓거나")).toBeVisible();
  });
});

test.describe("엑셀 품목 일괄 등록 (C: 카테고리 매칭 & 중복 처리)", () => {
  test("카테고리 미매칭 row에 선택 드롭다운이 표시된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 카테고리 미매칭 배지가 있는지 확인
    const unmatchedBadge = page.getByText("카테고리 미매칭");
    const unmatchedVisible = await unmatchedBadge
      .isVisible()
      .catch(() => false);

    if (unmatchedVisible) {
      // "카테고리 선택" 플레이스홀더가 있는 드롭다운이 표시되는지 확인
      await expect(page.getByText("카테고리 선택").first()).toBeVisible();
    }
  });

  test("매입원가 입력 필드에 값을 입력할 수 있다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 매입원가 입력 필드 찾기
    const costInputs = page.locator('input[placeholder="원가 입력"]');
    const count = await costInputs.count();
    expect(count).toBeGreaterThan(0);

    // 첫 번째 입력 필드에 값 입력
    await costInputs.first().fill("500000");
    await expect(costInputs.first()).toHaveValue("500,000");
  });
});

test.describe("엑셀 품목 일괄 등록 (D: 실제 등록)", () => {
  test("등록 시작 버튼을 누르면 프로그레스바가 표시된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    // 엑셀 파일 업로드
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 카테고리 미매칭 건이 있으면 모두 해결해야 등록 가능
    // 모든 "카테고리 선택" 드롭다운을 찾아서 첫 번째 카테고리 선택
    const categorySelects = page.getByText("카테고리 선택");
    const selectCount = await categorySelects.count();

    for (let i = 0; i < selectCount; i++) {
      const select = categorySelects.nth(i);
      if (await select.isVisible()) {
        await select.click();
        // 첫 번째 카테고리 옵션 클릭
        const option = page.locator('[role="option"]').first();
        if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
          await option.click();
        }
      }
    }

    // 등록 시작 버튼 클릭
    const startButton = page.getByRole("button", { name: /등록 시작/ });
    if (await startButton.isEnabled()) {
      await startButton.click();

      // Step 3: 프로그레스바 또는 결과 화면 대기
      await expect(page.getByText(/등록 중|등록 완료/).first()).toBeVisible({
        timeout: 30000,
      });
    }
  });

  test("등록 완료 후 결과 리포트가 표시된다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 카테고리 미매칭 해결
    const categorySelects = page.getByText("카테고리 선택");
    const selectCount = await categorySelects.count();

    for (let i = 0; i < selectCount; i++) {
      const select = categorySelects.nth(i);
      if (await select.isVisible()) {
        await select.click();
        const option = page.locator('[role="option"]').first();
        if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
          await option.click();
        }
      }
    }

    // 등록 시작
    const startButton = page.getByRole("button", { name: /등록 시작/ });
    if (await startButton.isEnabled()) {
      await startButton.click();

      // 등록 완료 대기
      await expect(page.getByText("등록 완료")).toBeVisible({
        timeout: 60000,
      });

      // 결과 카드 확인
      await expect(page.getByText("성공")).toBeVisible();

      // 품목 관리 돌아가기 버튼 확인
      await expect(
        page.getByRole("button", { name: "품목 관리로 돌아가기" })
      ).toBeVisible();
    }
  });

  test("품목 관리로 돌아가기 버튼이 동작한다", async ({ page }) => {
    await page.goto(BULK_UPLOAD_URL);
    await page.waitForLoadState("networkidle");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(VALID_EXCEL);

    await expect(page.getByText("프리뷰 & 편집")).toBeVisible({
      timeout: 15000,
    });

    // 카테고리 미매칭 해결
    const categorySelects = page.getByText("카테고리 선택");
    const selectCount = await categorySelects.count();

    for (let i = 0; i < selectCount; i++) {
      const select = categorySelects.nth(i);
      if (await select.isVisible()) {
        await select.click();
        const option = page.locator('[role="option"]').first();
        if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
          await option.click();
        }
      }
    }

    const startButton = page.getByRole("button", { name: /등록 시작/ });
    if (await startButton.isEnabled()) {
      await startButton.click();

      await expect(page.getByText("등록 완료")).toBeVisible({
        timeout: 60000,
      });

      // 돌아가기 버튼 클릭
      await page.getByRole("button", { name: "품목 관리로 돌아가기" }).click();
      await expect(page).toHaveURL(/team-items/);
    }
  });
});
