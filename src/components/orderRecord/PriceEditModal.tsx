"use client";

import { useState, useMemo } from "react";
import { Modal } from "@/components/ui";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { useUpdateOrderPrice } from "@/hooks/(useOrder)/useOrderMutations";
import { toast } from "react-hot-toast";
import { LoadingInline } from "@/components/ui/Loading";

interface PriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: IOrderRecord;
}

interface EditedItem {
  itemId: number;
  itemName: string;
  itemCode: string;
  quantity: number;
  sellingPrice: string;
  vat: string;
}

const PriceEditModal: React.FC<PriceEditModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { mutateAsync: updateOrderPrice, isPending } = useUpdateOrderPrice();

  // 초기 데이터 설정
  const [editedItems, setEditedItems] = useState<EditedItem[]>(
    order.orderItems?.map((item) => ({
      itemId: item.itemId,
      itemName: item.item?.teamItem?.itemName || "알 수 없는 품목",
      itemCode: item.item?.teamItem?.itemCode || "",
      quantity: item.quantity,
      sellingPrice: item.sellingPrice?.toString() || "",
      vat: item.vat?.toString() || "",
    })) || []
  );

  // 총 거래금액 자동 계산
  const totalPrice = useMemo(() => {
    return editedItems.reduce((sum, item) => {
      const price = parseInt(item.sellingPrice || "0", 10);
      const vat = parseInt(item.vat || "0", 10);
      return sum + (price + vat) * item.quantity;
    }, 0);
  }, [editedItems]);

  // 가격 입력 핸들러
  const handlePriceChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    // PostgreSQL INT 최대값 검증
    if (value !== "") {
      const numValue = parseInt(value, 10);
      const MAX_PRICE = 2147483647;

      if (numValue > MAX_PRICE) {
        toast.error(
          `판매가는 최대 ${MAX_PRICE.toLocaleString()}원까지 입력 가능합니다.`
        );
        return;
      }
    }

    setEditedItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        sellingPrice: value,
      };
      return updated;
    });
  };

  // VAT 입력 핸들러
  const handleVatChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    // PostgreSQL INT 최대값 검증
    if (value !== "") {
      const numValue = parseInt(value, 10);
      const MAX_PRICE = 2147483647;

      if (numValue > MAX_PRICE) {
        toast.error(
          `VAT는 최대 ${MAX_PRICE.toLocaleString()}원까지 입력 가능합니다.`
        );
        return;
      }
    }

    setEditedItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        vat: value,
      };
      return updated;
    });
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    // 모든 품목의 가격이 입력되었는지 확인
    const hasEmptyPrice = editedItems.some(
      (item) => !item.sellingPrice || item.sellingPrice === ""
    );

    if (hasEmptyPrice) {
      const confirmSubmit = window.confirm(
        "일부 품목의 판매가가 입력되지 않았습니다.\n\n0원으로 처리하시겠습니까?"
      );

      if (!confirmSubmit) {
        return;
      }
    }

    // 최종 확인
    const confirmMessage = `가격 정보를 수정하시겠습니까?\n\n총 거래금액: ${totalPrice.toLocaleString()}원`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await updateOrderPrice({
        id: order.id.toString(),
        data: {
          totalPrice,
          orderItems: editedItems.map((item) => ({
            itemId: item.itemId,
            sellingPrice: parseInt(item.sellingPrice || "0", 10),
            vat: item.vat ? parseInt(item.vat, 10) : undefined,
          })),
        },
      });

      toast.success("가격이 성공적으로 수정되었습니다.");
      onClose();

      // 페이지 새로고침으로 최신 데이터 반영
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("가격 수정 오류:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "가격 수정 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">발주 가격 수정</h2>
            <p className="text-sm text-gray-600">
              품목별 판매가와 VAT를 수정할 수 있습니다
            </p>
          </div>
        </div>

        {/* 품목 리스트 */}
        <div className="mb-6">
          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    품목명
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    품목코드
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    수량
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    판매가
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    VAT
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    소계
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editedItems.map((item, index) => {
                  const price = parseInt(item.sellingPrice || "0", 10);
                  const vat = parseInt(item.vat || "0", 10);
                  const subtotal = (price + vat) * item.quantity;

                  return (
                    <tr key={item.itemId} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {item.itemName}
                        </div>
                        {/* 모바일에서 품목코드 표시 */}
                        <div className="sm:hidden text-xs text-gray-500 mt-1">
                          {item.itemCode}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <div className="text-sm text-gray-700">
                          {item.itemCode}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {item.quantity}개
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.sellingPrice}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData("text");
                            const sanitized = pastedText.replace(/[^0-9]/g, "");
                            handlePriceChange(index, sanitized);
                          }}
                          placeholder="0"
                          className="w-20 sm:w-28 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isPending}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.vat}
                          onChange={(e) => handleVatChange(index, e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData("text");
                            const sanitized = pastedText.replace(/[^0-9]/g, "");
                            handleVatChange(index, sanitized);
                          }}
                          placeholder="0"
                          className="w-20 sm:w-28 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isPending}
                        />
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-blue-600">
                          {subtotal > 0 ? subtotal.toLocaleString() + "원" : "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 총 거래금액 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">총 거래금액</span>
            <span className="text-2xl font-bold text-blue-700">
              {totalPrice.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">안내사항</p>
              <ul className="list-disc list-inside space-y-1">
                <li>발주 상태와 무관하게 가격을 수정할 수 있습니다</li>
                <li>VAT는 자동 계산되지 않으므로 직접 입력해주세요</li>
                <li>숫자만 입력 가능하며, 최대값은 2,147,483,647원입니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isPending ? (
              <>
                <LoadingInline />
                <span>수정 중...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>가격 수정</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PriceEditModal;
