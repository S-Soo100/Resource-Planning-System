"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/store/authStore";
import { menuTabStore } from "@/store/menuTabStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBox,
  FaClipboardList,
  FaTruck,
  FaUser,
  FaQuestionCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  PiNewspaperClippingFill,
  // PiShoppingCartFill,
  PiHandCoinsFill,
  PiClipboardTextFill,
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
      onClick: () => checkAccess(`/stock`, ["admin", "user", "moderator", "supplier"]),
      accessLevel: ["user", "admin", "moderator", "supplier"],
    },
    {
      title: "입출고 내역",
      subtitle: "품목별 입출고 기록을 조회합니다",
      icon: <FaClipboardList className="text-3xl" />,
      onClick: () => checkAccess(`/ioHistory`, ["admin", "user", "moderator", "supplier"]),
      accessLevel: ["user", "admin", "moderator", "supplier"],
    },
    // {
    //   title: "품목 관리",
    //   subtitle: "품목 정보를 조회하고 관리합니다",
    //   icon: <PiPackageFill className="text-3xl" />,
    //   onClick: () => checkAccess(`/item`, ["admin", "user", "moderator"]),
    //   accessLevel: ["user", "admin", "moderator"],
    // },
    {
      title: "업체 관리",
      subtitle: "협력업체 정보를 등록하고 관리합니다",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/supplier`, ["admin", "user", "moderator", "supplier"]),
      accessLevel: ["user", "admin", "moderator", "supplier"],
    },
  ];

  // 발주 메뉴
  const orderMenuItems = [
    {
      title: "발주 시작하기",
      subtitle: "",
      icon: <FaTruck className="text-3xl" />,
      onClick: () =>
        checkAccess(`/order-guide`, ["admin", "user", "supplier", "moderator"]),
      accessLevel: ["supplier", "user", "admin", "moderator"],
    },
    // {
    //   title: "휠체어 발주",
    //   subtitle: "휠체어 품목을 발주합니다",
    //   icon: <FaTruck className="text-3xl" />,
    //   onClick: () =>
    //     checkAccess(`/orderWheelchair`, [
    //       "admin",
    //       "user",
    //       "supplier",
    //       "moderator",
    //     ]),
    //   accessLevel: ["supplier", "user", "admin", "moderator"],
    // },
    // {
    //   title: "패키지 발주",
    //   subtitle: "패키지 단위로 발주를 요청합니다",
    //   icon: <FaTruck className="text-3xl" />,
    //   onClick: () =>
    //     checkAccess(`/packageOrder`, [
    //       "admin",
    //       "user",
    //       "supplier",
    //       "moderator",
    //     ]),
    //   accessLevel: ["supplier", "user", "admin", "moderator"],
    // },
    // {
    //   title: "개별 품목 발주",
    //   subtitle: "개별 소모품류 발주를 요청합니다",
    //   icon: <PiShoppingCartFill className="text-3xl" />,
    //   onClick: () =>
    //     checkAccess(`/orderRequest`, [
    //       "admin",
    //       "user",
    //       "supplier",
    //       "moderator",
    //     ]),
    //   accessLevel: ["supplier", "user", "admin", "moderator"],
    // },
    {
      title: "발주 기록",
      subtitle: "발주건의 기록과 상태를 확인합니다",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () =>
        checkAccess(`/orderRecord`, ["admin", "user", "supplier", "moderator"]),
      accessLevel: ["supplier", "user", "admin", "moderator"],
    },
    {
      title: "시연 요청",
      subtitle: "시연품 출고를 요청합니다",
      icon: <PiHandCoinsFill className="text-3xl" />,
      onClick: () =>
        checkAccess(`/demonstration`, [
          "admin",
          "user",
          "supplier",
          "moderator",
        ]),
      accessLevel: ["supplier", "user", "admin", "moderator"],
    },
    {
      title: "시연 기록",
      subtitle: "시연품 출고 기록을 확인합니다",
      icon: <PiClipboardTextFill className="text-3xl" />,
      onClick: () =>
        checkAccess(`/demonstration-record`, [
          "admin",
          "user",
          "supplier",
          "moderator",
        ]),
      accessLevel: ["supplier", "user", "admin", "moderator"],
    },
  ];

  // 관리자 메뉴
  const adminMenuItems = [
    {
      title: "1. 전체 물품, 카테고리 등록",
      subtitle: "팀에서 사용하는 모든 카테고리와 품목을 관리합니다",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/team-items`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "2. 창고별 관리물품 등록",
      subtitle: "각 창고에 보관된 품목을 관리합니다",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/warehouse-items`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "3. 패키지 등록 및 관리",
      subtitle: "발주용 패키지를 구성하고 관리합니다",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/package`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
    {
      title: "4. 관리 - 팀멤버, 창고 관리",
      subtitle: "팀 구성원 추가, 창고 추가",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/admin`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
  ];

  // 탭 설정
  let tabs = [];

  // 모든 사용자에게 재고 관리와 발주 & 시연 탭 표시
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
      title: "발주 & 시연",
      items: orderMenuItems,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-500",
      iconBg: "bg-green-600",
      hoverBg: "hover:bg-green-50",
      hoverBorder: "hover:border-green-200",
    },
  ];

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

  // 리다이렉트 로직을 useEffect로 분리
  useEffect(() => {
    if (!userLoading && !categoriesLoading) {
      if (!user) {
        router.push("/signin");
        return;
      }

      if (!selectedTeam) {
        router.push("/team-select");
        return;
      }
    }
  }, [user, selectedTeam, userLoading, categoriesLoading, router]);

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

  // 로딩이 끝났는데 사용자나 팀이 없으면 null 반환 (리다이렉트 진행 중)
  if (!user || !selectedTeam) {
    return null;
  }

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="p-6">
      {/* 헤더 애니메이션 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center text-3xl font-bold text-gray-900"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <FaUser className="mr-3 text-blue-600" />
            </motion.div>
            {user.name}님, 환영합니다!
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-3 items-center"
          >
            {user.accessLevel !== "supplier" && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/calendar")}
                className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg transition-colors duration-200 hover:bg-green-100 shadow-sm hover:shadow-md"
              >
                <FaCalendarAlt className="text-lg" />
                캘린더
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/how-to-use")}
              className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors duration-200 hover:bg-blue-100 shadow-sm hover:shadow-md"
            >
              <FaQuestionCircle className="text-lg" />
              사용법 안내
            </motion.button>
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-2 text-lg text-gray-600"
        >
          팀: <span className="font-semibold">{selectedTeam.teamName}</span>
        </motion.p>
      </motion.div>

      {/* 탭 네비게이션 애니메이션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex p-1 mb-6 bg-gray-100 rounded-lg"
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200 relative overflow-hidden ${
              activeTab === tab.id
                ? `${tab.bgColor} ${tab.textColor} shadow-sm`
                : "text-gray-600 hover:text-gray-800 hover:bg-white"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-md -z-10"
                style={{ backgroundColor: tab.bgColor.replace('bg-', '') }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.title}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* 메뉴 아이템 그리드 애니메이션 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2"
        >
          {currentTab.items
            .filter((item) => item.accessLevel.includes(user.accessLevel))
            .map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.13,
                  delay: index * 0.033,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                whileHover={{
                  scale: 1.05,
                  rotate: [0, 1, -1, 0],
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={item.onClick}
                className={`cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-2xl ${currentTab.hoverBg} ${currentTab.hoverBorder} border-gray-200 relative overflow-hidden group`}
              >
                {/* 배경 그라데이션 효과 */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at top left, ${currentTab.bgColor.replace('bg-', '')}, transparent)`,
                  }}
                />

                <div className="flex items-center mb-4 relative z-10">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`p-3 rounded-lg ${currentTab.iconBg} text-white mr-4 shadow-lg`}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <motion.h3
                      className="text-xl font-semibold text-gray-800"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.title}
                    </motion.h3>
                  </div>
                </div>
                <motion.p
                  className="leading-relaxed text-gray-600 relative z-10"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  {item.subtitle}
                </motion.p>

                {/* 호버 시 빛나는 효과 */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${currentTab.iconBg.replace('bg-', '')}, transparent)`,
                  }}
                />
              </motion.div>
            ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MainMenu;
