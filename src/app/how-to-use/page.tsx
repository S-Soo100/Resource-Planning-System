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
} from "react-icons/fa";
import {
  PiNewspaperClippingFill,
  // PiShoppingCartFill,
  PiHandCoinsFill,
  PiClipboardTextFill,
} from "react-icons/pi";
import { Accessibility } from "lucide-react";

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
        // {
        //   title: "품목 관리",
        //   description: "품목 정보를 조회하고 관리합니다",
        //   accessLevels: ["admin", "moderator", "user", "supplier"],
        //   icon: <PiPackageFill className="text-lg" />,
        // },
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
          title: "휠리엑스 패키지 발주",
          description: "미리 구성된 패키지 단위로 발주를 요청합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <FaTruck className="text-lg" />,
        },
        {
          title: "휠체어 발주",
          description: "휠체어 전용 품목을 선택하여 발주합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <Accessibility className="text-lg" />,
        },
        {
          title: "개별 품목 발주",
          description: "원하는 품목을 개별적으로 선택하여 발주합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <FaBox className="text-lg" />,
        },
        {
          title: "발주 기록",
          description: "발주건의 기록과 상태를 확인합니다",
          accessLevels: ["admin", "moderator", "user", "supplier"],
          icon: <PiNewspaperClippingFill className="text-lg" />,
        },
        {
          title: "시연 요청",
          description: "제품 시연을 위한 전용 발주를 요청합니다",
          accessLevels: ["admin", "moderator", "user"],
          icon: <PiHandCoinsFill className="text-lg" />,
        },
        {
          title: "시연 기록",
          description: "시연품 출고 및 복귀 기록을 확인합니다",
          accessLevels: ["admin", "moderator", "user"],
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
          KARS(Kangsters Auto Resource-management System)는 다양한 품목을
          효율적으로 분류하고 자동으로 재고 관리 하기 위한 통합 재고 관리
          시스템입니다. v1.5.0부터 시연 시스템과 휠체어 전용 발주 기능이
          추가되었습니다.
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
              발주 물품은 자동으로 재고에 반영되며, 이메일로 상세히
              안내해줍니다.
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
                🏢 팀 (기업)
              </div>
              <div className="text-sm text-blue-600">
                예: 캥스터즈, 에어패스 등
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
                <div className="text-sm text-green-600">
                  예: 안산 연구소 창고
                </div>
              </div>
              <div className="p-4 text-center bg-green-100 rounded-lg">
                <div className="text-lg font-semibold text-green-800">
                  📦 창고 B
                </div>
                <div className="text-sm text-green-600">예: 미국 현지 창고</div>
              </div>
              <div className="p-4 text-center bg-green-100 rounded-lg">
                <div className="text-lg font-semibold text-green-800">
                  📦 창고 C
                </div>
                <div className="text-sm text-green-600">
                  예: 기업 시연품 창고
                </div>
              </div>
            </div>

            {/* 화살표 */}
            <div className="text-gray-400">↓</div>

            {/* 카테고리 레벨 */}
            <div className="grid grid-cols-1 gap-4 w-full max-w-6xl md:grid-cols-4">
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  🔧 하드웨어 생산품
                </div>
              </div>
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  🛞 휠체어 등 유통품
                </div>
              </div>
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  ⚡ TV, 컴퓨터 등 전자제품
                </div>
              </div>
              <div className="p-3 text-center bg-yellow-100 rounded-lg">
                <div className="text-sm font-semibold text-yellow-800">
                  🔧 시연 전용 물품(별도 관리품)
                </div>
              </div>
            </div>

            {/* 화살표 */}
            <div className="text-gray-400">↓</div>

            {/* 물품 레벨 */}
            <div className="grid grid-cols-1 gap-2 w-full max-w-6xl md:grid-cols-6">
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">
                  트레드밀
                </div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">휠체어</div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">센서</div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">
                  키오스크
                </div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">
                  악세사리
                </div>
              </div>
              <div className="p-2 text-center bg-white rounded border border-gray-300">
                <div className="text-xs font-medium text-gray-700">
                  소모품류
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 분류 체계 */}
        <div className="p-6 mb-6 bg-orange-50 rounded-xl border-2 border-orange-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            📂 카테고리 분류 체계 (예시)
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">
                🔧 메인 컨트롤러
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 트레드밀 제품군</li>
                <li>• 자체 센서 제품군</li>
                <li>• 기타 메인 컨트롤러 제품군</li>
                {/* <li>• 연료필터</li>
                <li>• 점화플러그</li> */}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">🛞 휠체어</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• K-MS2 휠체어 본체</li>
                <li>• K-MS2 휠체어 옵션품</li>
                <li>• 휠체어 악세사리</li>
                <li>• 쿠션, 벨트 등 부가품</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="mb-2 font-semibold text-orange-800">
                ⚡ 전기부품
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 모니터</li>
                <li>• TV</li>
                <li>• 키오스크</li>
                {/* <li>• 퓨즈</li>
                <li>• 릴레이</li> */}
              </ul>
            </div>
            {/* <div className="p-4 bg-white rounded-lg border border-orange-200">
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
            </div> */}
          </div>
        </div>

        {/* 물품 관리 프로세스 */}
        <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            🔄 물품 관리 프로세스
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📂</div>
              <h4 className="mb-2 font-semibold text-green-800">
                1. 카테고리 등록
              </h4>
              <p className="text-sm text-gray-600">
                물품 분류를 위한 카테고리를 먼저 등록
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📝</div>
              <h4 className="mb-2 font-semibold text-green-800">
                2. 품목 등록
              </h4>
              <p className="text-sm text-gray-600">
                카테고리별로 품목을 등록하고 기본 정보 설정
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">🏢</div>
              <h4 className="mb-2 font-semibold text-green-800">
                3. 창고 선택
              </h4>
              <p className="text-sm text-gray-600">
                품목을 보관할 적절한 창고를 선택 혹은 창고 생성
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📦</div>
              <h4 className="mb-2 font-semibold text-green-800">
                4. 창고 관리 품목으로 추가
              </h4>
              <p className="text-sm text-gray-600">
                선택한 창고에 품목을 관리 품목으로 등록
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📊</div>
              <h4 className="mb-2 font-semibold text-green-800">
                5. 재고 관리
              </h4>
              <p className="text-sm text-gray-600">
                입출고를 통한 실시간 재고 수량 관리
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">📋</div>
              <h4 className="mb-2 font-semibold text-green-800">
                6. 패키지 생성 및 구성
              </h4>
              <p className="text-sm text-gray-600">
                자주 사용되는 품목들을 패키지로 구성하여 발주 효율성 증대
              </p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg border border-green-200">
              <div className="mb-2 text-2xl">🛒</div>
              <h4 className="mb-2 font-semibold text-green-800">
                7. 발주 및 시연
              </h4>
              <p className="text-sm text-gray-600">
                패키지/개별/휠체어 발주 또는 시연을 통해 물품 출고를 정확히
                기록하고 재고에 반영
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 발주 시스템 */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          📋 발주 시스템
        </h2>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-3 text-xl font-semibold text-gray-700">
            발주 시스템 개요
          </h3>
          <p className="mb-4 text-gray-600">
            KARS의 발주 시스템은 다양한 유형의 발주를 지원하는 통합 관리
            시스템입니다. 개별 품목 발주, 패키지 발주, 휠체어 전용 발주, 그리고
            제품 시연을 위한 시연 시스템까지 모든 발주 프로세스를 효율적으로
            관리할 수 있습니다.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 일반 발주 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="mb-2 text-lg font-semibold text-blue-800">
                🛒 일반 발주
              </h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• 개별 품목 및 패키지 발주</li>
                <li>• 실시간 재고 확인</li>
                <li>• 권한별 승인 워크플로우</li>
                <li>• 댓글을 통한 소통 및 협업</li>
                <li>• 파일 첨부 지원</li>
              </ul>
            </div>

            {/* 휠체어 발주 */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="mb-2 text-lg font-semibold text-purple-800">
                🦽 휠체어 발주
              </h4>
              <ul className="space-y-1 text-sm text-purple-700">
                <li>• 휠체어 전용 창고로 제한</li>
                <li>• 휠체어 관련 카테고리만 선택</li>
                <li>• 보라색 테마로 구분</li>
                <li>• 일반 발주와 동일한 워크플로우</li>
                <li>• 댓글 시스템 지원</li>
              </ul>
            </div>

            {/* 시연 시스템 */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="mb-2 text-lg font-semibold text-green-800">
                🎯 시연 시스템
              </h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• 제품 시연 전용 프로세스</li>
                <li>• 시연 출고 시 자동 재고 차감</li>
                <li>• 시연 완료 후 재고 자동 복구</li>
                <li>• 시연 전용 상태 관리</li>
                <li>• 댓글을 통한 시연 피드백</li>
              </ul>
            </div>

            {/* 공통 기능 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="mb-2 text-lg font-semibold text-gray-800">
                🔧 공통 기능
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• 주소 검색 및 입력</li>
                <li>• 파일 업로드 (50MB 이하)</li>
                <li>• 담당자 정보 관리</li>
                <li>• 실시간 상태 추적</li>
                <li>• 권한별 접근 제어</li>
              </ul>
            </div>
          </div>
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

      {/* 발주 워크플로우 요약 */}
      <div className="mt-8 space-y-6">
        {/* 일반 발주 워크플로우 */}
        <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            📦 일반 발주 워크플로우
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

        {/* 시연 워크플로우 */}
        <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            🎭 시연 워크플로우
          </h2>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="px-3 py-1 text-blue-800 bg-blue-100 rounded-full">
              시연 요청
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 text-yellow-800 bg-yellow-100 rounded-full">
              시연 승인
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 text-green-800 bg-green-100 rounded-full">
              시연팀 확인
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 text-orange-800 bg-orange-100 rounded-full">
              시연 출고
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 text-purple-800 bg-purple-100 rounded-full">
              시연 복귀
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            시연은 일반 발주와 별도로 관리되며, 출고 후 반드시 복귀 처리가
            필요합니다. 재고는 시연 출고 시 차감되고 복귀 시 다시 복구됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowToUsePage;
