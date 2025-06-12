"use client";
import StockTable from "@/components/stock/StockTable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { navigateByAuthStatus } from "@/utils/navigation";

export default function StockPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            로그인이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">
            해당 페이지는 로그인한 사용자만 접근할 수 있습니다.
          </p>
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

  return (
    <div className="container px-2 mx-auto sm:px-4">
      <StockTable />
    </div>
  );
}
