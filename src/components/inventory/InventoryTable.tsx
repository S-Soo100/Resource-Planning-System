/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Item, CreateItemRequest } from "@/types/item";
import { Input, Button, Modal, Select, Pagination } from "antd";
import {
  SearchOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { IWarehouse } from "@/types/warehouse";
import { useInventory } from "@/hooks/useInventory";
import { itemService } from "@/services/itemService";

export default function InventoryTable() {
  const router = useRouter();
  const { items, isLoading, isError, invalidateInventory } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [formValues, setFormValues] = useState<{
    itemCode: string;
    itemName: string;
    itemQuantity: number;
    warehouseId: number;
  }>({
    itemCode: "",
    itemName: "",
    itemQuantity: 0,
    warehouseId: 0,
  });
  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormValues({
      itemCode: "",
      itemName: "",
      itemQuantity: 0,
      warehouseId: 0,
    });
    setIsModalOpen(false);
  };

  const handleFormChange = (field: string, value: string | number) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  const handleFormSubmit = () => {
    handleAddItem(formValues);
  };

  const handleAddItem = async (values: typeof formValues) => {
    const newItemData: CreateItemRequest = {
      name: values.itemName,
      description: "",
      sku: values.itemCode,
      warehouseId: values.warehouseId,
      quantity: values.itemQuantity || 0,
      minimumQuantity: 0,
      category: "",
      unit: "개",
      price: 0,
    };

    try {
      const response = await itemService.addItem(
        newItemData,
        invalidateInventory
      );

      if (response.success) {
        alert(`아이템 "${values.itemName}"이(가) 추가되었습니다.`);
        handleCloseModal();
      } else {
        alert(
          `오류 발생: ${response.message || "알 수 없는 오류가 발생했습니다."}`
        );
      }
    } catch (error) {
      console.error("아이템 추가 중 오류 발생:", error);
      alert("아이템 추가 중 오류가 발생했습니다.");
    }
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

  const filteredItems = items.filter((item) => {
    return (
      item.itemCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <div className="overflow-x-auto relative">
        <div className="mb-4">
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
        </div>

        <table className="min-w-full bg-white rounded-2xl overflow-hidden shadow-sm">
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
                    <Button
                      type="primary"
                      onClick={handleOpenModal}
                      className="bg-blue-500 hover:bg-blue-600 border-0 rounded-xl"
                    >
                      새 품목 추가하기
                    </Button>
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
                        onClick={() => router.push(`/item/edit/${item.id}`)}
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

        {filteredItems.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              current={currentPage}
              total={filteredItems.length}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              className="rounded-xl"
            />
          </div>
        )}

        {/* Floating Buttons for Stock Management */}
        <div className="fixed bottom-8 right-8 flex flex-col space-y-4">
          <button
            onClick={handleOpenStockInModal}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-all duration-300"
            title="입고"
          >
            <PlusCircleOutlined style={{ fontSize: "24px" }} />
          </button>
          <button
            onClick={handleOpenStockOutModal}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-all duration-300"
            title="출고"
          >
            <MinusCircleOutlined style={{ fontSize: "24px" }} />
          </button>
        </div>

        {/* Modal for Adding New Item */}
        <Modal
          title="새 품목 추가"
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
          className="rounded-2xl"
        >
          <div className="mt-4">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                품목 코드
              </label>
              <Input
                placeholder="예: ABC-123"
                value={formValues.itemCode}
                onChange={(e) => handleFormChange("itemCode", e.target.value)}
                required
                className="rounded-xl"
              />
              {!formValues.itemCode && (
                <div className="text-red-500 text-sm mt-1">
                  품목 코드를 입력해주세요
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                품목명
              </label>
              <Input
                placeholder="예: 서플라이 휠"
                value={formValues.itemName}
                onChange={(e) => handleFormChange("itemName", e.target.value)}
                required
                className="rounded-xl"
              />
              {!formValues.itemName && (
                <div className="text-red-500 text-sm mt-1">
                  품목명을 입력해주세요
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                초기 수량
              </label>
              <Input
                type="number"
                min={0}
                value={formValues.itemQuantity}
                onChange={(e) =>
                  handleFormChange(
                    "itemQuantity",
                    parseInt(e.target.value) || 0
                  )
                }
                className="rounded-xl"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                창고 선택
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="창고를 선택해주세요"
                value={formValues.warehouseId || undefined}
                onChange={(value) => handleFormChange("warehouseId", value)}
                className="rounded-xl"
              >
                {warehouses.map((warehouse) => (
                  <Select.Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={handleCloseModal} className="rounded-xl">
                취소
              </Button>
              <Button
                type="primary"
                onClick={handleFormSubmit}
                disabled={
                  !formValues.itemCode ||
                  !formValues.itemName ||
                  !formValues.warehouseId
                }
                className="rounded-xl"
              >
                추가
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal for Stock In */}
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
              <Input
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
                className="rounded-xl"
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
              <Input.TextArea
                placeholder="입고 관련 메모"
                value={stockFormValues.note}
                onChange={(e) => handleStockFormChange("note", e.target.value)}
                rows={3}
                className="rounded-xl"
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
              <Input
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
                className="rounded-xl"
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
              <Input.TextArea
                placeholder="출고 관련 메모"
                value={stockFormValues.note}
                onChange={(e) => handleStockFormChange("note", e.target.value)}
                rows={3}
                className="rounded-xl"
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
      </div>
    </>
  );
}
