import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { IUser, UpdateUserRequest } from "@/types/(auth)/user";
import { userApi } from "@/api/user-api";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";

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
  const { warehouses } = useWarehouseItems();
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const [selectedWarehouses, setSelectedWarehouses] = useState<number[]>([]);

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
        const restrictedIds =
          typeof user.restrictedWhs === "string"
            ? user.restrictedWhs
                .split(",")
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id))
            : Array.isArray(user.restrictedWhs)
            ? user.restrictedWhs.map((id) =>
                typeof id === "number" ? id : parseInt(id)
              )
            : [];
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

      // 비밀번호 필드는 제외
      delete updateData.password;

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
    } catch (error) {
      console.error("사용자 수정 오류:", error);
      alert("사용자 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWarehouseToggle = (warehouseId: number) => {
    if (isReadOnly) return;

    setSelectedWarehouses((prev) =>
      prev.includes(warehouseId)
        ? prev.filter((id) => id !== warehouseId)
        : [...prev, warehouseId]
    );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {isReadOnly ? "사용자 정보 조회" : "사용자 정보 수정"}
          </h3>
          {isReadOnly && (
            <div className="px-3 py-1 text-sm text-yellow-700 rounded-md bg-yellow-50">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {formData.accessLevel !== "admin" && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">창고 접근 제한</h4>
              <p className="text-sm text-gray-600">
                선택된 창고는 접근이 제한됩니다. (관리자는 모든 창고에 접근
                가능)
              </p>

              <div className="p-3 space-y-2 overflow-y-auto border border-gray-200 rounded-md max-h-40">
                {warehouses && warehouses.length > 0 ? (
                  warehouses.map((warehouse) => (
                    <label key={warehouse.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedWarehouses.includes(warehouse.id)}
                        onChange={() => handleWarehouseToggle(warehouse.id)}
                        className="mr-2"
                        disabled={isReadOnly}
                      />
                      <span className="text-sm text-gray-700">
                        {warehouse.warehouseName} - {warehouse.warehouseAddress}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    등록된 창고가 없습니다.
                  </p>
                )}
              </div>

              {selectedWarehouses.length > 0 && (
                <div className="text-sm text-gray-600">
                  선택된 제한 창고: {selectedWarehouses.length}개
                </div>
              )}
            </div>
          )}

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
