"use client";
import React, { useState, useEffect } from "react";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft, Edit, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTeamItems } from "@/hooks/useTeamItems";
import { CreateTeamItemDto } from "@/types/team-item";
import { authStore } from "@/store/authStore";

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
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const selectedTeam = authStore((state) => state.selectedTeam);

  useEffect(() => {
    if (team) {
      console.log("team.warehouses:", JSON.stringify(team.warehouses, null, 2));
    }
  }, [team]);

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
      });
    } else {
      // 추가 모드
      setIsEditMode(false);
      setCurrentEditItemId(null);
      setFormData({
        itemCode: "",
        itemName: "",
        memo: "",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEditItemId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      if (isEditMode && currentEditItemId) {
        // 수정 모드
        await updateTeamItem({ id: currentEditItemId, teamItemDto });
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

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            권한이 필요합니다
          </h2>
          <p className="text-gray-600 mb-6">
            해당 페이지는 관리자 또는 중재자만 접근할 수 있습니다.
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
          className="mt-6 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">팀 아이템 관리</h1>
        {!isReadOnly && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 font-medium"
          >
            <span className="mr-2 text-xl">+</span> 아이템 추가
          </button>
        )}
        {isReadOnly && (
          <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            중재자 권한으로는 조회만 가능합니다
          </div>
        )}
      </div>

      {teamItems.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    아이템 코드
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    아이템명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    팀 ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메모
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {item.itemCode || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.itemName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.teamId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.memo || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
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
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </>
                        )}
                        {isReadOnly && (
                          <span className="text-gray-400 text-xs">
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
        <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="mb-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
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
          <p className="text-gray-500 mb-6 text-lg">
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? "팀 아이템 수정" : "새 팀 아이템 추가"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                  className="block text-gray-700 text-sm font-bold mb-2"
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
                  className="block text-gray-700 text-sm font-bold mb-2"
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
                  className="block text-gray-700 text-sm font-bold mb-2"
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
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-start">
                  <AlertCircle
                    size={20}
                    className="mr-2 mt-0.5 flex-shrink-0"
                  />
                  <p>{submitError}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
