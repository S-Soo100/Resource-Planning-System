import { useQuery } from "@tanstack/react-query";
import { SalesRecord, SalesSummary, SalesFilterParams } from "@/types/sales";
import { DemoResponse } from "@/types/demo/demo";
import { Order } from "@/types/(order)/order";
import { getDemoByTeamId } from "@/api/demo-api";
import { authStore } from "@/store/authStore";

/**
 * 유료 시연에 포함되는 상태 목록
 */
const PAID_DEMO_VALID_STATUSES = [
  "confirmedByShipper",
  "shipmentCompleted",
  "demoCompleted",
];

/**
 * 유료 시연 데이터를 SalesRecord로 변환
 */
const transformDemoToSalesRecord = (demo: DemoResponse): SalesRecord => {
  const totalQuantity = demo.demoItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const demoPrice = demo.demoPrice ?? null;

  return {
    id: demo.id,
    purchaseDate: demo.demoStartDate || "",
    title: demo.demoTitle || "",
    supplierName: demo.demoManager || "",
    receiver: demo.demoAddress || "",
    itemCount: demo.demoItems.length,
    totalQuantity,
    totalPrice: demoPrice,
    status: demo.demoStatus || "",
    manager: demo.handler || "",
    memo: demo.memo || null,
    orderItems: [],
    originalOrder: {} as Order,
    // 마진 분석: 유료 시연은 원가 0원
    costAmount: 0,
    marginAmount: demoPrice,
    marginRate: demoPrice !== null && demoPrice > 0 ? 100 : null,
    hasCostPrice: true,
    isNegativeMargin: false,
    // 데이터 출처
    source: "demo",
    demoId: demo.id,
    originalDemo: demo,
  };
};

/**
 * 유료 시연 요약 정보 계산
 */
const calculateDemoSummary = (records: SalesRecord[]): SalesSummary => {
  const totalItems = records.reduce((sum, r) => sum + r.itemCount, 0);
  const totalQuantity = records.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalSales = records.reduce(
    (sum, r) => (r.totalPrice !== null ? sum + r.totalPrice : sum),
    0
  );
  const missingPriceCount = records.filter((r) => r.totalPrice === null).length;

  // 마진: 유료 시연은 원가 0이므로 마진 = 판매가
  const totalCost = 0;
  const totalMargin = totalSales;
  const recordsWithMargin = records.filter((r) => r.marginRate !== null);
  const averageMarginRate =
    recordsWithMargin.length > 0
      ? recordsWithMargin.reduce((sum, r) => sum + (r.marginRate || 0), 0) /
        recordsWithMargin.length
      : 0;

  return {
    totalOrders: records.length,
    totalItems,
    totalQuantity,
    totalSales,
    missingPriceCount,
    totalCost,
    totalMargin,
    averageMarginRate,
    negativeMarginCount: 0,
    missingCostCount: 0,
    demoCount: records.length,
    demoSalesAmount: totalSales,
  };
};

/**
 * 유료 시연 데이터를 판매 레코드로 조회하는 훅
 */
export const useDemoSalesData = (params: SalesFilterParams) => {
  const selectedTeam = authStore((state) => state.selectedTeam);

  return useQuery({
    queryKey: [
      "demoSales",
      selectedTeam?.id,
      params.startDate,
      params.endDate,
      params.searchQuery,
      params.showMissingPriceOnly,
    ],
    queryFn: async () => {
      if (!selectedTeam?.id) {
        throw new Error("팀이 선택되지 않았습니다.");
      }

      // 시연 데이터 조회
      const response = await getDemoByTeamId(selectedTeam.id);
      if (!response.success || !response.data) {
        throw new Error("시연 데이터 조회에 실패했습니다.");
      }

      // API 응답 구조 안전 파싱: 배열이면 직접 사용, 아니면 .data 접근
      const rawData = response.data;
      const demos: DemoResponse[] = Array.isArray(rawData)
        ? rawData
        : (rawData as unknown as { data: DemoResponse[] })?.data || [];

      // 유료 시연 + 유효 상태만 필터링
      const filteredDemos = demos.filter(
        (demo) =>
          demo.demoPaymentType === "유료" &&
          PAID_DEMO_VALID_STATUSES.includes(demo.demoStatus)
      );

      // SalesRecord로 변환
      let salesRecords = filteredDemos.map(transformDemoToSalesRecord);

      // 날짜 필터링
      salesRecords = salesRecords.filter((record) => {
        const date = record.purchaseDate;
        return date >= params.startDate && date <= params.endDate;
      });

      // 검색어 필터링
      if (params.searchQuery && params.searchQuery.trim()) {
        const query = params.searchQuery.toLowerCase();
        salesRecords = salesRecords.filter(
          (record) =>
            record.title.toLowerCase().includes(query) ||
            record.supplierName.toLowerCase().includes(query) ||
            record.receiver.toLowerCase().includes(query) ||
            record.manager.toLowerCase().includes(query)
        );
      }

      // 판매가 미입력만 보기
      if (params.showMissingPriceOnly) {
        salesRecords = salesRecords.filter((r) => r.totalPrice === null);
      }

      const summary = calculateDemoSummary(salesRecords);

      return {
        records: salesRecords,
        summary,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분
  });
};
