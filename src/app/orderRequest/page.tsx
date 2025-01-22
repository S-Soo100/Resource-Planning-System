// app/page.tsx
"use client";
import OrderRequestForm from "../../components/orderRequest/OrderRequestForm";
// import { sendOrderRequest } from "@/utils/orderRequest"; // 임시

export default function OrderRequestPage() {
  const handleOrderRequest = async () => {};
  // const handleOrderRequest = async (formData) => {
  //   await sendOrderRequest(formData); // 임시 함수 호출
  // };

  return <OrderRequestForm onSubmit={handleOrderRequest} />;
}
