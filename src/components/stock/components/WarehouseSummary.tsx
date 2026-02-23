"use client";
import React, { useMemo } from 'react';
import { Warehouse } from '@/types/warehouse';
import { Item } from '@/types/(item)/item';
import { FaWarehouse, FaBoxes, FaListUl, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import { useCategory } from '@/hooks/useCategory';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { calculateStockAsset, formatCurrency } from '@/utils/stockAssetCalculator';
import { useRouter } from 'next/navigation';

interface WarehouseSummaryProps {
  warehouse: Warehouse;
  items: Item[];
}

const WarehouseSummary: React.FC<WarehouseSummaryProps> = ({ warehouse, items }) => {
  const { categories } = useCategory(warehouse.teamId);
  const { user } = useCurrentUser();
  const router = useRouter();

  // 권한 체크: Admin, Moderator만 원가 정보 열람 가능
  const canViewCostPrice = user?.accessLevel === 'admin' || user?.accessLevel === 'moderator';

  // 카테고리 ID로 카테고리 이름 찾기
  const getCategoryNameById = (categoryId?: number | null): string => {
    if (!categoryId) return '미분류';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || '미분류';
  };

  // 재고 자산 계산
  const assetSummary = useMemo(() => {
    return calculateStockAsset(items, getCategoryNameById);
  }, [items, categories]);

  // 원가 미입력 품목 클릭 핸들러
  const handleMissingCostClick = () => {
    router.push('/team-items');
  };

  // 총 수량 계산
  const getTotalQuantity = () => {
    return items.reduce((sum, item) => sum + item.itemQuantity, 0);
  };

  const totalQuantity = getTotalQuantity();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* 창고 기본 정보 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaWarehouse className="text-xl text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">{warehouse.warehouseName}</h2>
        </div>

        {warehouse.warehouseAddress && (
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
            <FaMapMarkerAlt className="text-blue-500 mt-0.5" />
            <p>{warehouse.warehouseAddress}</p>
          </div>
        )}

        {warehouse.description && (
          <p className="text-sm text-gray-600 mt-2">{warehouse.description}</p>
        )}
      </div>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* 총 품목 수 */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <FaBoxes className="text-xl text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">총 품목 수</p>
              <p className="text-xl font-bold text-gray-900">{items.length}개</p>
            </div>
          </div>
        </div>

        {/* 총 재고 자산 (권한 있는 사용자만) */}
        {canViewCostPrice && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-xl text-green-600" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">총 재고 자산</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(assetSummary.totalAssetValue)}
                </p>
                {assetSummary.totalItemsWithoutCost > 0 && (
                  <button
                    onClick={handleMissingCostClick}
                    className="text-xs text-yellow-600 hover:text-yellow-700 hover:underline mt-1"
                  >
                    ⚠️ 원가 미입력: {assetSummary.totalItemsWithoutCost}개
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 카테고리별 상세 정보 */}
      {assetSummary.categoryAssets.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">카테고리별 현황</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {assetSummary.categoryAssets.map(category => (
              <div
                key={category.categoryId}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 mb-2">{category.categoryName}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>품목 수</span>
                    <span className="font-medium">{category.itemCount + category.itemsWithoutCost}개</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>총 수량</span>
                    <span className="font-medium">{category.totalQuantity.toLocaleString()}개</span>
                  </div>
                  {canViewCostPrice && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">재고 자산</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(category.assetValue)}
                        </span>
                      </div>
                      {category.itemsWithoutCost > 0 && (
                        <div className="flex justify-between text-xs text-yellow-600">
                          <span>원가 미입력</span>
                          <span className="font-medium">{category.itemsWithoutCost}개</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseSummary;
