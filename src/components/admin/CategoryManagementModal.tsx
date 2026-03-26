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
  Category,
} from "@/types/(item)/category";

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
  parentId: number | null;
}

export interface CategoryManagementModalRef {
  openEditMode: (category: Category) => void;
  openAddChildMode: (parentId: number) => void;
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
    parentId: null,
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
        parentId: null,
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

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      parentId: value === 0 ? null : value,
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
          name: formData.name,
          priority: formData.priority,
          teamId: teamId,
          ...(formData.parentId ? { parentId: formData.parentId } : {}),
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
      const errorMessage = isEditMode
        ? "카테고리 수정 중 오류가 발생했습니다."
        : "카테고리 생성 중 오류가 발생했습니다.";

      // 자식 존재 시 백엔드 400 에러 처리
      if (error instanceof Error && error.message) {
        setSubmitError(error.message);
        toast.error(
          isEditMode ? "카테고리 수정 실패" : "카테고리 생성 실패",
          error.message
        );
      } else {
        setSubmitError(errorMessage);
        toast.error(
          isEditMode ? "카테고리 수정 실패" : "카테고리 생성 실패",
          errorMessage
        );
      }
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
      parentId: category.parentId ?? null,
    });
    setSubmitError(null);
  };

  // 외부에서 자식 카테고리 추가 모드로 열기
  const openAddChildMode = (parentId: number) => {
    setIsEditMode(false);
    setCurrentEditCategoryId(null);

    const nextPriority =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.priority)) + 1
        : 1;

    setFormData({
      name: "",
      priority: nextPriority,
      parentId: parentId,
    });
    setSubmitError(null);
  };

  React.useImperativeHandle(ref, () => ({
    openEditMode,
    openAddChildMode,
  }));

  // 부모 카테고리 후보 목록 (최상위 카테고리만 + 편집 중인 카테고리 자신 제외)
  const parentCandidates = categories.filter((c) => {
    // 자식이 아닌 최상위 카테고리만
    if (c.parentId) return false;
    // 편집 모드에서 자기 자신 제외
    if (isEditMode && c.id === currentEditCategoryId) return false;
    return true;
  });

  const parentCategoryName = formData.parentId
    ? categories.find((c) => c.id === formData.parentId)?.name
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEditMode
          ? "카테고리 수정"
          : formData.parentId
            ? `자식 카테고리 추가 (${parentCategoryName ?? ""})`
            : "새 카테고리 추가"
      }
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

        {/* 수정 모드에서만 우선순위 표시 (추가 시 자동 계산) */}
        {isEditMode && (
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
        )}

        {/* 부모 카테고리 선택 (추가 모드에서만, 수정 모드에서는 부모 변경 지원 안 함) */}
        {!isEditMode && (
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              부모 카테고리
            </label>
            <select
              value={formData.parentId || 0}
              onChange={handleParentChange}
              className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>없음 (최상위 카테고리)</option>
              {parentCandidates.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              선택하면 해당 카테고리의 하위 카테고리로 생성됩니다.
            </p>
          </div>
        )}

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
