"use client";
import React, { useState, useEffect } from "react";
import { useSuppliers } from "@/hooks/useSupplier";
import {
  CreateSupplierRequest,
  Supplier,
  UpdateSupplierRequest,
} from "@/types/(order)/supplier";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Daum 주소 검색 모달 동적 임포트
const SearchAddressModal = dynamic(
  () => import("@/components/SearchAddressModal"),
  { ssr: false }
);

// iOS 스타일 버튼 컴포넌트
interface ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
  color?: "primary" | "secondary" | "danger" | "success" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  type = "button",
  disabled = false,
  children,
  color = "default",
  size = "md",
  className = "",
}) => {
  // iOS 스타일 색상 맵
  const colorClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    default: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  // iOS 스타일 크기 맵
  const sizeClasses = {
    sm: "py-1 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colorClasses[color]} 
        ${sizeClasses[size]} 
        rounded-full 
        font-medium 
        transition-all 
        duration-200 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        focus:ring-blue-300 
        transform 
        active:scale-[0.98]
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// 공급업체 추가/수정 모달 컴포넌트
interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSupplier: Supplier | null;
  onSubmit: (data: CreateSupplierRequest | UpdateSupplierRequest) => void;
  isProcessing: boolean;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  editingSupplier,
  onSubmit,
  isProcessing,
}) => {
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [baseAddress, setBaseAddress] = useState<string>("");
  const [detailAddress, setDetailAddress] = useState<string>("");

  // 현재 선택된 팀 ID 가져오기
  const currentTeamId =
    Number(authStore((state) => state.selectedTeam?.id)) || 1;

  const [formData, setFormData] = useState<
    CreateSupplierRequest | UpdateSupplierRequest
  >({
    supplierName: "",
    email: "",
    supplierAddress: "",
    supplierPhoneNumber: "",
    registrationNumber: "",
    memo: "",
    teamId: Number(currentTeamId),
  });

  // 주소 검색 완료 핸들러
  const handleAddressComplete = (data: Address) => {
    // 기본 주소 설정 (도로명 주소 우선, 없으면 지번 주소)
    const selectedAddress = data.roadAddress || data.jibunAddress;
    setBaseAddress(selectedAddress);

    // 주소 모달 닫기
    setShowAddressModal(false);

    // 전체 주소 업데이트 (상세 주소와 합치기)
    updateFullAddress(selectedAddress, detailAddress);
  };

  // 전체 주소 업데이트 함수
  const updateFullAddress = (base: string, detail: string) => {
    const fullAddress = detail ? `${base} ${detail}` : base;
    setFormData((prev) => ({ ...prev, supplierAddress: fullAddress }));
  };

  // 상세 주소 변경 핸들러
  const handleDetailAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const detail = e.target.value;
    setDetailAddress(detail);
    updateFullAddress(baseAddress, detail);
  };

  // 입력 필드 변경 처리
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 팀 ID 설정
    const submitData = {
      ...formData,
      teamId: Number(currentTeamId),
    };

    onSubmit(submitData);
  };

  // 초기화 효과
  useEffect(() => {
    if (isOpen) {
      if (editingSupplier) {
        // 수정 모드: 공급업체 데이터로 폼 초기화
        const address = editingSupplier.supplierAddress || "";
        setBaseAddress(address);
        setDetailAddress("");

        setFormData({
          supplierName: editingSupplier.supplierName,
          email: editingSupplier.email,
          supplierAddress: editingSupplier.supplierAddress,
          supplierPhoneNumber: editingSupplier.supplierPhoneNumber,
          registrationNumber: editingSupplier.registrationNumber,
          memo: editingSupplier.memo,
          teamId: Number(currentTeamId),
        });
      } else {
        // 추가 모드: 폼 초기화
        setFormData({
          supplierName: "",
          email: "",
          supplierAddress: "",
          supplierPhoneNumber: "",
          registrationNumber: "",
          memo: "",
          teamId: Number(currentTeamId),
        });
        setBaseAddress("");
        setDetailAddress("");
      }
    }
  }, [isOpen, editingSupplier, currentTeamId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4 transform transition-all animate-modal-slide-up">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingSupplier ? "공급업체 정보 수정" : "신규 공급업체 추가"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                업체명
              </label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-white"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-white"
                required
              />
            </div>

            {/* 주소 검색 */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                기본 주소
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={baseAddress}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-white"
                  readOnly
                  placeholder="주소 검색 버튼을 클릭하세요"
                />
                <Button
                  onClick={() => setShowAddressModal(true)}
                  color="primary"
                >
                  주소 검색
                </Button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                상세 주소
              </label>
              <input
                type="text"
                value={detailAddress}
                onChange={handleDetailAddressChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-white"
                placeholder="상세 주소를 입력하세요"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                type="text"
                name="supplierPhoneNumber"
                value={formData.supplierPhoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-white"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                사업자등록번호
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-white"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                메모
              </label>
              <textarea
                name="memo"
                value={formData.memo || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-white"
                rows={3}
              ></textarea>
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <Button onClick={onClose} color="default">
              취소
            </Button>
            <Button type="submit" color="primary" disabled={isProcessing}>
              {isProcessing ? "처리 중..." : "저장"}
            </Button>
          </div>
        </form>

        {/* 주소 검색 모달 */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl mx-4 transform transition-all animate-modal-slide-up">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    주소 검색
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <SearchAddressModal onCompletePost={handleAddressComplete} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SupplierManagePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();

  const [searchName, setSearchName] = useState<string>("");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);

  // useSupplier 훅에서 필요한 함수들 가져오기
  const {
    useGetSuppliers,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
  } = useSuppliers();

  // 공급업체 목록 조회
  const {
    suppliers: suppliersResponse,
    isLoading,
    refetch,
  } = useGetSuppliers(searchName);

  // API 응답 데이터 구조에 맞게 처리
  useEffect(() => {
    if (suppliersResponse) {
      // API 응답이 중첩된 구조로 올 경우 처리
      if (
        typeof suppliersResponse === "object" &&
        "data" in suppliersResponse
      ) {
        setSuppliersList(suppliersResponse.data as Supplier[]);
      } else {
        setSuppliersList(suppliersResponse as Supplier[]);
      }
    }
  }, [suppliersResponse]);

  // 공급업체 생성
  const { createSupplier, isPending: isCreating } = useCreateSupplier();

  // 공급업체 수정
  const { updateSupplier, isPending: isUpdating } = useUpdateSupplier();

  // 공급업체 삭제
  const { deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  // 신규 업체 추가 모달 열기
  const handleAddNewClick = () => {
    setEditingSupplier(null);
    setIsFormModalOpen(true);
  };

  // 수정 모달 열기
  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingSupplier(null);
  };

  // 폼 제출 처리 (추가 또는 수정)
  const handleFormSubmit = (
    data: CreateSupplierRequest | UpdateSupplierRequest
  ) => {
    if (!editingSupplier) {
      // 새 공급업체 추가
      createSupplier(data as CreateSupplierRequest);
    } else {
      // 기존 공급업체 수정
      updateSupplier({
        id: String(editingSupplier.id),
        data: data as UpdateSupplierRequest,
      });
    }

    // 모달 닫기
    setIsFormModalOpen(false);
    setEditingSupplier(null);
  };

  // 삭제 처리
  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 공급업체를 삭제하시겠습니까?")) {
      deleteSupplier(String(id));
    }
  };

  // 디버깅 용도
  useEffect(() => {
    if (suppliersResponse) {
      console.log("API 응답:", suppliersResponse);
    }
  }, [suppliersResponse]);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.accessLevel === "supplier") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            열람 권한이 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            해당 페이지에 접근할 수 있는 권한이 없습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-gray-900">공급업체 관리</h1>
      </div>

      {/* 검색 및 추가 버튼 */}
      <div className="bg-white rounded-2xl p-4 shadow-md mb-8 w-full">
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="공급업체 이름으로 검색"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none transition-colors bg-gray-50"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => refetch()}
              color="primary"
              className="whitespace-nowrap"
            >
              검색
            </Button>
            <Button
              onClick={handleAddNewClick}
              color="success"
              className="whitespace-nowrap"
            >
              신규 업체 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 공급업체 목록 */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden w-full">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : suppliersList && suppliersList.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    업체명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    이메일
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    주소
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    전화번호
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    사업자등록번호
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    메모
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliersList.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {supplier.supplierName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.supplierAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.supplierPhoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.memo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditClick(supplier)}
                          color="primary"
                          size="sm"
                        >
                          수정
                        </Button>
                        <Button
                          onClick={() => handleDelete(supplier.id)}
                          color="danger"
                          size="sm"
                          disabled={isDeleting}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            등록된 공급업체가 없습니다.
          </div>
        )}
      </div>

      {/* 공급업체 추가/수정 모달 */}
      <SupplierFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        editingSupplier={editingSupplier}
        onSubmit={handleFormSubmit}
        isProcessing={isCreating || isUpdating}
      />

      {/* iOS 스타일 애니메이션을 위한 스타일 */}
      <style jsx global>{`
        @keyframes modal-slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-modal-slide-up {
          animation: modal-slide-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
