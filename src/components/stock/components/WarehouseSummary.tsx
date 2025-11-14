"use client";
import React from 'react';
import { Warehouse } from '@/types/warehouse';
import { Item } from '@/types/(item)/item';
import { FaWarehouse, FaBoxes, FaListUl, FaMapMarkerAlt } from 'react-icons/fa';

interface WarehouseSummaryProps {
  warehouse: Warehouse;
  items: Item[];
}

const WarehouseSummary: React.FC<WarehouseSummaryProps> = ({ warehouse, items }) => {
  // 카테고리별 그룹화
  const getCategoryGroups = () => {
    const categoryMap = new Map<string, { name: string; count: number; totalQuantity: number }>();

    items.forEach(item => {
      const categoryName = item.teamItem?.category?.name || '미분류';
      const existing = categoryMap.get(categoryName);

      if (existing) {
        existing.count += 1;
        existing.totalQuantity += item.itemQuantity;
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          count: 1,
          totalQuantity: item.itemQuantity
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // 총 수량 계산
  const getTotalQuantity = () => {
    return items.reduce((sum, item) => sum + item.itemQuantity, 0);
  };

  const categories = getCategoryGroups();
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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

        {/* 총 수량 */}
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <FaBoxes className="text-xl text-green-600" />
            <div>
              <p className="text-xs text-gray-600">총 재고 수량</p>
              <p className="text-xl font-bold text-gray-900">{totalQuantity.toLocaleString()}개</p>
            </div>
          </div>
        </div>

        {/* 카테고리 수 */}
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <FaListUl className="text-xl text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">관리 카테고리</p>
              <p className="text-xl font-bold text-gray-900">{categories.length}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 카테고리별 상세 정보 */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">카테고리별 현황</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {categories.map(category => (
              <div
                key={category.name}
                className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 mb-1">{category.name}</p>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{category.count}개 품목</span>
                  <span className="font-medium">{category.totalQuantity.toLocaleString()}개</span>
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
