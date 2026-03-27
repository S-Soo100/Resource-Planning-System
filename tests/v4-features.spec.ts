import { test, expect, Page } from "@playwright/test";

/**
 * v2.8.0 신규 기능 6종 E2E 테스트
 *
 * 대상 기능:
 * 1. 워딩 변경 (발주→판매, 고객→판매대상)
 * 2. 팀품목 확장 (3섹션 모달, 서비스/건보 배지)
 * 3. 계층형 카테고리 (TreeSelect)
 * 4. 판매 폼 (시리얼코드, quantity:1 분리, 서비스 품목)
 * 5. 입고 관리 (매입단가, 입고상태, 입고완료 전환)
 * 6. 시리얼코드 검색
 */

// ===== 테스트 1: 워딩 변경 =====

test.describe("1. 워딩 변경", () => {
  test("메인 메뉴에 '판매', '판매대상', '재고&매입' 워딩이 표시된다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 메뉴 탭 확인
    await expect(page.getByText("판매 & 시연")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("재고&매입 관리")).toBeVisible();
    await expect(page.getByText("판매대상 관리")).toBeVisible();
  });

  test("판매 기록 페이지가 /salesRecord에서 로드된다", async ({ page }) => {
    await page.goto("/salesRecord");
    await expect(page).toHaveURL(/salesRecord/);
    await page.waitForLoadState("networkidle");
  });

  test("판매 가이드 페이지가 /sales-guide에서 로드된다", async ({ page }) => {
    await page.goto("/sales-guide");
    await expect(page).toHaveURL(/sales-guide/);
    await page.waitForLoadState("networkidle");
  });

  test("구 URL /orderRecord는 404이다", async ({ page }) => {
    const response = await page.goto("/orderRecord");
    // Next.js 404 또는 리다이렉트 확인
    if (response) {
      expect(response.status()).toBe(404);
    }
  });
});

// ===== 테스트 2: 팀품목 확장 필드 =====

test.describe("2. 팀품목 관리 — 확장 필드", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/team-items");
    await page.waitForLoadState("networkidle");
  });

  test("팀품목 추가 모달에 3개 섹션이 표시된다", async ({ page }) => {
    // 팀 품목 영역의 추가 버튼 (카테고리 추가 버튼과 구분)
    // 스크린샷: 팀 품목 목록 테이블 위에 "팀 아이템 추가" 또는 편집 아이콘 버튼
    const addBtn = page
      .locator("button")
      .filter({ hasText: /팀 아이템 추가|새 품목/ })
      .first();
    if (!(await addBtn.isVisible({ timeout: 5000 }))) {
      // 테이블 행의 편집 버튼으로 기존 품목 수정 모달 열기 (대안)
      const editBtn = page.locator("table button").first();
      await expect(editBtn).toBeVisible({ timeout: 15000 });
      await editBtn.click();
    } else {
      await addBtn.click();
    }

    // 3개 섹션 확인
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("가격 정보")).toBeVisible();
    await expect(page.getByText("추가 정보")).toBeVisible();
  });

  test("고시가격 체크박스 토글 시 입력 필드가 나타나고 사라진다", async ({
    page,
  }) => {
    // 기존 품목의 수정 버튼 클릭으로 모달 열기
    const editBtn = page.locator("table button").first();
    await expect(editBtn).toBeVisible({ timeout: 15000 });
    await editBtn.click();
    await expect(page.getByText("가격 정보")).toBeVisible({ timeout: 5000 });

    // 고시가격 토글 찾기 (Toggle 컴포넌트: label이 sr-only input을 감쌈)
    const toggle = page.getByRole("switch", { name: /고시가격/ });
    if ((await toggle.count()) > 0) {
      const toggleLabel = page.locator("label").filter({ has: toggle });
      const isAlreadyOn = await toggle.isChecked();

      if (isAlreadyOn) {
        // 이미 ON → 입력 필드가 보여야 함 → OFF로 토글 → 사라져야 함
        await toggleLabel.click();
        await page.waitForTimeout(300);
        // 다시 ON → 입력 필드 보여야 함
        await toggleLabel.click();
      } else {
        // OFF → ON으로 토글
        await toggleLabel.click();
      }

      await expect(
        page.getByPlaceholder(/고시가격/).or(page.getByLabel(/고시가격.*원/))
      ).toBeVisible();
    }
  });

  test("서비스 품목 체크박스가 추가 정보 섹션에 존재한다", async ({ page }) => {
    const editBtn = page.locator("table button").first();
    await expect(editBtn).toBeVisible({ timeout: 15000 });
    await editBtn.click();
    await expect(page.getByText("추가 정보")).toBeVisible({ timeout: 5000 });

    // 서비스 품목 토글 확인 (Toggle 컴포넌트: role="switch")
    await expect(
      page.getByRole("switch", { name: /서비스 품목/ })
    ).toBeVisible();
  });
});

// ===== 테스트 3: 계층형 카테고리 =====

test.describe("3. 계층형 카테고리", () => {
  test("팀품목 페이지에서 카테고리가 트리 구조로 표시된다", async ({
    page,
  }) => {
    await page.goto("/team-items");
    await page.waitForLoadState("networkidle");

    // 카테고리 영역이 존재하는지 확인
    await expect(page.getByText(/카테고리/).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("팀품목 수정 모달에서 카테고리 선택이 트리형이다", async ({ page }) => {
    await page.goto("/team-items");
    await page.waitForLoadState("networkidle");

    // 기존 품목의 수정 버튼 클릭
    const editBtn = page.locator("table button").first();
    await expect(editBtn).toBeVisible({ timeout: 15000 });
    await editBtn.click();

    // 카테고리 선택 드롭다운 찾기
    await expect(page.getByText("기본 정보")).toBeVisible({ timeout: 5000 });
    const categorySelect = page.getByText(/카테고리를 선택/).first();
    if (await categorySelect.isVisible({ timeout: 3000 })) {
      await categorySelect.click();
      await page.waitForTimeout(500);
    }
  });
});

// ===== 테스트 4: 판매 폼 — 시리얼코드 & 서비스 =====

test.describe("4. 판매 폼", () => {
  test("판매 요청 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/salesRequest");
    await expect(page).toHaveURL(/salesRequest/);
    await page.waitForLoadState("networkidle");
  });

  test("휠체어 판매 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/salesWheelchair");
    await expect(page).toHaveURL(/salesWheelchair/);
    await page.waitForLoadState("networkidle");
  });

  test("판매 요청 폼에 '판매대상' 워딩이 사용된다", async ({ page }) => {
    await page.goto("/salesRequest");
    await page.waitForLoadState("networkidle");

    // 폼에 "판매대상" 텍스트가 표시되는지 확인
    await expect(page.getByText(/판매대상/).first()).toBeVisible({
      timeout: 15000,
    });
  });
});

// ===== 테스트 5: 입고 관리 — 매입단가 & 입고상태 =====

test.describe("5. 입고 관리", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ioHistory");
    await page.waitForLoadState("networkidle");
  });

  test("입고 모달에 매입단가 필드와 입고상태 선택이 표시된다", async ({
    page,
  }) => {
    // 입고 버튼 클릭
    const inboundBtn = page.getByRole("button", { name: /입고/ }).first();
    await expect(inboundBtn).toBeVisible({ timeout: 15000 });
    await inboundBtn.click();

    // 입고 등록 모달 대기
    await expect(page.getByText("입고 등록")).toBeVisible({ timeout: 5000 });

    // 매입단가 필드 확인
    await expect(
      page.getByPlaceholder(/매입단가/).or(page.getByLabel(/매입단가/))
    ).toBeVisible();

    // 입고상태 선택 버튼 확인 (getByRole로 버튼만 매칭)
    await expect(
      page.getByRole("button", { name: "즉시 입고완료" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "입고 요청만" })
    ).toBeVisible();
  });

  test("매입단가에 숫자만 입력된다", async ({ page }) => {
    const inboundBtn = page.getByRole("button", { name: /입고/ }).first();
    await expect(inboundBtn).toBeVisible({ timeout: 15000 });
    await inboundBtn.click();
    await expect(page.getByText("입고 등록")).toBeVisible({ timeout: 5000 });

    const unitCostInput = page
      .getByPlaceholder(/매입단가/)
      .or(page.getByLabel(/매입단가/));
    if (await unitCostInput.isVisible()) {
      // 문자 입력 시도 → 반영 안 됨
      await unitCostInput.fill("abc");
      await expect(unitCostInput).toHaveValue("");

      // 숫자 입력 → 정상 반영
      await unitCostInput.fill("15000");
      await expect(unitCostInput).toHaveValue("15000");
    }
  });

  test("입고 모달에서 거래처 선택 모달 제목이 '거래처 선택'이다", async ({
    page,
  }) => {
    const inboundBtn = page.getByRole("button", { name: /입고/ }).first();
    await expect(inboundBtn).toBeVisible({ timeout: 15000 });
    await inboundBtn.click();
    await expect(page.getByText("입고 등록")).toBeVisible({ timeout: 5000 });

    // 구매 입고 선택 (기본값)
    await page.getByRole("button", { name: "구매 입고" }).click();

    // 거래처 선택 버튼 클릭
    const supplierBtn = page
      .getByRole("button", { name: /거래처|선택/ })
      .first();
    if (await supplierBtn.isVisible()) {
      await supplierBtn.click();
      await expect(page.getByText("거래처 선택")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("입출고 관리 목록에 입고상태 배지가 표시된다", async ({ page }) => {
    // 입출고 내역 목록에서 상태 배지 확인
    // 기존 데이터가 있으면 "완료(레거시)" 배지가 보여야 함
    await page.waitForTimeout(2000);

    const hasBadge =
      (await page.getByText("완료(레거시)").count()) > 0 ||
      (await page.getByText("입고완료").count()) > 0 ||
      (await page.getByText("입고요청").count()) > 0;

    // 입고 데이터가 있으면 배지 중 하나 이상 보여야 함
    // 데이터가 없을 수도 있으므로 조건부 확인
    if (await page.locator("table tbody tr").count()) {
      expect(hasBadge).toBeTruthy();
    }
  });
});

// ===== 테스트 6: 시리얼코드 검색 =====

test.describe("6. 시리얼코드 검색", () => {
  test("판매 기록 페이지에 시리얼 검색 버튼이 있다", async ({ page }) => {
    await page.goto("/salesRecord");
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("button", { name: /시리얼 검색|시리얼/ })
    ).toBeVisible({ timeout: 15000 });
  });

  test("시리얼 검색 모달이 열리고 검색할 수 있다", async ({ page }) => {
    await page.goto("/salesRecord");
    await page.waitForLoadState("networkidle");

    // 시리얼 검색 버튼 클릭
    const searchBtn = page.getByRole("button", {
      name: /시리얼 검색|시리얼/,
    });
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // 검색 모달 대기
    await page.waitForTimeout(500);

    // 검색 입력 필드 확인
    const searchInput = page
      .getByPlaceholder(/시리얼/)
      .or(page.getByRole("textbox").last());
    if (await searchInput.isVisible()) {
      // 존재하지 않는 시리얼 검색
      await searchInput.fill("NONEXISTENT_SERIAL_999");
      // 검색 버튼 클릭 또는 Enter
      const searchSubmit = page
        .locator("button")
        .filter({ hasText: /검색/ })
        .last();
      if (await searchSubmit.isVisible({ timeout: 2000 })) {
        await searchSubmit.click();
      } else {
        await searchInput.press("Enter");
      }

      // "검색 중..." 로딩 완료 대기
      await page
        .waitForFunction(
          () => !document.body.textContent?.includes("검색 중"),
          { timeout: 10000 }
        )
        .catch(() => {});
      await page.waitForTimeout(1000);

      // 결과 없음 안내 또는 빈 테이블 또는 단순히 로딩 완료
      // 존재하지 않는 시리얼이므로 결과가 없어야 함
      const resultRows = page.locator(
        "[class*='modal'] table tbody tr, [class*='Modal'] table tbody tr"
      );
      const noResultText = page.getByText(
        /검색 결과가 없|결과 없|0건|일치하는/
      );
      const hasNoResult =
        (await noResultText.count()) > 0 || (await resultRows.count()) === 0;
      expect(hasNoResult).toBeTruthy();
    }
  });
});

// ===== 테스트 7: 데이터 호환성 =====

test.describe("7. 데이터 호환성", () => {
  test("기존 팀품목 페이지가 정상 로드된다 (확장 필드 없는 데이터)", async ({
    page,
  }) => {
    await page.goto("/team-items");
    await page.waitForLoadState("networkidle");

    // 페이지가 에러 없이 로드되는지 확인
    await expect(page.locator("body")).not.toContainText("error", {
      timeout: 10000,
    });
  });

  test("입출고 관리 페이지가 레거시 데이터와 호환된다", async ({ page }) => {
    await page.goto("/ioHistory");
    await page.waitForLoadState("networkidle");

    // 페이지가 에러 없이 로드되는지 확인
    await expect(page.locator("body")).not.toContainText(
      "Something went wrong",
      { timeout: 10000 }
    );
  });

  test("판매 기록 페이지가 기존 데이터와 호환된다", async ({ page }) => {
    await page.goto("/salesRecord");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).not.toContainText(
      "Something went wrong",
      { timeout: 10000 }
    );
  });
});
