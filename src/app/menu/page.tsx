"use client";
import MenuButtonListComponent from "@/components/menu/MenuButtonListComponent";
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
        <div className="p-4 space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
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
        <MenuButtonListComponent />
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
