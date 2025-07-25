import React, { useState } from "react";
import { useCategory } from "@/hooks/useCategory";
import { CreateCategoryDto, UpdateCategoryDto } from "@/types/(item)/category";
import { authStore } from "@/store/authStore";
import { Button, Input } from "@/components/ui";

interface CategoryExampleProps {
  teamId?: number;
}

export const CategoryExample: React.FC<CategoryExampleProps> = ({ teamId }) => {
  // 선택된 팀 정보 가져오기
  const selectedTeam = authStore((state) => state.selectedTeam);
  const effectiveTeamId = teamId || selectedTeam?.id;

  const {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesSorted,
  } = useCategory(effectiveTeamId);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // 카테고리 생성 핸들러
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !effectiveTeamId) return;

    const newCategory: CreateCategoryDto = {
      name: newCategoryName,
      priority: categories.length + 1,
      teamId: effectiveTeamId,
    };

    await createCategory(newCategory);
    setNewCategoryName("");
  };

  // 카테고리 수정 모드 설정
  const handleSetEditMode = (id: number, name: string) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
  };

  // 카테고리 수정 핸들러
  const handleUpdateCategory = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !effectiveTeamId) return;

    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    const updatedCategory: UpdateCategoryDto = {
      id: category.id,
      name: editCategoryName,
      priority: category.priority,
      teamId: effectiveTeamId,
    };

    await updateCategory(updatedCategory);
    setEditCategoryId(null);
    setEditCategoryName("");
  };

  // 카테고리 삭제 핸들러
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm("정말로 이 카테고리를 삭제하시겠습니까?")) {
      await deleteCategory(id);
    }
  };

  // 팀 ID가 없는 경우
  if (!effectiveTeamId) {
    return <div className="p-4 text-yellow-500">팀을 먼저 선택해주세요.</div>;
  }

  // 로딩 중 표시
  if (isLoading) {
    return <div className="p-4">카테고리 데이터를 불러오는 중...</div>;
  }

  // 에러 표시
  if (error) {
    return <div className="p-4 text-red-500">오류: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">카테고리 관리</h2>

      {/* 카테고리 생성 폼 */}
      <form onSubmit={handleCreateCategory} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="새 카테고리 이름"
            className="flex-grow"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!newCategoryName.trim()}
          >
            추가
          </Button>
        </div>
      </form>

      {/* 카테고리 목록 */}
      <div className="space-y-2">
        {getCategoriesSorted().map((category) => (
          <div
            key={category.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            {editCategoryId === category.id ? (
              <form
                onSubmit={(e) => handleUpdateCategory(e, category.id)}
                className="flex gap-2 w-full"
              >
                <Input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="flex-grow"
                  autoFocus
                />
                <Button type="submit" variant="success" size="sm">
                  저장
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setEditCategoryId(null)}
                >
                  취소
                </Button>
              </form>
            ) : (
              <>
                <div>
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    우선순위: {category.priority}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleSetEditMode(category.id, category.name)
                    }
                  >
                    수정
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    삭제
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-gray-500 italic">
            카테고리가 없습니다. 새 카테고리를 추가해주세요.
          </p>
        )}
      </div>
    </div>
  );
};
