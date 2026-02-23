import React, { useState, useEffect } from "react";
import { IMappingUser } from "@/types/mappingUser";
import { UpdateTeamRoleRequest } from "@/types/team";
import { TeamWarehouse } from "@/types/warehouse";
import { useTeamRole } from "@/hooks/useTeamRole";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { Button } from "@/components/ui";
import { LoadingCentered } from "@/components/ui/Loading";
import { X } from "lucide-react";

interface TeamRoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: IMappingUser | null;
  isReadOnly?: boolean;
}

/**
 * 팀별 권한 수정 모달 컴포넌트
 *
 * @description 선택된 멤버의 팀별 권한을 수정합니다.
 * - accessLevel: 권한 레벨 (user/moderator/admin/supplier)
 * - isAdmin: 관리자 여부
 * - restrictedWhs: 제한 창고 목록 (쉼표 구분)
 *
 * @see docs/2.3. backend/TEAM_ROLE_API.md
 */
export default function TeamRoleEditModal({
  isOpen,
  onClose,
  member,
  isReadOnly = false,
}: TeamRoleEditModalProps) {
  const { team } = useCurrentTeam();
  const teamId = team?.id;
  const warehouses: TeamWarehouse[] = team?.warehouses || [];

  const { teamRole, isLoading, updateRole, isUpdatingRole } = useTeamRole(
    teamId || 0,
    member?.userId || 0
  );

  const [formData, setFormData] = useState<UpdateTeamRoleRequest>({
    accessLevel: undefined,
    isAdmin: undefined,
    restrictedWhs: undefined,
  });

  // 모달 열릴 때 현재 권한 정보 로드
  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        accessLevel: member.accessLevel,
        isAdmin: member.isAdmin,
        restrictedWhs: member.restrictedWhs || undefined,
      });
    }
  }, [isOpen, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamId || !member) {
      return;
    }

    try {
      await updateRole(formData);
      onClose();
    } catch (error) {
      console.error("팀 권한 수정 실패:", error);
    }
  };

  const handleWarehouseChange = (warehouseId: number, checked: boolean) => {
    const currentWarehouses = formData.restrictedWhs
      ? formData.restrictedWhs.split(",").map(Number)
      : [];

    let newWarehouses: number[];
    if (checked) {
      newWarehouses = [...currentWarehouses, warehouseId];
    } else {
      newWarehouses = currentWarehouses.filter((id) => id !== warehouseId);
    }

    setFormData({
      ...formData,
      restrictedWhs:
        newWarehouses.length > 0 ? newWarehouses.join(",") : undefined,
    });
  };

  const isWarehouseSelected = (warehouseId: number): boolean => {
    if (!formData.restrictedWhs) return false;
    return formData.restrictedWhs
      .split(",")
      .map(Number)
      .includes(warehouseId);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-Outline-Variant">
          <div>
            <h2 className="text-xl font-semibold text-Text-Highest-100">
              팀별 권한 수정
            </h2>
            <p className="text-sm text-Text-Low-70 mt-0.5">
              {member?.user.name} 님의 팀별 권한을 설정합니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-Text-Low-70 hover:text-Text-Highest-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <LoadingCentered size="lg" />
            <p className="mt-4 text-Text-Low-70">권한 정보를 불러오는 중...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-6">
              {/* 현재 권한 정보 */}
              <div className="p-4 bg-Back-Low-10 rounded-xl">
                <h3 className="text-sm font-semibold text-Text-High-90 mb-2">
                  현재 권한 정보
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-Text-Low-70">기본 권한:</span>
                    <span className="ml-2 font-medium text-Text-Highest-100">
                      {(member?.user as { accessLevel?: string }).accessLevel ||
                        "user"}
                    </span>
                  </div>
                  <div>
                    <span className="text-Text-Low-70">팀 권한:</span>
                    <span className="ml-2 font-medium text-Text-Highest-100">
                      {member?.accessLevel || "기본 권한 사용"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 권한 레벨 선택 */}
              <div>
                <label className="block text-sm font-semibold text-Text-Highest-100 mb-2">
                  권한 레벨
                </label>
                <select
                  value={formData.accessLevel || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accessLevel: e.target.value as
                        | "user"
                        | "moderator"
                        | "admin"
                        | "supplier"
                        | undefined,
                    })
                  }
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 border border-Outline-Variant rounded-xl focus:outline-none focus:ring-2 focus:ring-Primary-Main disabled:bg-Back-Low-10 disabled:cursor-not-allowed"
                >
                  <option value="">기본 권한 사용</option>
                  <option value="user">일반 사용자</option>
                  <option value="moderator">1차 승인권자</option>
                  <option value="admin">관리자</option>
                  <option value="supplier">납품처</option>
                </select>
                <p className="mt-1 text-xs text-Text-Low-70">
                  비어있으면 사용자 기본 권한을 사용합니다
                </p>
              </div>

              {/* 관리자 여부 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAdmin || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isAdmin: e.target.checked,
                      })
                    }
                    disabled={isReadOnly}
                    className="w-5 h-5 text-Primary-Main focus:ring-Primary-Main border-Outline-Variant rounded disabled:cursor-not-allowed"
                  />
                  <span className="text-sm font-semibold text-Text-Highest-100">
                    팀 관리자
                  </span>
                </label>
                <p className="mt-1 text-xs text-Text-Low-70 ml-7">
                  관리자는 역할 체크를 bypass하며, 모든 창고에 접근할 수 있습니다
                </p>
              </div>

              {/* 창고 접근 제한 */}
              <div>
                <label className="block text-sm font-semibold text-Text-Highest-100 mb-2">
                  접근 가능한 창고
                </label>
                {warehouses && warehouses.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-Outline-Variant rounded-xl">
                    {warehouses.map((warehouse: TeamWarehouse) => (
                      <label
                        key={warehouse.id}
                        className="flex items-center gap-2 p-2 hover:bg-Back-Low-10 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isWarehouseSelected(warehouse.id)}
                          onChange={(e) =>
                            handleWarehouseChange(warehouse.id, e.target.checked)
                          }
                          disabled={isReadOnly}
                          className="w-5 h-5 text-Primary-Main focus:ring-Primary-Main border-Outline-Variant rounded disabled:cursor-not-allowed"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-Text-Highest-100">
                            {warehouse.warehouseName}
                          </div>
                          <div className="text-xs text-Text-Low-70">
                            {warehouse.warehouseAddress}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-Text-Low-70">
                    등록된 창고가 없습니다.
                  </p>
                )}
                <p className="mt-1 text-xs text-Text-Low-70">
                  선택하지 않으면 모든 창고에 접근할 수 있습니다
                </p>
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-Outline-Variant">
              <Button variant="secondary" onClick={onClose} type="button">
                취소
              </Button>
              {!isReadOnly && (
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isUpdatingRole}
                >
                  {isUpdatingRole ? "저장 중..." : "저장"}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
