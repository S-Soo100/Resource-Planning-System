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
    // 초기 2초 대기
    const timer = setTimeout(() => {
      if (!isTeamLoading) {
        if (!auth.selectedTeam) {
          auth.resetTeam();
          router.push("/team-select");
          return;
        }
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [auth.selectedTeam, router, isTeamLoading, auth]);

  if (isLoading || isTeamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!auth.selectedTeam) {
    return null;
  }

  return (
    <>
      <MenuButtonListComponent teamId={auth.selectedTeam.id.toString()} />
    </>
  );
}
