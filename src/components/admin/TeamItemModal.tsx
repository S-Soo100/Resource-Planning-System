"use client";
import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
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
  category?: Category;
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
}

export default function TeamItemModal({
  isOpen,
  onClose,
  teamId,
  categories,
  editItem,
}: TeamItemModalProps) {
  const [formData, setFormData] = useState<TeamItemFormData>({
    itemCode: "",
    itemName: "",
    memo: "",
    categoryId: null,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 이미지 관련 상태
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { useCreateTeamItem, useUpdateTeamItem, useUploadImage, useDeleteImage } = useTeamItems();
  const { createTeamItemAsync, isPending: createLoading } = useCreateTeamItem();
  const { updateTeamItem, isPending: updateLoading } = useUpdateTeamItem();
  const { uploadImageAsync, isPending: uploadLoading } = useUploadImage();
  const { deleteImageAsync, isPending: deleteLoading } = useDeleteImage();
  const toast = useToast();

  const isEditMode = !!editItem;
  const submitLoading = createLoading || updateLoading || uploadLoading || deleteLoading;

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
        });
        // 기존 이미지 미리보기
        setImagePreview(editItem.imageUrl || null);
        setSelectedImage(null);
      } else {
        // 추가 모드 - 첫 번째 카테고리가 있으면 선택
        const defaultCategoryId =
          categories.length > 0 ? categories[0].id : null;
        setFormData({
          itemCode: "",
          itemName: "",
          memo: "",
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

  // 이미지 파일 검증
  const validateImageFile = (file: File): string | null => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

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
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
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
        ...formData,
        teamId: teamId,
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
    } catch (error) {
      console.error(
        isEditMode ? "아이템 수정 오류:" : "아이템 생성 오류:",
        error
      );
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
      title={isEditMode ? "팀 아이템 수정" : "새 팀 아이템 추가"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
                  onClick={selectedImage ? handleRemoveSelectedImage : handleDeleteExistingImage}
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
                {imagePreview ? <ImageIcon size={18} /> : <Upload size={18} />}
                {imagePreview ? "이미지 변경" : "이미지 선택"}
              </label>
              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG, GIF, WebP (최대 5MB)
              </p>
            </div>
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
