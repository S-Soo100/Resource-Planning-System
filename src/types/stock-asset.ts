import { Item } from "./(item)/item";

/**
 * 재고 자산 요약 정보
 */
export interface StockAssetSummary {
  totalAssetValue: number; // 총 재고 자산 (원가 입력된 품목만)
  totalItemsWithCost: number; // 원가 입력된 품목 수
  totalItemsWithoutCost: number; // 원가 미입력 품목 수
  categoryAssets: CategoryAsset[]; // 카테고리별 자산
}

/**
 * 카테고리별 재고 자산 정보
 */
export interface CategoryAsset {
  categoryId: number;
  categoryName: string;
  assetValue: number; // 카테고리 총 자산
  itemCount: number; // 품목 수
  totalQuantity: number; // 총 수량
  itemsWithoutCost: number; // 원가 미입력 품목 수
}

/**
 * 자산 가치가 포함된 품목 정보
 */
export interface ItemWithAssetValue extends Item {
  costPrice: number | null; // TeamItem.costPrice
  assetValue: number | null; // costPrice × itemQuantity
}
