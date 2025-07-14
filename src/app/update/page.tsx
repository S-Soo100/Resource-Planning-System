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
        <div className="px-4 py-4 mx-auto max-w-4xl">
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
      <div className="px-4 py-8 mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* v1.5.1 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.1
                  </h2>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                    최신
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-07-05
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                시연 신청 폼 및 시연 시스템 UI/UX 개선, 창고별 아이템 동적 선택,
                체크박스 로직 개선, 문서화 등
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 신청 폼 UI/UX 개선 (창고 선택 드롭다운 단일화, 자동
                    선택 로직 개선)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    창고별 실제 재고 아이템 목록 기반 동적 선택 UI 제공
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    체크박스 및 수량 조절 로직 개선 (teamItem 기준 일원화)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    불필요한 정보(창고 주소 등) 제거, 드롭다운만 노출
                  </li>
                </ul>
              </div>
              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    체크박스 동작 오류 및 전체 선택/해제 동작 오류 수정
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    선택된 아이템 요약 표시 오류 수정
                  </li>
                </ul>
              </div>
              {/* 문서화 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("문서화")}
                  <h3 className="font-medium text-gray-900">문서화</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    CHANGELOG, 시연 시스템 비즈니스 로직, 업데이트 내역 등 문서
                    최신화
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.5.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.5.0
                  </h2>
                  <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                    최신
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-01-15
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                시연 시스템, 휠체어 발주 기능, 댓글 시스템 추가
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 시스템 구축 (요청/승인/시연출고/복귀 6단계 상태 관리)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    휠체어 전용 발주 시스템 (전용 창고/카테고리 제한)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    공통 컴포넌트 시스템 (8개 재사용 컴포넌트 구축)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    파일 업로드 시스템 (드래그 앤 드롭 지원)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    주소 검색 시스템 (다음 포스트 API 연동)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    품목 선택 모달 (카테고리별 필터링 지원)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    댓글 시스템 (발주별 실시간 소통 및 협업 기능)
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 시스템 콘셉트 4개에서 6개로 확장 (휠체어 발주, 데모
                    시연 추가)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 기능을 &quot;개발 중&quot;에서 정식 기능으로 변경
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    워크플로우 설명을 일반 발주와 시연으로 분리
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    카테고리 분류 체계에서 휠체어 관련 내용 구체화
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    공통 컴포넌트 재사용으로 코드 중복 제거 및 일관성 향상
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    색상 테마 시스템으로 발주 유형별 시각적 구분 강화
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    반응형 디자인 및 모바일 환경 최적화
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    접근성 향상: 모든 입력 필드에 적절한 라벨 및 접근성 속성
                    추가
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    댓글 시스템 UI/UX 개선: 상대적 시간 표시, 수정 표시 기능
                  </li>
                </ul>
              </div>

              {/* 보안 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("보안")}
                  <h3 className="font-medium text-gray-900">보안</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    시연 시스템 권한별 상태 변경 제한 강화
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    휠체어 발주 시스템 창고 및 카테고리 접근 제한
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    팀 기반 데이터 격리 및 권한 관리 유지
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    댓글 시스템 보안: XSS 방지, 권한 기반 접근 제어
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.4.1 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.4.1
                  </h2>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-06-20
                </div>
              </div>
              <p className="mt-2 text-gray-600">업체관리 기능 접근 권한 확장</p>
            </div>
            <div className="p-6 space-y-6">
              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    업체관리 기능을 재고관리 탭으로 이동
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    기존 관리자 탭에서 재고관리 탭으로 메뉴 위치 변경
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    user, moderator 권한 사용자도 업체관리 기능 접근 가능하도록
                    권한 확장
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    접근 권한을 [&quot;user&quot;, &quot;admin&quot;,
                    &quot;moderator&quot;]로 설정
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    사용자 경험 향상: 일반 사용자와 1차승인권자도 업체관리 기능
                    이용 가능
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    메뉴 구조 개선: 업체관리 기능을 논리적으로 재고관리 탭에
                    배치
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.4.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.4.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-06-20
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                발주 상태 관리 및 재고 확인 시스템
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("추가됨")}
                  <h3 className="font-medium text-gray-900">추가됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 변경 시 권한별 제한 기능 구현
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    출고 관련 상태 변경 시 재고 확인 로직 추가
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 표시 개선 (아이콘 추가, UI 개선)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    서버 응답 호환성 개선 (&quot;주문 접수&quot; 문자열 처리)
                  </li>
                </ul>
              </div>

              {/* 변경됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("변경됨")}
                  <h3 className="font-medium text-gray-900">변경됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 수량 수정 로직 개선 (불필요한 재고 기록 생성 제거)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 변경 UI 개선 (권한에 따른 드롭다운 표시 제한)
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    캐시 무효화 로직 개선 (화면 반영 문제 해결)
                  </li>
                </ul>
              </div>

              {/* 수정됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("수정됨")}
                  <h3 className="font-medium text-gray-900">수정됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 수량 수정 시 2개씩 증가하는 중복 업데이트 문제 해결
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 수량 수정 후 화면에 반영되지 않는 캐시 동기화 문제 해결
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    발주 상태 변경 시 권한 제한이 적용되지 않는 문제 해결
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    &quot;주문 접수&quot; 상태 표시 오류 수정 (requested와 동일
                    처리)
                  </li>
                </ul>
              </div>

              {/* 개선됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("개선됨")}
                  <h3 className="font-medium text-gray-900">개선됨</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    사용자 경험 향상: 권한별 명확한 기능 제한으로 혼란 방지
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    성능 개선: 불필요한 재고 기록 생성 제거로 데이터베이스 부하
                    감소
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    UI/UX 개선: 상태별 아이콘과 직관적인 상태 표시
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    데이터 일관성: 올바른 캐시 무효화로 실시간 데이터 동기화
                    보장
                  </li>
                </ul>
              </div>

              {/* 보안 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
                  {getIconForType("보안")}
                  <h3 className="font-medium text-gray-900">보안</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    권한별 발주 상태 변경 제한으로 비즈니스 로직 보호
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    재고 확인 로직으로 출고 시 데이터 무결성 보장
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* v1.3.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.3.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-06-11
                </div>
              </div>
              <p className="mt-2 text-gray-600">입출고 관리 시스템 개선</p>
            </div>
            <div className="p-6 space-y-6">
              {/* 추가됨 */}
              <div>
                <div className="flex items-center mb-3 space-x-2">
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
                <div className="flex items-center mb-3 space-x-2">
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
                <div className="flex items-center mb-3 space-x-2">
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
                <div className="flex items-center mb-3 space-x-2">
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
                <div className="flex items-center mb-3 space-x-2">
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
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.2.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-05-31
                </div>
              </div>
              <p className="mt-2 text-gray-600">창고 접근 권한 관리 시스템</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                창고별 접근 권한 관리 기능, 사용자별 창고 제한 설정, 권한 기반
                데이터 필터링 등의 보안 강화 업데이트가 포함되었습니다.
              </div>
            </div>
          </div>

          {/* v1.1.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">v1.1.0</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-05-23
                </div>
              </div>
              <p className="mt-2 text-gray-600">발주 시스템 개선</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                발주 요청 후 부드러운 페이지 전환, 발주 상세 정보 확장 표시, UX
                개선 등이 포함되었습니다.
              </div>
            </div>
          </div>

          {/* v1.0.0 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    v1.0.0
                  </h2>
                  <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded bg-gold-100 text-gold-800">
                    초기 릴리즈
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 w-4 h-4" />
                  2025-04-29
                </div>
              </div>
              <p className="mt-2 text-gray-600">KARS 시스템 최초 출시</p>
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-600">
                재고 관리, 발주 관리, 패키지 관리, 사용자 관리 등 핵심 기능들이
                포함된 초기 버전입니다.
              </div>
            </div>
          </div>

          {/* 새로운 기능 소개 */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              🆕 새로운 기능 소개
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* 시연 시스템 */}
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="mb-3 text-lg font-semibold text-green-800">
                  🎯 시연 시스템
                </h3>
                <p className="mb-4 text-green-700">
                  제품 시연을 위한 전용 관리 시스템이 추가되었습니다. 일반
                  발주와 구분된 시연 전용 워크플로우로 효율적인 제품 시연 관리가
                  가능합니다.
                </p>
                <ul className="space-y-1 text-sm text-green-600">
                  <li>• 시연 요청부터 복귀까지 전체 프로세스 관리</li>
                  <li>• 시연 출고 시 자동 재고 차감 및 복귀 시 복구</li>
                  <li>• 시연 전용 상태 관리 (6단계)</li>
                  <li>• 팀별 데모 데이터 격리</li>
                </ul>
              </div>

              {/* 휠체어 발주 */}
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="mb-3 text-lg font-semibold text-purple-800">
                  🦽 휠체어 발주 시스템
                </h3>
                <p className="mb-4 text-purple-700">
                  휠체어 전용 창고와 카테고리로 제한된 전문 발주 시스템입니다.
                  보라색 테마로 일반 발주와 구분되어 사용하기 편리합니다.
                </p>
                <ul className="space-y-1 text-sm text-purple-600">
                  <li>• 휠체어 전용 창고로만 발주 제한</li>
                  <li>• 휠체어 관련 카테고리만 선택 가능</li>
                  <li>• 보라색 테마로 시각적 구분</li>
                  <li>• 기존 발주와 동일한 승인 워크플로우</li>
                </ul>
              </div>

              {/* 댓글 시스템 */}
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="mb-3 text-lg font-semibold text-blue-800">
                  💬 댓글 시스템
                </h3>
                <p className="mb-4 text-blue-700">
                  발주 기록에 대한 실시간 소통과 협업을 위한 댓글 기능이
                  추가되었습니다. 발주 관련 이슈나 질문에 즉시 피드백할 수
                  있습니다.
                </p>
                <ul className="space-y-1 text-sm text-blue-600">
                  <li>• 발주별 실시간 댓글 작성 및 관리</li>
                  <li>• 권한 기반 수정/삭제 (작성자 본인 + Admin)</li>
                  <li>• 상대적 시간 표시 (방금 전, N분 전 등)</li>
                  <li>• 수정된 댓글 &quot;(수정됨)&quot; 표시</li>
                </ul>
              </div>

              {/* 공통 컴포넌트 */}
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  🔧 공통 컴포넌트 시스템
                </h3>
                <p className="mb-4 text-gray-700">
                  발주 관련 폼의 재사용 가능한 컴포넌트들이 추가되어 일관된
                  사용자 경험을 제공합니다.
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 주소 검색, 파일 업로드 등 8개 공통 컴포넌트</li>
                  <li>• 테마별 색상 지원 (파란색, 보라색)</li>
                  <li>• 반응형 디자인 및 접근성 향상</li>
                  <li>• 코드 중복 제거 및 일관성 향상</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
