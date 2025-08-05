import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { IUser, UpdateUserRequest } from "@/types/(auth)/user";
import { warehouseApi } from "@/api/warehouse-api";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useTeamAdmin } from "@/hooks/admin/useTeamAdmin";
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
  const { updateUser, isUpdatingUser } = useTeamAdmin(team?.id || 0);
  const [warehouses, setWarehouses] = useState<Warehouse[] | null>(null);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({});

  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

  // 팀의 모든 창고 목록 로딩
  useEffect(() => {
    const loadAllWarehouses = async () => {
      if (!team?.id) return;

      setIsLoadingWarehouses(true);
      try {
        const response = await warehouseApi.getTeamWarehouses(team.id);
        // console.log("[UserEditModal] 창고 API 응답:", response);
        if (response.success && response.data) {
          // response.data가 { data: Warehouse[], success: true } 형태로 오므로
          // response.data.data로 실제 배열에 접근
          const warehouseArray = Array.isArray(response.data)
            ? response.data
            : (response.data as { data: Warehouse[] }).data;
          setWarehouses(warehouseArray);
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
      let restrictedIds: number[] = [];

      if (user.restrictedWhs) {
        if (typeof user.restrictedWhs === "string") {
          const trimmed = user.restrictedWhs.trim();
          if (trimmed === "") {
            restrictedIds = [];
          } else {
            const splitResult = trimmed.split(",");
            restrictedIds = splitResult
              .map((id) => {
                const idTrimmed = id.trim();
                const parsed = parseInt(idTrimmed);
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
      } else {
        // restrictedWhs가 없거나 null/undefined인 경우
        restrictedIds = [];
      }

      // console.log("[UserEditModal] 제한된 창고:", restrictedIds.length, "개");
      // console.log("[UserEditModal] 제한된 창고 ID:", restrictedIds);
      // console.log("[UserEditModal] 원본 restrictedWhs:", user.restrictedWhs);
      setSelectedWarehouses(restrictedIds);
    }
  }, [user]);

  // 창고 목록이 로딩된 후 선택된 창고 상태 업데이트
  useEffect(() => {
    if (Array.isArray(warehouses) && warehouses.length > 0 && user) {
      // console.log(
      //   "[UserEditModal] 창고 목록 로딩 완료:",
      //   warehouses.length,
      //   "개"
      // );
    } else if (warehouses === null && !isLoadingWarehouses) {
      // console.log("[UserEditModal] 창고 목록 로딩 실패");
    } else if (Array.isArray(warehouses) && warehouses.length === 0) {
      // console.log("[UserEditModal] 창고 목록이 비어있음");
    } else {
      // console.log("[UserEditModal] 창고 목록 로딩 중:", {
      //   isLoading: isLoadingWarehouses,
      //   isArray: Array.isArray(warehouses),
      //   length: Array.isArray(warehouses) ? warehouses.length : "N/A",
      // });
    }
  }, [warehouses, user, isLoadingWarehouses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isReadOnly) return;
    try {
      const updateData: UpdateUserRequest = {
        ...formData,
        restrictedWhs:
          selectedWarehouses.length > 0 ? selectedWarehouses.join(",") : "",
      };

      // restrictedWhs가 빈 문자열인 경우 빈 문자열로 유지 (서버에서 처리하도록)
      // console.log("[UserEditModal] 제출 전 restrictedWhs:", updateData.restrictedWhs);

      // 빈 필드는 제거 (restrictedWhs는 제외)
      Object.keys(updateData).forEach((key) => {
        const value = updateData[key as keyof UpdateUserRequest];
        if ((value === "" || value === undefined) && key !== "restrictedWhs") {
          delete updateData[key as keyof UpdateUserRequest];
        }
      });

      // 디버깅 정보 출력
      // console.log("[UserEditModal] 최종 수정 요청:", {
      //   userId: user.id,
      //   selectedWarehouses: selectedWarehouses.length,
      //   restrictedWhs: updateData.restrictedWhs,
      //   updateData: updateData,
      // });

      // useTeamAdmin의 updateUser 사용
      await updateUser({ userId: user.id, userData: updateData });

      // 보낸 값과 응답 값 비교를 위해 직접 API 호출
      try {
        const userApi = (await import("@/api/user-api")).userApi;
        const response = await userApi.getUser(user.id.toString());

        if (response.success && response.data) {
          const sentRestrictedWhs = updateData.restrictedWhs || "";
          const receivedRestrictedWhs = response.data.restrictedWhs || "";

          const comparisonMessage = `[내가보낸값]\n${sentRestrictedWhs}\n\n[응답받은값]\n${receivedRestrictedWhs}`;
          alert(comparisonMessage);
        }
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
      }

      onUserUpdated();
      onClose();
    } catch {
      // console.error("[UserEditModal] 수정 중 오류:", error);
      alert("사용자 정보 수정 중 오류가 발생했습니다.");
    }
  };

  const handleWarehouseToggle = (warehouseId: number) => {
    if (isReadOnly) return;

    setSelectedWarehouses((prev) => {
      const newSelected = prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId];

      // console.log("[UserEditModal] 창고 선택 변경:", {
      //   warehouseId,
      //   newSelection: newSelected,
      //   prevSelection: prev,
      // });
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

    // admin으로 변경 시 창고 제한 해제
    if (accessLevel === "admin") {
      setSelectedWarehouses([]);
    }
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
              <Button type="submit" variant="primary" disabled={isUpdatingUser}>
                {isUpdatingUser ? "수정 중..." : "수정 완료"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
