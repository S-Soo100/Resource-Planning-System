// app/page.tsx
"use client";
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import OrderRequestForm from "@/components/orderRequest/OrderRequestForm";
import { useWarehouseWithItems } from "@/hooks/useWarehouseWithItems";
import { DynamicTitle } from "@/components/common/DynamicTitle";

export default function OrderRequestPage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  // 창고 및 아이템 관련 로직을 커스텀 훅으로 분리
  const { warehousesList, warehouseItems, handleWarehouseChange } =
    useWarehouseWithItems();

  // 로딩 상태
  if (isUserLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 로그인 체크
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-600 mb-6">
              개별품목 발주 요청 페이지는 로그인 후 이용할 수 있습니다.
            </p>
            <button
              onClick={() => router.push('/menu')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

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
