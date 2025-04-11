/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UpdateItemQuantityRequest } from "@/types/item";
import { Button, Modal, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useInventory } from "@/hooks/useInventory";
import { useItemMutation } from "@/hooks/useItemMutation";

export default function InventoryTable() {
  const router = useRouter();
  const { updateQuantityMutation } = useItemMutation();
  const { items, isLoading, isError, invalidateInventory } = useInventory();
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isEditQuantityModalOpen, setIsEditQuantityModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [warehouses, setWarehouses] = useState<TeamWarehouse[]>([]);
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
      setWarehouses(team.Warehouses);
    } else {
      setWarehouses([]);
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

  const handleStockIn = async () => {
    try {
      console.log("입고 처리:", stockFormValues);
      alert(`${stockFormValues.quantity}개 입고 처리되었습니다.`);
      handleCloseStockInModal();
      await invalidateInventory();
    } catch (error) {
      console.error("입고 처리 중 오류 발생:", error);
      alert("입고 처리 중 오류가 발생했습니다.");
    }
  };

  const handleStockOut = async () => {
    try {
      console.log("출고 처리:", stockFormValues);
      alert(`${stockFormValues.quantity}개 출고 처리되었습니다.`);
      handleCloseStockOutModal();
      await invalidateInventory();
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

  const handleUpdateQuantity = async () => {
    if (!quantityEditValues.itemId) return;

    try {
      const data: UpdateItemQuantityRequest = {
        quantity: quantityEditValues.newQuantity,
      };

      updateQuantityMutation.mutate(
        {
          id: quantityEditValues.itemId.toString(),
          data,
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

  const filteredItems = items.filter((item) => {
    return (
      item.itemCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
      <div className="overflow-x-auto relative">
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
            <select
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={10}>10개 보기</option>
              <option value={20}>20개 보기</option>
              <option value={50}>50개 보기</option>
              <option value={100}>100개 보기</option>
            </select>

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

        <table className="mx-3 my-2  bg-white rounded-2xl overflow-hidden shadow-sm">
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
                창고
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
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center">
                  <div className="py-6">
                    <p className="text-lg text-gray-500 mb-4">
                      표시할 품목이 없습니다
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                      onClick={() => router.push(`/item/detail/${item.id}`)}
                    >
                      {item.itemCode}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-150"
                      onClick={() => router.push(`/item/detail/${item.id}`)}
                    >
                      {item.itemName}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {item.itemQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {warehouses.find((w) => w.id === item.warehouseId)
                      ?.warehouseName || item.warehouseId}
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

        {/* 페이지네이션 */}
        {filteredItems.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } text-sm font-medium`}
              >
                이전
              </button>

              {Array.from({
                length: Math.ceil(filteredItems.length / itemsPerPage),
              }).map((_, index) => {
                // 현재 페이지 주변 5개만 표시
                if (
                  index + 1 === 1 ||
                  index + 1 ===
                    Math.ceil(filteredItems.length / itemsPerPage) ||
                  (index + 1 >= currentPage - 2 && index + 1 <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === index + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      } text-sm font-medium`}
                    >
                      {index + 1}
                    </button>
                  );
                }

                // 건너뛴 페이지를 표시하는 줄임표
                if (
                  (index + 1 === currentPage - 3 && currentPage > 4) ||
                  (index + 1 === currentPage + 3 &&
                    currentPage <
                      Math.ceil(filteredItems.length / itemsPerPage) - 3)
                ) {
                  return (
                    <span
                      key={index}
                      className="relative inline-flex items-center px-4 py-2 border bg-white text-gray-700 text-sm font-medium"
                    >
                      ...
                    </span>
                  );
                }

                return null;
              })}

              <button
                onClick={() =>
                  paginate(
                    currentPage < Math.ceil(filteredItems.length / itemsPerPage)
                      ? currentPage + 1
                      : currentPage
                  )
                }
                disabled={
                  currentPage === Math.ceil(filteredItems.length / itemsPerPage)
                }
                className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                  currentPage === Math.ceil(filteredItems.length / itemsPerPage)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } text-sm font-medium`}
              >
                다음
              </button>
            </nav>
          </div>
        )}

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
                value={stockFormValues.itemId || undefined}
                onChange={(value, option) => {
                  handleStockFormChange("itemId", value);
                  const selectedOption = Array.isArray(option)
                    ? option[0]
                    : option;
                  const selectedItem = (selectedOption as any)?.item;
                  handleStockFormChange(
                    "itemCode",
                    selectedItem?.itemCode || ""
                  );
                  handleStockFormChange(
                    "itemName",
                    selectedItem?.itemName || ""
                  );
                }}
                showSearch
                optionFilterProp="children"
                className="rounded-xl"
              >
                {items.map((item) => (
                  <Select.Option key={item.id} value={item.id} item={item}>
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
                value={stockFormValues.warehouseId || undefined}
                onChange={(value) =>
                  handleStockFormChange("warehouseId", value)
                }
                className="rounded-xl"
              >
                {warehouses.map((warehouse) => (
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

        {/* Modal for Stock Out */}
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
                value={stockFormValues.itemId || undefined}
                onChange={(value, option) => {
                  handleStockFormChange("itemId", value);
                  const selectedOption = Array.isArray(option)
                    ? option[0]
                    : option;
                  const selectedItem = (selectedOption as any)?.item;
                  handleStockFormChange(
                    "itemCode",
                    selectedItem?.itemCode || ""
                  );
                  handleStockFormChange(
                    "itemName",
                    selectedItem?.itemName || ""
                  );
                }}
                showSearch
                optionFilterProp="children"
                className="rounded-xl"
              >
                {items.map((item) => (
                  <Select.Option key={item.id} value={item.id} item={item}>
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
                value={stockFormValues.warehouseId || undefined}
                onChange={(value) =>
                  handleStockFormChange("warehouseId", value)
                }
                className="rounded-xl"
              >
                {warehouses.map((warehouse) => (
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

        {/* 재고 수량 수정 모달 */}
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
