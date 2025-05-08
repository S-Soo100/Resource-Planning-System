// app/page.tsx
"use client";
import OrderRequestForm from "@/components/orderRequest/OrderRequestForm";
// import { sendOrderRequest } from "@/utils/orderRequest"; // 임시

export default function OrderRequestPage() {
  return <OrderRequestForm isPackageOrder={false} title="개별품목 출고 요청" />;
}
