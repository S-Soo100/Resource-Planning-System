"use client";
import React, { useState, useEffect } from "react";
import { useSuppliers } from "@/hooks/useSupplier";
import {
  CreateSupplierRequest,
  Supplier,
  UpdateSupplierRequest,
} from "@/types/supplier";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { navigateByAuthStatus } from "@/utils/navigation";

// Daum 주소 검색 모달 동적 임포트
const SearchAddressModal = dynamic(
  () => import("@/components/SearchAddressModal"),
  { ssr: false }
);

// 거래처 추가/수정 모달 컴포넌트
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
        // 수정 모드: 거래처 데이터로 폼 초기화
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
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4 transform transition-all animate-modal-slide-up">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingSupplier ? "거래처 정보 수정" : "신규 거래처 추가"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 transition-colors hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                업체명
              </label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
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
                className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
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
                  className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
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
                className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
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
                className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
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
                className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
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
                className="w-full px-4 py-3 transition-colors bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none"
                rows={3}
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={onClose} variant="default">
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessing}
              loading={isProcessing}
            >
              저장
            </Button>
          </div>
        </form>

        {/* 주소 검색 모달 */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 transition-all transform bg-white shadow-2xl rounded-2xl animate-modal-slide-up">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    주소 검색
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="text-gray-500 transition-colors hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
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

  // 거래처 목록 조회
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

  // 거래처 생성
  const { createSupplier, isPending: isCreating } = useCreateSupplier();

  // 거래처 수정
  const { updateSupplier, isPending: isUpdating } = useUpdateSupplier();

  // 거래처 삭제
  const { deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  // 신규 거래처 추가 모달 열기
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
      // 새 거래처 추가
      createSupplier(data as CreateSupplierRequest);
    } else {
      // 기존 거래처 수정
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
    if (window.confirm("정말로 이 거래처를 삭제하시겠습니까?")) {
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
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">거래처 관리</h1>
      </div>

      {/* 검색 및 추가 버튼 */}
      <div className="w-full p-4 mb-8 bg-white shadow-md rounded-2xl">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="거래처 이름으로 검색"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:outline-none bg-gray-50"
            />
            <div className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
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

      {/* 거래처 목록 */}
      <div className="w-full overflow-hidden bg-white shadow-md rounded-2xl">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : suppliersList && suppliersList.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    업체명
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    이메일
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    주소
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    전화번호
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    사업자등록번호
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    메모
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                  >
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliersList.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {supplier.supplierName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {supplier.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {supplier.supplierAddress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {supplier.supplierPhoneNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {supplier.registrationNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {supplier.memo}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
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
            등록된 거래처가 없습니다.
          </div>
        )}
      </div>

      {/* 거래처 추가/수정 모달 */}
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
