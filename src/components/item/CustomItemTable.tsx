"use client";

import { CreateItemRequest, Item } from "@/types/item";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useItems } from "@/hooks/useItems";
import { useTeamItems } from "@/hooks/useTeamItems";
import { TeamItem } from "@/types/(item)/team-item";

interface CustomItemTableProps {
  isReadOnly?: boolean;
}

export default function CustomItemTable({
  isReadOnly = false,
}: CustomItemTableProps) {
  const router = useRouter();
  const { items, isLoading, isError, invalidateInventory, refetchAll } =
    useWarehouseItems();
  const { teamItems = [], isLoading: isTeamItemsLoading } =
    useTeamItems().useGetTeamItems();
  const { useAddItem, useDeleteItem } = useItems();
  const addItemMutation = useAddItem();
  const deleteItemMutation = useDeleteItem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedWarehouses, setExpandedWarehouses] = useState<number[]>([]);
  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>(
    {}
  );
  const [currentWarehouseId, setCurrentWarehouseId] = useState<number | null>(
    null
  );
  const [selectedTeamItem, setSelectedTeamItem] = useState<TeamItem | null>(
    null
  );
  const modalRef = useRef<HTMLDivElement>(null);

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
  const [warehouses, setWarehouses] = useState<TeamWarehouse[]>([]);

  // 팀의 창고 정보 가져오기
  useEffect(() => {
    const team = authService.getSelectedTeam();
    if (team && team.warehouses) {
      setWarehouses(team.warehouses);
    } else {
      setWarehouses([]);
    }
  }, []);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleCloseModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // 창고 토글 처리
  const toggleWarehouse = (warehouseId: number) => {
    setExpandedWarehouses((prev) =>
      prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  // 검색어 변경 처리
  const handleSearchChange = (warehouseId: number, query: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [warehouseId]: query,
    }));
  };

  const handleOpenModal = (warehouseId: number) => {
    if (isReadOnly) return;

    setCurrentWarehouseId(warehouseId);
    setSelectedTeamItem(null);
    setFormValues({
      itemCode: "",
      itemName: "",
      itemQuantity: 0,
      warehouseId: warehouseId,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormValues({
      itemCode: "",
      itemName: "",
      itemQuantity: 0,
      warehouseId: 0,
    });
    setSelectedTeamItem(null);
    setCurrentWarehouseId(null);
    setIsModalOpen(false);
  };

  // 폼 입력값 변경 처리 함수
  const handleFormChange = (field: string, value: string | number) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  // 팀 아이템 선택 처리
  const handleTeamItemSelect = (teamItemId: string) => {
    const teamItemId_num = parseInt(teamItemId);
    if (teamItemId_num === 0) {
      setSelectedTeamItem(null);
      setFormValues({
        ...formValues,
        itemCode: "",
        itemName: "",
      });
      return;
    }

    const selected = teamItems.find((item) => item.id === teamItemId_num);
    if (selected) {
      setSelectedTeamItem(selected);
      setFormValues({
        ...formValues,
        itemCode: selected.itemCode,
        itemName: selected.itemName,
      });
    }
  };

  // 폼 제출 처리 함수
  const handleFormSubmit = () => {
    handleAddItem(formValues);
  };

  // 새 아이템 추가를 위한 인터페이스 정의
  interface AddItemFormValues {
    itemCode: string;
    itemName: string;
    itemQuantity: number;
    warehouseId: number;
  }

  const handleAddItem = (values: AddItemFormValues) => {
    // API를 통한 아이템 추가 로직
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

    // React Query 뮤테이션 사용
    addItemMutation.mutate(newItemData, {
      onSuccess: async (response) => {
        if (response.success) {
          // 아이템 추가 성공 메시지
          alert(`아이템 "${values.itemName}"이(가) 추가되었습니다.`);
          handleCloseModal();

          // 데이터 리페치 및 캐시 무효화
          await invalidateInventory();
          await refetchAll();
        } else {
          alert(
            `오류 발생: ${
              response.message || "알 수 없는 오류가 발생했습니다."
            }`
          );
        }
      },
      onError: (error) => {
        console.error("아이템 추가 중 오류 발생:", error);
        alert("아이템 추가 중 오류가 발생했습니다.");
      },
    });
  };

  // 아이템 삭제 처리 함수
  const handleDeleteItem = (itemId: number, itemName: string) => {
    if (isReadOnly) return;

    if (window.confirm(`'${itemName}' 품목을 삭제하시겠습니까?`)) {
      deleteItemMutation.mutate(
        {
          id: String(itemId),
          itemWarehouseId: String(currentWarehouseId || ""),
        },
        {
          onSuccess: async (response) => {
            if (response.success) {
              alert(`품목 "${itemName}"이(가) 삭제되었습니다.`);

              // 데이터 리페치 및 캐시 무효화
              await invalidateInventory();
              await refetchAll();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("품목 삭제 중 오류 발생:", error);
            alert("품목 삭제 중 오류가 발생했습니다.");
          },
        }
      );
    }
  };

  // 창고별 아이템 필터링
  const getWarehouseItems = (warehouseId: number) => {
    const filteredItems = items
      ? items.filter(
          (item) =>
            item.warehouseId === warehouseId &&
            (!searchQueries[warehouseId] ||
              (item.itemName &&
                item.itemName
                  .toLowerCase()
                  .includes(searchQueries[warehouseId]?.toLowerCase() || "")) ||
              (item.itemCode &&
                item.itemCode
                  .toLowerCase()
                  .includes(searchQueries[warehouseId]?.toLowerCase() || "")))
        )
      : [];

    return filteredItems as Item[];
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
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-6">창고별 품목 관리</h1>

        {/* 창고 카드 목록 */}
        <div className="space-y-4">
          {warehouses.length > 0 ? (
            warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* 창고 헤더 (토글 가능) */}
                <div className="flex items-center justify-between p-4 bg-white rounded-t-lg border-b">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleWarehouse(warehouse.id)}
                  >
                    <div className="mr-2 transform transition-transform duration-200">
                      {expandedWarehouses.includes(warehouse.id) ? "▼" : "▶"}
                    </div>
                    <h3 className="text-lg font-medium">
                      {warehouse.warehouseName}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500">
                      ({getWarehouseItems(warehouse.id).length}개 품목)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="품목 검색"
                      className="px-3 py-1 border rounded-md text-sm"
                      value={searchQueries[warehouse.id] || ""}
                      onChange={(e) =>
                        handleSearchChange(warehouse.id, e.target.value)
                      }
                    />
                    {!isReadOnly && (
                      <button
                        onClick={() => handleOpenModal(warehouse.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        품목 추가
                      </button>
                    )}
                  </div>
                </div>

                {/* 토글되면 보이는 내용 */}
                {expandedWarehouses.includes(warehouse.id) && (
                  <div className="p-4">
                    {/* 품목 테이블 */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              품목 코드
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              품목명
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              수량
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              등록일
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              관리
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getWarehouseItems(warehouse.id).length > 0 ? (
                            getWarehouseItems(warehouse.id).map((item) => (
                              <tr
                                key={item.id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <a
                                    className="text-blue-500 hover:underline cursor-pointer"
                                    onClick={() =>
                                      router.push(`/item/detail/${item.id}`)
                                    }
                                  >
                                    {item.itemCode}
                                  </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <a
                                    className="text-blue-500 hover:underline cursor-pointer"
                                    onClick={() =>
                                      router.push(`/item/detail/${item.id}`)
                                    }
                                  >
                                    {item.itemName}
                                  </a>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {item.itemQuantity || 0} 개
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {new Date(
                                    item.createdAt ?? ""
                                  ).toLocaleDateString("ko-KR")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                  {!isReadOnly && (
                                    <button
                                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                                      onClick={() =>
                                        handleDeleteItem(
                                          item.id,
                                          item.itemName || ""
                                        )
                                      }
                                    >
                                      삭제
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-6 py-8 text-center text-gray-500"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <svg
                                    className="h-10 w-10 text-gray-400 mb-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  <p>이 창고에 등록된 품목이 없습니다</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-lg font-medium mb-2">등록된 창고가 없습니다</p>
              <p className="text-gray-500 mb-4">
                관리자에게 창고 등록을 요청하세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">
                {warehouses.find((w) => w.id === currentWarehouseId)
                  ?.warehouseName || ""}{" "}
                - 새 품목 추가
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* 팀 품목 선택 드롭다운 */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  팀 품목 선택
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTeamItem?.id || 0}
                  onChange={(e) => handleTeamItemSelect(e.target.value)}
                >
                  <option value={0}>직접 입력</option>
                  {isTeamItemsLoading ? (
                    <option disabled>로딩 중...</option>
                  ) : teamItems.length > 0 ? (
                    teamItems.map((item) => {
                      // 현재 창고에 이미 있는 품목인지 확인
                      const isExistingItem = items.some(
                        (warehouseItem) =>
                          warehouseItem.warehouseId === currentWarehouseId &&
                          warehouseItem.itemCode === item.itemCode
                      );

                      return (
                        <option
                          key={item.id}
                          value={item.id}
                          disabled={isExistingItem}
                        >
                          {item.itemCode} - {item.itemName}
                          {isExistingItem ? " (이미 등록됨)" : ""}
                        </option>
                      );
                    })
                  ) : (
                    <option disabled>등록된 팀 품목이 없습니다</option>
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  품목 코드
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="품목 선택시 자동 입력"
                  value={formValues.itemCode}
                  onChange={(e) => handleFormChange("itemCode", e.target.value)}
                  required
                  disabled={selectedTeamItem !== null}
                />
                {!formValues.itemCode && (
                  <div className="text-red-500 text-sm mt-1">
                    품목 선택시 자동 입력
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">품목명</label>
                <input
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  placeholder="품목 선택시 자동 입력"
                  value={formValues.itemName}
                  onChange={(e) => handleFormChange("itemName", e.target.value)}
                  required
                  disabled={selectedTeamItem !== null}
                />
                {!formValues.itemName && (
                  <div className="text-red-500 text-sm mt-1">
                    품목 선택시 자동 입력
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  초기 수량
                </label>
                <input
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  min={0}
                  value={formValues.itemQuantity}
                  onChange={(e) =>
                    handleFormChange(
                      "itemQuantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={!formValues.itemCode || !formValues.itemName}
                  className={`px-4 py-2 rounded-lg ${
                    !formValues.itemCode || !formValues.itemName
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
