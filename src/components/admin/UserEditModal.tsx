import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { IUser, UpdateUserRequest } from "@/types/(auth)/user";
import { userApi } from "@/api/user-api";
import { warehouseApi } from "@/api/warehouse-api";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { Warehouse } from "@/types/warehouse";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser | null;
  onUserUpdated: () => void;
  isReadOnly?: boolean;
}

export default function UserEditModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  isReadOnly = false,
}: UserEditModalProps) {
  const { team } = useCurrentTeam();
  const [warehouses, setWarehouses] = useState<Warehouse[] | null>(null);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

  // 팀의 모든 창고 목록 로딩
  useEffect(() => {
    const loadAllWarehouses = async () => {
      if (!team?.id) return;

      setIsLoadingWarehouses(true);
      try {
        const response = await warehouseApi.getTeamWarehouses(team.id);
        if (response.success && response.data) {
          setWarehouses(response.data);
        } else {
          setWarehouses(null);
        }
      } catch {
        setWarehouses(null);
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    if (isOpen && team?.id) {
      loadAllWarehouses();
    }
  }, [isOpen, team?.id]);

  // 사용자 정보가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        accessLevel: user.accessLevel,
        isAdmin: user.isAdmin,
      });

      // restrictedWhs 파싱
      if (user.restrictedWhs) {
        let restrictedIds: number[] = [];

        if (typeof user.restrictedWhs === "string") {
          if (user.restrictedWhs.trim() === "") {
            restrictedIds = [];
          } else {
            const splitResult = user.restrictedWhs.split(",");

            restrictedIds = splitResult
              .map((id) => {
                const trimmed = id.trim();
                const parsed = parseInt(trimmed);

                return parsed;
              })
              .filter((id) => !isNaN(id));
          }
        } else if (Array.isArray(user.restrictedWhs)) {
          restrictedIds = user.restrictedWhs.map((id) => {
            const result = typeof id === "number" ? id : parseInt(id);
            return result;
          });
        }

        setSelectedWarehouses(restrictedIds);
      } else {
        setSelectedWarehouses([]);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isReadOnly) return;

    setIsUpdating(true);
    try {
      const updateData: UpdateUserRequest = {
        ...formData,
        restrictedWhs: selectedWarehouses.join(","),
      };

      // 빈 필드는 제거
      Object.keys(updateData).forEach((key) => {
        const value = updateData[key as keyof UpdateUserRequest];
        if (value === "" || value === undefined) {
          delete updateData[key as keyof UpdateUserRequest];
        }
      });

      const result = await userApi.updateUser(user.id.toString(), updateData);

      if (result.success) {
        alert("사용자 정보가 성공적으로 수정되었습니다.");
        onUserUpdated();
        onClose();
      } else {
        alert(result.error || "사용자 정보 수정에 실패했습니다.");
      }
    } catch {
      alert("사용자 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWarehouseToggle = (warehouseId: number) => {
    if (isReadOnly) return;

    setSelectedWarehouses((prev) => {
      const newSelected = prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId];

      return newSelected;
    });
  };

  const handleAccessLevelChange = (accessLevel: string) => {
    if (isReadOnly) return;

    setFormData((prev) => ({
      ...prev,
      accessLevel: accessLevel as "user" | "admin" | "supplier" | "moderator",
      isAdmin: accessLevel === "admin",
    }));
  };

  if (!isOpen || !user) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {isReadOnly ? "사용자 정보 조회" : "사용자 정보 수정"}
          </h3>
          {isReadOnly && (
            <div className="px-3 py-1 text-sm text-yellow-700 bg-yellow-50 rounded-md">
              읽기 전용
            </div>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">기본 정보</h4>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* 권한 설정 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">권한 설정</h4>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                권한 레벨
              </label>
              <div className="space-y-2">
                {[
                  { value: "user", label: "일반 사용자" },
                  { value: "moderator", label: "1차승인권자" },
                  { value: "supplier", label: "외부업체" },
                  { value: "admin", label: "관리자" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="accessLevel"
                      value={option.value}
                      checked={formData.accessLevel === option.value}
                      onChange={(e) => handleAccessLevelChange(e.target.value)}
                      className="mr-2"
                      disabled={isReadOnly}
                    />
                    <span className="text-sm text-gray-700">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 창고 접근 제한 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">창고 접근 권한</h4>

            {formData.accessLevel === "admin" ? (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-600">
                  관리자는 모든 창고에 접근 가능하므로 창고 접근 제한이 적용되지
                  않습니다.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      접근 가능한 창고
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {Array.isArray(warehouses)
                        ? warehouses.length - selectedWarehouses.length
                        : 0}
                      개
                    </span>
                  </div>
                </div>

                {/* 권한 레벨별 안내 */}
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    체크된 창고는 접근이 제한됩니다. 관리자는 모든 창고에 접근
                    가능합니다.
                  </p>
                </div>

                {/* 디버깅 정보 표시 (개발 환경에서만) */}
                {process.env.NODE_ENV === "development" && (
                  <div className="p-2 text-xs bg-gray-100 rounded">
                    <div>
                      창고 목록 개수:{" "}
                      {Array.isArray(warehouses) ? warehouses.length : 0}
                    </div>
                    <div>선택된 창고: [{selectedWarehouses.join(", ")}]</div>
                    <div>
                      창고 로딩 중: {isLoadingWarehouses ? "예" : "아니오"}
                    </div>
                  </div>
                )}

                {isLoadingWarehouses ? (
                  <div className="p-3 text-center text-gray-500">
                    창고 목록을 불러오는 중...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.isArray(warehouses) && warehouses.length > 0 ? (
                      warehouses.map((warehouse) => {
                        const isRestricted = selectedWarehouses.includes(
                          warehouse.id
                        );

                        return (
                          <div
                            key={warehouse.id}
                            className={`
                              flex items-center p-3 rounded-md border transition-colors
                              ${
                                isRestricted
                                  ? "bg-red-50 border-red-200"
                                  : "bg-green-50 border-green-200"
                              }
                              ${
                                isReadOnly
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer hover:bg-gray-50"
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isRestricted}
                              onChange={() =>
                                handleWarehouseToggle(warehouse.id)
                              }
                              disabled={isReadOnly}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {warehouse.warehouseName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {warehouse.warehouseAddress}
                              </div>
                            </div>
                            <div
                              className={`
                              px-2 py-1 text-xs rounded-full
                              ${
                                isRestricted
                                  ? "text-red-700 bg-red-100"
                                  : "text-green-700 bg-green-100"
                              }
                            `}
                            >
                              {isRestricted ? "접근 제한" : "접근 가능"}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-gray-500 rounded-md border border-gray-200">
                        등록된 창고가 없습니다.
                      </div>
                    )}
                  </div>
                )}

                {selectedWarehouses.length > 0 && (
                  <div className="p-2 bg-amber-50 rounded-md border border-amber-200">
                    <p className="text-sm text-amber-800">
                      ⚠️ {selectedWarehouses.length}개 창고에 접근이 제한됩니다.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end pt-6 space-x-3 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              {isReadOnly ? "닫기" : "취소"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" variant="primary" disabled={isUpdating}>
                {isUpdating ? "수정 중..." : "수정 완료"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
