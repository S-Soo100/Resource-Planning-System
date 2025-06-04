import React, { useState, useEffect } from "react";
import { CreateWarehouseDto, Warehouse } from "@/types/warehouse";
import { adminService } from "@/services/adminService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Button } from "@/components/ui";
import { Plus, Edit, Trash2 } from "lucide-react";
import WarehouseModal from "./WarehouseModal";

interface WarehouseManagementProps {
  warehouses: Warehouse[];
  isReadOnly?: boolean;
}

const WarehouseManagement: React.FC<WarehouseManagementProps> = ({
  warehouses = [],
  isReadOnly = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // useWarehouseItems 훅 추가
  const { invalidateInventory, refetchAll } = useWarehouseItems();

  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );

  // 컴포넌트 마운트 시 창고 목록 디버깅
  useEffect(() => {
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
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleSubmitWarehouse = async (
    warehouseRequest: CreateWarehouseDto,
    isEdit: boolean,
    editingId?: number
  ) => {
    setIsSubmitting(true);

    try {
      const currentTeam = authService.getSelectedTeam();

      if (!currentTeam || !currentTeam.id) {
        toast.error("선택된 팀 정보가 없습니다.");
        return;
      }

      // teamId 설정
      warehouseRequest.teamId = Number(currentTeam.id);

      if (isEdit && editingId) {
        // 수정 모드
        console.log("[컴포넌트] 창고 수정 시도", {
          warehouseId: editingId,
          updateData: warehouseRequest,
        });

        await adminService.updateWarehouse(
          editingId,
          warehouseRequest,
          queryClient
        );
        console.log("[컴포넌트] 창고 수정 완료");
        toast.success("창고 정보가 성공적으로 수정되었습니다.");
      } else {
        // 신규 추가 모드
        const success = await adminService.createWarehouse(
          warehouseRequest,
          queryClient
        );

        if (success) {
          toast.success("창고가 성공적으로 추가되었습니다.");
        } else {
          toast.error("창고 추가에 실패했습니다.");
          return;
        }
      }

      // 창고 데이터 최신화
      await invalidateInventory();
      await refetchAll();

      // 선택된 팀 정보 갱신
      await authService.refreshSelectedTeam();

      handleCloseModal();
    } catch (error) {
      console.error("창고 처리 중 오류 발생:", error);
      toast.error("창고 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">창고 관리</h2>
        <div className="flex items-center space-x-2">
          {isReadOnly && (
            <div className="px-4 py-2 text-sm text-yellow-700 rounded-md bg-yellow-50">
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
      <div className="pb-4 mb-4 border-b">
        <p className="text-gray-600">
          창고 정보 관리, 재고 상태 확인 및 위치 설정을 할 수 있습니다.
        </p>
      </div>

      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              className="flex flex-col p-4 text-left transition-colors duration-200 border border-blue-200 rounded-lg shadow-sm bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                <div className="flex justify-end pt-3 mt-4 space-x-2 border-t border-blue-200">
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
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-center text-gray-500">등록된 창고가 없습니다</p>
        </div>
      )}

      {/* 창고 관리 모달 */}
      <WarehouseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitWarehouse}
        editingWarehouse={editingWarehouse}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default WarehouseManagement;
