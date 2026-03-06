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
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import {
  getCustomerTypeBadge,
  getRecipientBadge,
  getFieldVisibility,
} from "@/utils/customerFieldUtils";
import { CustomerType } from "@/types/supplier";
import { LoadingCentered } from "@/components/ui/Loading";

// Daum 주소 검색 모달 동적 임포트
const SearchAddressModal = dynamic(
  () => import("@/components/SearchAddressModal"),
  { ssr: false }
);

// 고객 추가/수정 모달 컴포넌트
interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSupplier: Supplier | null;
  onSubmit: (data: CreateSupplierRequest | UpdateSupplierRequest) => void;
  isProcessing: boolean;
}

const inputCls =
  "w-full px-4 py-2.5 bg-Back-Mid-20 border border-Outline-Variant rounded-xl text-sm font-normal text-Text-Highest-100 placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:ring-2 focus:ring-Primary-Main/20 focus:outline-none transition-all";

const labelCls = "block mb-1.5 text-sm font-medium text-Text-High-90";

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

  const currentTeamId =
    Number(authStore((state) => state.selectedTeam?.id)) || 1;

  const [formData, setFormData] = useState<
    CreateSupplierRequest | UpdateSupplierRequest
  >({
    supplierName: "",
    email: "",
    supplierAddress: "",
    supplierPhoneNumber: "",
    representativeName: "",
    registrationNumber: "",
    memo: "",
    teamId: Number(currentTeamId),
    customerType: null,
    isRecipient: false,
    depositorName: null,
    residentId: null,
    repurchaseCycleMonths: null,
  });

  const formVisibility = getFieldVisibility(
    formData.customerType,
    formData.isRecipient
  );

  const handleAddressComplete = (data: Address) => {
    const selectedAddress = data.roadAddress || data.jibunAddress;
    setBaseAddress(selectedAddress);
    setShowAddressModal(false);
    updateFullAddress(selectedAddress, detailAddress);
  };

  const updateFullAddress = (base: string, detail: string) => {
    const fullAddress = detail ? `${base} ${detail}` : base;
    setFormData((prev) => ({ ...prev, supplierAddress: fullAddress }));
  };

  const handleDetailAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const detail = e.target.value;
    setDetailAddress(detail);
    updateFullAddress(baseAddress, detail);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, teamId: Number(currentTeamId) });
  };

  useEffect(() => {
    if (isOpen) {
      if (editingSupplier) {
        const address = editingSupplier.supplierAddress || "";
        setBaseAddress(address);
        setDetailAddress("");
        setFormData({
          supplierName: editingSupplier.supplierName,
          email: editingSupplier.email,
          supplierAddress: editingSupplier.supplierAddress,
          supplierPhoneNumber: editingSupplier.supplierPhoneNumber,
          representativeName: editingSupplier.representativeName || "",
          registrationNumber: editingSupplier.registrationNumber,
          memo: editingSupplier.memo,
          teamId: Number(currentTeamId),
          customerType: editingSupplier.customerType ?? null,
          isRecipient: editingSupplier.isRecipient ?? false,
          depositorName: editingSupplier.depositorName ?? null,
          residentId: editingSupplier.residentId ?? null,
          repurchaseCycleMonths: editingSupplier.repurchaseCycleMonths ?? null,
        });
      } else {
        setFormData({
          supplierName: "",
          email: "",
          supplierAddress: "",
          supplierPhoneNumber: "",
          representativeName: "",
          registrationNumber: "",
          memo: "",
          teamId: Number(currentTeamId),
          customerType: null,
          isRecipient: false,
          depositorName: null,
          residentId: null,
          repurchaseCycleMonths: null,
        });
        setBaseAddress("");
        setDetailAddress("");
      }
    }
  }, [isOpen, editingSupplier, currentTeamId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl mx-4 animate-modal-slide-up">
        {/* 모달 헤더 */}
        <div className="px-6 py-5 border-b border-Outline-Variant flex items-center justify-between">
          <h2 className="text-xl font-medium text-Text-Highest-100">
            {editingSupplier ? "고객 정보 수정" : "신규 고객 추가"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-Text-Low-70 hover:text-Text-High-90 hover:bg-Back-Mid-20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls}>고객명</label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="고객명을 입력하세요"
                required
              />
            </div>
            <div>
              <label className={labelCls}>이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            {/* 기본 주소 */}
            <div className="md:col-span-2">
              <label className={labelCls}>기본 주소</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={baseAddress}
                  className={inputCls}
                  readOnly
                  placeholder="주소 검색 버튼을 클릭하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="h-10 px-4 bg-Primary-Main text-white rounded-full text-sm font-medium whitespace-nowrap hover:brightness-90 active:brightness-85 transition-all"
                >
                  주소 검색
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>상세 주소</label>
              <input
                type="text"
                value={detailAddress}
                onChange={handleDetailAddressChange}
                className={inputCls}
                placeholder="상세 주소를 입력하세요"
              />
            </div>

            <div>
              <label className={labelCls}>전화번호</label>
              <input
                type="text"
                name="supplierPhoneNumber"
                value={formData.supplierPhoneNumber}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="전화번호를 입력하세요"
                required
              />
            </div>
            <div>
              <label className={labelCls}>대표자 이름</label>
              <input
                type="text"
                name="representativeName"
                value={formData.representativeName || ""}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="대표자 이름을 입력하세요"
              />
            </div>
            <div>
              <label className={labelCls}>사업자등록번호</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="예: 123-45-67890"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>메모</label>
              <textarea
                name="memo"
                value={formData.memo || ""}
                onChange={handleInputChange}
                className={inputCls}
                rows={3}
                placeholder="추가 정보를 입력하세요"
              />
            </div>

            {/* 고객 유형 (버튼형 선택) */}
            <div className="md:col-span-2 pt-3 border-t border-Outline-Variant">
              <p className="text-sm font-medium text-Text-High-90 mb-2">
                고객 유형
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    type: "b2c" as const,
                    label: "B2C",
                    sub: "개인 고객",
                    active: "border-indigo-500 bg-indigo-50 text-indigo-700",
                  },
                  {
                    type: "b2b" as const,
                    label: "B2B",
                    sub: "기업 고객",
                    active: "border-emerald-500 bg-emerald-50 text-emerald-700",
                  },
                ].map(({ type, label, sub, active }) => {
                  const isSelected = formData.customerType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        const newType = isSelected ? null : type;
                        setFormData((prev) => ({
                          ...prev,
                          customerType: newType,
                          ...(newType === "b2b" && {
                            isRecipient: false,
                            residentId: null,
                            depositorName: null,
                            repurchaseCycleMonths: null,
                          }),
                          ...(newType === "b2c" &&
                            !prev.isRecipient && {
                              depositorName: null,
                              repurchaseCycleMonths: null,
                            }),
                        }));
                      }}
                      className={`flex flex-col items-center gap-0.5 py-3 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? active
                          : "border-Outline-Variant bg-Back-Low-10 text-Text-High-90 hover:border-gray-400"
                      }`}
                    >
                      <span className="text-base font-semibold">{label}</span>
                      <span className="text-xs opacity-70">{sub}</span>
                    </button>
                  );
                })}
              </div>
              {formData.customerType === "b2c" && (
                <label className="flex items-center gap-2 mt-2.5 px-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecipient ?? false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData((prev) => ({
                        ...prev,
                        isRecipient: checked,
                        ...(!checked && {
                          depositorName: null,
                          repurchaseCycleMonths: null,
                        }),
                      }));
                    }}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-Text-High-90">
                    수급자 (보조기기 지원 대상)
                  </span>
                </label>
              )}
            </div>

            {/* 주민등록번호 (B2C / 미설정) */}
            {formVisibility.showResidentId && (
              <div>
                <label className={labelCls}>주민등록번호</label>
                <input
                  type="text"
                  value={formData.residentId || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9-]/g, "");
                    setFormData((prev) => ({
                      ...prev,
                      residentId: value || null,
                    }));
                  }}
                  className={inputCls}
                  placeholder="000000-0000000"
                  maxLength={14}
                />
              </div>
            )}

            {/* 입금자명 (수급자 전용) */}
            {formVisibility.showDepositorName && (
              <div>
                <label className={labelCls}>입금자명</label>
                <input
                  type="text"
                  value={formData.depositorName || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      depositorName: e.target.value || null,
                    }))
                  }
                  className={inputCls}
                  placeholder="지자체 환급 시 입금자명"
                />
              </div>
            )}

            {/* 재구매 주기 (수급자 전용) */}
            {formVisibility.showRepurchaseCycle && (
              <div>
                <label className={labelCls}>재구매 주기 (개월)</label>
                <input
                  type="number"
                  value={formData.repurchaseCycleMonths ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      repurchaseCycleMonths: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                  className={inputCls}
                  placeholder="기본 3개월"
                  min={1}
                  max={120}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-Outline-Variant">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-6 bg-transparent text-Text-High-90 border border-Outline-Variant rounded-full text-sm font-medium hover:bg-Back-Mid-20 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="h-10 px-6 bg-Primary-Main text-white rounded-full text-sm font-medium hover:brightness-90 active:brightness-85 disabled:bg-Gray-Sub-Disabled-40 disabled:text-Text-Low-70 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>

        {/* 주소 검색 모달 */}
        {showAddressModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg mx-4 bg-white shadow-2xl rounded-3xl animate-modal-slide-up">
              <div className="px-6 py-5 border-b border-Outline-Variant flex items-center justify-between">
                <h3 className="text-base font-medium text-Text-Highest-100">
                  주소 검색
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="p-1.5 rounded-full text-Text-Low-70 hover:text-Text-High-90 hover:bg-Back-Mid-20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
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
  const [typeFilter, setTypeFilter] = useState<
    "all" | "b2c" | "b2b" | "recipient" | "none"
  >("all");

  const {
    useGetSuppliers,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
  } = useSuppliers();

  const {
    suppliers: suppliersResponse,
    isLoading,
    refetch,
  } = useGetSuppliers(searchName);

  useEffect(() => {
    if (suppliersResponse) {
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

  const { createSupplier, isPending: isCreating } = useCreateSupplier();
  const { updateSupplier, isPending: isUpdating } = useUpdateSupplier();
  const { deleteSupplier, isPending: isDeleting } = useDeleteSupplier();

  const handleAddNewClick = () => {
    setEditingSupplier(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingSupplier(null);
  };

  const handleFormSubmit = (
    data: CreateSupplierRequest | UpdateSupplierRequest
  ) => {
    if (!editingSupplier) {
      createSupplier(data as CreateSupplierRequest);
    } else {
      updateSupplier({
        id: String(editingSupplier.id),
        data: data as UpdateSupplierRequest,
      });
    }
    setIsFormModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 고객을 삭제하시겠습니까?")) {
      deleteSupplier(String(id));
    }
  };

  if (isUserLoading || isLoading) {
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-Back-Low-10">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-medium text-Text-Highest-100 mb-3">
            접근 권한이 필요합니다
          </h2>
          <p className="text-sm text-Text-Low-70 mb-6">
            고객 관리 페이지는 관리자 또는 1차 승인권자만 접근할 수 있습니다.
          </p>
          <Button
            variant="default"
            onClick={() => router.push("/menu")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-Back-Low-10 p-6">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal leading-10 text-Text-Highest-100">
          고객 관리
        </h1>
        <p className="mt-1 text-sm text-Text-Low-70">
          고객 정보를 등록하고 관리합니다
        </p>
      </div>

      {/* 검색 & 추가 */}
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant p-4 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-grow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-Text-Lowest-60"
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
            <input
              type="text"
              placeholder="고객 이름으로 검색"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && refetch()}
              className="w-full pl-9 pr-4 py-2.5 bg-Back-Mid-20 border border-Outline-Variant rounded-full text-sm text-Text-Highest-100 placeholder:text-Text-Lowest-60 focus:border-Primary-Main focus:ring-2 focus:ring-Primary-Main/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => refetch()}
              className="h-10 px-5 bg-transparent text-Primary-Main border border-Primary-Main rounded-full text-sm font-medium hover:bg-Primary-Container/30 transition-all"
            >
              검색
            </button>
            <button
              onClick={handleAddNewClick}
              className="h-10 px-5 bg-Primary-Main text-white rounded-full text-sm font-medium hover:brightness-90 active:brightness-85 transition-all"
            >
              + 고객 추가
            </button>
          </div>
        </div>
      </div>

      {/* 필터 */}
      {suppliersList.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {(
            [
              { key: "all", label: "전체", count: suppliersList.length },
              {
                key: "b2c",
                label: "B2C",
                count: suppliersList.filter((s) => s.customerType === "b2c")
                  .length,
              },
              {
                key: "b2b",
                label: "B2B",
                count: suppliersList.filter((s) => s.customerType === "b2b")
                  .length,
              },
              {
                key: "recipient",
                label: "수급자",
                count: suppliersList.filter((s) => s.isRecipient).length,
              },
              {
                key: "none",
                label: "미분류",
                count: suppliersList.filter((s) => !s.customerType).length,
              },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`h-8 px-3 rounded-full text-xs font-medium transition-all ${
                typeFilter === key
                  ? "bg-Primary-Main text-white"
                  : "bg-Back-Mid-20 text-Text-High-90 hover:bg-Back-Mid-20/80"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      )}

      {/* 고객 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-Outline-Variant overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <LoadingCentered size="lg" />
          </div>
        ) : suppliersList && suppliersList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-Back-Low-10 border-b border-Outline-Variant">
                  {[
                    "고객명",
                    "이메일",
                    "주소",
                    "전화번호",
                    "대표자",
                    "사업자등록번호",
                    "메모",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-3.5 text-left text-sm font-medium text-Text-High-90 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-Outline-Variant">
                {suppliersList
                  .filter((s) => {
                    if (typeFilter === "all") return true;
                    if (typeFilter === "b2c") return s.customerType === "b2c";
                    if (typeFilter === "b2b") return s.customerType === "b2b";
                    if (typeFilter === "recipient") return s.isRecipient;
                    if (typeFilter === "none") return !s.customerType;
                    return true;
                  })
                  .map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-Back-Low-10 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`/supplier/${supplier.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            {supplier.supplierName}
                          </a>
                          {(() => {
                            const typeBadge = getCustomerTypeBadge(
                              supplier.customerType
                            );
                            const recipientBadge = getRecipientBadge(
                              supplier.isRecipient
                            );
                            return (
                              <>
                                {typeBadge && (
                                  <span
                                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${typeBadge.color}`}
                                  >
                                    {typeBadge.text}
                                  </span>
                                )}
                                {recipientBadge && (
                                  <span
                                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${recipientBadge.color}`}
                                  >
                                    {recipientBadge.text}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                        {supplier.email || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-Text-High-90 max-w-[200px] truncate">
                        {supplier.supplierAddress || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                        {supplier.supplierPhoneNumber || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                        {supplier.representativeName || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-Text-High-90 whitespace-nowrap">
                        {supplier.registrationNumber || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-Text-Low-70 max-w-[160px] truncate">
                        {supplier.memo || "-"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditClick(supplier)}
                            className="h-8 px-3 bg-Primary-Container text-Primary-Main rounded-lg text-xs font-medium hover:bg-Primary-Container/70 transition-all"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id)}
                            disabled={isDeleting}
                            className="h-8 px-3 bg-Error-Container text-Error-Main rounded-lg text-xs font-medium hover:bg-Error-Container/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-base font-medium text-Text-High-90">
              등록된 고객이 없습니다
            </p>
            <p className="mt-1 text-sm text-Text-Low-70">
              오른쪽 상단의 버튼으로 고객을 추가해보세요
            </p>
          </div>
        )}
      </div>

      {/* 고객 추가/수정 모달 */}
      <SupplierFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        editingSupplier={editingSupplier}
        onSubmit={handleFormSubmit}
        isProcessing={isCreating || isUpdating}
      />

      <style jsx global>{`
        @keyframes modal-slide-up {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-modal-slide-up {
          animation: modal-slide-up 0.18s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
