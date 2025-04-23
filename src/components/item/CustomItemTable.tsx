"use client";

import { Item, CreateItemRequest } from "@/types/item";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { TeamWarehouse } from "@/types/warehouse";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useItems } from "@/hooks/useItems";

export default function CustomItemTable() {
  const router = useRouter();
  const { items, isLoading, isError } = useWarehouseItems();
  const { useAddItem } = useItems();
  const addItemMutation = useAddItem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  // 폼 입력값 변경 처리 함수
  const handleFormChange = (field: string, value: string | number) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
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
      onSuccess: (response) => {
        if (response.success) {
          // 아이템 추가 성공 메시지
          alert(`아이템 "${values.itemName}"이(가) 추가되었습니다.`);
          handleCloseModal();
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

  // 정렬 처리
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 필터링 및 정렬된 아이템 목록
  const filteredItems = items
    ? items.filter((item) => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
          (item.itemCode && item.itemCode.toLowerCase().includes(query)) ||
          (item.itemName && item.itemName.toLowerCase().includes(query))
        );
      })
    : [];

  // 정렬
  const sortedItems = filteredItems.sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField as keyof Item];
    const bValue = b[sortField as keyof Item];

    if (sortField === "createdAt" || sortField === "updatedAt") {
      return sortDirection === "asc"
        ? new Date(aValue as string).getTime() -
            new Date(bValue as string).getTime()
        : new Date(bValue as string).getTime() -
            new Date(aValue as string).getTime();
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // 페이지네이션
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="w-full p-4">
        {/* 검색 및 필터 영역 */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="품목 검색..."
              className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
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
              onClick={handleOpenModal}
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
              새 품목 추가
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    ID
                    {sortField === "id" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("itemCode")}
                >
                  <div className="flex items-center">
                    품목 코드
                    {sortField === "itemCode" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("itemName")}
                >
                  <div className="flex items-center">
                    품목명
                    {sortField === "itemName" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  창고
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    등록일
                    {sortField === "createdAt" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("updatedAt")}
                >
                  <div className="flex items-center">
                    최종수정일
                    {sortField === "updatedAt" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={`item-${item.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() => router.push(`/item/detail/${item.id}`)}
                      >
                        {item.itemCode}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() => router.push(`/item/detail/${item.id}`)}
                      >
                        {item.itemName}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {warehouses.find((w) => w.id === item.warehouseId)
                        ?.warehouseName || item.warehouseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.createdAt ?? "").toLocaleDateString(
                        "ko-KR"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.updatedAt ?? "").toLocaleDateString(
                        "ko-KR"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                        onClick={() => router.push(`/item/edit/${item.id}`)}
                      >
                        수정
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                        onClick={() =>
                          router.push(`/item/log/${item.itemCode}`)
                        }
                      >
                        입출고 기록
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="h-12 w-12 text-gray-400 mb-4"
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
                      <p className="text-lg font-medium mb-2">
                        표시할 품목이 없습니다
                      </p>
                      <button
                        onClick={handleOpenModal}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
                      >
                        새 품목 추가하기
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

        {/* 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              ref={modalRef}
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">새 품목 추가</h3>
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
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    품목 코드
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="예: ABC-123"
                    value={formValues.itemCode}
                    onChange={(e) =>
                      handleFormChange("itemCode", e.target.value)
                    }
                    required
                  />
                  {!formValues.itemCode && (
                    <div className="text-red-500 text-sm mt-1">
                      품목 코드를 입력해주세요
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    품목명
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    placeholder="예: 서플라이 휠"
                    value={formValues.itemName}
                    onChange={(e) =>
                      handleFormChange("itemName", e.target.value)
                    }
                    required
                  />
                  {!formValues.itemName && (
                    <div className="text-red-500 text-sm mt-1">
                      품목명을 입력해주세요
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

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">창고</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.warehouseId || ""}
                    onChange={(e) =>
                      handleFormChange("warehouseId", Number(e.target.value))
                    }
                  >
                    <option value="">창고를 선택하세요</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.warehouseName} ({warehouse.warehouseAddress})
                      </option>
                    ))}
                    {warehouses.length === 0 && (
                      <option disabled>사용 가능한 창고가 없습니다</option>
                    )}
                  </select>
                  {!formValues.warehouseId && (
                    <div className="text-red-500 text-sm mt-1">
                      창고를 선택해주세요
                    </div>
                  )}
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
                    disabled={
                      !formValues.itemCode ||
                      !formValues.itemName ||
                      !formValues.warehouseId
                    }
                    className={`px-4 py-2 rounded-lg ${
                      !formValues.itemCode ||
                      !formValues.itemName ||
                      !formValues.warehouseId
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
      </div>
    </>
  );
}
