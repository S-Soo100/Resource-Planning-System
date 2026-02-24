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
  // 🆕 v2.6.0: 총액 입력 방식
  totalPrice: string;        // 사용자 입력 (총 금액)
  isZeroRated: boolean;      // 개별 영세율 체크
  // 자동 계산 필드
  sellingPrice: string;      // 공급가액 (자동 계산)
  vat: string;               // 부가세 (자동 계산)
}

const PriceEditModal: React.FC<PriceEditModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { mutateAsync: updateOrderPrice, isPending } = useUpdateOrderPrice();

  // 🆕 전체 영세율 상태 (v2.6.0)
  const [isAllZeroRated, setIsAllZeroRated] = useState(false);

  // 초기 데이터 설정
  const [editedItems, setEditedItems] = useState<EditedItem[]>(
    order.orderItems?.map((item) => {
      const sellingPrice = item.sellingPrice || 0;
      const vat = item.vat || 0;
      const totalPrice = sellingPrice + vat;
      const isZeroRated = vat === 0 && sellingPrice > 0;

      return {
        itemId: item.itemId,
        itemName: item.item?.teamItem?.itemName || "알 수 없는 품목",
        itemCode: item.item?.teamItem?.itemCode || "",
        quantity: item.quantity,
        totalPrice: totalPrice.toString(),
        isZeroRated: isZeroRated,
        sellingPrice: sellingPrice.toString(),
        vat: vat.toString(),
      };
    }) || []
  );

  // 🆕 총 금액에서 공급가액과 VAT 계산 (v2.6.0)
  const calculatePriceBreakdown = (
    totalPrice: string,
    isZeroRated: boolean
  ): { sellingPrice: number; vat: number } => {
    const total = parseInt(totalPrice || "0", 10);

    if (total === 0) {
      return { sellingPrice: 0, vat: 0 };
    }

    if (isZeroRated) {
      // 영세율: 전체 금액이 공급가액, VAT = 0
      return {
        sellingPrice: total,
        vat: 0,
      };
    } else {
      // 일반 부가세: 총액 ÷ 1.1 = 공급가액
      const sellingPrice = Math.round(total / 1.1);
      const vat = total - sellingPrice; // 차액이 VAT (반올림 오차 방지)
      return { sellingPrice, vat };
    }
  };

  // 총 거래금액 자동 계산
  const totalPrice = useMemo(() => {
    return editedItems.reduce((sum, item) => {
      const isZeroRated = isAllZeroRated || item.isZeroRated;
      const { sellingPrice, vat } = calculatePriceBreakdown(
        item.totalPrice,
        isZeroRated
      );
      return sum + (sellingPrice + vat) * item.quantity;
    }, 0);
  }, [editedItems, isAllZeroRated]);

  // 🆕 전체 영세율 체크 핸들러 (v2.6.0)
  const handleAllZeroRatedChange = (checked: boolean) => {
    setIsAllZeroRated(checked);

    // 모든 품목의 가격 재계산
    setEditedItems((prev) =>
      prev.map((item) => {
        const { sellingPrice, vat } = calculatePriceBreakdown(
          item.totalPrice,
          checked
        );
        return {
          ...item,
          sellingPrice: sellingPrice.toString(),
          vat: vat.toString(),
        };
      })
    );
  };

  // 🆕 개별 영세율 체크 핸들러 (v2.6.0)
  const handleZeroRatedChange = (index: number, checked: boolean) => {
    setEditedItems((prev) => {
      const updated = [...prev];
      const item = updated[index];

      // 영세율 상태 업데이트
      const newItem = { ...item, isZeroRated: checked };

      // 가격 재계산
      const { sellingPrice, vat } = calculatePriceBreakdown(
        newItem.totalPrice,
        checked
      );

      newItem.sellingPrice = sellingPrice.toString();
      newItem.vat = vat.toString();

      updated[index] = newItem;
      return updated;
    });
  };

  // 🆕 총 금액 입력 핸들러 (v2.6.0)
  const handleTotalPriceChange = (index: number, value: string) => {
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
          `총 금액은 최대 ${MAX_PRICE.toLocaleString()}원까지 입력 가능합니다.`
        );
        return;
      }
    }

    setEditedItems((prev) => {
      const updated = [...prev];
      const item = updated[index];

      // 영세율 여부 확인 (전체 또는 개별)
      const isZeroRated = isAllZeroRated || item.isZeroRated;

      // 공급가액과 VAT 자동 계산
      const { sellingPrice, vat } = calculatePriceBreakdown(value, isZeroRated);

      // 업데이트
      updated[index] = {
        ...item,
        totalPrice: value,
        sellingPrice: sellingPrice.toString(),
        vat: vat.toString(),
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
              품목별 총 금액만 입력하세요. 공급가액과 부가세는 자동 계산됩니다.
            </p>
          </div>
        </div>

        {/* 🆕 전체 영세율 체크박스 (v2.6.0) */}
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllZeroRated}
              onChange={(e) => handleAllZeroRatedChange(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="font-medium text-gray-700">
              영세율(0%) 품목 (전체 적용)
            </span>
          </label>
          <p className="ml-6 mt-1 text-xs text-amber-700">
            체크 시: 모든 품목의 부가세가 0원으로 처리됩니다
          </p>
        </div>

        {/* 🆕 안내 메시지 (v2.6.0) */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 가격 입력 방법</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>총 금액만 입력</strong>하세요. 공급가액과 부가세는 자동으로 계산됩니다.
                </li>
                <li>
                  <strong>일반 품목</strong>: 총 금액의 10%가 부가세로 자동 계산됩니다.
                </li>
                <li>
                  <strong>영세율 품목</strong>: 체크박스를 선택하면 부가세가 0원으로 처리됩니다.
                </li>
              </ul>
            </div>
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
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    영세율
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    총 금액 (원)
                    <span className="ml-1 text-xs text-blue-600">✏️</span>
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공급가액 (원)
                    <span className="ml-1 text-xs">💡</span>
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    부가세 (원)
                    <span className="ml-1 text-xs">💡</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {editedItems.map((item, index) => {
                  // 🆕 영세율 여부 판단 (전체 또는 개별)
                  const isZeroRated = isAllZeroRated || item.isZeroRated;

                  // 🆕 자동 계산
                  const { sellingPrice, vat } = calculatePriceBreakdown(
                    item.totalPrice,
                    isZeroRated
                  );

                  const subtotal = (sellingPrice + vat) * item.quantity;

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

                      {/* 🆕 영세율 체크박스 (v2.6.0) */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.isZeroRated}
                          onChange={(e) => handleZeroRatedChange(index, e.target.checked)}
                          disabled={isAllZeroRated || isPending}
                          className="w-4 h-4 accent-blue-600"
                          title={isAllZeroRated ? "전체 영세율 적용 중" : "개별 영세율"}
                        />
                      </td>

                      {/* 🆕 총 금액 입력 (v2.6.0) */}
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.totalPrice}
                          onChange={(e) => handleTotalPriceChange(index, e.target.value)}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pastedText = e.clipboardData.getData("text");
                            const sanitized = pastedText.replace(/[^0-9]/g, "");
                            handleTotalPriceChange(index, sanitized);
                          }}
                          placeholder="총 금액 입력"
                          className="w-24 sm:w-32 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-right border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                          disabled={isPending}
                        />
                      </td>

                      {/* 🆕 공급가액 (자동 계산, 읽기 전용) */}
                      <td className="hidden md:table-cell px-4 py-3 text-right">
                        <span className="text-sm text-gray-600">
                          {sellingPrice > 0 ? sellingPrice.toLocaleString() : "-"}
                        </span>
                      </td>

                      {/* 🆕 부가세 (자동 계산, 읽기 전용) */}
                      <td className="hidden md:table-cell px-4 py-3 text-right">
                        <span className="text-sm text-gray-600">
                          {vat > 0 ? vat.toLocaleString() : "0"}
                        </span>
                        {isZeroRated && (
                          <span className="ml-1 text-xs text-amber-600">(0%)</span>
                        )}
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
