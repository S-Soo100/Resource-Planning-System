"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/store/authStore";
import { menuTabStore } from "@/store/menuTabStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";
import { FaBox, FaClipboardList, FaTruck, FaUser } from "react-icons/fa";
import {
  PiNewspaperClippingFill,
  PiShoppingCartFill,
  PiPackageFill,
} from "react-icons/pi";
import { useCategory } from "@/hooks/useCategory";

const MainMenu = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();
  const selectedTeam = authStore((state) => state.selectedTeam);

  // 탭 상태 관리를 menuTabStore로 변경
  const { activeTab, setActiveTab, setTabForUser } = menuTabStore();

  // 새로운 useCategory 훅 사용
  const { isLoading: categoriesLoading } = useCategory(selectedTeam?.id);

  // 사용자 권한에 따른 탭 설정 (최초 로드 시에만)
  useEffect(() => {
    if (user?.accessLevel) {
      setTabForUser(user.accessLevel);
    }
  }, [user?.accessLevel, setTabForUser]);

  // 권한 체크 함수
  const checkAccess = (
    path: string,
    allowedAccessLevels: string[]
  ): boolean => {
    if (!user || !allowedAccessLevels.includes(user.accessLevel)) {
      toast.error(`접근 권한이 없습니다. (${user?.accessLevel || "미인증"})`);
      return false;
    }
    router.push(path);
    return true;
  };

  // 재고 관리 메뉴
  const stockMenuItems = [
    {
      title: "재고 조회",
      subtitle: "창고별 재고 현황을 확인합니다",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/stock`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
    {
      title: "입출고 내역",
      subtitle: "품목별 입출고 기록을 조회합니다",
      icon: <FaClipboardList className="text-3xl" />,
      onClick: () => checkAccess(`/ioHistory`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
    {
      title: "품목 관리",
      subtitle: "품목 정보를 조회하고 관리합니다",
      icon: <PiPackageFill className="text-3xl" />,
      onClick: () => checkAccess(`/item`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
  ];

  // 발주 메뉴
  const orderMenuItems = [
    {
      title: "패키지 발주",
      subtitle: "패키지 단위로 발주를 요청합니다",
      icon: <FaTruck className="text-3xl" />,
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
      title: "개별 품목 발주",
      subtitle: "개별 소모품류 발주를 요청합니다",
      icon: <PiShoppingCartFill className="text-3xl" />,
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
      title: "발주 기록",
      subtitle: "발주건의 기록과 상태를 확인합니다",
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
      subtitle: "발주용 패키지를 구성하고 관리합니다",
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
      title: "관리 - 카테고리 및 품목 관리",
      subtitle: "팀에서 사용하는 모든 카테고리와 품목을 관리합니다",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/team-items`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "관리 - 팀멤버, 창고 관리",
      subtitle: "팀 구성원 추가, 창고 추가",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/admin`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
  ];

  // 탭 설정
  let tabs = [];

  // supplier인 경우 '발주' 탭만 표시
  if (user?.accessLevel === "supplier") {
    tabs = [
      {
        id: "order",
        title: "발주",
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
        title: "발주",
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

  // 관리자 또는 1차 승인권자인 경우 관리자 탭 추가
  if (user?.accessLevel === "admin" || user?.accessLevel === "moderator") {
    tabs.push({
      id: "admin",
      title: "관리",
      items: adminMenuItems,
      bgColor: "bg-purple-50",
      textColor: "text-purple-800",
      borderColor: "border-purple-500",
      iconBg: "bg-purple-600",
      hoverBg: "hover:bg-purple-50",
      hoverBorder: "hover:border-purple-200",
    });
  }

  if (userLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  if (!selectedTeam) {
    router.push("/team-select");
    return null;
  }

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="container p-6 mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="flex items-center text-3xl font-bold text-gray-900">
          <FaUser className="mr-3 text-blue-600" />
          {user.name}님, 환영합니다!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          팀: <span className="font-semibold">{selectedTeam.teamName}</span>
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex p-1 mb-6 bg-gray-100 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? `${tab.bgColor} ${tab.textColor} shadow-sm`
                : "text-gray-600 hover:text-gray-800 hover:bg-white"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* 메뉴 아이템 그리드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentTab.items
          .filter((item) => item.accessLevel.includes(user.accessLevel))
          .map((item, index) => (
            <div
              key={index}
              onClick={item.onClick}
              className={`cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${currentTab.hoverBg} ${currentTab.hoverBorder} border-gray-200`}
            >
              <div className="flex items-center mb-4">
                <div
                  className={`p-3 rounded-lg ${currentTab.iconBg} text-white mr-4`}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.title}
                  </h3>
                </div>
              </div>
              <p className="leading-relaxed text-gray-600">{item.subtitle}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MainMenu;
