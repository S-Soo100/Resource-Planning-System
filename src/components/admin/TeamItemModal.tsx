"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
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

  const { useCreateTeamItem, useUpdateTeamItem } = useTeamItems();
  const { createTeamItem, isPending: createLoading } = useCreateTeamItem();
  const { updateTeamItem, isPending: updateLoading } = useUpdateTeamItem();
  const toast = useToast();

  const isEditMode = !!editItem;
  const submitLoading = createLoading || updateLoading;

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

      if (isEditMode && editItem) {
        // 수정 모드
        await updateTeamItem({ id: editItem.id, teamItemDto });
        toast.success(
          "아이템 수정 완료",
          `'${formData.itemName}' 아이템이 성공적으로 수정되었습니다.`
        );
      } else {
        // 추가 모드
        await createTeamItem(teamItemDto);
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
