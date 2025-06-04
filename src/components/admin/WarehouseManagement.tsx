import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import {
  CreateWarehouseDto,
  CreateWarehouseProps,
  Warehouse,
} from "@/types/warehouse";
import { adminService } from "@/services/adminService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Button, Input, Modal } from "@/components/ui";
import { Plus, Edit, Trash2, Search } from "lucide-react";

// SearchAddressModal을 동적으로 import
const SearchAddressModal = dynamic(() => import("../SearchAddressModal"), {
  ssr: false,
});

interface WarehouseManagementProps {
  warehouses: Warehouse[];
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
    id: number;
    warehouseName: string;
    warehouseAddress: string;
  } | null>(null);

  // 컴포넌트 마운트 시 창고 목록 디버깅
  useEffect(() => {
    // console.log("[창고 목록 정본]", JSON.stringify(warehouses));
    // console.log(
    //   "WarehouseManagement 렌더링, warehouses 개수:",
    //   warehouses.length
    // );

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

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse({
      id: warehouse.id,
      warehouseName: warehouse.warehouseName,
      warehouseAddress: warehouse.warehouseAddress || "",
    });

    // 주소와 상세 주소 분리 시도
    let mainAddress = warehouse.warehouseAddress || "";
    let detailLocation = "";

    // 주소 데이터에서 상세 주소 추출 시도 (예: 마지막 공백 이후를 상세 주소로 간주)
    const lastSpaceIndex = mainAddress.lastIndexOf(" ");
    if (lastSpaceIndex !== -1 && lastSpaceIndex < mainAddress.length - 1) {
      const potentialDetail = mainAddress.substring(lastSpaceIndex + 1);
      // 숫자로만 구성된 경우 상세 주소로 간주 (예: 아파트 호수 등)
      if (/^\d+$/.test(potentialDetail)) {
        mainAddress = mainAddress.substring(0, lastSpaceIndex);
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
            <Button
              variant="primary"
              onClick={handleOpenModal}
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              창고 추가
            </Button>
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
                <div className="flex justify-end mt-4 pt-3 border-t border-blue-200 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditWarehouse(warehouse)}
                    icon={<Edit className="w-3 h-3" />}
                    iconPosition="left"
                  >
                    수정
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-3 h-3" />}
                    iconPosition="left"
                  >
                    삭제
                  </Button>
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
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingWarehouse ? "창고 정보 수정" : "새 창고 추가"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="창고명"
              name="warehouseName"
              type="text"
              value={newWarehouse.warehouseName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Input
              label="주소"
              name="warehouseAddress"
              type="text"
              value={newWarehouse.warehouseAddress}
              onChange={handleInputChange}
              readOnly
              required
              rightIcon={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenAddressModal}
                  icon={<Search className="w-4 h-4" />}
                >
                  검색
                </Button>
              }
            />
          </div>

          <div>
            <Input
              label="상세 주소"
              name="detailLocation"
              type="text"
              value={newWarehouse.detailLocation}
              onChange={handleInputChange}
              placeholder="건물명, 동/호수 등 상세 주소를 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              취소
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {editingWarehouse ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 주소 검색 모달 */}
      {isAddressModalOpen && (
        <SearchAddressModal onCompletePost={handleCompletePost} />
      )}
    </div>
  );
};

export default WarehouseManagement;
