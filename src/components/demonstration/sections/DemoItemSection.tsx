import React, { useMemo } from "react";
import { Plus, Minus, X, AlertCircle } from "lucide-react";
import {
  OrderRequestFormData,
  OrderItemWithDetails,
} from "@/types/(order)/orderRequestFormData";
import { Item } from "@/types/(item)/item";
import { usePackages } from "@/hooks/usePackages";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";

interface DemoItemSectionProps {
  isPackageOrder: boolean;
  formData: OrderRequestFormData;
  orderItems: (OrderItemWithDetails & {
    warehouseItemId: number;
    id: number;
  })[];
  setOrderItems: React.Dispatch<
    React.SetStateAction<
      (OrderItemWithDetails & { warehouseItemId: number; id: number })[]
    >
  >;
  onRemoveItem: (itemId: number) => void;
  onQuantityChange: (index: number, increment: boolean) => void;
  warehouseItems?: Record<string, Item[]>;
}

const DemoItemSection: React.FC<DemoItemSectionProps> = ({
  isPackageOrder,
  formData,
  orderItems,
  setOrderItems,
  onRemoveItem,
  onQuantityChange,
  warehouseItems: propWarehouseItems,
}) => {
  const { useGetPackages } = usePackages();
  const { packages } = useGetPackages();
  const { useGetItemsByWarehouse } = useItemStockManagement();

  // 창고별 아이템 재고 조회 - props가 없을 경우에만 사용
  const warehouseId = formData.warehouseId?.toString() || "";
  const { data: warehouseItemsData } = useGetItemsByWarehouse(
    warehouseId || undefined
  );

  // 현재 선택된 창고의 아이템 목록
  const currentWarehouseItems = useMemo(() => {
    if (propWarehouseItems && warehouseId) {
      return propWarehouseItems[warehouseId] || [];
    }
    return (warehouseItemsData?.data as Item[]) || [];
  }, [propWarehouseItems, warehouseId, warehouseItemsData]);

  // 개별 아이템 선택 핸들러
  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = parseInt(e.target.value);
    if (itemId) {
      const selectedItem = currentWarehouseItems.find(
        (item) => item.id === itemId
      );
      if (selectedItem) {
        // 이미 추가된 아이템인지 확인
        const existingItem = orderItems.find(
          (item) => item.teamItem.itemCode === selectedItem.teamItem.itemCode
        );

        if (!existingItem) {
          // 새 아이템 추가
          const newItem: OrderItemWithDetails & {
            warehouseItemId: number;
            id: number;
          } = {
            id: Date.now(),
            teamItem: {
              id: selectedItem.teamItem.id,
              itemCode: selectedItem.teamItem.itemCode,
              itemName: selectedItem.teamItem.itemName,
              categoryId: selectedItem.teamItem.categoryId,
              category: selectedItem.teamItem.category,
              teamId: selectedItem.teamItem.teamId,
              memo: selectedItem.teamItem.memo || "",
            },
            quantity: 1,
            stockAvailable: selectedItem.itemQuantity >= 1,
            stockQuantity: selectedItem.itemQuantity,
            warehouseItemId: selectedItem.id,
          };
          setOrderItems((prev) => [...prev, newItem]);
        }
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-800">시연품 선택</h2>

      {isPackageOrder ? (
        // 패키지 시연품 선택
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              패키지 선택
            </label>
            <select
              value={formData.supplierId || ""}
              onChange={handleItemSelect}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">패키지를 선택하세요</option>
              {packages?.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.packageName} - {pkg.packageName}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        // 개별 시연품 선택
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            시연품 선택
          </label>
          <select
            onChange={handleItemSelect}
            className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">시연품을 선택하세요</option>
            {currentWarehouseItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.teamItem.itemName} ({item.teamItem.itemCode}) - 재고:{" "}
                {item.itemQuantity}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 선택된 시연품 목록 */}
      {orderItems.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 font-medium text-gray-700 text-md">
            선택된 시연품
          </h3>
          <div className="space-y-2">
            {orderItems.map((item, index) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {item.teamItem.itemName}
                  </div>
                  <div className="text-sm text-gray-500">
                    코드: {item.teamItem.itemCode}
                  </div>
                  {item.teamItem.category && (
                    <div className="text-sm text-gray-400">
                      카테고리: {item.teamItem.category.name}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    재고: {item.stockQuantity}개
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => onQuantityChange(index, false)}
                    className="p-1 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-medium min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQuantityChange(index, true)}
                    className="p-1 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {!item.stockAvailable && (
                  <div className="flex gap-1 items-center text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    재고 부족
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoItemSection;
