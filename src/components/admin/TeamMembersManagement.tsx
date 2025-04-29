import React, { useState, useEffect } from "react";
import { useTeamAdmin } from "@/hooks/admin/useTeamAdmin";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { IMappingUser } from "@/types/mappingUser";
import { CreateUserDto } from "@/types/(auth)/user";

interface NewUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userId: number;
}

const TeamMembersManagement: React.FC = () => {
  const { team } = useCurrentTeam();
  const teamId = team?.id;

  useEffect(() => {
    console.log("현재 팀 정보:", team);
  }, [team]);

  const {
    teamUsers,
    isLoading,
    error,
    addUser,
    isAddingUser,
    addUserWithCreation,
    isProcessingUser,
    removeUser,
    isRemovingUser,
  } = useTeamAdmin(teamId || 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    userId: 0,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 에러/성공 메시지 초기화
    setFormError(null);
    setFormSuccess(null);
    setDetailMessage(null);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = (): boolean => {
    if (isExistingUser) {
      // 기존 사용자 추가 모드
      if (!newUserForm.userId) {
        setFormError("사용자 ID를 입력해주세요.");
        return false;
      }
    } else {
      // 새 사용자 생성 모드
      if (!newUserForm.email.trim()) {
        setFormError("이메일을 입력해주세요.");
        return false;
      }

      if (!newUserForm.name.trim()) {
        setFormError("이름을 입력해주세요.");
        return false;
      }

      if (!newUserForm.password) {
        setFormError("비밀번호를 입력해주세요.");
        return false;
      }

      if (newUserForm.password !== newUserForm.confirmPassword) {
        setFormError("비밀번호가 일치하지 않습니다.");
        return false;
      }

      if (newUserForm.password.length < 6) {
        setFormError("비밀번호는 최소 6자 이상이어야 합니다.");
        return false;
      }
    }

    return true;
  };

  const handleAddUser = async () => {
    // 진행 전 상태 확인 메시지 표시
    setDetailMessage(
      `현재 팀 ID: ${teamId || "없음"}, 사용자 수: ${teamUsers.length}`
    );

    if (!validateForm()) return;

    if (isExistingUser) {
      // 기존 사용자 추가
      try {
        setDetailMessage(
          `기존 사용자(ID: ${newUserForm.userId})를 팀(${teamId})에 추가 시도 중...`
        );
        addUser(Number(newUserForm.userId));
        setFormSuccess("사용자가 팀에 추가되었습니다.");
      } catch (error) {
        if (error instanceof Error) {
          setFormError(`사용자 추가 실패: ${error.message}`);
        } else {
          setFormError("사용자 추가 중 오류가 발생했습니다.");
        }
        return;
      }
    } else {
      // 새 사용자 생성 및 팀에 추가
      const userData: CreateUserDto = {
        email: newUserForm.email,
        password: newUserForm.password,
        name: newUserForm.name,
        restrictedWhs: "",
        accessLevel: "user",
        isAdmin: false,
      };

      setDetailMessage("새 사용자 생성 및 팀 추가 시도 중...");
      const result = await addUserWithCreation(userData);

      if (!result.success) {
        setFormError(result.error || "사용자 추가에 실패했습니다.");
        setDetailMessage(JSON.stringify(result, null, 2));
        return;
      }

      setFormSuccess("새 사용자가 성공적으로 생성되고 팀에 추가되었습니다.");
      setDetailMessage(
        `추가된 사용자 ID: ${result.data?.id}, 이름: ${result.data?.name}`
      );
    }

    // 성공 시 폼 초기화
    setNewUserForm({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      userId: 0,
    });

    // 성공 시 3초 후 모달 닫기
    if (!formError) {
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
        setDetailMessage(null);
      }, 3000);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
    setFormSuccess(null);
    setDetailMessage(null);
    setIsExistingUser(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setNewUserForm({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      userId: 0,
    });
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">팀 멤버 관리</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          멤버 추가
        </button>
      </div>

      <div className="border-b pb-4 mb-4">
        <p className="text-gray-600">
          팀원 초대, 권한 관리 및 멤버 상태를 확인할 수 있습니다.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          현재 팀 ID: {teamId || "없음"}, 사용자 수: {teamUsers.length}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>오류가 발생했습니다: {error.message}</p>
        </div>
      ) : teamUsers.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-center text-gray-500">
            등록된 팀 멤버가 없습니다.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamUsers.map((user: IMappingUser, index: number) => (
                <tr
                  key={
                    user.userId ? `user-${user.userId}` : `user-index-${index}`
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.user?.name || "이름 없음"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.user?.email || "이메일 없음"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.userId || "ID 없음"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removeUser(user.userId)}
                      disabled={isRemovingUser || !user.userId}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 유저 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">새 멤버 추가</h3>

            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsExistingUser(false)}
                  className={`py-2 px-4 rounded-md ${
                    !isExistingUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  새 사용자 생성
                </button>
                <button
                  onClick={() => setIsExistingUser(true)}
                  className={`py-2 px-4 rounded-md ${
                    isExistingUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  기존 사용자 추가
                </button>
              </div>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 p-3 rounded text-red-500 text-sm">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 bg-green-50 p-3 rounded text-green-500 text-sm">
                {formSuccess}
              </div>
            )}

            {detailMessage && (
              <div className="mb-4 bg-gray-50 p-3 rounded text-gray-700 text-xs font-mono whitespace-pre-wrap">
                {detailMessage}
              </div>
            )}

            <div className="space-y-4">
              {isExistingUser ? (
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="userId"
                  >
                    사용자 ID
                  </label>
                  <input
                    id="userId"
                    name="userId"
                    type="text"
                    value={newUserForm.userId}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="추가할 사용자의 ID"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="email"
                    >
                      이메일
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={newUserForm.email}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="name"
                    >
                      이름
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={newUserForm.name}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="사용자 이름"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="password"
                    >
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={newUserForm.password}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="최소 6자 이상"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={toggleShowPassword}
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2"
                      htmlFor="confirmPassword"
                    >
                      비밀번호 확인
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={newUserForm.confirmPassword}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="비밀번호 확인"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={toggleShowConfirmPassword}
                      >
                        {showConfirmPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                취소
              </button>
              <button
                onClick={handleAddUser}
                disabled={isProcessingUser || isAddingUser}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingUser || isAddingUser ? "처리 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembersManagement;
