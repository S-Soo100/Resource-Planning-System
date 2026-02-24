import React, { useState, useEffect } from "react";
import { useTeamAdmin } from "@/hooks/admin/useTeamAdmin";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { IMappingUser } from "@/types/mappingUser";
import { CreateUserDto, IUser } from "@/types/(auth)/user";
import { Button } from "@/components/ui";
import { LoadingCentered } from "@/components/ui/Loading";
import UserManagementModal from "./UserManagementModal";
import UserEditModal from "./UserEditModal";
import TeamRoleEditModal from "./TeamRoleEditModal";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isRoleEditModalOpen, setIsRoleEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<IMappingUser | null>(
    null
  );

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
    setSelectedUserId(user.id);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUserId(null);
  };

  const handleUserUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="py-10 text-center">
          <LoadingCentered size="lg" />
          <p className="mt-2 text-Text-Low-70">팀 멤버 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="py-10 text-center">
          <p className="text-Error-Main">
            오류가 발생했습니다: {error.toString()}
          </p>
        </div>
      </div>
    );
  }

  const accessLevelLabel = (level: string) => {
    return level === "admin"
      ? "관리자"
      : level === "moderator"
      ? "1차승인권자"
      : level === "supplier"
      ? "납품처"
      : "일반 사용자";
  };

  const accessLevelColor = (level: string) => {
    return level === "admin"
      ? "bg-Primary-Container text-Primary-Main"
      : level === "moderator"
      ? "bg-Back-Mid-20 text-Text-High-90"
      : level === "supplier"
      ? "bg-Back-Mid-20 text-Text-Low-70"
      : "bg-Back-Low-10 text-Text-Low-70";
  };

  const handleEditRole = (member: IMappingUser) => {
    setSelectedMember(member);
    setIsRoleEditModalOpen(true);
  };

  const handleCloseRoleEditModal = () => {
    setIsRoleEditModalOpen(false);
    setSelectedMember(null);
  };

  const handleRoleUpdated = () => {
    setIsRoleEditModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-Outline-Variant">
        <div>
          <h2 className="text-lg font-semibold text-Text-Highest-100">팀 멤버 관리</h2>
          <p className="text-sm text-Text-Low-70 mt-0.5">팀원 초대 및 권한 관리</p>
        </div>
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <span className="px-3 py-1 text-xs font-medium text-Primary-Main bg-Primary-Container rounded-full">
              읽기 전용
            </span>
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

      {/* 테이블 */}
      {teamUsers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-Back-Low-10 border-b border-Outline-Variant">
                <th className="px-6 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                  멤버
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                  기본 권한
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                  팀 권한
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-Text-Low-70 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-Outline-Variant">
              {teamUsers.map((member: IMappingUser) => {
                const userLevel =
                  (member.user as { accessLevel?: string }).accessLevel || "user";
                const teamLevel = member.accessLevel;
                const hasTeamRole = !!teamLevel;
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-Back-Low-10 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-Primary-Container rounded-full">
                          <span className="text-sm font-semibold text-Primary-Main">
                            {member.user.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-Text-Highest-100">
                          {member.user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-Text-Low-70">
                      {member.user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accessLevelColor(userLevel)}`}
                      >
                        {accessLevelLabel(userLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {hasTeamRole ? (
                          <>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accessLevelColor(teamLevel)}`}
                            >
                              {accessLevelLabel(teamLevel)}
                            </span>
                            {member.isAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-Error-Container text-Error-Main">
                                팀 관리자
                              </span>
                            )}
                            {member.restrictedWhs && (
                              <span className="text-xs text-Text-Low-70">
                                창고 제한: {member.restrictedWhs}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-Text-Low-70 italic">
                            기본 권한 사용
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!isReadOnly ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditRole(member)}
                            >
                              팀 역할
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditUser(member.user as IUser)}
                            >
                              정보 수정
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
                        ) : (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditRole(member)}
                            >
                              팀 역할
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditUser(member.user as IUser)}
                            >
                              정보 조회
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-12 h-12 bg-Primary-Container rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">👥</span>
          </div>
          <p className="text-Text-Low-70">등록된 팀 멤버가 없습니다.</p>
        </div>
      )}

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
        selectedUserId={selectedUserId}
        teamUsers={teamUsers}
        onUserUpdated={handleUserUpdated}
        isReadOnly={isReadOnly}
      />

      {/* 팀 권한 수정 모달 */}
      <TeamRoleEditModal
        isOpen={isRoleEditModalOpen}
        onClose={handleCloseRoleEditModal}
        member={selectedMember}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
