"use client";
import React from "react";
import { authStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function TeamSelectPage() {
  const { user: authUser } = authStore();
  const { user: serverUser, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return <div className="p-4">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        에러가 발생했습니다: {error.message}
      </div>
    );
  }

  if (!authUser) {
    return <div className="p-4">로그인이 필요합니다.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">팀 선택</h1>

      {/* Zustand Store의 사용자 정보 */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Zustand Store의 사용자 정보
        </h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">ID:</span> {authUser.id}
          </p>
          <p>
            <span className="font-medium">이름:</span> {authUser.name}
          </p>
          <p>
            <span className="font-medium">이메일:</span> {authUser.email}
          </p>
          <p>
            <span className="font-medium">접근 레벨:</span>{" "}
            {authUser.accessLevel}
          </p>
          <p>
            <span className="font-medium">관리자 여부:</span>{" "}
            {authUser.isAdmin ? "예" : "아니오"}
          </p>
        </div>
      </div>

      {/* 서버 상태의 사용자 정보 */}
      {serverUser && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            서버 상태의 사용자 정보 (JSON)
          </h2>
          <pre className="bg-white p-4 rounded-lg overflow-auto">
            {JSON.stringify(serverUser, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
