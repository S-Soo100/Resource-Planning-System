/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaBox,
  FaClipboardList,
  FaTruckLoading,
  // FaWarehouse,
} from "react-icons/fa";
import { MdOutlineInventory } from "react-icons/md";
import { PiNewspaperClippingFill } from "react-icons/pi";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const MainMenuComponent = () => {
  const router = useRouter();
  const { user } = useCurrentUser();
  // 활성화된 탭 상태 추가
  const [activeTab, setActiveTab] = useState(
    user?.accessLevel === "supplier" ? "order" : "stock"
  );

  // 권한 체크 함수
  const checkAccess = (
    path: string,
    requiredLevel:
      | "admin"
      | "user"
      | "supplier"
      | "moderator"
      | ("admin" | "user" | "supplier" | "moderator")[]
  ) => {
    if (Array.isArray(requiredLevel)) {
      if (
        !requiredLevel.includes(
          user?.accessLevel as "admin" | "user" | "supplier" | "moderator"
        )
      ) {
        const roles = requiredLevel
          .map((level) => {
            const roleMap = {
              admin: "관리자",
              user: "일반 사용자",
              supplier: "공급자",
              moderator: "중재자",
            };
            return roleMap[level];
          })
          .join(" 또는 ");
        alert(
          `죄송합니다. ${roles} 권한이 필요한 기능입니다.\n\n현재 계정으로는 해당 기능을 사용할 수 없습니다.`
        );
        return;
      }
    } else {
      if (user?.accessLevel !== requiredLevel) {
        const roleMap = {
          admin: "관리자",
          user: "일반 사용자",
          supplier: "공급자",
          moderator: "중재자",
        };
        alert(
          `죄송합니다. ${roleMap[requiredLevel]} 권한이 필요한 기능입니다.\n\n현재 계정으로는 해당 기능을 사용할 수 없습니다.`
        );
        return;
      }
    }
    router.push(path);
  };

  // 재고 관련 메뉴
  const stockMenuItems = [
    {
      title: "재고 조회",
      subtitle: "창고별, 상품별 재고 현황을 확인합니다",
      icon: <MdOutlineInventory className="text-3xl" />,
      onClick: () => checkAccess(`/stock`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
    {
      title: "재고 입출고 기록 조회",
      subtitle: "재고 입/출고 이력을 날짜별로 확인합니다",
      icon: <FaClipboardList className="text-3xl" />,
      onClick: () => checkAccess(`/ioHistory`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
  ];

  // 발주-출고 관련 메뉴
  const orderMenuItems = [
    {
      title: "패키지 출고 요청",
      subtitle: "미리 구성된 패키지로 출고를 요청합니다",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () =>
        checkAccess(`/packageOrder`, [
          "admin",
          "user",
          "supplier",
          "moderator",
        ]),
      accessLevel: ["supplier", "user", "admin", "moderator"],
    },
    {
      title: "개별 품목 출고 요청",
      subtitle: "개별 품목을 선택하여 출고를 요청합니다",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () =>
        checkAccess(`/orderRequest`, [
          "admin",
          "user",
          "supplier",
          "moderator",
        ]),
      accessLevel: ["supplier", "user", "admin", "moderator"],
    },
    {
      title: "발주 기록 확인",
      subtitle: "이전 출고 요청 및 처리 상태를 확인합니다",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () =>
        checkAccess(`/orderRecord`, ["admin", "user", "supplier", "moderator"]),
      accessLevel: ["supplier", "user", "admin", "moderator"],
    },
  ];

  // 관리자 메뉴
  const adminMenuItems = [
    {
      title: "업체 관리",
      subtitle: "협력업체 정보를 등록하고 관리합니다",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/supplier`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
    {
      title: "패키지 관리",
      subtitle: "출고용 패키지를 구성하고 관리합니다",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/package`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
    {
      title: "관리 - 창고별 품목 관리",
      subtitle: "각 창고에 보관된 품목을 관리합니다",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/warehouse-items`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "관리 - 전체 품목 관리",
      subtitle: "팀에서 사용하는 모든 품목을 관리합니다",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/team-items`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "관리 - 팀 관리",
      subtitle: "팀 구성원과 권한을 관리합니다",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/admin`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
  ];

  // 탭 설정
  let tabs = [];

  // supplier인 경우 '발주 및 출고' 탭만 표시
  if (user?.accessLevel === "supplier") {
    tabs = [
      {
        id: "order",
        title: "발주 및 출고",
        items: orderMenuItems,
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-500",
        iconBg: "bg-green-600",
        hoverBg: "hover:bg-green-50",
        hoverBorder: "hover:border-green-200",
      },
    ];
  } else {
    // supplier가 아닌 경우 기존 탭 설정
    tabs = [
      {
        id: "stock",
        title: "재고 관리",
        items: stockMenuItems,
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        borderColor: "border-blue-500",
        iconBg: "bg-blue-600",
        hoverBg: "hover:bg-blue-50",
        hoverBorder: "hover:border-blue-200",
      },
      {
        id: "order",
        title: "발주 및 출고",
        items: orderMenuItems,
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-500",
        iconBg: "bg-green-600",
        hoverBg: "hover:bg-green-50",
        hoverBorder: "hover:border-green-200",
      },
    ];
  }

  // 관리자 또는 중재자인 경우 관리자 탭 추가
  if (user?.accessLevel === "admin" || user?.accessLevel === "moderator") {
    tabs.push({
      id: "admin",
      title: "시스템 관리",
      items: adminMenuItems,
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-500",
      iconBg: "bg-red-600",
      hoverBg: "hover:bg-red-50",
      hoverBorder: "hover:border-red-200",
    });
  }

  // 메뉴 카드 렌더링 함수
  const renderMenuCards = (items: any, tabConfig: any) => {
    return items.map((item: any, index: number) => {
      const hasAccess =
        user?.accessLevel && item.accessLevel.includes(user.accessLevel);

      // 어드민 전용 메뉴 여부 확인
      const isAdminOnly =
        item.accessLevel.length === 1 && item.accessLevel[0] === "admin";

      return (
        <div
          key={index}
          onClick={item.onClick}
          className={`cursor-pointer flex items-start p-4 bg-white rounded-lg border border-gray-200 shadow-sm 
            ${
              hasAccess
                ? `${tabConfig.hoverBg} ${tabConfig.hoverBorder} hover:shadow-md`
                : "opacity-60"
            } 
            transition-all duration-300`}
        >
          <div
            className={`flex-shrink-0 flex items-center justify-center w-12 h-12 text-white ${tabConfig.iconBg} rounded-lg shadow-sm mr-4`}
          >
            {React.cloneElement(item.icon, { className: "text-xl" })}
          </div>

          <div className="flex-1">
            <h3 className={`text-sm font-bold mb-1 ${tabConfig.textColor}`}>
              {item.title}
            </h3>
            <p className="text-xs text-gray-600 mb-1 line-clamp-2">
              {item.subtitle}
            </p>

            {isAdminOnly && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                관리자 전용
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  // 현재 활성화된 탭 찾기
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Menu Body */}
      <main className="container mx-auto p-4">
        {/* 거래처 계정 환영 메시지 */}
        {user?.accessLevel === "supplier" && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-green-500">
            <p className="text-gray-700">
              안녕하세요 <span className="font-bold">{user.name}</span>님,{" "}
              <span className="font-bold">
                {user.teams && user.teams.length > 0
                  ? user.teams[0].teamName
                  : ""}
              </span>
              에게 발주를 요청할 수 있습니다.
            </p>
          </div>
        )}
        {/* 탭 네비게이션 */}
        {user?.accessLevel !== "supplier" && (
          <div className="flex justify-center mb-6 bg-white rounded-lg shadow-sm overflow-x-auto">
            <div className="flex w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 whitespace-nowrap px-5 py-3.5 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `${tab.bgColor} ${tab.textColor} border-b-3 ${tab.borderColor}`
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 현재 선택된 탭의 메뉴 카드 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {user?.accessLevel !== "supplier" && (
            <h2
              className={`text-xl font-bold mb-6 pb-2 border-b ${activeTabConfig.borderColor} ${activeTabConfig.textColor}`}
            >
              {activeTabConfig.title}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {renderMenuCards(activeTabConfig.items, activeTabConfig)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainMenuComponent;
