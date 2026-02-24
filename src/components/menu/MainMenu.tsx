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
  FaChartLine,
  FaLock,
  FaUsers,
  FaWarehouse,
  FaBuilding,
} from "react-icons/fa";
import {
  PiNewspaperClippingFill,
  // PiShoppingCartFill,
  PiHandCoinsFill,
  PiClipboardTextFill,
} from "react-icons/pi";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { MdPointOfSale, MdAnalytics } from "react-icons/md";
import { useCategory } from "@/hooks/useCategory";
import { LoadingCentered } from "@/components/ui/Loading";

const MainMenu = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useCurrentUser();
  const selectedTeam = authStore((state) => state.selectedTeam);

  // 탭 상태 관리를 menuTabStore로 변경
  const { activeTab, setActiveTab, setTabForUser } = menuTabStore();

  // 새로운 useCategory 훅 사용
  const { isLoading: categoriesLoading } = useCategory(selectedTeam?.id);

  // 3D 기울이기 효과를 위한 상태
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  // 마우스 이동 핸들러
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, cardIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setHoveredCard(cardIndex);
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  // 사용자 권한에 따른 탭 유효성 검사 및 설정
  useEffect(() => {
    if (user?.accessLevel) {
      // 현재 선택된 탭이 권한에 맞지 않으면 기본 탭으로 변경
      // 권한에 맞으면 localStorage에 저장된 탭 유지
      setTabForUser(user.accessLevel);
    }
  }, [user?.accessLevel, setTabForUser]);

  // 권한 레벨을 한글로 변환하는 함수
  const formatAccessLevel = (accessLevels: string[]): string => {
    const levelMap: Record<string, string> = {
      admin: "관리자",
      moderator: "중급 관리자",
      user: "일반 사용자",
      supplier: "공급업체",
    };

    // 권한 레벨을 우선순위 순으로 정렬 (admin > moderator > user > supplier)
    const priority = ["admin", "moderator", "user", "supplier"];
    const sortedLevels = accessLevels.sort(
      (a, b) => priority.indexOf(a) - priority.indexOf(b)
    );

    // 최소 권한 레벨 표시
    const lowestLevel = sortedLevels[sortedLevels.length - 1];

    if (sortedLevels.length === 1) {
      return `${levelMap[lowestLevel]} 전용`;
    }

    // 여러 권한이 있을 경우 "최소 권한" 이상 표시
    return `${levelMap[lowestLevel]} 이상`;
  };

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
      onClick: () => checkAccess(`/ioHistory`, ["admin", "user", "moderator"]),
      accessLevel: ["user", "admin", "moderator"],
    },
  ];

  // 고객 관리 메뉴
  const customerMenuItems = [
    {
      title: "고객 관리",
      subtitle: "고객 정보를 등록하고 관리합니다",
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
          "moderator",
        ]),
      accessLevel: ["user", "admin", "moderator"],
    },
    {
      title: "시연 기록",
      subtitle: "시연품 출고 기록을 확인합니다",
      icon: <PiClipboardTextFill className="text-3xl" />,
      onClick: () =>
        checkAccess(`/demonstration-record`, [
          "admin",
          "user",
          "moderator",
        ]),
      accessLevel: ["user", "admin", "moderator"],
    },
  ];

  // 판매&구매 분석 메뉴
  const analyticsMenuItems = [
    {
      title: "구매 내역",
      subtitle: "입고 기반 구매 현황을 분석합니다",
      icon: <BiSolidPurchaseTag className="text-3xl" />,
      onClick: () => checkAccess(`/purchase`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "판매 & 마진 분석",
      subtitle: "발주 기반 판매 현황 및 마진율을 분석합니다",
      icon: <MdPointOfSale className="text-3xl" />,
      onClick: () => checkAccess(`/sales`, ["admin", "moderator", "user"]),
      accessLevel: ["admin", "moderator", "user"],
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
      title: "4. 팀 멤버 관리",
      subtitle: "팀 구성원을 추가하고 권한을 관리합니다",
      icon: <FaUsers className="text-3xl" />,
      onClick: () => checkAccess(`/admin/team-members`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "5. 창고 관리",
      subtitle: "창고를 추가하고 정보를 관리합니다",
      icon: <FaWarehouse className="text-3xl" />,
      onClick: () => checkAccess(`/admin/warehouses`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    {
      title: "6. 팀 정보 관리",
      subtitle: "팀의 기본 정보와 사업장 정보를 관리합니다",
      icon: <FaBuilding className="text-3xl" />,
      onClick: () => checkAccess(`/admin/team-info`, ["admin", "moderator"]),
      accessLevel: ["admin", "moderator"],
    },
    // {
    //   title: "7. 팀 활동 모니터링",
    //   subtitle: "팀 전체의 실시간 변경 이력을 확인합니다",
    //   icon: <FaChartLine className="text-3xl" />,
    //   onClick: () => checkAccess(`/team-dashboard`, ["admin", "moderator"]),
    //   accessLevel: ["admin", "moderator"],
    // },
  ];

  // 탭 설정
  let tabs = [];

  // 모든 사용자에게 재고 관리, 고객관리, 발주 & 시연 탭 표시
  tabs = [
    {
      id: "stock",
      title: "재고 관리",
      items: stockMenuItems,
    },
    {
      id: "customer",
      title: "고객관리",
      items: customerMenuItems,
    },
    {
      id: "order",
      title: "발주 & 시연",
      items: orderMenuItems,
    },
  ];

  // user, admin, moderator에게 판매&구매 탭 표시 (supplier 제외)
  if (user?.accessLevel !== "supplier") {
    tabs.push({
      id: "analytics",
      title: "판매 & 구매",
      items: analyticsMenuItems,
    });
  }

  // 관리자 또는 1차 승인권자인 경우 관리 탭 추가
  if (user?.accessLevel === "admin" || user?.accessLevel === "moderator") {
    tabs.push({
      id: "admin",
      title: "관리",
      items: adminMenuItems,
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
          <LoadingCentered size="lg" />
          <p className="mt-4 text-base md:text-lg text-gray-600">데이터를 불러오는 중...</p>
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
    <div className="p-6 min-h-screen bg-Back-Low-10">
      {/* 헤더 애니메이션 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex items-center text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <FaUser className="mr-3 text-2xl md:text-3xl lg:text-4xl text-Primary-Main" />
            </motion.div>
            {user.name}님, 환영합니다!
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex gap-2 items-center"
          >
            {user.accessLevel !== "supplier" && (
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/calendar")}
                className="flex gap-1.5 items-center px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base font-medium text-Primary-Main rounded-full transition-all duration-200 hover:bg-Primary-Container/60"
              >
                <FaCalendarAlt className="text-base md:text-lg" />
                캘린더
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/how-to-use")}
              className="flex gap-1.5 items-center px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base font-medium text-Text-Low-70 rounded-full transition-all duration-200 hover:text-Text-High-90 hover:bg-Back-Mid-20"
            >
              <FaQuestionCircle className="text-base md:text-lg" />
              사용법 안내
            </motion.button>
          </motion.div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="mt-2 text-base md:text-xl lg:text-2xl text-gray-600"
        >
          팀: <span className="font-semibold">{selectedTeam.teamName}</span>
        </motion.p>
      </motion.div>

      {/* 탭 네비게이션 — MD3 Segment Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.2 }}
        className="flex p-1.5 mb-6 bg-Back-Mid-20 rounded-2xl shadow-inner"
      >
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 + index * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 py-2.5 md:py-3 px-3 md:px-5 text-sm md:text-base lg:text-lg rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "text-Primary-Main bg-white shadow-md"
                : "text-Text-Low-70 hover:text-Text-High-90 hover:bg-white/50"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 rounded-xl bg-white shadow-md -z-10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.25 }}
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
          transition={{ duration: 0.1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2"
        >
          {currentTab.items.map((item, index) => {
            const hasAccess = item.accessLevel.includes(user.accessLevel);
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{
                  opacity: hasAccess ? 1 : 0.5,
                  y: 0,
                  scale: hasAccess && hoveredCard === index ? 1.015 : 1,
                  rotateX: hasAccess && hoveredCard === index ? (mousePosition.y - 0.5) * -4 : 0,
                  rotateY: hasAccess && hoveredCard === index ? (mousePosition.x - 0.5) * 4 : 0,
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  opacity: { duration: 0.04, delay: index * 0.01 },
                  y: { duration: 0.04, delay: index * 0.01, type: "spring", stiffness: 300, damping: 25 },
                  scale: { duration: 0.12 },
                  rotateX: { duration: 0.1, ease: "easeOut" },
                  rotateY: { duration: 0.1, ease: "easeOut" },
                }}
                whileTap={hasAccess ? { scale: 0.97 } : {}}
                onClick={hasAccess ? item.onClick : () => toast.error(`접근 권한이 없습니다. 필요 권한: ${formatAccessLevel(item.accessLevel)}`)}
                onMouseMove={(e) => hasAccess && handleMouseMove(e, index)}
                onMouseLeave={handleMouseLeave}
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                  cursor: hasAccess ? "pointer" : "not-allowed",
                }}
                className={`group relative overflow-hidden p-6 md:p-8 text-left bg-white rounded-2xl transition-all duration-300 ${
                  hasAccess
                    ? hoveredCard === index
                      ? "shadow-2xl"
                      : "shadow-sm hover:shadow-md"
                    : "shadow-sm"
                }`}
              >
                {/* 배경 장식 원 */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-Primary-Container rounded-bl-full opacity-40 transition-all duration-300 group-hover:w-36 group-hover:h-36" />

                {/* 자물쇠 아이콘 (권한 없는 경우만) */}
                {!hasAccess && (
                  <div className="group/lock absolute top-3 right-3 z-10">
                    <div className="flex justify-center items-center p-2 bg-Back-Mid-20 rounded-full">
                      <FaLock className="text-sm text-Outline-Variant" />
                    </div>
                    {/* 툴팁 */}
                    <div className="invisible group-hover/lock:visible absolute top-full right-0 mt-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap transition-all duration-200">
                      필요 권한: {formatAccessLevel(item.accessLevel)}
                      {/* 툴팁 화살표 */}
                      <div className="absolute bottom-full right-3 w-2 h-2 bg-gray-900 transform rotate-45 translate-y-1" />
                    </div>
                  </div>
                )}

                <div className="relative flex flex-col gap-4">
                  {/* 첫 번째 줄: 아이콘 + 타이틀 */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-center items-center flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-Primary-Container rounded-2xl transition-all duration-300 group-hover:bg-Primary-Main/10"
                    >
                      <div className="text-3xl md:text-4xl text-Primary-Main">
                        {item.icon}
                      </div>
                    </motion.div>
                    <h4 className="text-lg md:text-xl lg:text-2xl font-bold text-Text-Highest-100 leading-tight">
                      {item.title}
                    </h4>
                  </div>

                  {/* 두 번째 줄: 서브타이틀 */}
                  {item.subtitle && (
                    <p className="text-sm md:text-base text-Text-Low-70 leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}

                  {/* 시작하기 */}
                  <div className="flex gap-1.5 items-center justify-end text-sm md:text-base font-semibold text-Primary-Main">
                    <span>시작하기</span>
                    <motion.svg
                      className="w-4 h-4 md:w-5 md:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MainMenu;
