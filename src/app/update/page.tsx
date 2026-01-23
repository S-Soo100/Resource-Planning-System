"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { APP_VERSION, APP_NAME } from "@/constants/version";
import UpdateList from "@/components/update/UpdateList";
import { parseChangelog } from "@/lib/changelog-parser";

// CHANGELOG.md 내용을 클라이언트에서 import
// Next.js에서는 webpack raw-loader를 사용하거나, 아래처럼 직접 읽을 수 있음
// 빌드 타임에 정적으로 포함됨
import changelogContent from "../../../CHANGELOG.md";

export default function UpdatePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  // CHANGELOG 파싱
  const updates = parseChangelog(changelogContent);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  업데이트 내역
                </h1>
                <p className="text-sm text-gray-600">{APP_NAME} 변경사항</p>
              </div>
            </div>
            <div className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
              현재 버전: v{APP_VERSION}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8">
        <UpdateList updates={updates} initialDisplayCount={10} />
      </div>
    </div>
  );
}
