"use client";
import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import { CategoryTreeSelect } from "@/components/ui/CategoryTreeSelect";
import { useTeamItems } from "@/hooks/useTeamItems";
import { useToast } from "@/hooks/useToast";
import { CreateTeamItemDto } from "@/types/(item)/team-item";

interface Category {
  id: number;
  name: string;
  priority: number;
}

interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  memo?: string;
  imageUrl?: string | null;
  costPrice?: number | null;
  category?: Category;
  // 확장 필드 (v4.0)
  isNotifiedPrice?: boolean;
  notifiedPrice?: number | null;
  consumerPrice?: number | null;
  brand?: string | null;
  isHealthInsuranceRegistered?: boolean;
  isService?: boolean;
}

interface TeamItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number | null;
  categories: Category[];
  editItem?: TeamItem;
}

interface TeamItemFormData {
  itemCode: string;
  itemName: string;
  memo: string;
  categoryId: number | null;
  costPrice: string;
  // 가격 정보 확장 (v4.0)
  isNotifiedPrice: boolean;
  notifiedPrice: string;
  consumerPrice: string;
  // 추가 정보 (v4.0)
  brand: string;
  isHealthInsuranceRegistered: boolean;
  isService: boolean;
}

const INITIAL_FORM_DATA: TeamItemFormData = {
  itemCode: "",
  itemName: "",
  memo: "",
  categoryId: null,
  costPrice: "",
  isNotifiedPrice: false,
  notifiedPrice: "",
  consumerPrice: "",
  brand: "",
  isHealthInsuranceRegistered: false,
  isService: false,
};

export default function TeamItemModal({
  isOpen,
  onClose,
  teamId,
  categories,
  editItem,
}: TeamItemModalProps) {
  const [formData, setFormData] = useState<TeamItemFormData>(INITIAL_FORM_DATA);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 이미지 관련 상태
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    useCreateTeamItem,
    useUpdateTeamItem,
    useUploadImage,
    useDeleteImage,
  } = useTeamItems();
  const { createTeamItemAsync, isPending: createLoading } = useCreateTeamItem();
  const { updateTeamItem, isPending: updateLoading } = useUpdateTeamItem();
  const { uploadImageAsync, isPending: uploadLoading } = useUploadImage();
  const { deleteImageAsync, isPending: deleteLoading } = useDeleteImage();
  const toast = useToast();

  const isEditMode = !!editItem;
  const submitLoading =
    createLoading || updateLoading || uploadLoading || deleteLoading;

  // 초기 데이터 설정
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // 수정 모드
        setFormData({
          itemCode: editItem.itemCode,
          itemName: editItem.itemName,
          memo: editItem.memo || "",
          categoryId: editItem.category?.id || null,
          costPrice: editItem.costPrice?.toString() || "",
          isNotifiedPrice: editItem.isNotifiedPrice ?? false,
          notifiedPrice: editItem.notifiedPrice?.toString() || "",
          consumerPrice: editItem.consumerPrice?.toString() || "",
          brand: editItem.brand || "",
          isHealthInsuranceRegistered:
            editItem.isHealthInsuranceRegistered ?? false,
          isService: editItem.isService ?? false,
        });
        // 기존 이미지 미리보기
        setImagePreview(editItem.imageUrl || null);
        setSelectedImage(null);
      } else {
        // 추가 모드 - 첫 번째 카테고리가 있으면 선택
        const defaultCategoryId =
          categories.length > 0 ? categories[0].id : null;
        setFormData({
          ...INITIAL_FORM_DATA,
          categoryId: defaultCategoryId,
        });
        setImagePreview(null);
        setSelectedImage(null);
      }
      setSubmitError(null);
    }
  }, [isOpen, editItem, categories]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // 카테고리 ID는 숫자로 변환하되, '0'인 경우 null로 설정
    if (name === "categoryId") {
      const numValue = parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue === 0 ? null : numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (name: keyof TeamItemFormData) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
      // isNotifiedPrice 해제 시 notifiedPrice 초기화
      ...(name === "isNotifiedPrice" && prev.isNotifiedPrice
        ? { notifiedPrice: "" }
        : {}),
    }));
  };

  const handleCategoryChange = (value: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value ?? null,
    }));
  };

  // 이미지 파일 검증
  const validateImageFile = (file: File): string | null => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (file.size > MAX_SIZE) {
      return "파일 크기는 5MB 이하여야 합니다.";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "JPG, PNG, GIF, WebP 형식만 지원됩니다.";
    }

    return null;
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      toast.error("이미지 검증 실패", error);
      return;
    }

    setSelectedImage(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 제거 핸들러 (새로 선택한 이미지)
  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(editItem?.imageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 기존 이미지 삭제 핸들러 (서버에서 삭제)
  const handleDeleteExistingImage = async () => {
    if (!editItem?.id || !editItem.imageUrl) return;

    if (!window.confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      await deleteImageAsync(editItem.id);
      setImagePreview(null);
      setSelectedImage(null);
    } catch {
      // useDeleteImage 훅 내부에서 에러 처리됨
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId) {
      setSubmitError("선택된 팀이 없습니다.");
      return;
    }

    if (!formData.itemCode || !formData.itemName) {
      setSubmitError("품목 코드와 품목명은 필수 입력값입니다.");
      return;
    }

    setSubmitError(null);

    try {
      const teamItemDto: CreateTeamItemDto = {
        itemCode: formData.itemCode,
        itemName: formData.itemName,
        memo: formData.memo || undefined,
        teamId: teamId,
        categoryId: formData.categoryId,
        costPrice: formData.costPrice
          ? parseInt(formData.costPrice, 10)
          : undefined,
        // 가격 정보 확장
        isNotifiedPrice: formData.isNotifiedPrice,
        notifiedPrice: formData.notifiedPrice
          ? parseInt(formData.notifiedPrice, 10)
          : undefined,
        consumerPrice: formData.consumerPrice
          ? parseInt(formData.consumerPrice, 10)
          : undefined,
        // 추가 정보
        brand: formData.brand || undefined,
        isHealthInsuranceRegistered: formData.isHealthInsuranceRegistered,
        isService: formData.isService,
      };

      let itemId: number;

      if (isEditMode && editItem) {
        // 수정 모드
        await updateTeamItem({ id: editItem.id, teamItemDto });
        itemId = editItem.id;

        // 새 이미지가 선택된 경우 업로드
        if (selectedImage) {
          await uploadImageAsync({ id: itemId, file: selectedImage });
        }

        toast.success(
          "아이템 수정 완료",
          `'${formData.itemName}' 아이템이 성공적으로 수정되었습니다.`
        );
      } else {
        // 추가 모드
        const response = await createTeamItemAsync(teamItemDto);

        // 생성된 아이템의 ID를 가져와서 이미지 업로드
        if (response.success && response.data && selectedImage) {
          itemId = response.data.id;
          await uploadImageAsync({ id: itemId, file: selectedImage });
        }

        toast.success(
          "아이템 추가 완료",
          `'${formData.itemName}' 아이템이 성공적으로 추가되었습니다.`
        );
      }

      handleClose();
    } catch {
      const errorMessage = isEditMode
        ? "아이템 수정 중 오류가 발생했습니다."
        : "아이템 생성 중 오류가 발생했습니다.";

      setSubmitError(errorMessage);
      toast.error(
        isEditMode ? "아이템 수정 실패" : "아이템 생성 실패",
        errorMessage
      );
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "팀 품목 수정" : "새 팀 품목 추가"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── 서비스 품목 체크박스 (맨 위) ── */}
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isService}
              onChange={() => handleCheckboxChange("isService")}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
          <span className="text-sm font-medium text-gray-700">서비스 품목</span>
          {formData.isService && (
            <span className="text-xs text-green-600">
              가격 정보, 고시가격, 건보 등록 필드가 숨겨집니다.
            </span>
          )}
        </div>

        {/* ── 기본 정보 섹션 ── */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
            기본 정보
          </h3>
          <div className="space-y-4">
            <div>
              <Input
                label="품목 코드"
                name="itemCode"
                type="text"
                value={formData.itemCode}
                onChange={handleInputChange}
                placeholder="예: ITEM001"
                required
              />
            </div>

            <div>
              <Input
                label="품목명"
                name="itemName"
                type="text"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="예: 노트북"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                카테고리 <span className="text-red-500">*</span>
              </label>
              {teamId ? (
                <CategoryTreeSelect
                  mode="assign"
                  value={formData.categoryId ?? undefined}
                  onChange={handleCategoryChange}
                  teamId={teamId}
                  placeholder="카테고리 선택"
                />
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId || 0}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={0}>없음</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                메모
              </label>
              <textarea
                name="memo"
                value={formData.memo || ""}
                onChange={handleInputChange}
                placeholder="예: 신형 모델"
                className="w-full h-24 px-3 py-2 transition-colors border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 이미지 업로드 섹션 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                품목 이미지
              </label>
              <div className="space-y-3">
                {/* 이미지 미리보기 */}
                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={
                        selectedImage
                          ? handleRemoveSelectedImage
                          : handleDeleteExistingImage
                      }
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title={selectedImage ? "선택 취소" : "이미지 삭제"}
                      disabled={deleteLoading}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* 파일 선택 버튼 */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="team-item-image"
                  />
                  <label
                    htmlFor="team-item-image"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {imagePreview ? (
                      <ImageIcon size={18} />
                    ) : (
                      <Upload size={18} />
                    )}
                    {imagePreview ? "이미지 변경" : "이미지 선택"}
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    JPG, PNG, GIF, WebP (최대 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 가격 정보 섹션 (서비스 품목이 아닐 때만 표시) ── */}
        {!formData.isService && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
              가격 정보
            </h3>
            <div className="space-y-4">
              <div>
                <Input
                  label="원가 (원)"
                  name="costPrice"
                  type="number"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  placeholder="예: 50000"
                  min="0"
                  step="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  선택 사항입니다. 입력하지 않으면 저장되지 않습니다.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNotifiedPrice}
                    onChange={() => handleCheckboxChange("isNotifiedPrice")}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  고시가격 여부
                </span>
              </div>

              {formData.isNotifiedPrice && (
                <div>
                  <Input
                    label="고시가격 (원)"
                    name="notifiedPrice"
                    type="number"
                    value={formData.notifiedPrice}
                    onChange={handleInputChange}
                    placeholder="건강보험 공시 금액"
                    min="0"
                    step="1"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    건보 공시 금액을 그대로 입력해주세요.
                  </p>
                </div>
              )}

              <div>
                <Input
                  label="소비자가격 (원)"
                  name="consumerPrice"
                  type="number"
                  value={formData.consumerPrice}
                  onChange={handleInputChange}
                  placeholder="VAT 포함 소비자가격"
                  min="0"
                  step="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  부가세 여부와 상관없이 소비자 가격을 그대로 입력해주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 추가 정보 섹션 ── */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2">
            추가 정보
          </h3>
          <div className="space-y-4">
            <div>
              <Input
                label="브랜드"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="예: 오토복"
              />
            </div>

            {/* 건강보험 등록 품목 (서비스 품목이 아닐 때만 표시) */}
            {!formData.isService && (
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHealthInsuranceRegistered}
                    onChange={() =>
                      handleCheckboxChange("isHealthInsuranceRegistered")
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  건강보험 등록 품목
                </span>
              </div>
            )}
          </div>
        </div>

        {submitError && (
          <div className="flex items-start p-3 text-red-700 border border-red-200 rounded-md bg-red-50">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        <div className="flex justify-end pt-4 space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitLoading}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" loading={submitLoading}>
            {isEditMode ? "수정" : "저장"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
