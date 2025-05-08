/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
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

  // 권한 체크 함수
  const checkAccess = (
    path: string,
    requiredLevel:
      | "admin"
      | "user"
      | "supplier"
      | ("admin" | "user" | "supplier")[]
  ) => {
    if (Array.isArray(requiredLevel)) {
      if (
        !requiredLevel.includes(
          user?.accessLevel as "admin" | "user" | "supplier"
        )
      ) {
        const roles = requiredLevel
          .map((level) => {
            const roleMap = {
              admin: "관리자",
              user: "일반 사용자",
              supplier: "공급자",
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
      // subtitle: "마스터 계정, 직원 계정",
      icon: <MdOutlineInventory className="text-3xl" />,
      onClick: () => checkAccess(`/stock`, ["admin", "user"]),
      accessLevel: ["user", "admin"],
    },
    {
      title: "재고 입출고 기록 조회",
      // subtitle: "마스터 계정",
      icon: <FaClipboardList className="text-3xl" />,
      onClick: () => checkAccess(`/ioHistory`, ["admin", "user"]),
      accessLevel: ["user", "admin"],
    },
    {
      title: "패키지 관리",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/package`, ["admin", "user"]),
      accessLevel: ["user", "admin"],
    },
  ];

  // 발주-출고 관련 메뉴
  const orderMenuItems = [
    {
      title: "패키지 출고 요청",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () =>
        checkAccess(`/packageOrder`, ["admin", "user", "supplier"]),
      accessLevel: ["supplier", "user", "admin"],
    },
    {
      title: "개별 품목 출고 요청",
      icon: <FaTruckLoading className="text-3xl" />,
      onClick: () =>
        checkAccess(`/orderRequest`, ["admin", "user", "supplier"]),
      accessLevel: ["supplier", "user", "admin"],
    },
    {
      title: "발주 기록 확인",
      // subtitle: "공급자 계정",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/orderRecord`, ["admin", "user", "supplier"]),
      accessLevel: ["supplier", "user", "admin"],
    },
    {
      title: "업체 관리",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/supplier`, ["admin", "user"]),
      accessLevel: ["user", "admin"],
    },
  ];

  // 관리자 메뉴
  const adminMenuItems = [
    {
      title: "관리 - 창고별 품목 관리",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/warehouse-items`, "admin"),
      accessLevel: ["admin"],
    },
    {
      title: "관리 - 전체 품목 관리",
      icon: <FaBox className="text-3xl" />,
      onClick: () => checkAccess(`/team-items`, "admin"),
      accessLevel: ["admin"],
    },
    {
      title: "관리 - 팀 관리",
      subtitle: " ",
      icon: <PiNewspaperClippingFill className="text-3xl" />,
      onClick: () => checkAccess(`/admin`, "admin"),
      accessLevel: ["admin"],
    },
  ];

  // 메뉴 카드 렌더링 함수
  const renderMenuCards = (items: any) => {
    return items.map((item: any, index: number) => {
      const hasAccess =
        user?.accessLevel && item.accessLevel.includes(user.accessLevel);
      return (
        <div
          key={index}
          onClick={item.onClick}
          className={`cursor-pointer flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${
            !hasAccess ? "opacity-70" : ""
          }`}
        >
          <div className="flex items-center justify-center w-10 h-10 mb-2 text-white bg-blue-600 rounded-full">
            {React.cloneElement(item.icon, { className: "text-xl" })}
          </div>
          <h3 className="text-sm font-bold text-center text-gray-900 mb-1">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-xs text-gray-600 text-center">{item.subtitle}</p>
          )}
          {item.accessLevel.length === 1 && item.accessLevel[0] === "admin" && (
            <span className="mt-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
              관리자 전용
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Menu Body */}
      <main className="container mx-auto p-3">
        {/* 재고 섹션 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 px-2 py-1 bg-blue-50 rounded-md text-blue-800">
            재고 관리
          </h2>
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
            {renderMenuCards(stockMenuItems)}
          </div>
        </div>

        {/* 발주-출고 섹션 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 px-2 py-1 bg-green-50 rounded-md text-green-800">
            발주 및 출고
          </h2>
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
            {renderMenuCards(orderMenuItems)}
          </div>
        </div>

        {/* 관리자 섹션 */}
        {user?.accessLevel === "admin" && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 px-2 py-1 bg-red-50 rounded-md text-red-800">
              시스템 관리
            </h2>
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {renderMenuCards(adminMenuItems)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainMenuComponent;
