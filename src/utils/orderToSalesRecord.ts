import { IOrderRecord } from "@/types/(order)/orderRecord";
import { SalesRecord } from "@/types/sales";
import { Order } from "@/types/(order)/order";

/**
 * IOrderRecord → SalesRecord 변환
 * 발주 상세 페이지에서 거래명세서 모달을 재사용하기 위한 어댑터
 */
export function orderToSalesRecord(order: IOrderRecord): SalesRecord {
  const orderItems = order.orderItems || [];

  const originalOrder = {
    id: order.id,
    title: order.title,
    receiver: order.receiver,
    receiverPhone: order.receiverPhone,
    receiverAddress: order.receiverAddress,
    requester: order.requester,
    purchaseDate: order.purchaseDate,
    supplier: {
      supplierName: order.supplier?.supplierName || "",
    },
    orderItems: orderItems,
    totalPrice: order.totalPrice,
  } as Order;

  return {
    id: order.id,
    purchaseDate: order.purchaseDate,
    title: order.title,
    supplierName: order.supplier?.supplierName || "",
    receiver: order.receiver,
    itemCount: orderItems.length,
    totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: order.totalPrice ?? null,
    status: order.status,
    manager: order.manager,
    memo: order.memo || null,
    orderItems: orderItems,
    originalOrder: originalOrder,
  };
}
