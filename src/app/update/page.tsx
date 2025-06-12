"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Plus,
  Edit,
  Bug,
  Shield,
  TrendingUp,
} from "lucide-react";
import { APP_VERSION, APP_NAME } from "@/constants/version";

export default function UpdatePage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "추가됨":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "변경됨":
        return <Edit className="w-4 h-4 text-blue-600" />;
      case "수정됨":
        return <Bug className="w-4 h-4 text-red-600" />;
      case "보안":
        return <Shield className="w-4 h-4 text-purple-600" />;
      case "개선됨":
        return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default:
        return <Tag className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              현재 버전: v{APP_VERSION}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* v1.3.0 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.3.0
                  </h2>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    최신
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  2025-06-11
                </div>
              </div>
              <p className="text-gray-600 mt-2">입출고 관리 시스템 개선</p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    /ioHistory 페이지에 입고/출고 버튼 및 기능 추가
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 처리 후 실시간 기록 반영 기능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 기록 조회와 작업이 한 페이지에서 가능한 통합 UI
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    AttachedFile 타입을 공통 타입으로 분리하여 재사용성 향상
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    /stock 페이지에서 입고/출고 버튼 제거 (재고 조회/수정 기능만
                    유지)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    /stock 페이지의 카테고리 토글이 기본적으로 열린 상태로 변경
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 기능을 /ioHistory 페이지로 이동하여 논리적 구조
                    개선
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    AttachedFile 타입을 /src/types/common.ts로 이동
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 관련 모든 메시지에서 &quot;발주&quot; →
                    &quot;출고&quot; 워딩 수정
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 모달 제목 및 버튼 텍스트 정확성 개선
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    TypeScript 빌드 에러 해결 (AttachedFile 타입 import 오류)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 처리 시 일관된 용어 사용으로 사용자 혼란 방지
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    사용자 경험 향상: 입출고 작업과 이력 확인이 한 곳에서 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    코드 구조 개선: 관심사 분리를 통한 유지보수성 향상
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    즉시 반영: 입고/출고 처리 후 바로 기록 목록에서 확인 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    타입 일관성: 공통 타입 사용으로 코드 중복 제거
                  </li>
                </ul>
              </div>

              {/* 보안 */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  {getIconForType("보안")}
                  <h3 className="font-medium text-gray-900">보안</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    입고/출고 기능에서 권한 제어 유지 (user 권한은 버튼 숨김)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.2.0 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">v1.2.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  2025-05-31
                </div>
              </div>
              <p className="text-gray-600 mt-2">창고 접근 권한 관리 시스템</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                창고별 접근 권한 관리 기능, 사용자별 창고 제한 설정, 권한 기반
                데이터 필터링 등의 보안 강화 업데이트가 포함되었습니다.
              </div>
            </div>
          </div>

          {/* v1.1.0 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">v1.1.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  2024-11-XX
                </div>
              </div>
              <p className="text-gray-600 mt-2">발주 시스템 개선</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                발주 요청 후 부드러운 페이지 전환, 발주 상세 정보 확장 표시, UX
                개선 등이 포함되었습니다.
              </div>
            </div>
          </div>

          {/* v1.0.0 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.0.0
                  </h2>
                  <span className="bg-gold-100 text-gold-800 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    초기 릴리즈
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  2025-05-31
                </div>
              </div>
              <p className="text-gray-600 mt-2">KARS 시스템 최초 출시</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                재고 관리, 발주 관리, 패키지 관리, 사용자 관리 등 핵심 기능들이
                포함된 초기 버전입니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
