"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import { useCategory } from "@/hooks/useCategory";
import { useToast } from "@/hooks/useToast";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryPriorityDto,
} from "@/types/(item)/category";

interface Category {
  id: number;
  name: string;
  priority: number;
}

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number | null;
  categories: Category[];
  onCategoryUpdated: () => void;
}

interface CategoryFormData {
  name: string;
  priority: number;
}

export interface CategoryManagementModalRef {
  openEditMode: (category: Category) => void;
}

const CategoryManagementModal = React.forwardRef<
  CategoryManagementModalRef,
  CategoryManagementModalProps
>(({ isOpen, onClose, teamId, categories, onCategoryUpdated }, ref) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditCategoryId, setCurrentEditCategoryId] = useState<
    number | null
  >(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    priority: 0,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const { createCategory, updateCategory, updateCategoryPriority } =
    useCategory(teamId || undefined);
  const toast = useToast();

  // 초기 데이터 설정
  useEffect(() => {
    if (isOpen && !isEditMode) {
      // 추가 모드 - 다음 우선순위 자동 설정
      const nextPriority =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.priority)) + 1
          : 1;

      setFormData({
        name: "",
        priority: nextPriority,
      });
      setSubmitError(null);
    }
  }, [isOpen, isEditMode, categories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId) {
      setSubmitError("선택된 팀이 없습니다.");
      return;
    }

    if (!formData.name.trim()) {
      setSubmitError("카테고리 이름은 필수 입력값입니다.");
      return;
    }

    setSubmitError(null);
    setSubmitLoading(true);

    try {
      if (isEditMode && currentEditCategoryId) {
        // 수정 모드
        const currentCategory = categories.find(
          (c) => c.id === currentEditCategoryId
        );

        if (currentCategory) {
          // 이름이 변경된 경우
          if (currentCategory.name !== formData.name) {
            const categoryDto: UpdateCategoryDto = {
              id: currentEditCategoryId,
              name: formData.name,
              priority: currentCategory.priority,
              teamId: teamId,
            };
            await updateCategory(categoryDto);
          }

          // 우선순위가 변경된 경우
          if (currentCategory.priority !== formData.priority) {
            const priorityDto: UpdateCategoryPriorityDto = {
              id: currentEditCategoryId,
              priority: formData.priority,
              teamId: teamId,
            };
            await updateCategoryPriority(priorityDto);
          }

          onCategoryUpdated();
          toast.success(
            "카테고리 수정 완료",
            `'${formData.name}' 카테고리가 성공적으로 수정되었습니다.`
          );
          handleClose();
        } else {
          setSubmitError("카테고리를 찾을 수 없습니다.");
        }
      } else {
        // 추가 모드
        const categoryDto: CreateCategoryDto = {
          ...formData,
          teamId: teamId,
        };

        const result = await createCategory(categoryDto);

        if (result) {
          onCategoryUpdated();
          toast.success(
            "카테고리 추가 완료",
            `'${formData.name}' 카테고리가 성공적으로 추가되었습니다.`
          );
          handleClose();
        } else {
          setSubmitError("카테고리 생성에 실패했습니다.");
          toast.error(
            "카테고리 생성 실패",
            "카테고리 생성 중 오류가 발생했습니다."
          );
        }
      }
    } catch (error) {
      console.error(
        isEditMode ? "카테고리 수정 오류:" : "카테고리 생성 오류:",
        error
      );
      const errorMessage = isEditMode
        ? "카테고리 수정 중 오류가 발생했습니다."
        : "카테고리 생성 중 오류가 발생했습니다.";

      setSubmitError(errorMessage);
      toast.error(
        isEditMode ? "카테고리 수정 실패" : "카테고리 생성 실패",
        errorMessage
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    setIsEditMode(false);
    setCurrentEditCategoryId(null);
    onClose();
  };

  // 외부에서 수정 모드로 열기 위한 함수
  const openEditMode = (category: Category) => {
    setIsEditMode(true);
    setCurrentEditCategoryId(category.id);
    setFormData({
      name: category.name,
      priority: category.priority,
    });
    setSubmitError(null);
  };

  React.useImperativeHandle(ref, () => ({
    openEditMode,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "카테고리 수정" : "새 카테고리 추가"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="카테고리명"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="예: 전자제품"
            required
            error={
              submitError?.includes("카테고리 이름") ? submitError : undefined
            }
          />
        </div>

        <div>
          <Input
            label="우선순위"
            name="priority"
            type="number"
            value={formData.priority.toString()}
            onChange={handleInputChange}
            min="1"
            required
            helperText="낮은 숫자일수록 높은 우선순위입니다"
          />
        </div>

        {submitError && !submitError?.includes("카테고리 이름") && (
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
          <Button type="submit" variant="success" loading={submitLoading}>
            {isEditMode ? "수정" : "저장"}
          </Button>
        </div>
      </form>
    </Modal>
  );
});

CategoryManagementModal.displayName = "CategoryManagementModal";

export default CategoryManagementModal;
