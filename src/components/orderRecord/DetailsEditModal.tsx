"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { useUpdateOrderDetails } from "@/hooks/(useOrder)/useOrderMutations";
import { toast } from "react-hot-toast";
import { LoadingInline } from "@/components/ui/Loading";
import SelectSupplierModal from "@/components/supplier/SelectSupplierModal";
import { Supplier } from "@/types/supplier";
import { Building2, User } from "lucide-react";

interface DetailsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrderRecord;
  suppliers: Supplier[];
}

const DetailsEditModal: React.FC<DetailsEditModalProps> = ({
  isOpen,
  onClose,
  order,
  suppliers,
}) => {
  const { mutateAsync: updateOrderDetails, isPending } = useUpdateOrderDetails();

  // 선택된 고객 정보 - order.supplier는 부분 타입이므로 목록에서 찾아서 설정
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(() => {
    if (order.supplier && order.supplierId) {
      // suppliers 목록에서 해당 ID의 전체 정보를 찾기
      const fullSupplier = suppliers.find((s) => s.id === order.supplierId);
      return fullSupplier || null;
    }
    return null;
  });
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // 고객 선택 핸들러
  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  // 저장 핸들러
  const handleSave = async () => {
    // 고객이 선택되지 않은 경우 검증
    if (!selectedSupplier) {
      toast.error("고객을 선택해주세요");
      return;
    }

    // 동일한 고객을 선택한 경우 (변경 없음)
    if (order.supplierId === selectedSupplier.id) {
      toast.error("동일한 고객입니다. 다른 고객을 선택해주세요", {
        duration: 3000,
        icon: "ℹ️",
      });
      return;
    }

    try {
      await updateOrderDetails({
        id: order.id.toString(),
        data: {
          supplierId: selectedSupplier.id,
        },
      });

      toast.success("발주 정보가 수정되었습니다", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#4CAF50",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });

      // 페이지 새로고침하여 변경사항 반영
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("발주 정보 수정 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "발주 정보 수정에 실패했습니다"
      );
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">발주 정보 수정</h2>
          <p className="text-sm text-gray-600">
            레거시 데이터를 수정할 수 있습니다
          </p>
        </div>

        {/* 본문 */}
        <div className="mt-6 space-y-6">
          {/* Suppliers 데이터 없음 경고 */}
          {suppliers.length === 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ <span className="font-semibold">고객 목록이 비어있습니다.</span> 먼저 고객을 등록해주세요.
              </p>
            </div>
          )}

          {/* 고객 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="inline-block w-4 h-4 mr-1 mb-0.5" />
              고객 선택 *
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                disabled={suppliers.length === 0}
                className={`flex-1 px-4 py-3 text-left rounded-lg border-2 transition-all ${
                  selectedSupplier
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white hover:border-blue-400"
                } ${suppliers.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {selectedSupplier ? (
                  <div>
                    <div className="font-semibold text-gray-800">
                      {selectedSupplier.supplierName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedSupplier.supplierPhoneNumber || "전화번호 없음"}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    {suppliers.length === 0 ? "고객 목록이 비어있습니다" : "고객을 선택하세요"}
                  </div>
                )}
              </button>
            </div>
            {!selectedSupplier && suppliers.length > 0 && (
              <p className="mt-2 text-xs text-red-600">
                ⚠️ 고객을 선택해주세요
              </p>
            )}
          </div>

          {/* 기존 고객 정보 (참고용) */}
          {order.supplier && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                기존 고객 정보
              </h3>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">고객명:</span>{" "}
                  {order.supplier.supplierName}
                </p>
                <p className="mt-1">
                  <span className="font-medium">전화번호:</span>{" "}
                  {order.supplier.supplierPhoneNumber || "-"}
                </p>
              </div>
            </div>
          )}

          {/* 변경 이력 안내 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <span className="font-semibold">변경 이력 기록:</span> 고객 정보
              변경 시 변경 이력에 자동으로 기록됩니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !selectedSupplier || suppliers.length === 0}
            className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title={
              suppliers.length === 0
                ? "고객 목록이 비어있습니다"
                : !selectedSupplier
                ? "고객을 선택해주세요"
                : ""
            }
          >
            {isPending ? (
              <>
                <LoadingInline />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </button>
        </div>
      </Modal>

      {/* 고객 선택 모달 */}
      <SelectSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        suppliers={suppliers}
        onSelect={handleSupplierSelect}
        selectedSupplierId={selectedSupplier?.id || null}
      />
    </>
  );
};

export default DetailsEditModal;
