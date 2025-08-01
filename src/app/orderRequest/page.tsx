// app/page.tsx
"use client";
import OrderRequestForm from "@/components/orderRequest/OrderRequestForm";
import { useWarehouseWithItems } from "@/hooks/useWarehouseWithItems";
import { DynamicTitle } from "@/components/common/DynamicTitle";

export default function OrderRequestPage() {
  // 창고 및 아이템 관련 로직을 커스텀 훅으로 분리
  const { warehousesList, warehouseItems, handleWarehouseChange } =
    useWarehouseWithItems();

  return (
    <>
      <DynamicTitle
        title="개별품목 발주 요청 - KARS"
        description="개별품목 발주 요청을 작성할 수 있습니다."
      />
      <OrderRequestForm
        isPackageOrder={false}
        title="개별품목 발주 요청"
        warehousesList={warehousesList}
        warehouseItems={warehouseItems}
        onWarehouseChange={handleWarehouseChange}
      />
    </>
  );
}
