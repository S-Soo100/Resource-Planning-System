"use client";
import OrderRequestForm from "@/components/orderRequest/OrderRequestForm";

export default function PackageOrderPage() {
  return <OrderRequestForm isPackageOrder={true} title="패키지 출고 요청" />;
}
