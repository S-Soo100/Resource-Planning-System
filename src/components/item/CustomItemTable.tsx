"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";

import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { useTeamItems } from "@/hooks/useTeamItems";
import { CreateItemApiRequest } from "@/types/(item)/item";
import { useCategory } from "@/hooks/useCategory";
import { ChevronDown, Package } from "lucide-react";

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
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // React Query 훅 사용
  const { useGetTeamItems } = useTeamItems();
  const { data: teamItems = [] } = useGetTeamItems();
  const { useGetItems, useAddItem, useDeleteItem } = useItemStockManagement();
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

  // 새로운 useCategory 훅 사용
  const { categories } = useCategory();

  const [warehouses, setWarehouses] = useState<TeamWarehouse[]>([]);

  // 팀의 창고 정보 및 카테고리 데이터 가져오기
  useEffect(() => {
    const team = authService.getSelectedTeam();
    if (team) {
      if (team.warehouses) {
        setWarehouses(team.warehouses);
      } else {
        setWarehouses([]);
      }
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
          alert(`아이템이 추가되었습니다.`);
          handleCloseModal();
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
        {warehouses.map((warehouse) => {
          const isExpanded = expandedWarehouses.includes(warehouse.id);
          const warehouseItems = Array.isArray(items)
            ? items.filter((item) => item.warehouseId === warehouse.id)
            : [];

          return (
            <div
              key={warehouse.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md"
            >
              {/* 창고 헤더 */}
              <div
                className="flex justify-between items-center px-6 py-4 cursor-pointer select-none"
                onClick={() => toggleWarehouse(warehouse.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-Primary-Container rounded-xl flex-shrink-0">
                    <span className="text-base text-Primary-Main">🏭</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-Text-Highest-100">
                      {warehouse.warehouseName}
                    </h3>
                    <p className="text-xs text-Text-Low-70">
                      창고 ID: {warehouse.id} · {warehouseItems.length}개 품목
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!isReadOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(warehouse.id);
                      }}
                      className="px-4 py-1.5 bg-Primary-Main text-white rounded-full text-sm font-medium hover:bg-Primary-Main/90 transition-colors"
                    >
                      품목 추가
                    </button>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-Text-Low-70 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* 확장 영역 */}
              {isExpanded && (
                <div className="border-t border-Outline-Variant">
                  {/* 검색 바 */}
                  <div className="px-6 py-3 bg-Back-Low-10">
                    <input
                      type="text"
                      placeholder="품목 코드나 품목명으로 검색..."
                      value={searchQueries[warehouse.id] || ""}
                      onChange={(e) =>
                        handleSearchChange(warehouse.id, e.target.value)
                      }
                      className="w-full px-4 py-2 text-sm border border-Outline-Variant rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main"
                    />
                  </div>

                  {/* 테이블 */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-Back-Low-10 border-b border-Outline-Variant">
                          <th className="px-4 py-3 w-20 text-center text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                            이미지
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                            품목 코드
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                            품목명
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                            카테고리
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                            수량
                          </th>
                          {!isReadOnly && (
                            <th className="px-4 py-3 text-right text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                              관리
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-Outline-Variant">
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
                            .sort((a, b) => {
                              const categoryA = getCategoryNameById(
                                a.teamItem.categoryId
                              );
                              const categoryB = getCategoryNameById(
                                b.teamItem.categoryId
                              );
                              if (categoryA !== categoryB) {
                                return categoryA.localeCompare(categoryB);
                              }
                              return a.teamItem.itemCode.localeCompare(
                                b.teamItem.itemCode
                              );
                            })
                            .map((item) => (
                              <tr
                                key={item.id}
                                className="hover:bg-Back-Low-10 transition-colors duration-150"
                              >
                                <td className="px-4 py-3 text-center">
                                  {item.teamItem.imageUrl ? (
                                    <img
                                      src={item.teamItem.imageUrl}
                                      alt={item.teamItem.itemName}
                                      className="w-12 h-12 object-cover rounded-md border border-Outline-Variant mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() =>
                                        setLightboxUrl(item.teamItem.imageUrl)
                                      }
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-Back-Mid-20 rounded-md flex items-center justify-center mx-auto">
                                      <Package className="w-6 h-6 text-Text-Low-70" />
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <Link
                                    href={`/team-items?editId=${item.teamItem.id}`}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                  >
                                    {item.teamItem.itemCode}
                                  </Link>
                                </td>
                                <td className="px-4 py-3">
                                  <Link
                                    href={`/team-items?editId=${item.teamItem.id}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                  >
                                    {item.teamItem.itemName}
                                  </Link>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 bg-Primary-Container text-Primary-Main rounded-full text-xs font-medium">
                                    {getCategoryNameById(
                                      item.teamItem.categoryId
                                    )}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-Text-Highest-100">
                                  {item.itemQuantity}
                                </td>
                                {!isReadOnly && (
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() =>
                                        handleDeleteItem(
                                          item.id,
                                          item.warehouseId
                                        )
                                      }
                                      className="px-3 py-1 text-Error-Main bg-Error-Container rounded-full text-xs font-medium hover:brightness-95 transition-all"
                                    >
                                      삭제
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                        {/* 검색 결과 없음 */}
                        {searchQueries[warehouse.id] &&
                          Array.isArray(items) &&
                          items.filter(
                            (item) =>
                              item.warehouseId === warehouse.id &&
                              (item.teamItem.itemCode
                                .toLowerCase()
                                .includes(
                                  searchQueries[warehouse.id].toLowerCase()
                                ) ||
                                item.teamItem.itemName
                                  .toLowerCase()
                                  .includes(
                                    searchQueries[warehouse.id].toLowerCase()
                                  ))
                          ).length === 0 && (
                            <tr>
                              <td
                                colSpan={isReadOnly ? 5 : 6}
                                className="px-4 py-10 text-center text-Text-Low-70"
                              >
                                검색 결과가 없습니다.
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>

                    {/* 아이템 없음 */}
                    {warehouseItems.length === 0 &&
                      !searchQueries[warehouse.id] && (
                        <div className="py-12 text-center">
                          <div className="w-10 h-10 bg-Primary-Container rounded-full flex items-center justify-center mx-auto mb-2">
                            <Package className="w-5 h-5 text-Primary-Main" />
                          </div>
                          <p className="text-Text-Low-70 text-sm">
                            등록된 아이템이 없습니다.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 창고 없음 */}
        {warehouses.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-Primary-Container rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🏭</span>
            </div>
            <p className="text-Text-Low-70">등록된 창고가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 아이템 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-Text-Highest-100">
                품목 추가
              </h2>

              <div>
                <label className="block text-sm font-medium text-Text-Highest-100 mb-1.5">
                  팀 아이템 선택 <span className="text-Error-Main">*</span>
                </label>
                <select
                  className="w-full px-4 py-2 border border-Outline-Variant rounded-md focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main text-Text-Highest-100 bg-white"
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

              <div>
                <label className="block text-sm font-medium text-Text-Highest-100 mb-1.5">
                  수량
                </label>
                <input
                  className="w-full px-4 py-2 border border-Outline-Variant rounded-md focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main text-Text-Highest-100 bg-white"
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-Outline-Variant rounded-full text-Text-High-90 hover:bg-Back-Low-10 transition-colors text-sm font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={formValues.teamItemId === 0}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formValues.teamItemId === 0
                      ? "bg-Back-Mid-20 text-Text-Low-70 cursor-not-allowed"
                      : "bg-Primary-Main hover:bg-Primary-Main/90 text-white"
                  }`}
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 라이트박스 */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[80] bg-black/75 flex items-center justify-center"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={lightboxUrl}
            alt="확대 이미지"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
