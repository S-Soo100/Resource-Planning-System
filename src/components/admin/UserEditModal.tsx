import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { IUser, UpdateUserRequest } from "@/types/(auth)/user";
import { warehouseApi } from "@/api/warehouse-api";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useTeamAdmin } from "@/hooks/admin/useTeamAdmin";
import { Warehouse } from "@/types/warehouse";
import { IMappingUser } from "@/types/mappingUser";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserId: number | null;
  teamUsers: IMappingUser[];
  onUserUpdated: () => void;
  isReadOnly?: boolean;
}

export default function UserEditModal({
  isOpen,
  onClose,
  selectedUserId,
  teamUsers,
  onUserUpdated,
  isReadOnly = false,
}: UserEditModalProps) {
  const { team } = useCurrentTeam();
  const { updateUser, isUpdatingUser } = useTeamAdmin(team?.id || 0);
  const [warehouses, setWarehouses] = useState<Warehouse[] | null>(null);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [formData, setFormData] = useState<UpdateUserRequest>({});

  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

  // selectedUserId로부터 사용자 정보 가져오기 (API에서 직접 가져오기)
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // 데이터 동기화 상태 추적
  const [isDataReady, setIsDataReady] = useState(false);

  // 에러 상태
  const [loadError, setLoadError] = useState<string | null>(null);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setUser(null);
      setFormData({});
      setSelectedWarehouses([]);
      setWarehouses(null);
      setIsDataReady(false);
      setLoadError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!selectedUserId || !isOpen) {
        setUser(null);
        setIsDataReady(false);
        setLoadError(null);
        return;
      }

      // 새 사용자를 불러오기 전에 이전 데이터 먼저 클리어
      setIsDataReady(false);
      setLoadError(null);
      setUser(null);
      setFormData({});
      setSelectedWarehouses([]);

      setIsLoadingUser(true);
      try {
        const userApi = (await import("@/api/user-api")).userApi;
        const response = await userApi.getUser(selectedUserId.toString());

        if (response.success && response.data) {
          setUser(response.data);
          setLoadError(null);
          console.log(
            "[UserEditModal] API에서 가져온 사용자 정보:",
            response.data
          );
        } else {
          console.error(
            "[UserEditModal] 사용자 정보 가져오기 실패:",
            response.error
          );
          setUser(null);
          setLoadError("사용자 정보를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("[UserEditModal] 사용자 정보 가져오기 오류:", error);
        setUser(null);
        setLoadError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [selectedUserId, isOpen]);

  // 팀의 모든 창고 목록 로딩
  useEffect(() => {
    const loadAllWarehouses = async () => {
      if (!team?.id) return;

      setIsLoadingWarehouses(true);
      try {
        const response = await warehouseApi.getTeamWarehouses(team.id);
        console.log("[UserEditModal] 창고 API 응답:", response);
        if (response.success && response.data) {
          // response.data가 { data: Warehouse[], success: true } 형태로 오므로
          // response.data.data로 실제 배열에 접근
          const warehouseArray = Array.isArray(response.data)
            ? response.data
            : (response.data as { data: Warehouse[] }).data;
          setWarehouses(warehouseArray);
          console.log("[UserEditModal] 창고 목록 설정 완료:", warehouseArray.length, "개");
        } else {
          setWarehouses(null);
          setLoadError("창고 목록을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("[UserEditModal] 창고 목록 로딩 오류:", error);
        setWarehouses(null);
        setLoadError("창고 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingWarehouses(false);
      }
    };

    if (isOpen && team?.id) {
      loadAllWarehouses();
    }
  }, [isOpen, team?.id, selectedUserId]);

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
        console.log(
          "[UserEditModal] restrictedWhs 타입:",
          typeof user.restrictedWhs
        );
        console.log("[UserEditModal] restrictedWhs 값:", user.restrictedWhs);

        if (typeof user.restrictedWhs === "string") {
          const trimmed = user.restrictedWhs.trim();
          console.log("[UserEditModal] trimmed:", trimmed);

          if (trimmed === "") {
            restrictedIds = [];
          } else {
            const splitResult = trimmed.split(",");
            console.log("[UserEditModal] splitResult:", splitResult);

            restrictedIds = splitResult
              .map((id) => {
                const idTrimmed = id.trim();
                const parsed = parseInt(idTrimmed);
                console.log("[UserEditModal] id 변환:", {
                  original: id,
                  trimmed: idTrimmed,
                  parsed,
                });
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

      console.log("[UserEditModal] 제한된 창고:", restrictedIds.length, "개");
      console.log("[UserEditModal] 제한된 창고 ID:", restrictedIds);
      console.log("[UserEditModal] 원본 restrictedWhs:", user.restrictedWhs);
      setSelectedWarehouses(restrictedIds);
    } else {
      // user가 null이면 폼 데이터 초기화
      setFormData({});
      setSelectedWarehouses([]);
    }
  }, [user]);

  // 데이터 준비 상태 체크 (사용자 정보 + 창고 목록 모두 로드 완료)
  useEffect(() => {
    const userLoaded = user !== null && !isLoadingUser;
    const warehousesLoaded = warehouses !== null && !isLoadingWarehouses;

    // 둘 다 로드 완료되면 데이터 준비 완료
    if (userLoaded && warehousesLoaded) {
      console.log("[UserEditModal] 모든 데이터 로드 완료 - 폼 렌더링 준비");
      setIsDataReady(true);
    }
  }, [user, warehouses, isLoadingUser, isLoadingWarehouses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !user || isReadOnly) return;
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
      console.log("[UserEditModal] 최종 수정 요청:", {
        userId: selectedUserId,
        selectedWarehouses: selectedWarehouses.length,
        restrictedWhs: updateData.restrictedWhs,
        updateData: updateData,
      });

      // useTeamAdmin의 updateUser 사용
      await updateUser({ userId: selectedUserId, userData: updateData });

      // 최신 데이터를 다시 불러와서 user 상태 업데이트
      try {
        const userApi = (await import("@/api/user-api")).userApi;
        const response = await userApi.getUser(selectedUserId.toString());

        if (response.success && response.data) {
          // user 상태를 최신 데이터로 업데이트
          setUser(response.data);
          console.log("[UserEditModal] 수정 후 최신 데이터로 업데이트:", response.data);
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

  if (!isOpen) return null;

  // 에러 발생 시
  if (loadError && !isLoadingUser && !isLoadingWarehouses) {
    return (
      <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
        <div className="p-6 mx-4 w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex flex-col justify-center items-center py-10">
            <div className="mb-4 text-red-500">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="mb-4 text-lg font-medium text-gray-900">데이터 로드 실패</p>
            <p className="mb-6 text-sm text-gray-600">{loadError}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 중이거나 데이터가 준비되지 않은 경우
  const isLoading = isLoadingUser || isLoadingWarehouses || !isDataReady;

  if (isLoading) {
    return (
      <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
        <div className="p-6 mx-4 w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex flex-col justify-center items-center py-10">
            <div className="mx-auto w-10 h-10 rounded-full border-b-2 border-purple-500 animate-spin"></div>
            <p className="mt-3 text-gray-600">
              {isLoadingUser && "사용자 정보를 불러오는 중..."}
              {!isLoadingUser && isLoadingWarehouses && "창고 목록을 불러오는 중..."}
              {!isLoadingUser && !isLoadingWarehouses && !isDataReady && "데이터를 준비하는 중..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
                    <div>
                      창고 목록:{" "}
                      {Array.isArray(warehouses)
                        ? warehouses
                            .map((w) => `${w.id}:${w.warehouseName}`)
                            .join(", ")
                        : "없음"}
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
