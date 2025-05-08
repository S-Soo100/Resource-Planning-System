"use client";
import OrderRequestForm from "@/components/orderRequest/OrderRequestForm";
import { useWarehouseWithItems } from "@/hooks/useWarehouseWithItems";

export default function PackageOrderPage() {
  // 창고 및 아이템 관련 로직을 커스텀 훅으로 분리
  const { warehousesList, warehouseItems, handleWarehouseChange } =
    useWarehouseWithItems();

  return (
    <OrderRequestForm
      isPackageOrder={true}
      title="패키지 출고 요청"
      warehousesList={warehousesList}
      warehouseItems={warehouseItems}
      onWarehouseChange={handleWarehouseChange}
    />
  );
}
