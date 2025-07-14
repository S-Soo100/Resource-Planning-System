"use client";

import React from "react";
import { X } from "lucide-react";
import { IAuth } from "@/types/(auth)/auth";
import LoginForm from "./LoginForm";
import { authStore } from "@/store/authStore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: IAuth) => void;
  redirectUrl?: string;
  teamId?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  redirectUrl,
  teamId,
}: LoginModalProps) {
  if (!isOpen) return null;

  // 현재 로그인 상태 확인
  const isAuthenticated = authStore.getState().isAuthenticated;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="flex relative flex-col items-center mx-4 w-full max-w-sm">
        {/* 로그인 상태일 때만 닫기 버튼 노출 */}
        {isAuthenticated && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* 안내문구 + 로그인폼 */}
        <div className="w-full">
          <LoginForm
            onLoginSuccess={onLoginSuccess}
            redirectUrl={redirectUrl}
            teamId={teamId}
            isModal={true}
            notice={
              <div className="mb-6 text-center">
                <span className="text-base font-medium text-gray-700">
                  발주 상세 정보를 확인하려면{" "}
                  <span className="font-bold text-blue-600">로그인</span>이
                  필요합니다.
                </span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
