"use client";
import WheelchairOrderForm from "@/components/orderWheelchair/WheelchairOrderForm";
import { DynamicTitle } from "@/components/common/DynamicTitle";

export default function OrderWheelchairPage() {
  return (
    <>
      <DynamicTitle
        title="휠체어 발주 - KARS"
        description="휠체어 전용 발주 시스템입니다."
      />
      <WheelchairOrderForm />
    </>
  );
}
