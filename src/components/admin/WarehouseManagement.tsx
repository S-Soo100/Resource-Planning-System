import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import { CreateWarehouseDto, CreateWarehouseProps } from "@/types/warehouse";
import { adminService } from "@/services/adminService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";

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

  const [editingWarehouse, setEditingWarehouse] = useState<{
    id: string;
    warehouseName: string;
    warehouseAddress: string;
  } | null>(null);

  // 컴포넌트 마운트 시 창고 목록 디버깅
  useEffect(() => {
    console.log("[창고 목록 정본]", JSON.stringify(warehouses));
    console.log(
      "WarehouseManagement 렌더링, warehouses 개수:",
      warehouses.length
    );

    // 각 창고의 주소 정보 상세 디버깅
    warehouses.forEach((warehouse) => {
      try {
        const addressInfo = {
          id: warehouse.id,
          warehouseName: warehouse.warehouseName,
          warehouseAddress: warehouse.warehouseAddress,
          warehouseAddressType: typeof warehouse.warehouseAddress,
          warehouseAddressLength: warehouse.warehouseAddress
            ? warehouse.warehouseAddress.length
            : 0,
          isEmpty:
            !warehouse.warehouseAddress ||
            warehouse.warehouseAddress.trim() === "",
          hasNull: warehouse.warehouseAddress === null,
          hasUndefined: warehouse.warehouseAddress === undefined,
        };

        console.log(`[창고 ID: ${warehouse.id}] 주소 분석:`, addressInfo);
      } catch (error) {
        console.error(`[창고 ID: ${warehouse.id}] 분석 오류:`, error);
      }
    });
  }, [warehouses]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
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

      // 수정 모드인 경우
      if (editingWarehouse) {
        // newWarehouse를 CreateWarehouseDto로 변환
        const warehouseRequest: CreateWarehouseDto = {
          warehouseName: newWarehouse.warehouseName,
          warehouseAddress:
            newWarehouse.warehouseAddress +
            (newWarehouse.detailLocation
              ? ` ${newWarehouse.detailLocation}`
              : ""),
          teamId: Number(currentTeam.id),
        };

        try {
          console.log("[컴포넌트] 창고 수정 시도", {
            warehouseId: editingWarehouse.id,
            originalData: editingWarehouse,
            updateData: warehouseRequest,
          });

          // 창고 수정 API 호출
          await adminService.updateWarehouse(
            Number(editingWarehouse.id),
            warehouseRequest,
            queryClient
          );

          console.log("[컴포넌트] 창고 수정 완료");

          toast.success("창고 정보가 성공적으로 수정되었습니다.");

          // 창고 데이터 최신화
          await invalidateInventory();
          await refetchAll();

          // 선택된 팀 정보 갱신
          await authService.refreshSelectedTeam();

          handleCloseModal();
        } catch (error) {
          console.error("[컴포넌트] 창고 수정 중 오류 발생:", error);
          toast.error("창고 수정 중 오류가 발생했습니다.");
        }
      } else {
        // 신규 추가 모드
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
      }
    } catch (error) {
      console.error("창고 처리 중 오류 발생:", error);
      toast.error("창고 처리 중 오류가 발생했습니다.");
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

  const handleEditWarehouse = (warehouse: {
    id: string;
    warehouseName: string;
    warehouseAddress: string;
  }) => {
    setEditingWarehouse(warehouse);

    // 주소와 상세 주소 분리 시도
    let mainAddress = warehouse.warehouseAddress;
    let detailLocation = "";

    // 주소 데이터에서 상세 주소 추출 시도 (예: 마지막 공백 이후를 상세 주소로 간주)
    const lastSpaceIndex = warehouse.warehouseAddress.lastIndexOf(" ");
    if (
      lastSpaceIndex !== -1 &&
      lastSpaceIndex < warehouse.warehouseAddress.length - 1
    ) {
      const potentialDetail = warehouse.warehouseAddress.substring(
        lastSpaceIndex + 1
      );
      // 숫자로만 구성된 경우 상세 주소로 간주 (예: 아파트 호수 등)
      if (/^\d+$/.test(potentialDetail)) {
        mainAddress = warehouse.warehouseAddress.substring(0, lastSpaceIndex);
        detailLocation = potentialDetail;
      }
    }

    console.log("[수정 모달 열기]", {
      원본주소: warehouse.warehouseAddress,
      변환주소: mainAddress,
      상세주소: detailLocation,
    });

    setNewWarehouse({
      warehouseName: warehouse.warehouseName,
      warehouseAddress: mainAddress,
      detailLocation: detailLocation,
    });

    setIsModalOpen(true);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">창고 관리</h2>
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
          창고 정보 관리, 재고 상태 확인 및 위치 설정을 할 수 있습니다.
        </p>
      </div>

      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              className="bg-blue-50 hover:bg-blue-100 text-left p-4 rounded-lg border border-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm flex flex-col"
            >
              <div className="flex-grow">
                <h3 className="font-semibold text-blue-800">
                  {warehouse.warehouseName}
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p className="break-words">
                    <span className="font-medium">위치:</span>{" "}
                    {warehouse &&
                    warehouse.warehouseAddress &&
                    warehouse.warehouseAddress.trim() !== ""
                      ? warehouse.warehouseAddress
                      : "주소 정보 없음"}
                  </p>
                </div>
              </div>
              {!isReadOnly && (
                <div className="flex justify-end mt-4 pt-3 border-t border-blue-200">
                  <button
                    onClick={() => handleEditWarehouse(warehouse)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-white rounded-md hover:bg-blue-50 transition-colors duration-200 mr-2"
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
                  <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-white rounded-md hover:bg-red-50 transition-colors duration-200">
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
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-center text-gray-500">등록된 창고가 없습니다</p>
        </div>
      )}

      {/* 창고 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editingWarehouse ? "창고 정보 수정" : "새 창고 추가"}
              </h3>
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
                      {editingWarehouse ? "수정 중..." : "저장 중..."}
                    </>
                  ) : editingWarehouse ? (
                    "수정"
                  ) : (
                    "저장"
                  )}
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
