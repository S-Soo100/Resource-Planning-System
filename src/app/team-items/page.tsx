"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  Package,
  ChevronDown,
  ChevronUp,
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
  costPrice?: number | null;
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

  // 라이트박스 상태
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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

  // 검색 상태
  const [searchQuery, setSearchQuery] = useState("");

  // 카테고리 접기/펼치기 상태
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
    deleteCategory,
  } = useCategory(selectedTeam?.id);

  // 원가 열람 권한 체크 (Admin과 Moderator만 가능)
  const canViewCost = useMemo(() => {
    if (!user) return false;
    return user.accessLevel === 'admin' || user.accessLevel === 'moderator';
  }, [user]);

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
    setIsCategoryModalOpen(true);
    categoryModalRef.current?.openEditMode(category);
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    const categoryName = category?.name || "카테고리";

    if (
      window.confirm(
        `정말 '${categoryName}' 카테고리를 삭제하시겠습니까?\n\n연결된 아이템이 있는 경우 삭제할 수 없습니다.`
      )
    ) {
      try {
        await deleteCategory(categoryId);
        // 삭제된 카테고리가 선택되어 있었다면 선택 초기화
        if (selectedCategoryId === categoryId) {
          setSelectedCategoryId(null);
        }
        alert(`'${categoryName}' 카테고리가 성공적으로 삭제되었습니다.`);
      } catch (error) {
        console.error("카테고리 삭제 오류:", error);
        alert("카테고리 삭제에 실패했습니다. 연결된 아이템이 있는지 확인해주세요.");
      }
    }
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

  // 카테고리별 필터링 + 검색 필터링된 팀 아이템
  const filteredTeamItems = teamItems
    .filter((item) => {
      // 카테고리 필터
      if (!selectedCategoryId) return true;
      if (selectedCategoryId === "none")
        return !item.category || item.category === null;
      return item.category?.id === parseInt(selectedCategoryId.toString(), 10);
    })
    .filter((item) => {
      // 검색 필터
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.itemName.toLowerCase().includes(query) ||
        item.itemCode.toLowerCase().includes(query) ||
        item.memo?.toLowerCase().includes(query)
      );
    });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredTeamItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredTeamItems.slice(startIndex, endIndex);

  // 카테고리별 아이템 개수 계산
  const getCategoryItemCount = (categoryId: number) => {
    return teamItems.filter((item) => item.category?.id === categoryId).length;
  };

  // 필터 초기화
  const handleClearFilter = () => {
    setSelectedCategoryId(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // 카테고리 카드 클릭 핸들러 (토글 기능)
  const handleCategoryCardClick = (categoryId: number | "none") => {
    // 이미 선택된 카테고리를 다시 클릭하면 선택 취소
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId);
    }
    setCurrentPage(1);
  };

  // 검색 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading || isUserLoading || isCategoryLoading) {
    return (
      <div className="p-4">
        <div className="mx-auto max-w-7xl animate-pulse">
          {/* 헤더 스켈레톤 */}
          <div className="mb-6 w-1/3 h-8 bg-Back-Mid-20 rounded-full"></div>

          {/* 카테고리 그리드 스켈레톤 */}
          <div className="mb-8">
            <div className="mb-4 w-32 h-6 bg-Back-Mid-20 rounded-full"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 h-24 bg-white rounded-xl shadow-sm"></div>
              ))}
            </div>
          </div>

          {/* 아이템 목록 스켈레톤 */}
          <div>
            <div className="mb-4 w-32 h-6 bg-Back-Mid-20 rounded-full"></div>
            <div className="p-4 mb-4 h-16 bg-white rounded-xl shadow-sm"></div>
            <div className="h-64 bg-white rounded-xl shadow-sm"></div>
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
    <div className="p-4 min-h-screen bg-Back-Low-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-Text-Highest-100">
            팀 카테고리, 품목 관리
          </h1>
          {isReadOnly && (
            <div className="px-4 py-2 text-sm text-Primary-Main bg-Primary-Container rounded-full">
              1차 승인권자 권한으로는 조회만 가능합니다
            </div>
          )}
        </div>

      {/* 팀 카테고리 카드 그리드 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-700">팀 카테고리</h2>
          <div className="flex gap-2">
            {selectedCategoryId && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setCurrentPage(1);
                }}
                size="md"
              >
                선택 초기화
              </Button>
            )}
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
        </div>
        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...categories]
                .sort((a, b) => a.priority - b.priority)
                .slice(0, isCategoryExpanded ? categories.length : 8)
                .map((category) => {
                  const itemCount = getCategoryItemCount(category.id);
                  const isSelected = selectedCategoryId === category.id;
                  return (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryCardClick(category.id)}
                      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? "bg-Primary-Container shadow-md ring-2 ring-Primary-Main/40"
                          : "bg-white shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {category.name}
                        </h3>
                        {!isReadOnly && (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategoryModal(category);
                              }}
                              className="p-1 text-Text-Low-70 transition-colors rounded-full hover:text-Primary-Main hover:bg-Primary-Container"
                              title="카테고리 수정"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              className="p-1 text-Text-Low-70 transition-colors rounded-full hover:text-Error-Main hover:bg-Error-Container"
                              title="카테고리 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          순서: {category.priority}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isSelected
                              ? "bg-Primary-Main text-white"
                              : "bg-Primary-Container text-Primary-Main"
                          }`}
                        >
                          {itemCount}개 품목
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            {categories.length > 8 && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                  icon={
                    isCategoryExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  }
                  iconPosition="right"
                >
                  {isCategoryExpanded
                    ? "카테고리 접기"
                    : `${categories.length - 8}개 더 보기`}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center bg-Primary-Container/40 rounded-xl shadow-sm">
            <Package className="mx-auto mb-4 w-12 h-12 text-Primary-Main" />
            <p className="text-Text-Low-70">등록된 팀 카테고리가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 팀 아이템 섹션 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
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
        <p className="text-sm text-gray-500">
          위 카테고리 카드를 클릭하면 해당 카테고리의 아이템만 조회할 수 있습니다.
        </p>
      </div>

      {/* 검색 및 필터 바 */}
      {teamItems.length > 0 && (
        <div className="p-4 mb-4 space-y-4 bg-white rounded-xl shadow-sm">
          {/* 검색 Input */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="품목 코드, 품목명, 메모로 검색..."
                className="w-full px-4 py-2 text-sm border border-Outline-Variant rounded-full focus:outline-none focus:ring-2 focus:ring-Primary-Main/20 focus:border-Primary-Main"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-700">
                {filteredTeamItems.length}개 아이템 표시 중
              </span>
              {(selectedCategoryId || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilter}
                >
                  전체 초기화
                </Button>
              )}
            </div>
          </div>

          {/* 선택된 필터 칩 */}
          {selectedCategoryId && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">
                필터:
              </span>
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 text-sm font-medium text-Primary-Main bg-Primary-Container rounded-full transition-colors hover:brightness-95"
              >
                {selectedCategoryId === "none"
                  ? "카테고리 없음"
                  : categories.find(
                      (c) =>
                        c.id === parseInt(selectedCategoryId.toString(), 10)
                    )?.name}{" "}
                ✕
              </button>
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
                    <th className="px-4 py-3 w-20 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                      이미지
                    </th>
                    <th className="px-4 py-3 w-28 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      아이템 코드
                    </th>
                    <th className="px-4 py-3 w-40 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      아이템명
                    </th>
                    <th className="px-4 py-3 w-28 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      카테고리
                    </th>
                    <th className="px-4 py-3 w-24 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                      원가
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
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="w-12 h-12 object-cover rounded-md border border-gray-200 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setLightboxUrl(item.imageUrl ?? null)}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mx-auto">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
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
                      <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                        {canViewCost ? (
                          item.costPrice !== null && item.costPrice !== undefined ? (
                            <span className="font-medium text-gray-900">
                              ₩{item.costPrice.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">미입력</span>
                          )
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
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

          {/* 페이지네이션 */}
          {filteredTeamItems.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // 현재 페이지 주변만 표시
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                            currentPage === page
                              ? "bg-Primary-Main text-white"
                              : "bg-white text-Text-Low-70 border border-Outline-Variant hover:bg-Primary-Container"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}

          {/* 필터링된 결과가 없을 때 */}
          {filteredTeamItems.length === 0 && (selectedCategoryId || searchQuery) && (
            <div className="p-8 text-center bg-Primary-Container/40 rounded-xl shadow-sm">
              <Package className="mx-auto mb-4 w-12 h-12 text-Primary-Main" />
              <p className="mb-2 text-gray-500">
                {searchQuery
                  ? `'${searchQuery}'에 대한 검색 결과가 없습니다.`
                  : selectedCategoryId === "none"
                  ? "카테고리가 설정되지 않은 아이템이 없습니다."
                  : "선택한 카테고리에 해당하는 아이템이 없습니다."}
              </p>
              <p className="mb-4 text-sm text-gray-400">
                {searchQuery
                  ? "다른 검색어를 입력하거나 필터를 초기화해보세요."
                  : "다른 카테고리를 선택하거나 필터를 초기화해보세요."}
              </p>
              <Button variant="outline" size="sm" onClick={handleClearFilter}>
                전체 초기화
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center bg-Primary-Container/40 rounded-xl shadow-sm">
          <Package className="mx-auto mb-4 w-16 h-16 text-Primary-Main" />
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

      {/* 이미지 라이트박스 */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[80] bg-black/75 flex items-center justify-center"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxUrl}
            alt="확대 이미지"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      </div>
    </div>
  );
}
