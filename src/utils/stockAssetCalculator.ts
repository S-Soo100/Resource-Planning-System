import { Item } from "@/types/(item)/item";
import {
  StockAssetSummary,
  CategoryAsset,
  ItemWithAssetValue,
} from "@/types/stock-asset";

/**
 * 재고 품목들의 자산 가치를 계산
 * @param items 재고 품목 목록
 * @param getCategoryName 카테고리 ID로 이름을 가져오는 함수
 * @returns 재고 자산 요약 정보
 */
export const calculateStockAsset = (
  items: Item[],
  getCategoryName: (categoryId?: number | null) => string
): StockAssetSummary => {
  let totalAssetValue = 0;
  let totalItemsWithCost = 0;
  let totalItemsWithoutCost = 0;
  const categoryMap = new Map<number, CategoryAsset>();

  items.forEach((item) => {
    const costPrice = item.teamItem?.costPrice ?? null;
    const categoryId =
      item.teamItem?.category?.id ?? item.teamItem?.categoryId;
    const categoryName = getCategoryName(categoryId) || "미분류";

    if (costPrice !== null && costPrice > 0) {
      // 원가가 입력된 경우
      const assetValue = costPrice * item.itemQuantity;
      totalAssetValue += assetValue;
      totalItemsWithCost++;

      // 카테고리별 집계
      if (categoryId) {
        const existing = categoryMap.get(categoryId);
        if (existing) {
          existing.assetValue += assetValue;
          existing.itemCount++;
          existing.totalQuantity += item.itemQuantity;
        } else {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            assetValue,
            itemCount: 1,
            totalQuantity: item.itemQuantity,
            itemsWithoutCost: 0,
          });
        }
      }
    } else {
      // 원가 미입력
      totalItemsWithoutCost++;

      if (categoryId) {
        const existing = categoryMap.get(categoryId);
        if (existing) {
          existing.itemsWithoutCost++;
        } else {
          // 원가 미입력 품목만 있는 카테고리
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            assetValue: 0,
            itemCount: 0,
            totalQuantity: item.itemQuantity,
            itemsWithoutCost: 1,
          });
        }
      }
    }
  });

  return {
    totalAssetValue,
    totalItemsWithCost,
    totalItemsWithoutCost,
    categoryAssets: Array.from(categoryMap.values()).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    ),
  };
};

/**
 * 품목에 자산 가치 정보를 추가
 * @param item 재고 품목
 * @returns 자산 가치가 포함된 품목 정보
 */
export const addAssetValueToItem = (item: Item): ItemWithAssetValue => {
  const costPrice = item.teamItem?.costPrice ?? null;
  const assetValue =
    costPrice !== null && costPrice > 0
      ? costPrice * item.itemQuantity
      : null;

  return {
    ...item,
    costPrice,
    assetValue,
  };
};

/**
 * 금액을 포맷팅 (천 단위 콤마 + ₩ 접두사)
 * @param amount 금액
 * @returns 포맷팅된 문자열
 */
export const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) {
    return "-";
  }
  return `₩${amount.toLocaleString()}`;
};

/**
 * 원가 미입력 여부 확인
 * @param item 재고 품목
 * @returns 원가 미입력 여부
 */
export const isCostPriceMissing = (item: Item): boolean => {
  const costPrice = item.teamItem?.costPrice ?? null;
  return costPrice === null || costPrice === 0;
};
