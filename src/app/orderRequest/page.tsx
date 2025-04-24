// app/page.tsx
"use client";
import OrderRequestFormComponent from "../../components/orderRequest/OrderRequestFormComponent";
// import { sendOrderRequest } from "@/utils/orderRequest"; // 임시

export default function OrderRequestPage() {
  return (
    <section className="m-2 p-1">
      <OrderRequestFormComponent />
    </section>
  );
}
