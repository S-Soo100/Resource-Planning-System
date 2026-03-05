"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { useUpdateOrderDetails } from "@/hooks/(useOrder)/useOrderMutations";
import { toast } from "react-hot-toast";
import { LoadingInline } from "@/components/ui/Loading";
import SelectSupplierModal from "@/components/supplier/SelectSupplierModal";
import { Supplier } from "@/types/supplier";
import { Building2 } from "lucide-react";

interface DetailsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrderRecord;
  suppliers: Supplier[];
  onSave?: (updatedFields: Partial<IOrderRecord>) => void;
}

const DetailsEditModal: React.FC<DetailsEditModalProps> = ({
  isOpen,
  onClose,
  order,
  suppliers,
  onSave,
}) => {
  const { mutateAsync: updateOrderDetails, isPending } =
    useUpdateOrderDetails();

  // 선택된 고객 정보
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    () => {
      if (order.supplier && order.supplierId) {
        const fullSupplier = supplierList.find(
          (s) => s.id === order.supplierId
        );
        return fullSupplier || null;
      }
      return null;
    }
  );
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // 고객 선택 핸들러
  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  // 변경 여부 체크
  const hasChanges = () => {
    return !!(selectedSupplier && order.supplierId !== selectedSupplier.id);
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!hasChanges()) {
      toast("변경된 내용이 없습니다", { icon: "ℹ️" });
      return;
    }

    if (!selectedSupplier) return;

    try {
      await updateOrderDetails({
        id: order.id.toString(),
        data: { supplierId: selectedSupplier.id },
      });

      toast.success("고객이 변경되었습니다", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#4CAF50",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
      });

      if (onSave) {
        onSave({
          supplierId: selectedSupplier.id,
          supplier: {
            id: selectedSupplier.id,
            supplierName: selectedSupplier.supplierName,
          },
        } as Partial<IOrderRecord>);
      }

      onClose();
    } catch (error) {
      console.error("고객 변경 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "고객 변경에 실패했습니다"
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        showCloseButton={false}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">고객 변경</h2>
          <p className="text-sm text-gray-600">
            발주의 고객(납품처)을 변경합니다
          </p>
        </div>

        {/* 본문 */}
        <div className="mt-6 space-y-6">
          {/* Suppliers 데이터 없음 경고 */}
          {supplierList.length === 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️{" "}
                <span className="font-semibold">고객 목록이 비어있습니다.</span>{" "}
                먼저 고객을 등록해주세요.
              </p>
            </div>
          )}

          {/* 고객 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="inline-block w-4 h-4 mr-1 mb-0.5" />
              고객 선택
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(true)}
                disabled={supplierList.length === 0}
                className={`flex-1 px-4 py-3 text-left rounded-lg border-2 transition-all ${
                  selectedSupplier
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white hover:border-blue-400"
                } ${supplierList.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    {supplierList.length === 0
                      ? "고객 목록이 비어있습니다"
                      : "고객을 선택하세요"}
                  </div>
                )}
              </button>
            </div>
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
            disabled={isPending || !hasChanges()}
            className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        suppliers={supplierList}
        onSelect={handleSupplierSelect}
        selectedSupplierId={selectedSupplier?.id || null}
      />
    </>
  );
};

export default DetailsEditModal;
