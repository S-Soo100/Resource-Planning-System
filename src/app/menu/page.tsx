"use client";
import MainMenu from "@/components/menu/MainMenu";
import { authStore } from "@/store/authStore";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useCategory } from "@/hooks/useCategory";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { APP_VERSION, APP_NAME, COPYRIGHT } from "@/constants/version";
import { Loading } from "@/components/ui/Loading";

export default function MenuPage() {
  const router = useRouter();
  const auth = authStore();
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: isTeamLoading } = useCurrentTeam();

  // 새로운 useCategory 훅 사용
  const { isLoading: isCategoryLoading } = useCategory(auth.selectedTeam?.id);

  useEffect(() => {
    let isMounted = true;

    const checkTeamAndRedirect = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!isMounted) return;

      if (!isTeamLoading) {
        if (!auth.selectedTeam) {
          auth.resetTeam();
          router.push("/team-select");
          return;
        }

        setIsLoading(false);
      }
    };

    checkTeamAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [auth.selectedTeam, router, isTeamLoading, auth]);

  if (isLoading || isTeamLoading || isCategoryLoading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-md">
            <div className="mb-6">
              <Loading size="lg" variant="primary" />
            </div>
            <h2 className="mb-2 text-2xl md:text-3xl font-semibold text-gray-800">
              로딩 중...
            </h2>
            <p className="text-base md:text-lg text-gray-600">KARS 시스템에 연결 중입니다</p>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 w-full px-4 py-3 bg-white shadow-inner max-h-20">
          <div className="mx-auto">
            <div className="flex flex-col items-center justify-center text-center">
              <Link
                href="/update"
                className="text-base md:text-lg text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              >
                {APP_NAME} v{APP_VERSION}
              </Link>
              <p className="mt-1 text-sm md:text-base text-gray-400">{COPYRIGHT}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!auth.selectedTeam) {
    return null;
  }

  return (
    <>
      <div className="pb-28">
        <MainMenu />
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 w-full px-4 py-3 bg-white shadow-inner max-h-20">
        <div className="mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <Link
              href="/update"
              className="text-base md:text-lg text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              {APP_NAME} v{APP_VERSION}
            </Link>
            <p className="mt-1 text-sm md:text-base text-gray-400">{COPYRIGHT}</p>
          </div>
        </div>
      </div>
    </>
  );
}
