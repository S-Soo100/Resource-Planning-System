import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import {
  CreateWarehouseDto,
  CreateWarehouseProps,
  Warehouse,
} from "@/types/warehouse";
import { Button, Input, Modal } from "@/components/ui";
import { Search } from "lucide-react";

// SearchAddressModal을 동적으로 import
const SearchAddressModal = dynamic(() => import("../SearchAddressModal"), {
  ssr: false,
});

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    warehouse: CreateWarehouseDto,
    isEdit: boolean,
    editingId?: number
  ) => Promise<void>;
  editingWarehouse?: Warehouse | null;
  isSubmitting: boolean;
}

export default function WarehouseModal({
  isOpen,
  onClose,
  onSubmit,
  editingWarehouse,
  isSubmitting,
}: WarehouseModalProps) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [warehouseData, setWarehouseData] = useState<
    Omit<CreateWarehouseProps, "id">
  >({
    warehouseName: "",
    warehouseAddress: "",
    detailLocation: "",
  });

  // 수정 모드일 때 기존 데이터로 초기화
  useEffect(() => {
    if (editingWarehouse) {
      // 주소와 상세 주소 분리 시도
      let mainAddress = editingWarehouse.warehouseAddress || "";
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

      setWarehouseData({
        warehouseName: editingWarehouse.warehouseName,
        warehouseAddress: mainAddress,
        detailLocation: detailLocation,
      });
    } else {
      // 새 창고 추가 모드일 때 초기화
      setWarehouseData({
        warehouseName: "",
        warehouseAddress: "",
        detailLocation: "",
      });
    }
  }, [editingWarehouse, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWarehouseData({
      ...warehouseData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const warehouseRequest: CreateWarehouseDto = {
      warehouseName: warehouseData.warehouseName,
      warehouseAddress:
        warehouseData.warehouseAddress +
        (warehouseData.detailLocation
          ? ` ${warehouseData.detailLocation}`
          : ""),
      teamId: 0, // 부모 컴포넌트에서 설정됨
    };

    await onSubmit(warehouseRequest, !!editingWarehouse, editingWarehouse?.id);
  };

  const handleCloseModal = () => {
    setWarehouseData({
      warehouseName: "",
      warehouseAddress: "",
      detailLocation: "",
    });
    setIsAddressModalOpen(false);
    onClose();
  };

  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleCompletePost = (data: Address) => {
    // 도로명 주소와 지번 주소 중 선택 (도로명 주소 우선)
    const fullAddress = data.roadAddress || data.jibunAddress;
    setWarehouseData({
      ...warehouseData,
      warehouseAddress: fullAddress,
    });
    setIsAddressModalOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
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
              value={warehouseData.warehouseName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Input
              label="주소"
              name="warehouseAddress"
              type="text"
              value={warehouseData.warehouseAddress}
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
              value={warehouseData.detailLocation}
              onChange={handleInputChange}
              placeholder="건물명, 동/호수 등 상세 주소를 입력하세요"
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3">
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
    </>
  );
}
