/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UpdateItemQuantityRequest } from "@/types/item";
import { SearchOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useItems } from "@/hooks/useItems";
import { CreateInventoryRecordRequest } from "@/types/inventory-record";
import EditQuantityModal from "./modal/EditQuantityModal";

export interface StockTableFormValues extends CreateInventoryRecordRequest {
  inboundDate?: string | null;
  outboundDate?: string | null;
  inboundLocation?: string | null;
  outboundLocation?: string | null;
  inboundQuantity?: number | null;
  outboundQuantity?: number | null;
  remarks?: string | null;
  supplierId?: number | null;
  packageId?: number | null;
  itemId?: number | null;
  userId?: number | null;
  name?: string | null;
  price?: number | null;
  description?: string | null;
  warehouseId: number | null;
}

export default function StockTable() {
  const router = useRouter();
  const { items, warehouses, isLoading, isError } = useWarehouseItems();
  const { useUpdateItemQuantity } = useItems();
  const updateQuantityMutation = useUpdateItemQuantity();
  const [isEditQuantityModalOpen, setIsEditQuantityModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [quantityEditValues, setQuantityEditValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    currentQuantity: number;
    newQuantity: number;
    reason: string;
    warehouseId: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    currentQuantity: 0,
    newQuantity: 0,
    reason: "",
    warehouseId: 0,
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleOpenEditQuantityModal = (item: any) => {
    setQuantityEditValues({
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      currentQuantity: item.itemQuantity,
      newQuantity: item.itemQuantity,
      reason: "",
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
          onSuccess: (response) => {
            if (response.success) {
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
    return items.filter((item) => item.warehouseId === warehouseId);
  };

  // 검색 기능
  const getFilteredItems = (warehouseItems: any[]) => {
    return warehouseItems.filter((item) => {
      return (
        item.itemCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchText.toLowerCase())
      );
    });
  };

  if (isLoading)
    return <div className="p-4 text-center">데이터를 불러오는 중...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <>
      <div key="warehouse-container" className="overflow-x-auto relative">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64 m-4">
            <input
              type="text"
              placeholder="품목코드 또는 품목명 검색..."
              className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <SearchOutlined className="absolute right-3 top-2.5 text-gray-400 text-sm" />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {}}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              입고
            </button>
            <button
              onClick={() => {}}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 12H4"
                />
              </svg>
              출고
            </button>
          </div>
        </div>

        {warehouses.map((warehouse, warehouseIndex) => {
          const warehouseItems = getWarehouseItems(Number(warehouse.id));
          const filteredItems = getFilteredItems(warehouseItems);

          return (
            <div
              key={`warehouse-${warehouse.id}-${warehouseIndex}`}
              className="mb-8"
            >
              <h2 className="text-xl font-bold mb-4 px-4">
                {warehouse.warehouseName ||
                  warehouses.find((w) => w.id === warehouse.id)
                    ?.warehouseName ||
                  `창고 ${warehouse.id}`}
              </h2>

              <table className="mx-3 my-2 bg-white rounded-2xl overflow-hidden shadow-sm w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-1/12">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      품목 코드
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      품목명
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      재고수량
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      최종수정일
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-1/12">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="py-6">
                          <p className="text-lg text-gray-500 mb-4">
                            창고가 비었습니다.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, itemIndex) => (
                      <tr
                        key={`item-${warehouse.id}-${item.id}-${itemIndex}`}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                            onClick={() =>
                              router.push(`/item/detail/${item.id}`)
                            }
                          >
                            {item.itemCode}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                            onClick={() =>
                              router.push(`/item/detail/${item.id}`)
                            }
                          >
                            {item.itemName}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {item.itemQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex justify-center">
                            <button
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-150 shadow-sm"
                              onClick={() => handleOpenEditQuantityModal(item)}
                            >
                              수정
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
        <EditQuantityModal
          isOpen={isEditQuantityModalOpen}
          onClose={handleCloseEditQuantityModal}
          quantityEditValues={quantityEditValues}
          onFormChange={handleQuantityEditFormChange}
          onUpdateQuantity={handleUpdateQuantity}
        />
      </div>
    </>
  );
}
