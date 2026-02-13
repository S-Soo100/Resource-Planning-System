"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui";
import { toast } from "react-hot-toast";
import { updateOrderPrice } from "@/api/order-api";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { authStore } from "@/store/authStore";
import { AlertCircle } from "lucide-react";

interface OrderPriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderRecord: IOrderRecord | null;
  onSuccess?: () => void;
}

interface PriceItemData {
  itemId: number;
  itemName: string;
  itemCode: string;
  quantity: number;
  sellingPrice: string;
  vat: string;
}

const OrderPriceEditModal: React.FC<OrderPriceEditModalProps> = ({
  isOpen,
  onClose,
  orderRecord,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState("");
  const [priceItems, setPriceItems] = useState<PriceItemData[]>([]);
  const auth = authStore((state) => state.user);

  // 권한 체크 (moderator 이상)
  const hasPermission =
    auth?.accessLevel === "moderator" || auth?.accessLevel === "admin";

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen && orderRecord) {
      // 총 판매가격 초기값
      setTotalPrice(orderRecord.totalPrice?.toString() || "");

      // 품목별 가격 초기값
      const items: PriceItemData[] = (orderRecord.orderItems || []).map((oi) => ({
        itemId: oi.item.id,
        itemName: oi.item.teamItem.itemName,
        itemCode: oi.item.teamItem.itemCode,
        quantity: oi.quantity,
        sellingPrice: oi.sellingPrice?.toString() || "",
        vat: oi.vat?.toString() || "",
      }));
      setPriceItems(items);
    }
  }, [isOpen, orderRecord]);

  // VAT 자동 계산 (10%)
  const handleCalculateVAT = () => {
    const updatedItems = priceItems.map((item) => {
      if (item.sellingPrice && !isNaN(Number(item.sellingPrice))) {
        const sellingPrice = Number(item.sellingPrice);
        const vat = Math.round(sellingPrice * 0.1);
        return { ...item, vat: vat.toString() };
      }
      return item;
    });
    setPriceItems(updatedItems);
    toast.success("VAT가 자동 계산되었습니다 (10%)");
  };

  // 품목별 판매가 변경
  const handleSellingPriceChange = (index: number, value: string) => {
    const updated = [...priceItems];
    updated[index].sellingPrice = value;
    setPriceItems(updated);
  };

  // 품목별 VAT 변경
  const handleVatChange = (index: number, value: string) => {
    const updated = [...priceItems];
    updated[index].vat = value;
    setPriceItems(updated);
  };

  // 품목별 소계 계산
  const calculateItemSubtotal = (item: PriceItemData): number => {
    const sellingPrice = Number(item.sellingPrice) || 0;
    const vat = Number(item.vat) || 0;
    return (sellingPrice + vat) * item.quantity;
  };

  // 품목 합계 계산
  const calculateItemsTotal = (): number => {
    return priceItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  };

  // 저장
  const handleSubmit = async () => {
    if (!orderRecord) return;

    // 권한 체크
    if (!hasPermission) {
      toast.error("가격 수정 권한이 없습니다 (중간관리자 이상 필요)");
      return;
    }

    setIsSubmitting(true);

    try {
      // API 요청 데이터 구성
      const requestData: {
        totalPrice?: number;
        orderItems?: Array<{
          itemId: number;
          sellingPrice: number;
          vat?: number;
        }>;
      } = {};

      // 총 판매가격 추가 (값이 있을 경우)
      if (totalPrice && totalPrice.trim() !== "") {
        requestData.totalPrice = Number(totalPrice);
      }

      // 품목별 가격 추가
      const orderItems = priceItems
        .filter((item) => item.sellingPrice && item.sellingPrice.trim() !== "")
        .map((item) => ({
          itemId: item.itemId,
          sellingPrice: Number(item.sellingPrice),
          ...(item.vat && item.vat.trim() !== "" && { vat: Number(item.vat) }),
        }));

      if (orderItems.length > 0) {
        requestData.orderItems = orderItems;
      }

      // 데이터가 없으면 오류
      if (!requestData.totalPrice && !requestData.orderItems) {
        toast.error("수정할 가격 정보를 입력해주세요");
        setIsSubmitting(false);
        return;
      }

      // API 호출
      const response = await updateOrderPrice(orderRecord.id.toString(), requestData);

      if (response.success) {
        toast.success("가격이 성공적으로 수정되었습니다");
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "가격 수정에 실패했습니다");
      }
    } catch (error) {
      console.error("가격 수정 오류:", error);
      toast.error("가격 수정 중 오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    setTotalPrice("");
    setPriceItems([]);
    onClose();
  };

  // 권한 없으면 모달 표시 안 함
  if (!hasPermission) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            💰 가격 수정 (중간관리자 이상)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            모든 상태에서 가격 정보만 별도로 수정할 수 있습니다
          </p>
        </div>

        {/* 내용 */}
        <div className="px-6 py-4 space-y-6">
          {/* 안내 메시지 */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">가격 수정 안내</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>출고완료 등 모든 상태에서 가격 수정이 가능합니다</li>
                <li>변경 내역은 자동으로 변경이력에 기록됩니다</li>
                <li>총 판매가격과 품목별 가격은 독립적으로 수정할 수 있습니다</li>
              </ul>
            </div>
          </div>

          {/* 주문 총 판매가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주문 총 판매가격
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="총 판매가격 입력"
                min="0"
              />
              <span className="text-gray-600">원</span>
            </div>
          </div>

          {/* 품목별 가격 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                품목별 가격
              </label>
              <button
                type="button"
                onClick={handleCalculateVAT}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                VAT 자동 계산 (10%)
              </button>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      품목코드
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      품목명
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수량
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      판매가
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VAT
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      소계
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {priceItems.map((item, index) => (
                    <tr key={item.itemId}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.itemCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {item.quantity}개
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        <input
                          type="number"
                          value={item.sellingPrice}
                          onChange={(e) =>
                            handleSellingPriceChange(index, e.target.value)
                          }
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="판매가"
                          min="0"
                        />
                        <span className="ml-1">원</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        <input
                          type="number"
                          value={item.vat}
                          onChange={(e) => handleVatChange(index, e.target.value)}
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="VAT"
                          min="0"
                        />
                        <span className="ml-1">원</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {calculateItemSubtotal(item).toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-3 text-sm font-semibold text-gray-700 text-right"
                    >
                      품목 합계:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                      {calculateItemsTotal().toLocaleString()}원
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderPriceEditModal;
