import { test, expect, Page } from "@playwright/test";

/**
 * 입출고 모달 - 고객 선택 조건부 표시 E2E 테스트
 *
 * 티켓: docs/issues/001-io-modal-supplier-optional.md
 *
 * 완료 조건 (Acceptance Criteria):
 * 1. recordPurpose가 transfer, adjustment, other일 때 고객 선택 영역 숨김
 * 2. 고객 미선택 시에도 입고처/출고처, 주소 폼은 직접 입력 가능
 * 3. purchase(입고), sale(출고)일 때는 기존과 동일하게 고객 필수
 * 4. 목적 변경 시 고객 관련 상태 초기화 (supplierId: undefined)
 * 5. API 호출 시 supplierId: undefined 전송 정상 동작 확인 (서버 테스트)
 * 6. InboundModal, OutboundModal 둘 다 적용
 */

// ===== Helper Functions =====

async function openInboundModal(page: Page) {
  // 입고 버튼은 창고 카드에 위치 (모달 내부 "구매 입고" 버튼과 구분)
  const inboundBtn = page.getByRole("button", { name: /입고/ }).first();
  await expect(inboundBtn).toBeVisible({ timeout: 15000 });
  await inboundBtn.click();
  // 모달 타이틀이 표시될 때까지 대기
  await expect(page.getByText("입고 등록")).toBeVisible({ timeout: 5000 });
}

async function openOutboundModal(page: Page) {
  const outboundBtn = page.getByRole("button", { name: /출고/ }).first();
  await expect(outboundBtn).toBeVisible({ timeout: 15000 });
  await outboundBtn.click();
  await expect(page.getByText("출고 등록")).toBeVisible({ timeout: 5000 });
}

// ===== 고객 선택 영역 표시 검증 =====

async function expectCustomerSectionVisible(page: Page) {
  await expect(page.getByText("고객 선택")).toBeVisible();
  await expect(page.getByText("고객을 선택하세요")).toBeVisible();
}

async function expectCustomerSectionHidden(page: Page) {
  await expect(page.getByText("고객 선택")).not.toBeVisible();
  await expect(page.getByText("고객을 선택하세요")).not.toBeVisible();
}

// ===== 입고처/출고처 폼 표시 검증 =====

async function expectInboundFormVisible(page: Page) {
  await expect(page.getByPlaceholder("입고처를 입력하세요")).toBeVisible();
  await expect(page.getByPlaceholder("주소를 검색하세요")).toBeVisible();
  await expect(
    page.getByPlaceholder("상세주소를 입력하세요 (동/호수 등)")
  ).toBeVisible();
}

async function expectOutboundFormVisible(page: Page) {
  await expect(page.getByPlaceholder("출고처를 입력하세요")).toBeVisible();
  await expect(page.getByPlaceholder("주소를 검색하세요")).toBeVisible();
  await expect(
    page.getByPlaceholder("상세주소를 입력하세요 (동/호수 등)")
  ).toBeVisible();
}

// =============================================================
// 테스트 시작
// =============================================================

test.describe("입출고 모달 - 고객 선택 조건부 표시", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ioHistory");
    await page.waitForLoadState("networkidle");
  });

  // =============================================================
  // [AC-6] 입고 모달 (InboundModal) 테스트
  // =============================================================
  test.describe("입고 모달", () => {
    // [AC-3] purchase일 때 고객 필수
    test("기본 상태: 구매 입고가 선택되어 있고 고객 선택이 표시된다", async ({
      page,
    }) => {
      await openInboundModal(page);

      // 구매 입고 버튼이 활성 상태 확인 (bg-blue-500)
      const purchaseBtn = page.getByRole("button", { name: "구매 입고" });
      await expect(purchaseBtn).toBeVisible();
      await expect(purchaseBtn).toHaveClass(/bg-blue-500/);

      // 고객 선택 영역 표시 확인
      await expectCustomerSectionVisible(page);

      // 고객 미선택 상태 → 안내 메시지 표시
      await expect(page.getByText("먼저 고객을 선택해주세요")).toBeVisible();
    });

    // [AC-1] transfer일 때 고객 선택 숨김
    test("창고 간 이동 선택 시 고객 선택이 숨겨지고 입고처 폼이 바로 표시된다", async ({
      page,
    }) => {
      await openInboundModal(page);

      await page.getByRole("button", { name: "창고 간 이동" }).click();

      // 고객 선택 숨겨짐
      await expectCustomerSectionHidden(page);
      await expect(
        page.getByText("먼저 고객을 선택해주세요")
      ).not.toBeVisible();

      // [AC-2] 입고처 폼이 바로 표시됨 (고객 없이도 직접 입력 가능)
      await expectInboundFormVisible(page);
    });

    // [AC-1] adjustment일 때 고객 선택 숨김
    test("재고 조정 선택 시 고객 선택이 숨겨지고 입고처 폼이 바로 표시된다", async ({
      page,
    }) => {
      await openInboundModal(page);

      await page.getByRole("button", { name: "재고 조정" }).click();

      await expectCustomerSectionHidden(page);
      await expectInboundFormVisible(page);
    });

    // [AC-1] other일 때 고객 선택 숨김
    test("기타 선택 시 고객 선택이 숨겨지고 입고처 폼이 바로 표시된다", async ({
      page,
    }) => {
      await openInboundModal(page);

      await page.getByRole("button", { name: "기타" }).click();

      await expectCustomerSectionHidden(page);
      await expectInboundFormVisible(page);
    });

    // [AC-2] 고객 미선택 시에도 입고처 직접 입력 가능
    test("비거래 목적에서 입고처를 직접 입력할 수 있다", async ({ page }) => {
      await openInboundModal(page);

      // 창고 간 이동 선택
      await page.getByRole("button", { name: "창고 간 이동" }).click();

      // 입고처 직접 입력
      const placeInput = page.getByPlaceholder("입고처를 입력하세요");
      await placeInput.fill("A창고 3층");
      await expect(placeInput).toHaveValue("A창고 3층");

      // 상세주소 직접 입력
      const detailInput = page.getByPlaceholder(
        "상세주소를 입력하세요 (동/호수 등)"
      );
      await detailInput.fill("301호");
      await expect(detailInput).toHaveValue("301호");
    });

    // [AC-4] 목적 변경 시 고객 관련 상태 초기화
    test("목적 변경 시 입력한 입고처 정보가 초기화된다", async ({ page }) => {
      await openInboundModal(page);

      // 1단계: 창고 간 이동으로 전환 → 입고처 입력
      await page.getByRole("button", { name: "창고 간 이동" }).click();
      const placeInput = page.getByPlaceholder("입고처를 입력하세요");
      await placeInput.fill("테스트 창고");
      await expect(placeInput).toHaveValue("테스트 창고");

      // 2단계: 재고 조정으로 전환 → 입고처 초기화
      await page.getByRole("button", { name: "재고 조정" }).click();
      await expect(page.getByPlaceholder("입고처를 입력하세요")).toHaveValue(
        ""
      );

      // 3단계: 다시 구매 입고로 전환 → 고객 선택 다시 표시
      await page.getByRole("button", { name: "구매 입고" }).click();
      await expectCustomerSectionVisible(page);
      await expect(page.getByText("먼저 고객을 선택해주세요")).toBeVisible();
    });

    // 목적 버튼 활성 상태 전환 검증
    test("모든 목적 버튼을 순환하며 활성 상태가 올바르게 전환된다", async ({
      page,
    }) => {
      await openInboundModal(page);

      const purposes = ["구매 입고", "창고 간 이동", "재고 조정", "기타"];

      for (const purpose of purposes) {
        const btn = page.getByRole("button", { name: purpose });
        await btn.click();
        // 선택된 버튼만 활성 상태
        await expect(btn).toHaveClass(/bg-blue-500/);

        // 다른 버튼들은 비활성 상태
        for (const other of purposes.filter((p) => p !== purpose)) {
          await expect(page.getByRole("button", { name: other })).toHaveClass(
            /bg-gray-100/
          );
        }
      }
    });
  });

  // =============================================================
  // [AC-6] 출고 모달 (OutboundModal) 테스트
  // =============================================================
  test.describe("출고 모달", () => {
    // [AC-3] sale일 때 고객 필수
    test("기본 상태: 판매 출고가 선택되어 있고 고객 선택이 표시된다", async ({
      page,
    }) => {
      await openOutboundModal(page);

      // 판매 출고 버튼이 활성 상태 확인
      const saleBtn = page.getByRole("button", { name: "판매 출고" });
      await expect(saleBtn).toBeVisible();
      await expect(saleBtn).toHaveClass(/bg-blue-500/);

      // 고객 선택 영역 표시 확인
      await expectCustomerSectionVisible(page);

      // 고객 미선택 상태 → 안내 메시지 표시
      await expect(page.getByText("먼저 고객을 선택해주세요")).toBeVisible();
    });

    // [AC-1] transfer일 때 고객 선택 숨김
    test("창고 간 이동 선택 시 고객 선택이 숨겨지고 출고처 폼이 바로 표시된다", async ({
      page,
    }) => {
      await openOutboundModal(page);

      await page.getByRole("button", { name: "창고 간 이동" }).click();

      await expectCustomerSectionHidden(page);
      await expect(
        page.getByText("먼저 고객을 선택해주세요")
      ).not.toBeVisible();

      // [AC-2] 출고처 폼이 바로 표시됨
      await expectOutboundFormVisible(page);
    });

    // [AC-1] adjustment일 때 고객 선택 숨김
    test("재고 조정 선택 시 고객 선택이 숨겨지고 출고처 폼이 바로 표시된다", async ({
      page,
    }) => {
      await openOutboundModal(page);

      await page.getByRole("button", { name: "재고 조정" }).click();

      await expectCustomerSectionHidden(page);
      await expectOutboundFormVisible(page);
    });

    // [AC-1] other일 때 고객 선택 숨김
    test("기타 선택 시 고객 선택이 숨겨지고 출고처 폼이 바로 표시된다", async ({
      page,
    }) => {
      await openOutboundModal(page);

      await page.getByRole("button", { name: "기타" }).click();

      await expectCustomerSectionHidden(page);
      await expectOutboundFormVisible(page);
    });

    // [AC-2] 고객 미선택 시에도 출고처 직접 입력 가능
    test("비거래 목적에서 출고처를 직접 입력할 수 있다", async ({ page }) => {
      await openOutboundModal(page);

      await page.getByRole("button", { name: "창고 간 이동" }).click();

      const placeInput = page.getByPlaceholder("출고처를 입력하세요");
      await placeInput.fill("B창고 2층");
      await expect(placeInput).toHaveValue("B창고 2층");

      const detailInput = page.getByPlaceholder(
        "상세주소를 입력하세요 (동/호수 등)"
      );
      await detailInput.fill("201호");
      await expect(detailInput).toHaveValue("201호");
    });

    // [AC-4] 목적 변경 시 고객 관련 상태 초기화
    test("목적 변경 시 입력한 출고처 정보가 초기화된다", async ({ page }) => {
      await openOutboundModal(page);

      // 1단계: 창고 간 이동으로 전환 → 출고처 입력
      await page.getByRole("button", { name: "창고 간 이동" }).click();
      const placeInput = page.getByPlaceholder("출고처를 입력하세요");
      await placeInput.fill("테스트 창고");
      await expect(placeInput).toHaveValue("테스트 창고");

      // 2단계: 기타로 전환 → 출고처 초기화
      await page.getByRole("button", { name: "기타" }).click();
      await expect(page.getByPlaceholder("출고처를 입력하세요")).toHaveValue(
        ""
      );

      // 3단계: 다시 판매 출고로 전환 → 고객 선택 다시 표시
      await page.getByRole("button", { name: "판매 출고" }).click();
      await expectCustomerSectionVisible(page);
      await expect(page.getByText("먼저 고객을 선택해주세요")).toBeVisible();
    });

    // 목적 버튼 활성 상태 전환 검증
    test("모든 목적 버튼을 순환하며 활성 상태가 올바르게 전환된다", async ({
      page,
    }) => {
      await openOutboundModal(page);

      const purposes = ["판매 출고", "창고 간 이동", "재고 조정", "기타"];

      for (const purpose of purposes) {
        const btn = page.getByRole("button", { name: purpose });
        await btn.click();
        await expect(btn).toHaveClass(/bg-blue-500/);

        for (const other of purposes.filter((p) => p !== purpose)) {
          await expect(page.getByRole("button", { name: other })).toHaveClass(
            /bg-gray-100/
          );
        }
      }
    });
  });
});
