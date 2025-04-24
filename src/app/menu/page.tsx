"use client";
import MainMenuComponent from "@/components/menu/MainMenuComponent";
import { authStore } from "@/store/authStore";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function MenuPage() {
  const router = useRouter();
  const auth = authStore();
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: isTeamLoading } = useCurrentTeam();

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

  if (isLoading || isTeamLoading) {
    return (
      <>
        <div className="flex flex-col min-h-screen">
          <main className="flex flex-col items-center w-full p-4 space-y-4 pb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <div
                key={item}
                className="flex items-center w-full max-w-2xl px-8 py-4 bg-gray-100 border border-gray-200 rounded-2xl animate-pulse"
              >
                <div className="flex-col w-full">
                  <div className="flex flex-row items-center">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-8 bg-gray-300 rounded-full"></div>
                    <div className="h-6 bg-gray-300 rounded-lg w-48"></div>
                  </div>
                  <div className="h-4 mt-2 ml-20 bg-gray-200 rounded-lg w-32"></div>
                </div>
              </div>
            ))}
          </main>
        </div>

        {/* Footer */}
        <div className="w-full px-4 py-3 bg-white shadow-inner mb-2">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-500">
                KARS 재고관리 시스템 v1.0.0
              </p>
              <p className="text-xs text-gray-400 mt-1">
                © 2025 Kangsters. All rights reserved.
              </p>
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
      <div className=" pb-6 ">
        <MainMenuComponent />
      </div>

      {/* Footer */}
      <div className="w-full px-4 py-3 bg-white shadow-inner mb-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500">KARS 재고관리 시스템 v1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">
              © 2025 Kangsters. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
