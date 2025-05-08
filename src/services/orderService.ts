// import { createOrder } from "@/api/order-api";
import { authStore } from "@/store/authStore";
import { CreateOrderDto, OrderStatus } from "@/types/(order)/order";
import {
  OrderItemWithDetails,
  OrderRequestFormData,
} from "@/types/(order)/orderRequestFormData";

export const orderService = {
  createOrderDto: async ({
    formData,
    // files,
    orderItems,
  }: {
    formData: OrderRequestFormData;
    // files: File[];
    orderItems: OrderItemWithDetails[];
  }) => {
    const auth = authStore((state) => state.user);
    const orderData: CreateOrderDto = {
      userId: auth?.id ?? 0,
      manager: formData.manager,
      supplierId: formData.supplierId ?? null,
      packageId: formData.packageId ?? null, // null가능하게
      warehouseId: formData.warehouseId ?? 0, // 창고 ID 추가 (기본값 0)
      requester: formData.requester, // 현재 내 이름
      receiver: formData.receiver, // 받는 사람
      receiverPhone: formData.receiverPhone, // 받는 사람 전화번호
      receiverAddress: `${formData.address} ${formData.detailAddress}`.trim(), // 받는 사람 주소
      purchaseDate: formData.requestDate, // 구매일
      outboundDate: formData.requestDate, // 희망출고일
      installationDate: formData.setupDate, // 희망설치일
      status: OrderStatus.requested,
      memo: formData.notes,
      orderItems: orderItems.map((item) => ({
        itemId: item.teamItem.id,
        quantity: item.quantity,
        memo: formData.notes,
      })),
    };

    return orderData;
  },
};
