"use client";

import React, { useRef, useState, useEffect } from "react";

import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useItems } from "@/hooks/useItems";
import { useTeamItems } from "@/hooks/useTeamItems";
import { useCategoryStore } from "@/store/categoryStore";
import { CreateItemApiRequest } from "@/types/(item)/item";

interface CustomItemTableProps {
  isReadOnly?: boolean;
}

interface AddItemFormValues {
  itemQuantity: number;
  warehouseId: number;
  teamItemId: number;
}

export default function CustomItemTable({
  isReadOnly = false,
}: CustomItemTableProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedWarehouses, setExpandedWarehouses] = useState<number[]>([]);
  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>(
    {}
  );

  // React Query 훅 사용
  const { useGetTeamItems } = useTeamItems();
  const { data: teamItems = [] } = useGetTeamItems();
  const { useGetItems, useAddItem, useDeleteItem } = useItems();
  const { data: itemsResponse, refetch: refetchItems } = useGetItems();
  // API 응답에서 실제 아이템 배열 추출
  const items =
    itemsResponse?.success && itemsResponse?.data ? itemsResponse.data : [];
  const addItemMutation = useAddItem();
  const deleteItemMutation = useDeleteItem();

  // 상태 관리
  const [formValues, setFormValues] = useState<AddItemFormValues>({
    itemQuantity: 0,
    warehouseId: 0,
    teamItemId: 0,
  });

  // 카테고리 스토어 접근
  const { categories, fetchCategories, isInitialized } = useCategoryStore();

  const [warehouses, setWarehouses] = useState<TeamWarehouse[]>([]);

  // 팀의 창고 정보 및 카테고리 데이터 가져오기
  useEffect(() => {
    const team = authService.getSelectedTeam();
    if (team) {
      if (team.id && !isInitialized) {
        const teamIdNumber = parseInt(team.id.toString(), 10);
        fetchCategories(teamIdNumber);
      }
      if (team.warehouses) {
        setWarehouses(team.warehouses);
      } else {
        setWarehouses([]);
      }
    } else {
      setWarehouses([]);
    }
  }, [fetchCategories, isInitialized]);

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

  const handleOpenModal = (warehouseId: number) => {
    if (isReadOnly) return;

    setFormValues({
      itemQuantity: 0,
      warehouseId: warehouseId,
      teamItemId: 0,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormValues({
      itemQuantity: 0,
      warehouseId: 0,
      teamItemId: 0,
    });
    setIsModalOpen(false);
  };

  const handleTeamItemSelect = (teamItemId: string) => {
    const teamItemId_num = parseInt(teamItemId);
    setFormValues({
      ...formValues,
      teamItemId: teamItemId_num,
    });
  };

  // 이미 창고에 존재하는 아이템인지 확인하는 함수
  const isItemAlreadyInWarehouse = (
    teamItemId: number,
    warehouseId: number
  ) => {
    return (
      Array.isArray(items) &&
      items.some(
        (item) =>
          item.teamItem.id === teamItemId && item.warehouseId === warehouseId
      )
    );
  };

  const handleFormChange = (field: string, value: number) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  const handleFormSubmit = () => {
    if (formValues.teamItemId === 0) {
      alert("팀 아이템을 선택해주세요.");
      return;
    }

    // 이미 창고에 존재하는 아이템인지 확인
    if (
      isItemAlreadyInWarehouse(formValues.teamItemId, formValues.warehouseId)
    ) {
      alert("이미 해당 창고에 존재하는 아이템입니다.");
      return;
    }

    handleAddItem(formValues);
  };

  const handleAddItem = (values: AddItemFormValues) => {
    // CreateItemApiRequest 형식으로 데이터 구성
    const newItemData: CreateItemApiRequest = {
      itemQuantity: values.itemQuantity || 0,
      warehouseId: values.warehouseId,
      teamItemId: values.teamItemId,
    };

    // React Query 뮤테이션 사용
    addItemMutation.mutate(newItemData, {
      onSuccess: async (response) => {
        if (response.success) {
          // 아이템 추가 성공 메시지
          alert(`아이템이 추가되었습니다.`);
          handleCloseModal();

          // 데이터 리페치
          await refetchItems();
        } else {
          alert(
            `오류 발생: ${
              response.message || "알 수 없는 오류가 발생했습니다."
            }`
          );
        }
      },
      onError: () => {
        alert("아이템 추가 중 오류가 발생했습니다.");
      },
    });
  };

  const toggleWarehouse = (warehouseId: number) => {
    setExpandedWarehouses((prev) =>
      prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  const handleSearchChange = (warehouseId: number, query: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [warehouseId]: query,
    }));
  };

  // 아이템 삭제 처리 함수
  const handleDeleteItem = (itemId: number, warehouseId: number) => {
    if (window.confirm("정말 이 아이템을 삭제하시겠습니까?")) {
      deleteItemMutation.mutate(
        {
          id: itemId.toString(),
          itemWarehouseId: warehouseId.toString(),
        },
        {
          onSuccess: async (response) => {
            if (response.success) {
              await refetchItems();
            } else {
              alert(
                `삭제 실패: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
        }
      );
    }
  };

  // 카테고리 ID로 카테고리 이름을 찾는 함수
  const getCategoryNameById = (categoryId: number | undefined): string => {
    if (!categoryId) return "-";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "-";
  };

  return (
    <>
      <div className="space-y-4">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white rounded-lg shadow">
            <div
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleWarehouse(warehouse.id)}
            >
              <div>
                <h3 className="text-lg font-medium">
                  {warehouse.warehouseName}
                </h3>
                <p className="text-sm text-gray-500">ID: {warehouse.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isReadOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(warehouse.id);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    아이템 추가
                  </button>
                )}
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    expandedWarehouses.includes(warehouse.id)
                      ? "rotate-180"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {expandedWarehouses.includes(warehouse.id) && (
              <div className="p-4 border-t">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="아이템 검색..."
                    value={searchQueries[warehouse.id] || ""}
                    onChange={(e) =>
                      handleSearchChange(warehouse.id, e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">품목 코드</th>
                        <th className="px-4 py-2 text-left">품목명</th>
                        <th className="px-4 py-2 text-left">카테고리</th>
                        <th className="px-4 py-2 text-right">수량</th>
                        {!isReadOnly && (
                          <th className="px-4 py-2 text-right">관리</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.isArray(items) &&
                        items
                          .filter(
                            (item) =>
                              item.warehouseId === warehouse.id &&
                              (!searchQueries[warehouse.id] ||
                                item.teamItem.itemCode
                                  .toLowerCase()
                                  .includes(
                                    searchQueries[warehouse.id].toLowerCase()
                                  ) ||
                                item.teamItem.itemName
                                  .toLowerCase()
                                  .includes(
                                    searchQueries[warehouse.id].toLowerCase()
                                  ))
                          )
                          .map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2">
                                {item.teamItem.itemCode}
                              </td>
                              <td className="px-4 py-2">
                                {item.teamItem.itemName}
                              </td>
                              <td className="px-4 py-2">
                                {getCategoryNameById(item.teamItem.categoryId)}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {item.itemQuantity}
                              </td>
                              {!isReadOnly && (
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() =>
                                      handleDeleteItem(
                                        item.id,
                                        item.warehouseId
                                      )
                                    }
                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                  >
                                    삭제
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-bold">아이템 추가</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  팀 아이템 선택
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.teamItemId}
                  onChange={(e) => handleTeamItemSelect(e.target.value)}
                >
                  <option value="0">팀 아이템을 선택하세요</option>
                  {teamItems
                    .filter(
                      (item) =>
                        !isItemAlreadyInWarehouse(
                          item.id,
                          formValues.warehouseId
                        )
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName} ({item.itemCode}) -{" "}
                        {getCategoryNameById(item.categoryId)}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">수량</label>
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
                  disabled={formValues.teamItemId === 0}
                  className={`px-4 py-2 rounded-lg ${
                    formValues.teamItemId === 0
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
