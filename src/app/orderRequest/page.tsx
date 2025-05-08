// app/page.tsx
"use client";
import OrderRequestForm from "@/components/orderRequest/OrderRequestForm";
import { useWarehouseWithItems } from "@/hooks/useWarehouseWithItems";

export default function OrderRequestPage() {
  // 창고 및 아이템 관련 로직을 커스텀 훅으로 분리
  const { warehousesList, warehouseItems, handleWarehouseChange } =
    useWarehouseWithItems();

  return (
    <OrderRequestForm
      isPackageOrder={false}
      title="개별품목 출고 요청"
      warehousesList={warehousesList}
      warehouseItems={warehouseItems}
      onWarehouseChange={handleWarehouseChange}
    />
  );
}
