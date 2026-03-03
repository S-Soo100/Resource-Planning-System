import { test, expect } from "@playwright/test";

test.describe("판매 내역 + 유료 시연 통합 (#006)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sales");
    await page.waitForLoadState("networkidle");
    // 페이지 로드 확인
    await expect(page.getByRole("heading", { name: /판매 내역/ })).toBeVisible({
      timeout: 15000,
    });
  });

  test("판매 페이지가 정상 로드되고 탭 UI가 표시된다", async ({ page }) => {
    // 탭 버튼 2개 존재 확인
    const orderTab = page.getByRole("button", { name: /발주 판매/ });
    const demoTab = page.getByRole("button", { name: /유료 시연/ });

    await expect(orderTab).toBeVisible();
    await expect(demoTab).toBeVisible();
  });

  test("발주 탭이 기본 선택이고 테이블이 표시된다", async ({ page }) => {
    const orderTab = page.getByRole("button", { name: /발주 판매/ });

    // 발주 탭이 활성 상태 (파란색)
    await expect(orderTab).toHaveClass(/text-blue-600/);

    // 테이블 또는 '조회된 데이터가 없습니다' 메시지 확인
    const hasTable = await page.locator("table").count();
    const hasEmptyMessage = await page
      .getByText("조회된 데이터가 없습니다.")
      .count();

    expect(hasTable > 0 || hasEmptyMessage > 0).toBeTruthy();
  });

  test("유료 시연 탭 클릭 시 시연 테이블이 표시된다", async ({ page }) => {
    const demoTab = page.getByRole("button", { name: /유료 시연/ });
    await demoTab.click();

    // 시연 탭이 활성 상태 (보라색)
    await expect(demoTab).toHaveClass(/text-purple-600/);

    // 시연 테이블 컬럼 또는 빈 메시지 확인
    const hasDemoTable = await page.getByText("시연일자").count();
    const hasEmptyMessage = await page
      .getByText("조회된 유료 시연 데이터가 없습니다.")
      .count();

    expect(hasDemoTable > 0 || hasEmptyMessage > 0).toBeTruthy();
  });

  test("탭 전환이 정상 동작한다", async ({ page }) => {
    const orderTab = page.getByRole("button", { name: /발주 판매/ });
    const demoTab = page.getByRole("button", { name: /유료 시연/ });

    // 시연 탭으로 전환
    await demoTab.click();
    await expect(demoTab).toHaveClass(/text-purple-600/);
    await expect(orderTab).not.toHaveClass(/text-blue-600/);

    // 다시 발주 탭으로 전환
    await orderTab.click();
    await expect(orderTab).toHaveClass(/text-blue-600/);
    await expect(demoTab).not.toHaveClass(/text-purple-600/);
  });

  test("요약 카드에 총 판매 건수가 표시된다", async ({ page }) => {
    // "총 발주 건수"가 아닌 "총 판매 건수"로 라벨 변경 확인
    await expect(page.getByText("총 판매 건수")).toBeVisible();
  });

  test("안내 카드에 시연 포함 조건이 표시된다", async ({ page }) => {
    // 안내 카드에 시연 관련 조건 포함 확인
    await expect(
      page.getByText(/유료 시연 중 출고자확인, 출고완료, 시연종료 상태/)
    ).toBeVisible();
  });

  test("날짜 필터가 양쪽 탭에 공통 적용된다", async ({ page }) => {
    // 날짜 필터 존재 확인
    const monthPicker = page.locator(".mb-4").first();
    await expect(monthPicker).toBeVisible();

    // 시연 탭에서도 같은 필터가 적용되는지 확인
    const demoTab = page.getByRole("button", { name: /유료 시연/ });
    await demoTab.click();

    // 필터 영역이 여전히 보이는지 확인
    await expect(monthPicker).toBeVisible();
  });

  test("검색 필터가 동작한다", async ({ page }) => {
    // 검색 입력 확인
    const searchInput = page.getByPlaceholder(/제목, 판매처/);
    await expect(searchInput).toBeVisible();

    // 검색어 입력
    await searchInput.fill("테스트");
    // 검색 반영 대기
    await page.waitForTimeout(500);

    // 시연 탭에서도 검색이 적용되는지 확인
    const demoTab = page.getByRole("button", { name: /유료 시연/ });
    await demoTab.click();

    // 검색어가 유지되는지 확인
    await expect(searchInput).toHaveValue("테스트");
  });

  test("엑셀 다운로드 버튼이 존재한다", async ({ page }) => {
    const downloadButton = page.getByRole("button", { name: /엑셀 다운로드/ });
    await expect(downloadButton).toBeVisible();
  });

  test("탭 건수 배지가 표시된다", async ({ page }) => {
    // 발주 탭에 건수 표시 (N건)
    const orderTab = page.getByRole("button", { name: /발주 판매/ });
    const orderTabText = await orderTab.textContent();
    expect(orderTabText).toMatch(/\d+건/);

    // 시연 탭에 건수 표시 (N건)
    const demoTab = page.getByRole("button", { name: /유료 시연/ });
    const demoTabText = await demoTab.textContent();
    expect(demoTabText).toMatch(/\d+건/);
  });
});
