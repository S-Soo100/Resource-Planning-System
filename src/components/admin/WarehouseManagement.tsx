import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import {
  CreateWarehouseRequest,
  CreateWarehouseProps,
} from "@/types/warehouse";
import { adminService } from "@/services/adminService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";

// SearchAddressModal을 동적으로 import
const SearchAddressModal = dynamic(
  () => import("../orderRequest/(addressSearch)/SearchAddressModal"),
  { ssr: false }
);

interface WarehouseManagementProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warehouses: any[];
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = ({
  warehouses = [],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const [newWarehouse, setNewWarehouse] = useState<
    Omit<CreateWarehouseProps, "id">
  >({
    name: "",
    location: "",
    detailLocation: "",
    capacity: 0,
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewWarehouse({
      name: "",
      location: "",
      detailLocation: "",
      capacity: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWarehouse({
      ...newWarehouse,
      [name]: name === "capacity" ? Number(value) : value,
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

      // newWarehouse를 CreateWarehouseRequest로 변환
      const warehouseRequest: CreateWarehouseRequest = {
        warehouseName: newWarehouse.name,
        warehouseAddress:
          newWarehouse.location +
          (newWarehouse.detailLocation
            ? ` ${newWarehouse.detailLocation}`
            : ""),
        teamId: Number(currentTeam.id), // 문자열을 숫자로 변환
      };

      const success = await adminService.addWarehouse(
        warehouseRequest,
        queryClient
      );

      if (success) {
        toast.success("창고가 성공적으로 추가되었습니다.");
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
      location: fullAddress,
    });
    setIsAddressModalOpen(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">창고 관리</h2>
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
      </div>
      <div className="border-b pb-4 mb-4">
        <p className="text-gray-600">
          창고 정보 관리, 재고 상태 확인 및 위치 설정을 할 수 있습니다.
        </p>
      </div>

      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <button
              key={warehouse.id}
              className="bg-blue-50 hover:bg-blue-100 text-left p-4 rounded-lg border border-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            >
              <h3 className="font-semibold text-blue-800">{warehouse.name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>위치: {warehouse.location}</p>
                <p>용량: {warehouse.capacity}㎡</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-center text-gray-500">등록된 창고가 없습니다</p>
        </div>
      )}

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
                  htmlFor="name"
                >
                  창고명
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newWarehouse.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="location"
                >
                  주소
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={newWarehouse.location}
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
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="capacity"
                >
                  용량 (㎡)
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={newWarehouse.capacity}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  required
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
