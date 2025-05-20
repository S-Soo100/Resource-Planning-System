"use client";
import React, { useState, useEffect } from "react";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTeamItems } from "@/hooks/useTeamItems";
import { CreateTeamItemDto } from "@/types/(item)/team-item";
import { authStore } from "@/store/authStore";
import { useCategoryStore } from "@/store/categoryStore";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoryPriorityDto,
} from "@/types/(item)/category";

export default function TeamItemsPage() {
  const { team } = useCurrentTeam();
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const isDebugMode = process.env.NODE_ENV === "development";
  const {
    useGetTeamItems,
    useCreateTeamItem,
    useDeleteTeamItem,
    useUpdateTeamItem,
  } = useTeamItems();
  const { data: teamItems = [], isLoading, error } = useGetTeamItems();
  const { createTeamItem, isPending: submitLoading } = useCreateTeamItem();
  const { deleteTeamItem, isPending: deleteLoading } = useDeleteTeamItem();
  const { updateTeamItem, isPending: updateLoading } = useUpdateTeamItem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditItemId, setCurrentEditItemId] = useState<number | null>(
    null
  );
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<CreateTeamItemDto, "teamId">>({
    itemCode: "",
    itemName: "",
    memo: "",
    categoryId: null,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const selectedTeam = authStore((state) => state.selectedTeam);

  // 카테고리 스토어 접근
  const {
    categories,
    fetchCategories,
    isLoading: isCategoryLoading,
    createCategory,
    updateCategory,
    updateCategoryPriority,
    isInitialized,
  } = useCategoryStore();

  // 카테고리 추가 관련 상태
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<
    Omit<CreateCategoryDto, "teamId">
  >({
    name: "",
    priority: 0,
  });
  const [categorySubmitError, setCategorySubmitError] = useState<string | null>(
    null
  );
  const [categorySubmitLoading, setCategorySubmitLoading] = useState(false);

  // 카테고리 수정 관련 상태
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [currentEditCategoryId, setCurrentEditCategoryId] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (selectedTeam?.id && !isInitialized) {
      fetchCategories(selectedTeam.id);
    }
  }, [selectedTeam?.id, isInitialized, fetchCategories]);

  useEffect(() => {
    if (team) {
      console.log("team.warehouses:", JSON.stringify(team.warehouses, null, 2));
    }
  }, [team]);

  // 카테고리 모달 열기
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
    setCategorySubmitError(null);

    // 추가 모드
    setIsCategoryEditMode(false);
    setCurrentEditCategoryId(null);

    // 우선순위 자동 설정: 가장 낮은(숫자가 큰) 우선순위 + 1, 없으면 1
    const nextPriority =
      categories.length > 0
        ? Math.max(...categories.map((c) => c.priority)) + 1
        : 1;

    setCategoryFormData({
      name: "",
      priority: nextPriority,
    });
  };

  // 카테고리 수정 모달 열기
  const handleEditCategoryModal = (category: (typeof categories)[0]) => {
    setIsCategoryModalOpen(true);
    setCategorySubmitError(null);

    // 수정 모드
    setIsCategoryEditMode(true);
    setCurrentEditCategoryId(category.id);
    setCategoryFormData({
      name: category.name,
      priority: category.priority,
    });
  };

  // 카테고리 모달 닫기
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategorySubmitError(null);
    setIsCategoryEditMode(false);
    setCurrentEditCategoryId(null);
  };

  // 카테고리 입력 변경 처리
  const handleCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 카테고리 추가/수정 제출 처리
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeam?.id) {
      setCategorySubmitError("선택된 팀이 없습니다.");
      return;
    }

    if (!categoryFormData.name.trim()) {
      setCategorySubmitError("카테고리 이름은 필수 입력값입니다.");
      return;
    }

    setCategorySubmitError(null);
    setCategorySubmitLoading(true);

    try {
      const teamIdNumber = selectedTeam.id
        ? parseInt(selectedTeam.id.toString(), 10)
        : 0;

      if (isCategoryEditMode && currentEditCategoryId) {
        // 수정 모드
        const currentCategory = categories.find(
          (c) => c.id === currentEditCategoryId
        );

        if (currentCategory) {
          // 이름이 변경된 경우
          if (currentCategory.name !== categoryFormData.name) {
            const categoryDto: UpdateCategoryDto = {
              id: currentEditCategoryId,
              name: categoryFormData.name,
              priority: currentCategory.priority,
              teamId: teamIdNumber,
            };
            await updateCategory(categoryDto);
          }

          // 우선순위가 변경된 경우
          if (currentCategory.priority !== categoryFormData.priority) {
            const priorityDto: UpdateCategoryPriorityDto = {
              id: currentEditCategoryId,
              priority: categoryFormData.priority,
              teamId: teamIdNumber,
            };
            await updateCategoryPriority(priorityDto);
          }

          // 성공적으로 카테고리 수정 후 카테고리 목록 다시 불러오기
          await fetchCategories(teamIdNumber);
          handleCloseCategoryModal();
        } else {
          setCategorySubmitError("카테고리를 찾을 수 없습니다.");
        }
      } else {
        // 추가 모드
        const categoryDto: CreateCategoryDto = {
          ...categoryFormData,
          teamId: teamIdNumber,
        };

        const result = await createCategory(categoryDto);

        if (result) {
          // 성공적으로 카테고리 추가 후 카테고리 목록 다시 불러오기
          await fetchCategories(teamIdNumber);
          handleCloseCategoryModal();
        } else {
          setCategorySubmitError("카테고리 생성에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error(
        isCategoryEditMode ? "카테고리 수정 오류:" : "카테고리 생성 오류:",
        error
      );
      setCategorySubmitError(
        isCategoryEditMode
          ? "카테고리 수정 중 오류가 발생했습니다."
          : "카테고리 생성 중 오류가 발생했습니다."
      );
    } finally {
      setCategorySubmitLoading(false);
    }
  };

  const handleOpenModal = (item?: (typeof teamItems)[0]) => {
    setIsModalOpen(true);
    setSubmitError(null);

    if (item) {
      // 수정 모드
      setIsEditMode(true);
      setCurrentEditItemId(item.id);
      setFormData({
        itemCode: item.itemCode,
        itemName: item.itemName,
        memo: item.memo || "",
        categoryId: item.category?.id || null,
      });
      console.log("수정 모드 카테고리 ID:", item.category?.id);
    } else {
      // 추가 모드
      setIsEditMode(false);
      setCurrentEditItemId(null);

      // 카테고리가 있을 경우 첫 번째 카테고리의 ID 사용, 없으면 null
      const defaultCategoryId = categories.length > 0 ? categories[0].id : null;
      console.log("추가 모드 기본 카테고리 ID:", defaultCategoryId);
      console.log("사용 가능한 카테고리:", categories);

      setFormData({
        itemCode: "",
        itemName: "",
        memo: "",
        categoryId: defaultCategoryId,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEditItemId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // 카테고리 ID는 숫자로 변환하되, '0'인 경우 null로 설정
    if (name === "categoryId") {
      const numValue = parseInt(value, 10);
      console.log(
        `카테고리 ID 변경: ${value} -> ${numValue === 0 ? null : numValue}`
      );
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

    if (!selectedTeam?.id) {
      setSubmitError("선택된 팀이 없습니다.");
      return;
    }

    if (!formData.itemCode || !formData.itemName) {
      setSubmitError("품목 코드와 품목명은 필수 입력값입니다.");
      return;
    }

    setSubmitError(null);

    try {
      // 타입 에러 수정
      const teamIdNumber = selectedTeam.id
        ? parseInt(selectedTeam.id.toString(), 10)
        : 0;
      const teamItemDto: CreateTeamItemDto = {
        ...formData,
        teamId: teamIdNumber,
      };

      console.log("제출 데이터:", teamItemDto); // 디버깅용 로그 추가

      if (isEditMode && currentEditItemId) {
        // 수정 모드
        await updateTeamItem({ id: currentEditItemId, teamItemDto });
        console.log("아이템 수정 완료:", currentEditItemId, teamItemDto);
      } else {
        // 추가 모드
        await createTeamItem(teamItemDto);
      }
      handleCloseModal();
    } catch (error) {
      console.error(
        isEditMode ? "아이템 수정 오류:" : "아이템 생성 오류:",
        error
      );
      setSubmitError(
        isEditMode
          ? "아이템 수정 중 오류가 발생했습니다."
          : "아이템 생성 중 오류가 발생했습니다."
      );
    }
  };

  const handleDeleteItem = (itemId: number) => {
    setDeletingItemId(itemId);
    if (window.confirm("정말 이 아이템을 삭제하시겠습니까?")) {
      deleteTeamItem(itemId);
      setDeletingItemId(null);
    } else {
      setDeletingItemId(null);
    }
  };

  if (isUserLoading || isLoading || isCategoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 디버그 모드가 아닐 때만 관리자 권한 체크
  if (
    !isDebugMode &&
    (!user ||
      (user.accessLevel !== "admin" && user.accessLevel !== "moderator"))
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            권한이 필요합니다
          </h2>
          <p className="mb-6 text-gray-600">
            해당 페이지는 관리자 또는 중재자만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  // moderator인 경우 읽기 전용 모드 설정
  const isReadOnly = user?.accessLevel === "moderator";

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg font-medium">
          {error.message || "오류가 발생했습니다"}
        </p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 mt-6 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-4 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          팀 카테고리, 품목 관리
        </h1>
        {isReadOnly && (
          <div className="px-4 py-2 text-sm text-yellow-700 rounded-md bg-yellow-50">
            중재자 권한으로는 조회만 가능합니다
          </div>
        )}
      </div>

      {/* 팀 카테고리 테이블 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-700">팀 카테고리</h2>
          {!isReadOnly && (
            <button
              onClick={handleOpenCategoryModal}
              className="flex items-center px-4 py-2 font-medium text-white transition-all duration-200 bg-green-500 rounded-md shadow-sm hover:bg-green-600"
            >
              <span className="mr-1 text-lg">+</span> 카테고리 추가
            </button>
          )}
        </div>
        {categories.length > 0 ? (
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      순서
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      카테고리명
                    </th>
                    {!isReadOnly && (
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                        관리
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...categories]
                    .sort((a, b) => a.priority - b.priority)
                    .map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {category.priority}
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {category.name}
                        </td>
                        {!isReadOnly && (
                          <td className="px-6 py-3 text-sm text-center whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              <button
                                className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                                onClick={() =>
                                  handleEditCategoryModal(category)
                                }
                              >
                                <Edit size={18} />
                              </button>
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
          <div className="p-8 text-center border border-gray-200 rounded-lg shadow-sm bg-gray-50">
            <p className="text-gray-500">등록된 팀 카테고리가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-700">팀 아이템 목록</h2>
        {!isReadOnly && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 font-medium"
          >
            <span className="mr-2 text-xl">+</span> 아이템 추가
          </button>
        )}
      </div>
      {teamItems.length > 0 ? (
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    아이템 코드
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    아이템명
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    카테고리
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    메모
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {item.itemCode || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.itemName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.category?.name || "없음"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.memo || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                      <div className="flex justify-center space-x-2">
                        {!isReadOnly && (
                          <>
                            <button
                              className="text-blue-500 hover:text-blue-700 p-1.5 rounded-full hover:bg-blue-50 transition-colors flex items-center justify-center"
                              onClick={() => handleOpenModal(item)}
                              disabled={deleteLoading || updateLoading}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={
                                deleteLoading ||
                                updateLoading ||
                                deletingItemId === item.id
                              }
                            >
                              {deletingItemId === item.id ? (
                                <div className="w-4 h-4 border-2 border-red-500 rounded-full border-t-transparent animate-spin"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
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
      ) : (
        <div className="p-12 text-center border border-gray-200 rounded-lg shadow-sm bg-gray-50">
          <div className="mb-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8 0l-8 4m-8-4l8 4m0 8V9"
              />
            </svg>
          </div>
          <p className="mb-6 text-lg text-gray-500">
            등록된 팀 아이템이 없습니다.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium transition-colors"
          >
            아이템 추가하기
          </button>
        </div>
      )}

      {/* 카테고리 추가/수정 모달 */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {isCategoryEditMode ? "카테고리 수정" : "새 카테고리 추가"}
              </h2>
              <button
                onClick={handleCloseCategoryModal}
                className="text-gray-400 hover:text-gray-600"
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
            <form onSubmit={handleCategorySubmit}>
              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="name"
                >
                  카테고리명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={categoryFormData.name}
                  onChange={handleCategoryInputChange}
                  placeholder="예: 전자제품"
                  className="shadow-sm border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="priority"
                >
                  순서 <span className="text-red-500">*</span>
                </label>
                <input
                  id="priority"
                  name="priority"
                  type="number"
                  min="1"
                  value={categoryFormData.priority}
                  onChange={handleCategoryInputChange}
                  className="shadow-sm border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              {categorySubmitError && (
                <div className="flex items-start p-3 mb-4 text-red-700 border border-red-200 rounded-md bg-red-50">
                  <AlertCircle
                    size={20}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <p>{categorySubmitError}</p>
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-md transition-colors"
                  onClick={handleCloseCategoryModal}
                  disabled={categorySubmitLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-md flex items-center justify-center min-w-[80px] transition-colors"
                  disabled={categorySubmitLoading}
                >
                  {categorySubmitLoading ? (
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  ) : isCategoryEditMode ? (
                    "수정"
                  ) : (
                    "저장"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 아이템 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? "팀 아이템 수정" : "새 팀 아이템 추가"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
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
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="itemCode"
                >
                  품목 코드 <span className="text-red-500">*</span>
                </label>
                <input
                  id="itemCode"
                  name="itemCode"
                  type="text"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  placeholder="예: ITEM001"
                  className="shadow-sm border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="itemName"
                >
                  품목명 <span className="text-red-500">*</span>
                </label>
                <input
                  id="itemName"
                  name="itemName"
                  type="text"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  placeholder="예: 노트북"
                  className="shadow-sm border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="categoryId"
                >
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId || 0}
                  onChange={handleInputChange}
                  className="shadow-sm border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value={0}>없음</option>
                  {categories.length > 0
                    ? categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    : null}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="memo"
                >
                  메모
                </label>
                <textarea
                  id="memo"
                  name="memo"
                  value={formData.memo || ""}
                  onChange={handleInputChange}
                  placeholder="예: 신형 모델"
                  className="shadow-sm border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors h-24 resize-none"
                />
              </div>

              {submitError && (
                <div className="flex items-start p-3 mb-4 text-red-700 border border-red-200 rounded-md bg-red-50">
                  <AlertCircle
                    size={20}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <p>{submitError}</p>
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-5 py-2.5 rounded-md transition-colors"
                  onClick={handleCloseModal}
                  disabled={submitLoading || updateLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-md flex items-center justify-center min-w-[80px] transition-colors"
                  disabled={submitLoading || updateLoading}
                >
                  {submitLoading || updateLoading ? (
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  ) : isEditMode ? (
                    "수정"
                  ) : (
                    "저장"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
