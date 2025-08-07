"use client";
import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title = "처리 중...",
  message = "잠시만 기다려주세요.",
  progress = 0,
  showProgress = true,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 블러 처리된 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* 로딩 콘텐츠 */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full">
        <div className="text-center">
          {/* 스피너 */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* 제목 */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {title}
          </h3>

          {/* 메시지 */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* 프로그레스 바 */}
          {showProgress && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {progress >= 100 ? "완료 중..." : `${Math.round(progress)}%`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
