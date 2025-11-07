"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTeamItems } from "@/hooks/useTeamItems";
import { authStore } from "@/store/authStore";
import { useCategory } from "@/hooks/useCategory";
import { Button } from "@/components/ui";
import CategoryManagementModal, {
  CategoryManagementModalRef,
} from "@/components/admin/CategoryManagementModal";
import TeamItemModal from "@/components/admin/TeamItemModal";
import { navigateByAuthStatus } from "@/utils/navigation";

interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  memo?: string;
  category?: {
    id: number;
    name: string;
    priority: number;
  };
}

export default function TeamItemsPage() {
  const { team } = useCurrentTeam();
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { useGetTeamItems, useDeleteTeamItem } = useTeamItems();
  const { data: teamItems = [], isLoading, error } = useGetTeamItems();
  const { deleteTeamItem, isPending: deleteLoading } = useDeleteTeamItem();

  // 모달 상태
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTeamItemModalOpen, setIsTeamItemModalOpen] = useState(false);
  const [editingTeamItem, setEditingTeamItem] = useState<TeamItem | undefined>(
    undefined
  );

  // 삭제 로딩 상태
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  // 필터링 상태
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | string | null
  >(null);

  // 뷰 모드 상태 (데스크톱: table, 모바일: card)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const selectedTeam = authStore((state) => state.selectedTeam);
  const categoryModalRef = useRef<CategoryManagementModalRef>(null);

  // 새로운 useCategory 훅 사용
  const {
    categories,
    isLoading: isCategoryLoading,
    getCategoriesSorted,
  } = useCategory(selectedTeam?.id);

  // 반응형 뷰 모드 감지
  useEffect(() => {
    const checkViewMode = () => {
      setViewMode(window.innerWidth < 768 ? "card" : "table");
    };

    checkViewMode();
    window.addEventListener("resize", checkViewMode);
    return () => window.removeEventListener("resize", checkViewMode);
  }, []);

  useEffect(() => {
    if (selectedTeam?.id && !isCategoryLoading) {
      getCategoriesSorted();
    }
  }, [selectedTeam?.id, isCategoryLoading, getCategoriesSorted]);

  useEffect(() => {
    if (team) {
      console.log("team.warehouses:", JSON.stringify(team.warehouses, null, 2));
    }
  }, [team]);

  // 카테고리 모달 열기 (추가 모드)
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  // 카테고리 수정 모달 열기
  const handleEditCategoryModal = (category: {
    id: number;
    name: string;
    priority: number;
  }) => {
    categoryModalRef.current?.openEditMode(category);
  };

  // 카테고리 모달 닫기
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // 카테고리 업데이트 후 콜백
  const handleCategoryUpdated = () => {
    getCategoriesSorted();
  };

  // 팀 아이템 모달 열기
  const handleOpenTeamItemModal = (item?: TeamItem) => {
    setEditingTeamItem(item);
    setIsTeamItemModalOpen(true);
  };

  // 팀 아이템 모달 닫기
  const handleCloseTeamItemModal = () => {
    setEditingTeamItem(undefined);
    setIsTeamItemModalOpen(false);
  };

  // 팀 아이템 삭제
  const handleDeleteItem = async (itemId: number) => {
    const item = teamItems.find((item) => item.id === itemId);
    const itemName = item?.itemName || "아이템";

    if (window.confirm(`정말 '${itemName}' 아이템을 삭제하시겠습니까?`)) {
      setDeletingItemId(itemId);

      try {
        await deleteTeamItem(itemId);
      } catch (error) {
        console.error("아이템 삭제 오류:", error);
      } finally {
        setDeletingItemId(null);
      }
    }
  };

  // 카테고리별 필터링된 팀 아이템
  const filteredTeamItems = selectedCategoryId
    ? selectedCategoryId === "none"
      ? teamItems.filter((item) => !item.category || item.category === null)
      : teamItems.filter(
          (item) =>
            item.category?.id === parseInt(selectedCategoryId.toString(), 10)
        )
    : teamItems;

  // 필터 초기화
  const handleClearFilter = () => {
    setSelectedCategoryId(null);
  };

  // 카테고리 필터 변경
  const handleCategoryFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setSelectedCategoryId(value === "all" ? null : value);
  };

  if (isLoading || isUserLoading || isCategoryLoading) {
    return (
      <div className="p-4 mx-auto max-w-[1800px]">
        <div className="animate-pulse">
          <div className="mb-6 w-1/3 h-8 bg-gray-300 rounded"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            로그인이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">
            이 페이지에 접근하려면 로그인해주세요.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/signin")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            로그인 페이지로
          </Button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            팀 선택이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">팀을 선택한 후 이용해주세요.</p>
          <Button
            variant="primary"
            onClick={() => router.push("/team-select")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            팀 선택 페이지로
          </Button>
        </div>
      </div>
    );
  }

  const isReadOnly = user.accessLevel === "moderator";

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 w-16 h-16 text-red-500" />
          <h2 className="mb-4 text-2xl font-bold text-gray-800">오류 발생</h2>
          <p className="mb-6 text-red-600">
            {error.message || "오류가 발생했습니다"}
          </p>
          <Button
            variant="outline"
            onClick={() => navigateByAuthStatus(router)}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            뒤로가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-[1800px]">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          팀 카테고리, 품목 관리
        </h1>
        {isReadOnly && (
          <div className="px-4 py-2 text-sm text-yellow-700 bg-yellow-50 rounded-md">
            1차 승인권자 권한으로는 조회만 가능합니다
          </div>
        )}
      </div>

      {/* 팀 카테고리 테이블 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">팀 카테고리</h2>
          {!isReadOnly && (
            <Button
              variant="success"
              onClick={handleOpenCategoryModal}
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              카테고리 추가
            </Button>
          )}
        </div>
        {categories.length > 0 ? (
          <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-20 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      순서
                    </th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      카테고리명
                    </th>
                    {!isReadOnly && (
                      <th className="px-4 py-3 w-20 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                        관리
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...categories]
                    .sort((a, b) => a.priority - b.priority)
                    .map((category) => (
                      <tr
                        key={category.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {category.priority}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {category.name}
                        </td>
                        {!isReadOnly && (
                          <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                            <div className="flex justify-center items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditCategoryModal(category)
                                }
                                icon={<Edit className="w-4 h-4" />}
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <Package className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <p className="text-gray-500">등록된 팀 카테고리가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 팀 아이템 섹션 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-700">팀 아이템 목록</h2>
        {!isReadOnly && (
          <Button
            variant="primary"
            onClick={() => handleOpenTeamItemModal()}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
          >
            아이템 추가
          </Button>
        )}
      </div>

      {/* 카테고리 필터 */}
      {teamItems.length > 0 && (
        <div className="flex flex-col gap-4 p-4 mb-4 bg-gray-50 rounded-lg sm:flex-row sm:items-center">
          <div className="flex gap-2 items-center">
            <label
              htmlFor="category-filter"
              className="text-sm font-medium text-gray-700"
            >
              카테고리 필터:
            </label>
            <select
              id="category-filter"
              value={selectedCategoryId || "all"}
              onChange={handleCategoryFilterChange}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체 카테고리</option>
              {categories
                .sort((a, b) => a.priority - b.priority)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              <option value="none">없음</option>
            </select>
          </div>

          {selectedCategoryId && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">
                {filteredTeamItems.length}개 아이템 표시 중
              </span>
              <Button variant="outline" size="sm" onClick={handleClearFilter}>
                필터 초기화
              </Button>
            </div>
          )}
        </div>
      )}

      {teamItems.length > 0 ? (
        <>
          {/* 데스크톱 테이블 뷰 */}
          <div className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-28 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      아이템 코드
                    </th>
                    <th className="px-4 py-3 w-40 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      아이템명
                    </th>
                    <th className="px-4 py-3 w-28 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      카테고리
                    </th>
                    <th className="px-4 py-3 w-52 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      메모
                    </th>
                    <th className="px-4 py-3 w-20 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTeamItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        {item.itemCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <div
                          className="truncate max-w-40"
                          title={item.itemName}
                        >
                          {item.itemName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {item.category?.name || "없음"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div
                          className="truncate max-w-52"
                          title={item.memo || ""}
                        >
                          {item.memo || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                        <div className="flex justify-center space-x-1">
                          {!isReadOnly && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenTeamItemModal(item)}
                                disabled={deleteLoading}
                                icon={<Edit className="w-4 h-4" />}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={
                                  deleteLoading || deletingItemId === item.id
                                }
                                loading={deletingItemId === item.id}
                                icon={
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                }
                              />
                            </>
                          )}
                          {isReadOnly && (
                            <span className="text-xs text-gray-400">
                              읽기 전용
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 필터링된 결과가 없을 때 */}
          {filteredTeamItems.length === 0 && selectedCategoryId && (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
              <Package className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <p className="mb-2 text-gray-500">
                {selectedCategoryId === "none"
                  ? "카테고리가 설정되지 않은 아이템이 없습니다."
                  : "선택한 카테고리에 해당하는 아이템이 없습니다."}
              </p>
              <p className="mb-4 text-sm text-gray-400">
                {selectedCategoryId === "none"
                  ? "다른 카테고리를 선택하거나 필터를 초기화해보세요."
                  : "다른 카테고리를 선택하거나 필터를 초기화해보세요."}
              </p>
              <Button variant="outline" size="sm" onClick={handleClearFilter}>
                필터 초기화
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <Package className="mx-auto mb-4 w-16 h-16 text-gray-400" />
          <p className="mb-2 text-gray-500">등록된 팀 아이템이 없습니다.</p>
          <p className="mb-6 text-sm text-gray-400">
            아이템을 추가하여 팀의 품목을 관리해보세요.
          </p>
          {!isReadOnly && (
            <Button
              variant="primary"
              onClick={() => handleOpenTeamItemModal()}
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              첫 아이템 추가하기
            </Button>
          )}
        </div>
      )}

      {/* 카테고리 관리 모달 */}
      <CategoryManagementModal
        ref={categoryModalRef}
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        teamId={
          selectedTeam?.id ? parseInt(selectedTeam.id.toString(), 10) : null
        }
        categories={categories}
        onCategoryUpdated={handleCategoryUpdated}
      />

      {/* 팀 아이템 관리 모달 */}
      <TeamItemModal
        isOpen={isTeamItemModalOpen}
        onClose={handleCloseTeamItemModal}
        teamId={
          selectedTeam?.id ? parseInt(selectedTeam.id.toString(), 10) : null
        }
        categories={categories}
        editItem={editingTeamItem}
      />
    </div>
  );
}
