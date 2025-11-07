"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Eye, EyeOff, Save } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userApi } from "@/api/user-api";
import { authApi } from "@/api/auth-api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 현재 비밀번호 유효성 검사 함수 (앱 상태에 영향 없음)
  const validateCurrentPassword = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    // 개발 모드에서는 현재 비밀번호 검사를 건너뜀
    if (process.env.NODE_ENV === "development") {
      console.log("개발 모드: 현재 비밀번호 검사를 건너뜁니다.");
      return true;
    }

    try {
      const response = await authApi.validatePassword({
        email,
        password,
      });
      return response.success && response.data === true;
    } catch (error) {
      console.error("현재 비밀번호 검증 오류:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !user?.email) {
      setError("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    // 기본 유효성 검사
    if (!currentPassword.trim()) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword.trim()) {
      setError("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 6) {
      setError("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 1단계: 현재 비밀번호 유효성 검사
      setIsValidatingPassword(true);
      const isCurrentPasswordValid = await validateCurrentPassword(
        user.email,
        currentPassword
      );
      setIsValidatingPassword(false);

      if (!isCurrentPasswordValid) {
        setError("현재 비밀번호가 올바르지 않습니다.");
        setIsSubmitting(false);
        return;
      }

      // 2단계: 현재 비밀번호가 유효한 경우에만 비밀번호 변경 실행
      const response = await userApi.updateUser(user.id.toString(), {
        password: newPassword,
      });

      if (response.success) {
        setSuccess(true);

        setTimeout(() => {
          router.push("/account");
        }, 2000);
      } else {
        setError(response.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error("비밀번호 변경 오류:", err);
      setError("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setIsValidatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">사용자 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push("/account")}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-[1800px] sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/account")}
            className="flex items-center mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            계정으로 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            비밀번호 변경
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            계정 보안을 위해 정기적으로 비밀번호를 변경하세요.
          </p>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div className="p-4 mb-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex justify-center items-center w-5 h-5 bg-green-400 rounded-full">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  비밀번호가 성공적으로 변경되었습니다. 잠시 후 계정 페이지로
                  이동합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 폼 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">비밀번호 보안</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* 현재 비밀번호 */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                현재 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="px-3 py-2 pr-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="현재 비밀번호를 입력하세요"
                  required
                  disabled={isSubmitting || isValidatingPassword || success}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isValidatingPassword || success}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div>
              <label
                htmlFor="newPassword"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                새 비밀번호
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-2 pr-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="새 비밀번호를 입력하세요"
                  required
                  minLength={6}
                  disabled={isSubmitting || isValidatingPassword || success}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isValidatingPassword || success}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                최소 6자 이상 입력해주세요.
              </p>
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                새 비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="px-3 py-2 pr-10 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
                  disabled={isSubmitting || isValidatingPassword || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || isValidatingPassword || success}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 보안 가이드 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start">
                <Lock className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    비밀번호 보안 가이드
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-blue-700">
                    <li>• 최소 6자 이상의 길이</li>
                    <li>• 영문, 숫자, 특수문자 조합 권장</li>
                    <li>• 개인정보(이름, 생년월일 등) 사용 금지</li>
                    <li>• 정기적인 비밀번호 변경 권장</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-end items-center pt-4 space-x-3">
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || isValidatingPassword || success}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isValidatingPassword ||
                  success ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  success
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                }`}
              >
                {success ? (
                  <>
                    <div className="flex justify-center items-center mr-2 w-4 h-4 bg-green-500 rounded-full">
                      <svg
                        className="w-2 h-2 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    변경 완료
                  </>
                ) : isValidatingPassword ? (
                  <>
                    <div className="mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
                    현재 비밀번호 확인 중...
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
                    변경 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" />
                    변경하기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
