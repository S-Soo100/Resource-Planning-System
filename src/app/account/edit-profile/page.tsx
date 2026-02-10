"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Save } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { userApi } from "@/api/user-api";
import { useMutation } from "@tanstack/react-query";
import { authStore } from "@/store/authStore";
import { LoadingCentered, LoadingInline } from "@/components/ui/Loading";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // 사용자 정보가 로드되면 현재 이름을 설정
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  // mutation 정의
  const updateUserMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!user?.id) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }
      return userApi.updateUser(user.id.toString(), { name: newName });
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        // authStore의 사용자 이름도 업데이트
        const currentUser = authStore.getState().user;
        if (currentUser) {
          authStore.getState().updateUser({
            ...currentUser,
            name: response.data.name,
          });
        }

        // 변경 완료 안내 및 새로고침 요청
        alert("변경 완료했습니다. 새로고침을 해주세요.");
        window.location.reload();
      } else {
        setError(response.error || "이름 변경에 실패했습니다.");
      }
    },
    onError: (err) => {
      console.error("이름 변경 오류:", err);
      setError("이름 변경 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setError("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (name.trim() === user.name) {
      setError("변경할 이름이 현재 이름과 동일합니다.");
      return;
    }

    setError("");
    updateUserMutation.mutate(name.trim());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingCentered size="lg" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">사용자 정보를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push("/account")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/account")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            계정으로 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            이름 변경
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            계정에 표시될 이름을 변경하세요.
          </p>
        </div>

        {/* 폼 */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">프로필 정보</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* 현재 정보 표시 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">현재 이름</p>
                  <p className="text-sm text-gray-600">{user.name}</p>
                </div>
              </div>
            </div>

            {/* 이름 입력 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                새 이름
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="새 이름을 입력하세요"
                required
                maxLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">
                최대 50자까지 입력할 수 있습니다.
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={
                  updateUserMutation.isPending ||
                  !name.trim() ||
                  name.trim() === user.name
                }
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <LoadingInline />
                    변경 중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
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
