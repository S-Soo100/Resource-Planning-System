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
import { DepositStatus, UpdateOrderDetailsDto } from "@/types/(order)/order";

const DEPOSIT_STATUS_OPTIONS: { value: DepositStatus; label: string }[] = [
  { value: "자부담금", label: "자부담금" },
  { value: "전액", label: "전액" },
  { value: "선금", label: "선금" },
  { value: "중도금", label: "중도금" },
  { value: "잔금", label: "잔금" },
];

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
  const { mutateAsync: updateOrderDetails, isPending } =
    useUpdateOrderDetails();

  // 선택된 고객 정보
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    () => {
      if (order.supplier && order.supplierId) {
        const fullSupplier = suppliers.find((s) => s.id === order.supplierId);
        return fullSupplier || null;
      }
      return null;
    }
  );
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // 환급 관련 상태
  const [isRefundApplied, setIsRefundApplied] = useState(
    order.isRefundApplied ?? false
  );
  const [isRefundReceived, setIsRefundReceived] = useState(
    order.isRefundReceived ?? false
  );
  const [isRefundNotApplicable, setIsRefundNotApplicable] = useState(
    order.isRefundNotApplicable ?? false
  );

  // 세금계산서
  const [isTaxInvoiceIssued, setIsTaxInvoiceIssued] = useState(
    order.isTaxInvoiceIssued ?? false
  );

  // 입금 관련
  const [depositStatus, setDepositStatus] = useState<DepositStatus | "">(
    (order.depositStatus as DepositStatus) ?? ""
  );
  const [depositAmount, setDepositAmount] = useState<string>(
    order.depositAmount != null ? order.depositAmount.toString() : ""
  );

  // 환급 해당없음 체크 시 다른 환급 필드 비활성화
  const handleRefundNotApplicableChange = (checked: boolean) => {
    setIsRefundNotApplicable(checked);
    if (checked) {
      setIsRefundApplied(false);
      setIsRefundReceived(false);
    }
  };

  // 고객 선택 핸들러
  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  // 변경 여부 체크
  const hasChanges = () => {
    const supplierChanged =
      selectedSupplier && order.supplierId !== selectedSupplier.id;
    const refundChanged =
      isRefundApplied !== (order.isRefundApplied ?? false) ||
      isRefundReceived !== (order.isRefundReceived ?? false) ||
      isRefundNotApplicable !== (order.isRefundNotApplicable ?? false);
    const taxChanged =
      isTaxInvoiceIssued !== (order.isTaxInvoiceIssued ?? false);
    const depositStatusChanged =
      depositStatus !== ((order.depositStatus as DepositStatus) ?? "");
    const depositAmountChanged =
      depositAmount !==
      (order.depositAmount != null ? order.depositAmount.toString() : "");

    return (
      supplierChanged ||
      refundChanged ||
      taxChanged ||
      depositStatusChanged ||
      depositAmountChanged
    );
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!hasChanges()) {
      toast("변경된 내용이 없습니다", { icon: "ℹ️" });
      return;
    }

    const data: UpdateOrderDetailsDto = {};

    // 고객 변경
    if (selectedSupplier && order.supplierId !== selectedSupplier.id) {
      data.supplierId = selectedSupplier.id;
    }

    // 환급 필드 (변경된 것만 전송)
    if (isRefundApplied !== (order.isRefundApplied ?? false)) {
      data.isRefundApplied = isRefundApplied;
    }
    if (isRefundReceived !== (order.isRefundReceived ?? false)) {
      data.isRefundReceived = isRefundReceived;
    }
    if (isRefundNotApplicable !== (order.isRefundNotApplicable ?? false)) {
      data.isRefundNotApplicable = isRefundNotApplicable;
    }

    // 세금계산서
    if (isTaxInvoiceIssued !== (order.isTaxInvoiceIssued ?? false)) {
      data.isTaxInvoiceIssued = isTaxInvoiceIssued;
    }

    // 입금 상태
    if (depositStatus !== ((order.depositStatus as DepositStatus) ?? "")) {
      data.depositStatus = depositStatus as DepositStatus;
    }

    // 입금 금액
    const newAmount = depositAmount ? parseInt(depositAmount) : undefined;
    const oldAmount = order.depositAmount ?? undefined;
    if (newAmount !== oldAmount) {
      data.depositAmount = newAmount;
    }

    try {
      await updateOrderDetails({
        id: order.id.toString(),
        data,
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        showCloseButton={false}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">발주 정보 수정</h2>
          <p className="text-sm text-gray-600">
            출고완료 건의 상세 정보를 수정합니다
          </p>
        </div>

        {/* 본문 */}
        <div className="mt-6 space-y-6">
          {/* Suppliers 데이터 없음 경고 */}
          {suppliers.length === 0 && (
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
                    {suppliers.length === 0
                      ? "고객 목록이 비어있습니다"
                      : "고객을 선택하세요"}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 환급 정보 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              환급 정보
            </label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRefundApplied}
                  onChange={(e) => setIsRefundApplied(e.target.checked)}
                  disabled={isRefundNotApplicable}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-50"
                />
                <span
                  className={`text-sm ${isRefundNotApplicable ? "text-gray-400" : "text-gray-700"}`}
                >
                  환급 신청
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRefundReceived}
                  onChange={(e) => setIsRefundReceived(e.target.checked)}
                  disabled={isRefundNotApplicable}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-50"
                />
                <span
                  className={`text-sm ${isRefundNotApplicable ? "text-gray-400" : "text-gray-700"}`}
                >
                  환급금 입금 완료
                </span>
              </label>
              <div className="border-t border-gray-200 pt-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRefundNotApplicable}
                    onChange={(e) =>
                      handleRefundNotApplicableChange(e.target.checked)
                    }
                    className="w-4 h-4 text-orange-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">환급 해당없음</span>
                </label>
              </div>
            </div>
          </div>

          {/* 세금계산서 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              세금계산서
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTaxInvoiceIssued}
                  onChange={(e) => setIsTaxInvoiceIssued(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  매입세금계산서 발행 완료
                </span>
              </label>
            </div>
          </div>

          {/* 입금 정보 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              입금 정보
            </label>
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  입금 상태
                </label>
                <select
                  value={depositStatus}
                  onChange={(e) =>
                    setDepositStatus(e.target.value as DepositStatus | "")
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">미설정</option>
                  {DEPOSIT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  입금 금액
                </label>
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setDepositAmount(value);
                  }}
                  placeholder="금액을 입력하세요"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {depositAmount && (
                  <p className="mt-1 text-xs text-gray-500">
                    {parseInt(depositAmount).toLocaleString()}원
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 변경 이력 안내 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              변경된 필드는 변경 이력에 자동으로 기록됩니다.
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
        suppliers={suppliers}
        onSelect={handleSupplierSelect}
        selectedSupplierId={selectedSupplier?.id || null}
      />
    </>
  );
};

export default DetailsEditModal;
