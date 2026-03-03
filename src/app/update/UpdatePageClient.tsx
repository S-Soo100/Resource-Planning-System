"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { APP_VERSION, APP_NAME } from "@/constants/version";
import UpdateList from "@/components/update/UpdateList";
import { VersionUpdate } from "@/types/update";

interface UpdatePageClientProps {
  updates: VersionUpdate[];
}

export default function UpdatePageClient({ updates }: UpdatePageClientProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-full transition-colors hover:bg-gray-100"
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
