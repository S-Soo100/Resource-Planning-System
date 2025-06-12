import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { navigateByAuthStatus } from "@/utils/navigation";

interface StockTableEmptyProps {
  message?: string;
  subMessage?: string;
}

export default function StockTableEmpty({
  message = "창고를 선택해주세요",
  subMessage = "위의 창고 목록에서 창고를 선택하면 해당 창고의 재고가 표시됩니다.",
}: StockTableEmptyProps) {
  const router = useRouter();

  return (
    <div className="text-center py-10 text-gray-500">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium">{message}</h3>
      <p className="mt-1 text-sm">{subMessage}</p>
      <div className="mt-4 flex justify-center">
        <Button
          variant="default"
          onClick={() => navigateByAuthStatus(router)}
          icon={<ArrowLeft className="w-4 h-4" />}
          iconPosition="left"
        >
          뒤로가기
        </Button>
      </div>
    </div>
  );
}
