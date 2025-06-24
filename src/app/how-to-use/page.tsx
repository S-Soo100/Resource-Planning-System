"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  FaArrowLeft,
  FaUser,
  FaShieldAlt,
  FaBox,
  FaTruck,
  FaClipboardList,
  FaCog,
  FaQuestionCircle,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  PiNewspaperClippingFill,
  PiShoppingCartFill,
  PiPackageFill,
  PiHandCoinsFill,
  PiClipboardTextFill,
} from "react-icons/pi";

const HowToUsePage = () => {
  const router = useRouter();
  const { user } = useCurrentUser();

  const accessLevelInfo = {
    admin: {
      title: "관리자",
      description: "시스템의 모든 기능에 대한 완전한 접근 권한",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      icon: <FaShieldAlt className="text-2xl" />,
    },
    moderator: {
      title: "1차승인권자",
      description: "관리자 권한의 제한된 버전, 주로 조회와 승인 기능",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      icon: <FaUser className="text-2xl" />,
    },
    user: {
      title: "일반 사용자",
      description: "기본적인 시스템 사용 권한, 관리 기능 제한",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: <FaUser className="text-2xl" />,
    },
    supplier: {
      title: "외부업체",
      description: "발주 관련 기능에만 제한된 접근 권한",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      icon: <FaTruck className="text-2xl" />,
    },
  };

  const features = [
    {
      category: "재고 관리",
      icon: <FaBox className="text-2xl" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        {
          title: "재고 조회",
          description: "창고별 재고 현황을 확인합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <FaBox className="text-lg" />,
        },
        {
          title: "재고 수량 수정",
          description: "재고 수량을 직접 수정합니다 (관리자만)",
          accessLevels: ["admin"],
          icon: <FaCog className="text-lg" />,
        },
        {
          title: "입출고 내역",
          description: "품목별 입출고 기록을 조회합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <FaClipboardList className="text-lg" />,
        },
        {
          title: "품목 관리",
          description: "품목 정보를 조회하고 관리합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <PiPackageFill className="text-lg" />,
        },
        {
          title: "업체 관리",
          description: "협력업체 정보를 등록하고 관리합니다",
          accessLevels: ["admin", "moderator"],
          icon: <PiNewspaperClippingFill className="text-lg" />,
        },
      ],
    },
    {
      category: "발주 & 시연",
      icon: <FaTruck className="text-2xl" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      items: [
        {
          title: "발주 시작하기",
          description: "발주가 처음이신가요? 가이드를 확인하세요",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <FaTruck className="text-lg" />,
        },
        {
          title: "패키지 발주",
          description: "패키지 단위로 발주를 요청합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <FaTruck className="text-lg" />,
        },
        {
          title: "개별 품목 발주",
          description: "개별 소모품류 발주를 요청합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <PiShoppingCartFill className="text-lg" />,
        },
        {
          title: "발주 기록",
          description: "발주건의 기록과 상태를 확인합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <PiNewspaperClippingFill className="text-lg" />,
        },
        {
          title: "시연 요청",
          description: "시연품 출고를 요청합니다 (관리자만) - 현재 개발 중",
          accessLevels: ["admin"],
          icon: <PiHandCoinsFill className="text-lg" />,
        },
        {
          title: "시연 기록",
          description:
            "시연품 출고 기록을 확인합니다 (관리자만) - 현재 개발 중",
          accessLevels: ["admin"],
          icon: <PiClipboardTextFill className="text-lg" />,
        },
      ],
    },
    {
      category: "관리",
      icon: <FaCog className="text-2xl" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        {
          title: "패키지 등록 및 관리",
          description: "발주용 패키지를 구성하고 관리합니다",
          accessLevels: ["admin", "moderator"],
          icon: <PiNewspaperClippingFill className="text-lg" />,
        },
        {
          title: "전체 물품, 카테고리 등록",
          description: "팀에서 사용하는 모든 카테고리와 품목을 관리합니다",
          accessLevels: ["admin", "moderator"],
          icon: <FaBox className="text-lg" />,
        },
        {
          title: "창고별 관리물품 등록",
          description: "각 창고에 보관된 품목을 관리합니다",
          accessLevels: ["admin", "moderator"],
          icon: <FaBox className="text-lg" />,
        },
        {
          title: "관리 - 팀멤버, 창고 관리",
          description: "팀 구성원 추가, 창고 추가",
          accessLevels: ["admin", "moderator"],
          icon: <PiNewspaperClippingFill className="text-lg" />,
        },
      ],
    },
  ];

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "admin":
        return <FaShieldAlt className="text-sm text-purple-600" />;
      case "moderator":
        return <FaUser className="text-sm text-blue-600" />;
      case "user":
        return <FaUser className="text-sm text-green-600" />;
      case "supplier":
        return <FaTruck className="text-sm text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container p-6 mx-auto max-w-6xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex gap-4 items-center mb-4">
          <button
            onClick={() => router.back()}
            className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg transition-colors duration-200 hover:bg-gray-200"
          >
            <FaArrowLeft />
            뒤로 가기
          </button>
        </div>
        <h1 className="flex items-center mb-2 text-3xl font-bold text-gray-900">
          <FaQuestionCircle className="mr-3 text-blue-600" />
          KARS 시스템 사용법 안내
        </h1>
        <p className="text-lg text-gray-600">
          KARS(Korea Auto Repair Shop)는 자동차 정비소를 위한 통합 재고 관리
          시스템입니다.
        </p>
      </div>

      {/* 현재 사용자 권한 정보 */}
      {user && (
        <div
          className={`mb-8 p-6 rounded-xl border-2 ${
            accessLevelInfo[user.accessLevel as keyof typeof accessLevelInfo]
              ?.bgColor
          } border-gray-200`}
        >
          <div className="flex gap-3 items-center mb-3">
            {
              accessLevelInfo[user.accessLevel as keyof typeof accessLevelInfo]
                ?.icon
            }
            <h2 className="text-xl font-semibold text-gray-800">
              현재 권한:{" "}
              {
                accessLevelInfo[
                  user.accessLevel as keyof typeof accessLevelInfo
                ]?.title
              }
            </h2>
          </div>
          <p className="text-gray-600">
            {
              accessLevelInfo[user.accessLevel as keyof typeof accessLevelInfo]
                ?.description
            }
          </p>
        </div>
      )}

      {/* 시스템 콘셉트 */}
      <div className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          🎯 KARS 시스템 콘셉트
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-4 text-center bg-white rounded-lg shadow-sm">
            <div className="mb-2 text-3xl">🏢</div>
            <h3 className="mb-2 font-semibold text-gray-800">팀 기반 관리</h3>
            <p className="text-sm text-gray-600">
              각 정비소는 독립적인 팀으로 관리되며, 팀별로 창고와 물품이 완전히
              격리됩니다.
            </p>
          </div>
          <div className="p-4 text-center bg-white rounded-lg shadow-sm">
            <div className="mb-2 text-3xl">📦</div>
            <h3 className="mb-2 font-semibold text-gray-800">통합 재고 관리</h3>
            <p className="text-sm text-gray-600">
              창고별 재고 현황을 실시간으로 확인하고, 입출고 이력을 체계적으로
              관리합니다.
            </p>
          </div>
          <div className="p-4 text-center bg-white rounded-lg shadow-sm">
            <div className="mb-2 text-3xl">🔄</div>
            <h3 className="mb-2 font-semibold text-gray-800">자동화된 발주</h3>
            <p className="text-sm text-gray-600">
              패키지 단위 발주와 개별 발주를 통해 효율적인 물품 공급을
              지원합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 창고 및 물품 관리 구조 */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          🏗️ 창고 및 물품 관리 구조
        </h2>

        {/* 전체 구조 다이어그램 */}
        <div className="p-6 mb-6 bg-gray-50 rounded-xl border-2 border-gray-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            전체 관리 구조
          </h3>
          <div className="flex flex-col items-center space-y-4">
            {/* 팀 레벨 */}
            <div className="p-4 w-full max-w-2xl text-center bg-blue-100 rounded-lg">
              <div className="text-lg font-semibold text-blue-800">
                🏢 팀 (정비소)
              </div>
              <div className="text-sm text-blue-600">
                예: 서울정비소, 부산정비소
              </div>
            </div>

            {/* 화살표 */}
            <div className="text-gray-400">↓</div>

            {/* 창고 레벨 */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-4xl md:grid-cols-3">
              <div className="p-4 text-center bg-green-100 rounded-lg">
                <div className="text-lg font-semibold text-green-800">
                  📦 창고 A
                </div>
                <div className="text-sm text-green-600">예: 부품창고</div>
              </div>
              <div className="p-4 text-center bg-green-100 rounded-lg">
                <div className="text-lg font-semibold text-green-800">
                  📦 창고 B
                </div>
                <div className="text-sm text-green-600">예: 소모품창고</div>
              </div>
              <div className="p-4 text-center bg-green-100 rounded-lg">
                <div className="text-lg font-semibold text-green-800">
                  📦 창고 C
                </div>
                <div className="text-sm text-green-600">예: 도구창고</div>
              </div>
            </div>

            {/* 화살표 */}
            <div className="text-gray-400">↓</div>

            {/* 카테고리 레벨 */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-6xl md:grid-cols-4">
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  🔧 엔진부품
                </div>
              </div>
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  🛞 브레이크부품
                </div>
              </div>
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  ⚡ 전기부품
                </div>
              </div>
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  🔧 소모품
                </div>
              </div>
            </div>

            {/* 화살표 */}
            <div className="text-gray-400">↓</div>

            {/* 물품 레벨 */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-6xl md:grid-cols-6">
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">
                  엔진오일
                </div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">
                  브레이크패드
                </div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">배터리</div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">필터</div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">와이어</div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">도구</div>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 분류 체계 */}
        <div className="p-6 mb-6 bg-orange-50 rounded-xl border-2 border-orange-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            📂 카테고리 분류 체계
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">
                🔧 엔진부품
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 엔진오일</li>
                <li>• 오일필터</li>
                <li>• 에어필터</li>
                <li>• 연료필터</li>
                <li>• 점화플러그</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">
                🛞 브레이크부품
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 브레이크패드</li>
                <li>• 브레이크디스크</li>
                <li>• 브레이크액</li>
                <li>• 브레이크호스</li>
                <li>• 캘리퍼</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">
                ⚡ 전기부품
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 배터리</li>
                <li>• 점화코일</li>
                <li>• 전구</li>
                <li>• 퓨즈</li>
                <li>• 릴레이</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">🔧 소모품</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 와이퍼</li>
                <li>• 와이퍼액</li>
                <li>• 세정액</li>
                <li>• 윤활유</li>
                <li>• 실리콘</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">🛠️ 도구</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 렌치세트</li>
                <li>• 소켓세트</li>
                <li>• 드라이버</li>
                <li>• 펜치</li>
                <li>• 해머</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">📦 기타</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 타이어</li>
                <li>• 휠</li>
                <li>• 범퍼</li>
                <li>• 미러</li>
                <li>• 안테나</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 물품 관리 프로세스 */}
        <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            🔄 물품 관리 프로세스
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📝</div>
              <h4 className="mb-2 font-semibold text-green-800">1. 등록</h4>
              <p className="text-sm text-gray-600">
                카테고리별로 물품을 등록하고 기본 정보 설정
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📦</div>
              <h4 className="mb-2 font-semibold text-green-800">
                2. 창고 배치
              </h4>
              <p className="text-sm text-gray-600">
                등록된 물품을 적절한 창고에 배치
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📊</div>
              <h4 className="mb-2 font-semibold text-green-800">
                3. 재고 관리
              </h4>
              <p className="text-sm text-gray-600">
                입출고를 통한 실시간 재고 수량 관리
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">🛒</div>
              <h4 className="mb-2 font-semibold text-green-800">4. 발주</h4>
              <p className="text-sm text-gray-600">
                재고 부족 시 패키지 또는 개별 발주
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 발주 시스템 안내 */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          🛒 발주 시스템 안내
        </h2>

        {/* 발주 콘셉트 */}
        <div className="p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            🎯 발주 시스템 콘셉트
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 text-center bg-white rounded-lg shadow-sm">
              <div className="mb-2 text-3xl">📦</div>
              <h4 className="mb-2 font-semibold text-green-800">패키지 발주</h4>
              <p className="text-sm text-gray-600">
                자주 사용되는 물품들을 미리 묶어서 한 번에 발주하는 효율적인
                방식
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg shadow-sm">
              <div className="mb-2 text-3xl">🛍️</div>
              <h4 className="mb-2 font-semibold text-green-800">개별 발주</h4>
              <p className="text-sm text-gray-600">
                특정 물품이 부족할 때 개별적으로 발주하는 유연한 방식
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg shadow-sm">
              <div className="mb-2 text-3xl">✅</div>
              <h4 className="mb-2 font-semibold text-green-800">
                승인 워크플로우
              </h4>
              <p className="text-sm text-gray-600">
                권한별로 구분된 승인 과정을 통한 체계적인 발주 관리
              </p>
            </div>
          </div>
        </div>

        {/* 패키지 개념 시각화 */}
        <div className="p-6 mb-6 bg-blue-50 rounded-xl border-2 border-blue-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            📦 패키지 개념 이해
          </h3>

          {/* 패키지 구조 다이어그램 */}
          <div className="mb-6">
            <h4 className="mb-3 font-semibold text-blue-800">패키지 구조</h4>
            <div className="flex flex-col items-center space-y-4">
              {/* 패키지 레벨 */}
              <div className="p-4 w-full max-w-4xl text-center bg-blue-100 rounded-lg border-2 border-blue-300">
                <div className="text-lg font-semibold text-blue-800">
                  📦 정기 정비 패키지
                </div>
                <div className="text-sm text-blue-600">
                  자주 사용되는 정기 정비용 물품들의 조합
                </div>
              </div>

              {/* 화살표 */}
              <div className="text-xl text-blue-400">↓</div>

              {/* 카테고리 그룹 */}
              <div className="grid grid-cols-1 gap-4 w-full max-w-6xl md:grid-cols-3">
                <div className="p-3 text-center bg-yellow-100 rounded-lg border border-yellow-300">
                  <div className="text-sm font-semibold text-yellow-800">
                    🔧 엔진부품 그룹
                  </div>
                </div>
                <div className="p-3 text-center bg-yellow-100 rounded-lg border border-yellow-300">
                  <div className="text-sm font-semibold text-yellow-800">
                    🛞 브레이크부품 그룹
                  </div>
                </div>
                <div className="p-3 text-center bg-yellow-100 rounded-lg border border-yellow-300">
                  <div className="text-sm font-semibold text-yellow-800">
                    🔧 소모품 그룹
                  </div>
                </div>
              </div>

              {/* 화살표 */}
              <div className="text-xl text-blue-400">↓</div>

              {/* 개별 물품들 */}
              <div className="grid grid-cols-1 gap-2 w-full max-w-6xl md:grid-cols-6">
                <div className="p-2 text-center bg-white rounded border border-gray-300">
                  <div className="text-xs font-medium text-gray-700">
                    엔진오일
                  </div>
                  <div className="text-xs text-gray-500">2개</div>
                </div>
                <div className="p-2 text-center bg-white rounded border border-gray-300">
                  <div className="text-xs font-medium text-gray-700">
                    오일필터
                  </div>
                  <div className="text-xs text-gray-500">2개</div>
                </div>
                <div className="p-2 text-center bg-white rounded border border-gray-300">
                  <div className="text-xs font-medium text-gray-700">
                    브레이크패드
                  </div>
                  <div className="text-xs text-gray-500">1세트</div>
                </div>
                <div className="p-2 text-center bg-white rounded border border-gray-300">
                  <div className="text-xs font-medium text-gray-700">
                    브레이크액
                  </div>
                  <div className="text-xs text-gray-500">1개</div>
                </div>
                <div className="p-2 text-center bg-white rounded border border-gray-300">
                  <div className="text-xs font-medium text-gray-700">
                    와이퍼
                  </div>
                  <div className="text-xs text-gray-500">1세트</div>
                </div>
                <div className="p-2 text-center bg-white rounded border border-gray-300">
                  <div className="text-xs font-medium text-gray-700">
                    세정액
                  </div>
                  <div className="text-xs text-gray-500">1개</div>
                </div>
              </div>
            </div>
          </div>

          {/* 패키지 예시 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="mb-2 font-semibold text-blue-800">
                🔧 정기 정비 패키지
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 엔진오일 (2개)</li>
                <li>• 오일필터 (2개)</li>
                <li>• 에어필터 (2개)</li>
                <li>• 브레이크패드 (1세트)</li>
                <li>• 브레이크액 (1개)</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="mb-2 font-semibold text-blue-800">
                🛞 브레이크 정비 패키지
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 브레이크패드 (2세트)</li>
                <li>• 브레이크디스크 (2개)</li>
                <li>• 브레이크액 (2개)</li>
                <li>• 브레이크호스 (2개)</li>
                <li>• 캘리퍼 (2개)</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="mb-2 font-semibold text-blue-800">
                ⚡ 전기 정비 패키지
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 배터리 (1개)</li>
                <li>• 점화코일 (4개)</li>
                <li>• 점화플러그 (4개)</li>
                <li>• 전구 세트 (1세트)</li>
                <li>• 퓨즈 세트 (1세트)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 발주 워크플로우 상세 */}
        <div className="p-6 mb-6 bg-purple-50 rounded-xl border-2 border-purple-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            🔄 발주 워크플로우 상세
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl">1️⃣</div>
              <div>
                <h4 className="font-semibold text-purple-800">발주 요청</h4>
                <p className="text-sm text-gray-600">
                  사용자가 패키지 또는 개별 물품 발주를 요청합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl">2️⃣</div>
              <div>
                <h4 className="font-semibold text-purple-800">
                  1차 승인 (1차승인권자)
                </h4>
                <p className="text-sm text-gray-600">
                  1차승인권자가 발주 요청을 검토하고 승인 또는 거부합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl">3️⃣</div>
              <div>
                <h4 className="font-semibold text-purple-800">
                  출고 확인 (관리자)
                </h4>
                <p className="text-sm text-gray-600">
                  관리자가 재고를 확인하고 출고를 진행합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl">4️⃣</div>
              <div>
                <h4 className="font-semibold text-purple-800">배송 완료</h4>
                <p className="text-sm text-gray-600">
                  물품이 배송되어 발주가 완료됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 권한 레벨 설명 */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          권한 레벨별 기능
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(accessLevelInfo).map(([key, info]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 ${info.bgColor} border-gray-200`}
            >
              <div className="flex gap-2 items-center mb-2">
                {info.icon}
                <h3 className={`font-semibold ${info.color}`}>{info.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 기능별 상세 설명 */}
      <div className="space-y-8">
        {features.map((feature) => (
          <div
            key={feature.category}
            className="overflow-hidden rounded-xl border-2 border-gray-200"
          >
            <div className={`p-4 ${feature.bgColor}`}>
              <div className="flex gap-3 items-center">
                <div className={feature.color}>{feature.icon}</div>
                <h2 className="text-xl font-bold text-gray-800">
                  {feature.category}
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {feature.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 transition-shadow duration-200 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-2 items-center">
                        <div className="text-gray-600">{item.icon}</div>
                        <h3 className="font-semibold text-gray-800">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item.accessLevels.map((level) => (
                        <span
                          key={level}
                          className="inline-flex gap-1 items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
                        >
                          {getAccessLevelIcon(level)}
                          {
                            accessLevelInfo[
                              level as keyof typeof accessLevelInfo
                            ]?.title
                          }
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 주요 제한사항 */}
      <div className="p-6 mt-8 bg-yellow-50 rounded-xl border-2 border-yellow-200">
        <div className="flex gap-2 items-center mb-4">
          <FaExclamationTriangle className="text-xl text-yellow-600" />
          <h2 className="text-xl font-bold text-gray-800">주요 제한사항</h2>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2 items-start">
            <FaTimes className="flex-shrink-0 mt-1 text-red-500" />
            <p className="text-gray-700">
              <strong>1차승인권자(Moderator)</strong>: 재고 수량 직접 수정 불가,
              팀 멤버 추가 기능 사용 불가
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <FaTimes className="flex-shrink-0 mt-1 text-red-500" />
            <p className="text-gray-700">
              <strong>일반 사용자(User)</strong>: 관리 기능 접근 불가, 발주 상태
              변경 불가
            </p>
          </div>
          <div className="flex gap-2 items-start">
            <FaTimes className="flex-shrink-0 mt-1 text-red-500" />
            <p className="text-gray-700">
              <strong>외부업체(Supplier)</strong>: 내부 관리 기능 접근 불가,
              발주 상태 변경 불가
            </p>
          </div>
        </div>
      </div>

      {/* 발주 워크플로우 */}
      <div className="p-6 mt-8 bg-blue-50 rounded-xl border-2 border-blue-200">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          발주 워크플로우
        </h2>
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="px-3 py-1 text-blue-800 bg-blue-100 rounded-full">
            요청됨
          </span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1 text-yellow-800 bg-yellow-100 rounded-full">
            승인/거부
          </span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1 text-green-800 bg-green-100 rounded-full">
            출고 확인
          </span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1 text-purple-800 bg-purple-100 rounded-full">
            배송 완료
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600">
          권한에 따라 상태 변경이 제한됩니다. 1차승인권자는 초기 승인만,
          관리자는 출고 단계만 담당합니다.
        </p>
      </div>

      {/* 도움말 */}
      <div className="p-6 mt-8 bg-gray-50 rounded-xl border-2 border-gray-200">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          도움이 필요하신가요?
        </h2>
        <div className="space-y-2 text-gray-600">
          <p>
            • 각 메뉴의 물음표 아이콘을 클릭하면 상세한 사용법을 확인할 수
            있습니다.
          </p>
          <p>• 권한 관련 문제가 있다면 관리자에게 문의하세요.</p>
          <p>• 시스템 오류나 버그 발견 시 즉시 관리자에게 보고해주세요.</p>
          <p>
            • <strong>시연 관련 기능</strong>은 현재 개발 중이며, 추후
            업데이트를 통해 제공될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToUsePage;
