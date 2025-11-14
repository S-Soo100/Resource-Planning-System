/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { UpdateItemQuantityRequest } from "@/types/(item)/item";
import React, { useState, useEffect } from "react";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import EditQuantityModal from "./modal/EditQuantityModal";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import WarehouseCard from "./components/WarehouseCard";
import StockTableHeader from "./components/StockTableHeader";
import StockTableDesktop from "./components/StockTableDesktop";
import StockItemCard from "./components/StockItemCard";
import StockTableEmpty from "./components/StockTableEmpty";
import WarehouseSummary from "./components/WarehouseSummary";
import { useQueryClient } from "@tanstack/react-query";
import { filterAccessibleWarehouses } from "@/utils/warehousePermissions";

export interface StockTableFormValues {
  itemId?: number;
  warehouseId: number;
}

export default function StockTable() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const {
    items,
    warehouses,
    isLoading: isDataLoading,
    isError,
    invalidateInventory,
  } = useWarehouseItems();
  const { useUpdateItemQuantity } = useItemStockManagement();
  const updateQuantityMutation = useUpdateItemQuantity();
  const queryClient = useQueryClient();
  const [isEditQuantityModalOpen, setIsEditQuantityModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [hideZeroStock, setHideZeroStock] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );

  const [quantityEditValues, setQuantityEditValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    currentQuantity: number;
    newQuantity: number;
    warehouseId: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    currentQuantity: 0,
    newQuantity: 0,
    warehouseId: 0,
  });

  // 사용자가 접근 가능한 창고만 필터링
  const accessibleWarehouses = user
    ? filterAccessibleWarehouses(user, warehouses)
    : warehouses;

  // 허용된 창고와 제한된 창고 콘솔 출력
  if (user) {
    const accessibleWarehouseNames = accessibleWarehouses
      .map((w) => w.warehouseName)
      .join(", ");
    const restrictedWarehouseNames = warehouses
      .filter((w) => !accessibleWarehouses.some((aw) => aw.id === w.id))
      .map((w) => w.warehouseName)
      .join(", ");

    console.log(
      `[재고관리] ${user.name}(${user.accessLevel}): 허용된 창고: [${accessibleWarehouseNames}] | 제한된 창고: [${restrictedWarehouseNames}]`
    );
  }

  // 페이지 로드 시 첫 번째 창고 자동 선택
  useEffect(() => {
    if (
      !isDataLoading &&
      accessibleWarehouses &&
      accessibleWarehouses.length > 0 &&
      selectedWarehouseId === null
    ) {
      const firstWarehouseId = Number(accessibleWarehouses[0].id);
      setSelectedWarehouseId(firstWarehouseId);
    }
  }, [isDataLoading, accessibleWarehouses, selectedWarehouseId]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleOpenEditQuantityModal = (item: any) => {
    // moderator는 재고 수량을 직접 수정할 수 없도록 처리
    if (user?.accessLevel !== "admin") {
      return;
    }

    setQuantityEditValues({
      itemId: item.id,
      itemCode: item.teamItem?.itemCode || "",
      itemName: item.teamItem?.itemName || "",
      currentQuantity: item.itemQuantity,
      newQuantity: item.itemQuantity,
      warehouseId: item.warehouseId,
    });
    setIsEditQuantityModalOpen(true);
  };

  const handleCloseEditQuantityModal = () => {
    setIsEditQuantityModalOpen(false);
  };

  const handleQuantityEditFormChange = (
    field: string,
    value: string | number
  ) => {
    setQuantityEditValues({
      ...quantityEditValues,
      [field]: value,
    });
  };

  const handleUpdateQuantity = () => {
    if (!quantityEditValues.itemId) return;

    try {
      const data: UpdateItemQuantityRequest = {
        quantity: quantityEditValues.newQuantity,
      };

      updateQuantityMutation.mutate(
        {
          id: quantityEditValues.itemId.toString(),
          data,
          itemWarehouseId: quantityEditValues.warehouseId.toString(),
        },
        {
          onSuccess: async (response) => {
            if (response.success) {
              // 재고 기록 생성 로직 제거 - 단순 수량 수정만 수행
              alert("재고 수량이 성공적으로 업데이트되었습니다.");
              handleCloseEditQuantityModal();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("수량 업데이트 중 오류 발생:", error);
            alert("수량 업데이트 중 오류가 발생했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("수량 업데이트 중 오류 발생:", error);
      alert("수량 업데이트 중 오류가 발생했습니다.");
    }
  };

  // 창고별로 아이템 필터링
  const getWarehouseItems = (warehouseId: number) => {
    const warehouseData = warehouses.find((w) => Number(w.id) === warehouseId);

    if (warehouseData && warehouseData.items) {
      return warehouseData.items;
    }

    return items.filter((item) => item.warehouseId === warehouseId);
  };

  // 검색 기능
  const getFilteredItems = (warehouseItems: any[]) => {
    return warehouseItems.filter((item) => {
      // 검색 대상 필드들
      const itemCode = item.teamItem?.itemCode || "";
      const itemName = item.teamItem?.itemName || "";
      const memo = item.teamItem?.memo || "";
      const categoryName = item.teamItem?.category?.name || "";

      // 검색어를 소문자로 변환
      const searchLower = searchText.toLowerCase();

      // 각 필드에서 검색어 포함 여부 확인
      const matchesSearch =
        itemCode.toLowerCase().includes(searchLower) ||
        itemName.toLowerCase().includes(searchLower) ||
        memo.toLowerCase().includes(searchLower) ||
        categoryName.toLowerCase().includes(searchLower);

      // 재고가 0인 품목 필터링
      const passesZeroFilter = hideZeroStock ? item.itemQuantity > 0 : true;

      return matchesSearch && passesZeroFilter;
    });
  };

  // 창고 선택 핸들러
  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
  };

  if (isUserLoading || isDataLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <>
      <div key="warehouse-container" className="relative overflow-x-auto">
        {/* 창고 선택 드롭다운 */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              창고 선택
            </label>
            <select
              value={selectedWarehouseId || ''}
              onChange={(e) => handleWarehouseSelect(Number(e.target.value))}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">창고를 선택하세요</option>
              {accessibleWarehouses.map((warehouse) => (
                <option key={`warehouse-option-${warehouse.id}`} value={warehouse.id}>
                  {warehouse.warehouseName} ({getWarehouseItems(Number(warehouse.id)).length}개 품목)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedWarehouseId && (
          <>
            {/* 창고 요약 정보 */}
            <div className="px-4">
              <WarehouseSummary
                warehouse={
                  accessibleWarehouses.find(
                    (w) => Number(w.id) === selectedWarehouseId
                  )!
                }
                items={getWarehouseItems(selectedWarehouseId)}
              />
            </div>

            <StockTableHeader
              searchText={searchText}
              onSearch={handleSearch}
              hideZeroStock={hideZeroStock}
              onHideZeroStockChange={setHideZeroStock}
              warehouseName={
                accessibleWarehouses.find(
                  (w) => Number(w.id) === selectedWarehouseId
                )?.warehouseName || `창고 ${selectedWarehouseId}`
              }
              onInboundClick={() => {}}
              onOutboundClick={() => {}}
              showButtons={false}
            />

            {/* 선택된 창고의 재고 테이블 */}
            <div className="hidden md:block">
              <div className="mx-3 my-2 overflow-hidden bg-white shadow-sm rounded-2xl">
                <table className="w-full">
                  <tbody>
                    <StockTableDesktop
                      items={getFilteredItems(
                        getWarehouseItems(selectedWarehouseId)
                      )}
                      onEditQuantity={handleOpenEditQuantityModal}
                      showEditButton={user?.accessLevel === "admin"}
                    />
                  </tbody>
                </table>
              </div>
            </div>

            {/* 모바일용 카드 뷰 */}
            <div className="px-4 md:hidden">
              <StockItemCard
                items={getFilteredItems(getWarehouseItems(selectedWarehouseId))}
                onEditQuantity={handleOpenEditQuantityModal}
                showEditButton={user?.accessLevel === "admin"}
              />
            </div>
          </>
        )}

        {!selectedWarehouseId && warehouses.length > 0 && <StockTableEmpty />}

        <EditQuantityModal
          isOpen={isEditQuantityModalOpen}
          onClose={handleCloseEditQuantityModal}
          quantityEditValues={quantityEditValues}
          onFormChange={handleQuantityEditFormChange}
          onUpdateQuantity={handleUpdateQuantity}
        />
        {/* 입고/출고 모달은 ioHistory 페이지로 이동됨 */}
      </div>
    </>
  );
}
