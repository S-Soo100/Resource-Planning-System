"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DemonstrationRequestForm from "@/components/demonstration/DemonstrationRequestForm";

export default function DemonstrationPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 mb-6">
            해당 페이지는 로그인한 사용자만 접근할 수 있습니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/")}
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
    <div className="container mx-auto py-6 max-w-4xl">
      <DemonstrationRequestForm />
    </div>
  );
}
