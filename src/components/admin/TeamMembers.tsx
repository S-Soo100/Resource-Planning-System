import React, { useState, useEffect } from "react";
import { useTeamAdmin } from "@/hooks/admin/useTeamAdmin";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { IMappingUser } from "@/types/mappingUser";
import { CreateUserDto, IUser } from "@/types/(auth)/user";
import { Button } from "@/components/ui";
import UserManagementModal from "./UserManagementModal";
import UserEditModal from "./UserEditModal";

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
    updateUser,
    isUpdatingUser,
  } = useTeamAdmin(teamId || 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const handleAddUser = async (userId: number) => {
    await addUser(userId);
  };

  const handleCreateUser = async (userData: CreateUserDto) => {
    await createUser(userData);
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

  const handleEditUser = (user: IUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    // 팀 멤버 목록 새로고침 (React Query 캐시 무효화)
    console.log("[TeamMembers] 사용자 정보 업데이트 완료, 캐시 무효화됨");
  };

  if (isLoading) {
    return (
      <div className="p-5 bg-white rounded-lg shadow-sm">
        <div className="py-10 text-center">
          <div className="w-10 h-10 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">팀 멤버 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-white rounded-lg shadow-sm">
        <div className="py-10 text-center">
          <p className="text-red-600">
            오류가 발생했습니다: {error.toString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">팀 멤버 관리</h2>
        <div className="flex items-center space-x-2">
          {isReadOnly && (
            <div className="px-4 py-2 text-sm text-yellow-700 rounded-md bg-yellow-50">
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

      <div className="pb-4 mb-4 border-b">
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
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <span className="font-medium text-blue-600">
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
                      ? "1차승인권자"
                      : accessLevel === "supplier"
                      ? "거래처"
                      : "일반 사용자";
                  })()}
                </span>
                {!isReadOnly && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditUser(member.user as IUser)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveUser(member.user.id)}
                      disabled={isRemovingUser}
                    >
                      제거
                    </Button>
                  </>
                )}
                {isReadOnly && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditUser(member.user as IUser)}
                  >
                    조회
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500">등록된 팀 멤버가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 사용자 관리 모달 */}
      <UserManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
        onCreateUser={handleCreateUser}
        isAddingUser={isAddingUser}
        isCreatingUser={isCreatingUser}
      />

      {/* 사용자 수정 모달 */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
