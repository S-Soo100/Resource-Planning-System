import React, { useState, useEffect } from "react";
import { useTeamAdmin } from "@/hooks/admin/useTeamAdmin";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { IMappingUser } from "@/types/mappingUser";
import { CreateUserDto } from "@/types/(auth)/user";
import { Button, Input, Modal } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

interface NewUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userId: number;
  accessLevel: "user" | "supplier" | "moderator";
}

export default function TeamMembers({
  isReadOnly = false,
}: {
  isReadOnly?: boolean;
}) {
  const { team } = useCurrentTeam();
  const teamId = team?.id;

  useEffect(() => {
    if (team) {
      console.log("팀 정보:", {
        id: team.id,
        userCount: team.teamUserMap?.length || 0,
      });
    }
  }, [team]);

  const {
    teamUsers,
    isLoading,
    error,
    addUser,
    isAddingUser,
    createUser,
    isCreatingUser,
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
    accessLevel: "user",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);

  useEffect(() => {
    if (
      formSuccess === "새 사용자가 성공적으로 생성되고 팀에 추가되었습니다."
    ) {
      alert("새 사용자가 성공적으로 생성되고 팀에 추가되었습니다.");
      setIsModalOpen(false);
      setFormSuccess(null);
      setDetailMessage(null);
    }
  }, [formSuccess]);

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
        accessLevel: newUserForm.accessLevel,
        isAdmin: false,
      };

      setDetailMessage("새 사용자 생성 및 팀 추가 시도 중...");
      try {
        await createUser(userData);
        setFormSuccess("새 사용자가 성공적으로 생성되고 팀에 추가되었습니다.");
        setDetailMessage(`추가된 사용자 이름: ${userData.name}`);
      } catch (error) {
        if (error instanceof Error) {
          setFormError(error.message);
        } else {
          setFormError("사용자 생성 중 오류가 발생했습니다.");
        }
        return;
      }
    }

    // 성공 시 폼 초기화
    setNewUserForm({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      userId: 0,
      accessLevel: "user",
    });

    // 성공 시 1.2초 후 모달 닫기
    if (!formError && (isCreatingUser || isAddingUser)) {
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(null);
        setDetailMessage(null);
      }, 1200);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewUserForm({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      userId: 0,
      accessLevel: "user",
    });
    setFormError(null);
    setFormSuccess(null);
    setDetailMessage(null);
    setIsExistingUser(false);
  };

  const handleRemoveUser = async (userId: number) => {
    if (
      window.confirm(
        "정말로 이 사용자를 팀에서 제거하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
      )
    ) {
      try {
        await removeUser(userId);
      } catch (error) {
        console.error("사용자 제거 중 오류:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-sm">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">팀 멤버 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-sm">
        <div className="text-center py-10">
          <p className="text-red-600">
            오류가 발생했습니다: {error.toString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">팀 멤버 관리</h2>
        <div className="flex items-center space-x-2">
          {isReadOnly && (
            <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
              읽기 전용 모드
            </div>
          )}
          {!isReadOnly && (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              size="md"
            >
              멤버 추가
            </Button>
          )}
        </div>
      </div>

      <div className="border-b pb-4 mb-4">
        <p className="text-gray-600">
          팀원을 추가하거나 제거하고, 권한을 관리할 수 있습니다.
        </p>
      </div>

      {/* 팀 멤버 목록 */}
      <div className="space-y-3">
        {teamUsers.length > 0 ? (
          teamUsers.map((member: IMappingUser) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {member.user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {member.user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {(() => {
                    const accessLevel =
                      (member.user as { accessLevel?: string }).accessLevel ||
                      "user";
                    return accessLevel === "admin"
                      ? "관리자"
                      : accessLevel === "moderator"
                      ? "중재자"
                      : accessLevel === "supplier"
                      ? "공급자"
                      : "일반 사용자";
                  })()}
                </span>
                {!isReadOnly && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveUser(member.user.id)}
                    disabled={isRemovingUser}
                  >
                    제거
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">등록된 팀 멤버가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 멤버 추가 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isExistingUser ? "기존 사용자 추가" : "새 사용자 생성"}
        size="md"
      >
        <div className="space-y-4">
          {/* 모드 선택 */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={!isExistingUser ? "primary" : "outline"}
              onClick={() => setIsExistingUser(false)}
              size="sm"
            >
              새 사용자 생성
            </Button>
            <Button
              variant={isExistingUser ? "primary" : "outline"}
              onClick={() => setIsExistingUser(true)}
              size="sm"
            >
              기존 사용자 추가
            </Button>
          </div>

          {/* 에러/성공 메시지 */}
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{formError}</p>
            </div>
          )}
          {formSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{formSuccess}</p>
            </div>
          )}
          {detailMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-600 text-sm">{detailMessage}</p>
            </div>
          )}

          {/* 폼 필드 */}
          {isExistingUser ? (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                사용자 ID
              </label>
              <Input
                name="userId"
                type="text"
                value={newUserForm.userId.toString()}
                onChange={handleInputChange}
                placeholder="추가할 사용자의 ID"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  이메일
                </label>
                <Input
                  name="email"
                  type="email"
                  value={newUserForm.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  이름
                </label>
                <Input
                  name="name"
                  type="text"
                  value={newUserForm.name}
                  onChange={handleInputChange}
                  placeholder="사용자 이름"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  비밀번호
                </label>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={newUserForm.password}
                  onChange={handleInputChange}
                  placeholder="최소 6자 이상"
                  rightIcon={
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  비밀번호 확인
                </label>
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={newUserForm.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호 확인"
                  rightIcon={
                    <button
                      type="button"
                      onClick={toggleShowConfirmPassword}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  권한 레벨
                </label>
                <select
                  value={newUserForm.accessLevel}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      accessLevel: e.target.value as
                        | "user"
                        | "supplier"
                        | "moderator",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">일반 사용자</option>
                  <option value="supplier">공급자</option>
                  <option value="moderator">1차승인권자</option>
                </select>
              </div>
            </>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
              loading={isAddingUser || isCreatingUser}
            >
              {isExistingUser ? "추가" : "생성 및 추가"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
