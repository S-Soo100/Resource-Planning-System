import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import { CreateWarehouseDto, CreateWarehouseProps } from "@/types/warehouse";
import { adminService } from "@/services/adminService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import { useTeamItems } from "@/hooks/useTeamItems";
import { CreateTeamItemDto, TeamItem } from "@/types/team-item";
import { authStore } from "@/store/authStore";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { TeamWarehouse } from "@/types/warehouse";

// SearchAddressModal을 동적으로 import
const SearchAddressModal = dynamic(() => import("../SearchAddressModal"), {
  ssr: false,
});

interface WarehouseManagementProps {
  warehouses: {
    id: string;
    warehouseName: string;
    warehouseAddress: string;
  }[];
  isReadOnly?: boolean;
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = ({
  warehouses = [],
  isReadOnly = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [newWarehouse, setNewWarehouse] = useState<
    Omit<CreateWarehouseProps, "id">
  >({
    warehouseName: "",
    warehouseAddress: "",
    detailLocation: "",
  });

  // useWarehouseItems 훅 추가
  const { invalidateInventory, refetchAll } = useWarehouseItems();

  // 팀 아이템 관련 상태와 기능 추가
  const { useGetTeamItems, useCreateTeamItem, useUpdateTeamItem } =
    useTeamItems();
  const { data: teamItems = [] } = useGetTeamItems();
  const { createTeamItem } = useCreateTeamItem();
  const { updateTeamItem, isPending: isItemUpdating } = useUpdateTeamItem();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemFormData, setItemFormData] = useState<
    Omit<CreateTeamItemDto, "teamId">
  >({
    itemCode: "",
    itemName: "",
    memo: "",
  });
  const [editingItem, setEditingItem] = useState<TeamItem | null>(null);
  const [itemSubmitError, setItemSubmitError] = useState<string | null>(null);
  const selectedTeam = authStore((state) => state.selectedTeam);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewWarehouse({
      warehouseName: "",
      warehouseAddress: "",
      detailLocation: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWarehouse({
      ...newWarehouse,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentTeam = authService.getSelectedTeam();

      if (!currentTeam || !currentTeam.id) {
        toast.error("선택된 팀 정보가 없습니다.");
        setIsSubmitting(false);
        return;
      }

      // newWarehouse를 CreateWarehouseDto로 변환
      const warehouseRequest: CreateWarehouseDto = {
        warehouseName: newWarehouse.warehouseName,
        warehouseAddress:
          newWarehouse.warehouseAddress +
          (newWarehouse.detailLocation
            ? ` ${newWarehouse.detailLocation}`
            : ""),
        teamId: Number(currentTeam.id), // 문자열을 숫자로 변환
      };

      const success = await adminService.createWarehouse(
        warehouseRequest,
        queryClient
      );

      if (success) {
        toast.success("창고가 성공적으로 추가되었습니다.");

        // 창고 데이터 최신화
        await invalidateInventory();
        await refetchAll();

        // 선택된 팀 정보 갱신 (Zustand 스토어 업데이트)
        await authService.refreshSelectedTeam();

        handleCloseModal();
      } else {
        toast.error("창고 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("창고 추가 중 오류 발생:", error);
      toast.error("창고 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleCompletePost = (data: Address) => {
    // 도로명 주소와 지번 주소 중 선택 (도로명 주소 우선)
    const fullAddress = data.roadAddress || data.jibunAddress;
    setNewWarehouse({
      ...newWarehouse,
      warehouseAddress: fullAddress,
    });
    setIsAddressModalOpen(false);
  };

  // 팀 아이템 관련 함수 추가
  const handleOpenItemModal = () => {
    setIsItemModalOpen(true);
    setItemSubmitError(null);
    setItemFormData({
      itemCode: "",
      itemName: "",
      memo: "",
    });
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
  };

  const handleItemInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setItemFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeam?.id) {
      setItemSubmitError("선택된 팀이 없습니다.");
      return;
    }

    if (!itemFormData.itemCode || !itemFormData.itemName) {
      setItemSubmitError("품목 코드와 품목명은 필수 입력값입니다.");
      return;
    }

    setItemSubmitError(null);

    try {
      const teamIdNumber = Number(selectedTeam.id);
      const teamItemDto: CreateTeamItemDto = {
        ...itemFormData,
        teamId: teamIdNumber,
      };

      await createTeamItem(teamItemDto);

      // 창고 아이템 데이터 최신화
      await invalidateInventory();
      await refetchAll();

      handleCloseItemModal();
    } catch (error) {
      console.error("아이템 생성 오류:", error);
      setItemSubmitError("아이템 생성 중 오류가 발생했습니다.");
    }
  };

  // 팀 아이템 수정 모달 열기
  const handleOpenEditModal = (item: TeamItem) => {
    setEditingItem(item);
    setItemFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      memo: item.memo || "",
    });
    setIsEditModalOpen(true);
  };

  // 팀 아이템 수정 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setItemFormData({
      itemCode: "",
      itemName: "",
      memo: "",
    });
  };

  // 팀 아이템 수정 제출
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeam?.id || !editingItem) {
      setItemSubmitError("선택된 팀이 없거나 수정할 아이템이 없습니다.");
      return;
    }

    if (!itemFormData.itemCode || !itemFormData.itemName) {
      setItemSubmitError("품목 코드와 품목명은 필수 입력값입니다.");
      return;
    }

    setItemSubmitError(null);

    try {
      const teamIdNumber = Number(selectedTeam.id);
      const teamItemDto: CreateTeamItemDto = {
        ...itemFormData,
        teamId: teamIdNumber,
      };

      await updateTeamItem({
        id: editingItem.id,
        teamItemDto,
      });

      handleCloseEditModal();
    } catch (error) {
      console.error("아이템 수정 오류:", error);
      setItemSubmitError("아이템 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">창고 및 품목 관리</h2>
        <div className="flex items-center space-x-2">
          {isReadOnly && (
            <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
              읽기 전용 모드
            </div>
          )}
          {!isReadOnly && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
              onClick={handleOpenModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              창고 추가
            </button>
          )}
        </div>
      </div>
      <div className="border-b pb-4 mb-4">
        <p className="text-gray-600">
          창고 정보 관리, 재고 상태 확인, 위치 설정 및 팀 품목을 관리할 수
          있습니다.
        </p>
      </div>

      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <button
              key={warehouse.id}
              className="bg-blue-50 hover:bg-blue-100 text-left p-4 rounded-lg border border-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            >
              <h3 className="font-semibold text-blue-800">
                {warehouse.warehouseName}
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>위치: {warehouse.warehouseAddress}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-center text-gray-500">등록된 창고가 없습니다</p>
        </div>
      )}

      {/* 팀 아이템 관리 섹션 추가 */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">팀 아이템 관리</h2>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
            onClick={handleOpenItemModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            아이템 추가
          </button>
        </div>
        <div className="border-b pb-4 mb-4">
          <p className="text-gray-600">
            팀에서 사용하는 아이템 목록을 관리할 수 있습니다.
          </p>
        </div>

        {teamItems.length > 0 ? (
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
                    메모
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.itemCode || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.itemName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.memo || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm w-24 text-center">
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        onClick={() => handleOpenEditModal(item)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        수정
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200 ml-2 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">등록된 팀 아이템이 없습니다.</p>
            <button
              onClick={handleOpenItemModal}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              아이템 추가하기
            </button>
          </div>
        )}
      </div>

      {/* 창고 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">새 창고 추가</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="warehouseName"
                >
                  창고명
                </label>
                <input
                  type="text"
                  id="warehouseName"
                  name="warehouseName"
                  value={newWarehouse.warehouseName}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="warehouseAddress"
                >
                  주소
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="warehouseAddress"
                    name="warehouseAddress"
                    value={newWarehouse.warehouseAddress}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    readOnly
                    required
                  />
                  <button
                    type="button"
                    onClick={handleOpenAddressModal}
                    className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    주소 검색
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="detailLocation"
                >
                  상세 주소
                </label>
                <input
                  type="text"
                  id="detailLocation"
                  name="detailLocation"
                  value={newWarehouse.detailLocation}
                  onChange={handleInputChange}
                  placeholder="건물명, 동/호수 등 상세 주소를 입력하세요"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      저장 중...
                    </>
                  ) : (
                    "저장"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 팀 아이템 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">팀 아이템 수정</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  품목 코드
                </label>
                <input
                  type="text"
                  name="itemCode"
                  value={itemFormData.itemCode}
                  onChange={handleItemInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">품목명</label>
                <input
                  type="text"
                  name="itemName"
                  value={itemFormData.itemName}
                  onChange={handleItemInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">메모</label>
                <textarea
                  name="memo"
                  value={itemFormData.memo}
                  onChange={handleItemInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              {itemSubmitError && (
                <div className="mb-4 text-red-500 text-sm">
                  {itemSubmitError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={isItemUpdating}
                >
                  {isItemUpdating ? "수정 중..." : "수정"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 주소 검색 모달 */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">주소 검색</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsAddressModalOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
            </div>
            <SearchAddressModal onCompletePost={handleCompletePost} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
