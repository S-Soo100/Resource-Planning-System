/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UpdateItemQuantityRequest } from "@/types/item";
import { Button, Modal, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useItems } from "@/hooks/useItems";

// Select 컴포넌트의 value 타입을 위한 인터페이스 정의
interface SelectOption {
  value: any;
  label: string;
}

export default function StockTable() {
  const router = useRouter();
  const { items, warehouses, isLoading, isError } = useWarehouseItems();
  const { useUpdateItemQuantity } = useItems();
  const updateQuantityMutation = useUpdateItemQuantity();
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isEditQuantityModalOpen, setIsEditQuantityModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [localWarehouses, setLocalWarehouses] = useState<TeamWarehouse[]>([]);
  const [stockFormValues, setStockFormValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    quantity: number;
    warehouseId: number;
    note: string;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    quantity: 0,
    warehouseId: 0,
    note: "",
  });
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

  useEffect(() => {
    const team = authService.getSelectedTeam();
    if (team && team.Warehouses) {
      setLocalWarehouses(team.Warehouses);
    } else {
      setLocalWarehouses([]);
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleOpenStockInModal = () => {
    setIsStockInModalOpen(true);
  };

  const handleCloseStockInModal = () => {
    setStockFormValues({
      itemId: null,
      itemCode: "",
      itemName: "",
      quantity: 0,
      warehouseId: 0,
      note: "",
    });
    setIsStockInModalOpen(false);
  };

  const handleOpenStockOutModal = () => {
    setIsStockOutModalOpen(true);
  };

  const handleCloseStockOutModal = () => {
    setStockFormValues({
      itemId: null,
      itemCode: "",
      itemName: "",
      quantity: 0,
      warehouseId: 0,
      note: "",
    });
    setIsStockOutModalOpen(false);
  };

  const handleStockFormChange = (
    field: string,
    value: string | number | null
  ) => {
    setStockFormValues({
      ...stockFormValues,
      [field]: value,
    });
  };

  const handleStockIn = () => {
    try {
      console.log("입고 처리:", stockFormValues);

      // 현재 아이템 정보 찾기
      const currentItem = items.find(
        (item) => item.id === stockFormValues.itemId
      );
      if (!currentItem) {
        alert("선택한 품목을 찾을 수 없습니다.");
        return;
      }

      // 입고는 기존 수량에 추가
      const newQuantity = currentItem.itemQuantity + stockFormValues.quantity;

      // 수량 업데이트 뮤테이션 사용
      updateQuantityMutation.mutate(
        {
          id: stockFormValues.itemId!.toString(),
          data: { quantity: newQuantity },
          itemWarehouseId: stockFormValues.warehouseId.toString(),
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              alert(`${stockFormValues.quantity}개 입고 처리되었습니다.`);
              handleCloseStockInModal();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("입고 처리 중 오류 발생:", error);
            alert("입고 처리 중 오류가 발생했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("입고 처리 중 오류 발생:", error);
      alert("입고 처리 중 오류가 발생했습니다.");
    }
  };

  const handleStockOut = () => {
    try {
      console.log("출고 처리:", stockFormValues);

      // 현재 아이템 정보 찾기
      const currentItem = items.find(
        (item) => item.id === stockFormValues.itemId
      );
      if (!currentItem) {
        alert("선택한 품목을 찾을 수 없습니다.");
        return;
      }

      // 출고 수량이 현재 재고보다 많으면 오류
      if (stockFormValues.quantity > currentItem.itemQuantity) {
        alert(
          `출고 수량(${stockFormValues.quantity})이 현재 재고(${currentItem.itemQuantity})보다 많습니다.`
        );
        return;
      }

      // 출고는 기존 수량에서 감소
      const newQuantity = currentItem.itemQuantity - stockFormValues.quantity;

      // 수량 업데이트 뮤테이션 사용
      updateQuantityMutation.mutate(
        {
          id: stockFormValues.itemId!.toString(),
          data: { quantity: newQuantity },
          itemWarehouseId: stockFormValues.warehouseId.toString(),
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              alert(`${stockFormValues.quantity}개 출고 처리되었습니다.`);
              handleCloseStockOutModal();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("출고 처리 중 오류 발생:", error);
            alert("출고 처리 중 오류가 발생했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("출고 처리 중 오류 발생:", error);
      alert("출고 처리 중 오류가 발생했습니다.");
    }
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
              onClick={handleOpenStockInModal}
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
              onClick={handleOpenStockOutModal}
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

        {/* 창고 목록 디버깅 정보 */}
        {/* <div className="p-4 mb-6 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">창고 목록 디버깅 정보:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">
                useWarehouseItems 훅의 창고 목록 ({warehouses.length}개):
              </h4>
              {warehouses.length > 0 ? (
                <div>
                  <pre className="bg-gray-100 p-2 rounded-lg overflow-auto max-h-60 text-xs">
                    {JSON.stringify(warehouses, null, 2)}
                  </pre>
                  <div className="mt-4 text-sm font-medium text-gray-700">
                    실제 창고 정보:
                  </div>
                  <ul className="list-disc pl-5 mt-2">
                    {warehouses &&
                      warehouses.map((w, idx) => (
                        <li key={`debug-hook-warehouse-${idx}`}>
                          ID: {w.id}, 이름: {w.warehouseName || "없음"}, 팀:{" "}
                          {w.teamId}
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <p className="text-red-500">창고 데이터가 없습니다.</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold">
                로컬 창고 목록 ({localWarehouses.length}개):
              </h4>
              {localWarehouses.length > 0 ? (
                <ul className="list-disc pl-5">
                  {localWarehouses.map((w, idx) => (
                    <li key={`debug-local-warehouse-${idx}`}>
                      ID: {w.id}, 이름: {w.warehouseName || "없음"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-500">로컬 창고 데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div> */}

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

        <Modal
          title="입고 등록"
          open={isStockInModalOpen}
          onCancel={handleCloseStockInModal}
          footer={null}
          className="rounded-2xl"
        >
          <div className="mt-4">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                품목 선택
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="품목을 선택해주세요"
                labelInValue
                value={
                  stockFormValues.itemId
                    ? {
                        value: stockFormValues.itemId,
                        label: `${stockFormValues.itemName} (${stockFormValues.itemCode})`,
                      }
                    : undefined
                }
                onChange={(selected: SelectOption) => {
                  const value = selected.value;
                  const selectedItem = items.find((item) => item.id === value);
                  handleStockFormChange("itemId", value);
                  if (selectedItem) {
                    handleStockFormChange("itemCode", selectedItem.itemCode);
                    handleStockFormChange("itemName", selectedItem.itemName);
                  }
                }}
                showSearch
                optionFilterProp="children"
                className="rounded-xl"
              >
                {items.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.itemName} ({item.itemCode})
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                입고 수량
              </label>
              <input
                type="number"
                min={1}
                value={stockFormValues.quantity}
                onChange={(e) =>
                  handleStockFormChange(
                    "quantity",
                    parseInt(e.target.value) || 0
                  )
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                창고 선택
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="창고를 선택해주세요"
                labelInValue
                value={
                  stockFormValues.warehouseId
                    ? {
                        value: stockFormValues.warehouseId,
                        label:
                          localWarehouses.find(
                            (w) => w.id === stockFormValues.warehouseId
                          )?.warehouseName || "",
                      }
                    : undefined
                }
                onChange={(selected: SelectOption) => {
                  handleStockFormChange("warehouseId", selected.value);
                }}
                className="rounded-xl"
              >
                {localWarehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                비고
              </label>
              <textarea
                placeholder="입고 관련 메모"
                value={stockFormValues.note}
                onChange={(e) => handleStockFormChange("note", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={handleCloseStockInModal} className="rounded-xl">
                취소
              </Button>
              <Button
                type="primary"
                onClick={handleStockIn}
                disabled={
                  !stockFormValues.itemId ||
                  stockFormValues.quantity <= 0 ||
                  !stockFormValues.warehouseId
                }
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                className="rounded-xl"
              >
                입고 처리
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          title="출고 등록"
          open={isStockOutModalOpen}
          onCancel={handleCloseStockOutModal}
          footer={null}
          className="rounded-2xl"
        >
          <div className="mt-4">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                품목 선택
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="품목을 선택해주세요"
                labelInValue
                value={
                  stockFormValues.itemId
                    ? {
                        value: stockFormValues.itemId,
                        label: `${stockFormValues.itemName} (${stockFormValues.itemCode})`,
                      }
                    : undefined
                }
                onChange={(selected: SelectOption) => {
                  const value = selected.value;
                  const selectedItem = items.find((item) => item.id === value);
                  handleStockFormChange("itemId", value);
                  if (selectedItem) {
                    handleStockFormChange("itemCode", selectedItem.itemCode);
                    handleStockFormChange("itemName", selectedItem.itemName);
                  }
                }}
                showSearch
                optionFilterProp="children"
                className="rounded-xl"
              >
                {items.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.itemName} ({item.itemCode}) - 재고:{" "}
                    {item.itemQuantity}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                출고 수량
              </label>
              <input
                type="number"
                min={1}
                value={stockFormValues.quantity}
                onChange={(e) =>
                  handleStockFormChange(
                    "quantity",
                    parseInt(e.target.value) || 0
                  )
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                창고 선택
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="창고를 선택해주세요"
                labelInValue
                value={
                  stockFormValues.warehouseId
                    ? {
                        value: stockFormValues.warehouseId,
                        label:
                          localWarehouses.find(
                            (w) => w.id === stockFormValues.warehouseId
                          )?.warehouseName || "",
                      }
                    : undefined
                }
                onChange={(selected: SelectOption) => {
                  handleStockFormChange("warehouseId", selected.value);
                }}
                className="rounded-xl"
              >
                {localWarehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                비고
              </label>
              <textarea
                placeholder="출고 관련 메모"
                value={stockFormValues.note}
                onChange={(e) => handleStockFormChange("note", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={handleCloseStockOutModal} className="rounded-xl">
                취소
              </Button>
              <Button
                type="primary"
                onClick={handleStockOut}
                disabled={
                  !stockFormValues.itemId ||
                  stockFormValues.quantity <= 0 ||
                  !stockFormValues.warehouseId
                }
                danger
                className="rounded-xl"
              >
                출고 처리
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          title="재고 수량 수정"
          open={isEditQuantityModalOpen}
          onCancel={handleCloseEditQuantityModal}
          footer={null}
          className="rounded-2xl"
        >
          <div className="mt-4">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                품목 정보
              </label>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-medium">{quantityEditValues.itemName}</p>
                <p className="text-gray-600 text-sm">
                  {quantityEditValues.itemCode}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                현재 수량
              </label>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-medium">
                  {quantityEditValues.currentQuantity}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                새 수량
              </label>
              <input
                type="number"
                min={0}
                value={quantityEditValues.newQuantity}
                onChange={(e) =>
                  handleQuantityEditFormChange(
                    "newQuantity",
                    parseInt(e.target.value) || 0
                  )
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                수정 사유
              </label>
              <textarea
                placeholder="수량 수정 사유를 입력해주세요"
                value={quantityEditValues.reason}
                onChange={(e) =>
                  handleQuantityEditFormChange("reason", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleCloseEditQuantityModal}
                className="rounded-xl"
              >
                취소
              </Button>
              <Button
                type="primary"
                onClick={handleUpdateQuantity}
                disabled={
                  quantityEditValues.newQuantity ===
                    quantityEditValues.currentQuantity ||
                  !quantityEditValues.reason
                }
                className="rounded-xl"
              >
                수정 완료
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
