"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/user-api";
import { usePermission } from "@/hooks/usePermission";
import { authStore } from "@/store/authStore";
import { LoadingCentered } from "@/components/ui/Loading";
import CustomerInfoCard from "@/components/customer/CustomerInfoCard";
import CustomerInfoEditModal from "@/components/customer/CustomerInfoEditModal";
import CustomerOrderHistory from "@/components/customer/CustomerOrderHistory";
import CustomerDocumentSection from "@/components/orderRecord/CustomerDocumentSection";
import { ArrowLeft, FileText, ClipboardList } from "lucide-react";
import { IUser } from "@/types/(auth)/user";
import { Button } from "@/components/ui";

type TabType = "documents" | "orders";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const authUser = authStore((state) => state.user);
  const hasHydrated = authStore((state) => state._hasHydrated);
  const { isAdminOrModerator } = usePermission();

  const [activeTab, setActiveTab] = useState<TabType>("documents");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: customer,
    isLoading: isCustomerLoading,
    error: customerError,
  } = useQuery<IUser>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await userApi.getUser(userId.toString());
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error("고객 정보를 불러올 수 없습니다");
    },
    enabled: !!userId && hasHydrated,
  });

  const isLoading = !hasHydrated || isCustomerLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center">
          <LoadingCentered />
          <p className="mt-4 text-sm text-Text-Low-70">
            데이터를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-medium text-Text-Highest-100 mb-3">
            로그인이 필요합니다
          </h2>
          <p className="text-sm text-Text-Low-70 mb-6">
            고객 상세 페이지는 로그인 후 이용 가능합니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/login")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium text-Text-Highest-100 mb-3">
            고객 정보를 찾을 수 없습니다
          </h2>
          <p className="text-sm text-Text-Low-70 mb-6">
            존재하지 않거나 삭제된 고객입니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/customers")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            고객 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-Back-Low-10 p-4 md:p-6">
      {/* 뒤로가기 */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-Text-High-90 hover:text-Text-Highest-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </button>
      </div>

      {/* 고객 기본 정보 카드 */}
      <div className="mb-6">
        <CustomerInfoCard
          user={customer}
          onEdit={() => setIsEditOpen(true)}
          canEdit={isAdminOrModerator}
        />
      </div>

      {/* 탭 UI */}
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-Outline-Variant bg-Back-Low-10">
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === "documents"
                ? "text-blue-600 bg-white"
                : "text-Text-High-90 hover:text-Text-Highest-100 hover:bg-Back-Mid-20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              고객 서류
            </div>
            {activeTab === "documents" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
              activeTab === "orders"
                ? "text-blue-600 bg-white"
                : "text-Text-High-90 hover:text-Text-Highest-100 hover:bg-Back-Mid-20"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ClipboardList className="w-4 h-4" />
              발주 이력
            </div>
            {activeTab === "orders" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* 탭 본문 */}
        <div className="p-6">
          {activeTab === "documents" ? (
            <CustomerDocumentSection userId={userId} />
          ) : (
            <CustomerOrderHistory userId={userId} />
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      <CustomerInfoEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={customer}
      />
    </div>
  );
}
