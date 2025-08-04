import React, { useState, useEffect } from "react";
import { CreateUserDto } from "@/types/(auth)/user";
import { Button, Input, Modal } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";

interface NewUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userId: number;
  accessLevel: "user" | "supplier" | "moderator";
  restrictedWhs: number[];
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userId: number) => Promise<void>;
  onCreateUser: (userData: CreateUserDto) => Promise<void>;
  isAddingUser: boolean;
  isCreatingUser: boolean;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  onAddUser,
  onCreateUser,
  isAddingUser,
  isCreatingUser,
}: UserManagementModalProps) {
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
    restrictedWhs: [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);

  // 창고 목록 가져오기
  const { warehouses } = useWarehouseItems();

  // 성공 시 모달 자동 닫기
  useEffect(() => {
    if (
      formSuccess === "새 사용자가 성공적으로 생성되고 팀에 추가되었습니다."
    ) {
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    }
  }, [formSuccess]); // handleCloseModal는 무한루프 방지를 위해 의존성에서 제외

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

  // 창고 제한 체크박스 핸들러
  const handleWarehouseRestriction = (
    warehouseId: number,
    isChecked: boolean
  ) => {
    setNewUserForm((prev) => ({
      ...prev,
      restrictedWhs: isChecked
        ? [...prev.restrictedWhs, warehouseId]
        : prev.restrictedWhs.filter((id) => id !== warehouseId),
    }));
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isExistingUser) {
        // 기존 사용자 추가
        setDetailMessage(
          `기존 사용자(ID: ${newUserForm.userId})를 팀에 추가 중...`
        );
        await onAddUser(Number(newUserForm.userId));
        setFormSuccess("사용자가 팀에 추가되었습니다.");
      } else {
        // 새 사용자 생성 및 팀에 추가
        const userData: CreateUserDto = {
          email: newUserForm.email,
          password: newUserForm.password,
          name: newUserForm.name,
          restrictedWhs: newUserForm.restrictedWhs.join(","),
          accessLevel: newUserForm.accessLevel,
          isAdmin: false,
        };

        setDetailMessage("새 사용자 생성 및 팀 추가 중...");
        await onCreateUser(userData);
        setFormSuccess("새 사용자가 성공적으로 생성되고 팀에 추가되었습니다.");
        setDetailMessage(`추가된 사용자 이름: ${userData.name}`);
      }

      // 성공 시 폼 초기화
      setNewUserForm({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        userId: 0,
        accessLevel: "user",
        restrictedWhs: [],
      });
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(
          isExistingUser
            ? "사용자 추가 중 오류가 발생했습니다."
            : "사용자 생성 중 오류가 발생했습니다."
        );
      }
    }
  };

  const handleCloseModal = () => {
    setNewUserForm({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      userId: 0,
      accessLevel: "user",
      restrictedWhs: [],
    });
    setFormError(null);
    setFormSuccess(null);
    setDetailMessage(null);
    setIsExistingUser(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={isExistingUser ? "기존 사용자 추가" : "새 사용자 생성"}
      size="lg"
    >
      <div className="space-y-4">
        {/* 모드 선택 */}
        <div className="flex mb-6 space-x-4">
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
          <div className="p-3 border border-red-200 rounded-md bg-red-50">
            <p className="text-sm text-red-600">{formError}</p>
          </div>
        )}
        {formSuccess && (
          <div className="p-3 border border-green-200 rounded-md bg-green-50">
            <p className="text-sm text-green-600">{formSuccess}</p>
          </div>
        )}
        {detailMessage && (
          <div className="p-3 border border-blue-200 rounded-md bg-blue-50">
            <p className="text-sm text-blue-600">{detailMessage}</p>
          </div>
        )}

        {/* 폼 필드 */}
        {isExistingUser ? (
          <div>
            <Input
              label="사용자 ID"
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
              <Input
                label="이메일"
                name="email"
                type="email"
                value={newUserForm.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Input
                label="이름"
                name="name"
                type="text"
                value={newUserForm.name}
                onChange={handleInputChange}
                placeholder="사용자 이름"
              />
            </div>

            <div>
              <Input
                label="비밀번호"
                name="password"
                type={showPassword ? "text" : "password"}
                value={newUserForm.password}
                onChange={handleInputChange}
                placeholder="최소 6자 이상"
                rightIcon={
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="p-1 rounded hover:bg-gray-100"
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
              <Input
                label="비밀번호 확인"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={newUserForm.confirmPassword}
                onChange={handleInputChange}
                placeholder="비밀번호 확인"
                rightIcon={
                  <button
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className="p-1 rounded hover:bg-gray-100"
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

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
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
                <option value="supplier">거래처</option>
                <option value="moderator">1차승인권자</option>
              </select>
            </div>

            {/* 창고 접근 제한 설정 */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                창고 접근 제한
              </label>
              <p className="mb-3 text-xs text-gray-500">
                체크된 창고는 해당 사용자가 접근할 수 없습니다.
              </p>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                {warehouses && warehouses.length > 0 ? (
                  <div className="space-y-2">
                    {warehouses.map((warehouse: Warehouse) => (
                      <label
                        key={warehouse.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newUserForm.restrictedWhs.includes(
                            warehouse.id
                          )}
                          onChange={(e) =>
                            handleWarehouseRestriction(
                              warehouse.id,
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {warehouse.warehouseName}
                        </span>
                        {warehouse.warehouseAddress && (
                          <span className="text-xs text-gray-400">
                            ({warehouse.warehouseAddress})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    등록된 창고가 없습니다.
                  </p>
                )}
              </div>
              {newUserForm.restrictedWhs.length > 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  {newUserForm.restrictedWhs.length}개 창고에 접근이 제한됩니다.
                </p>
              )}
            </div>
          </>
        )}

        {/* 액션 버튼 */}
        <div className="flex justify-end pt-4 space-x-3">
          <Button variant="outline" onClick={handleCloseModal}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isAddingUser || isCreatingUser}
          >
            {isExistingUser ? "추가" : "생성 및 추가"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
