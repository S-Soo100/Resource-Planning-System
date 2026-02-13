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
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui";
import { Team } from "@/types/team";

// 회사 정보 누락 여부 체크 함수
const isCompanyInfoMissing = (team: Team | null): boolean => {
  if (!team) return false;
  return !team.companyName || !team.businessRegistrationNumber;
};

export default function MenuPage() {
  const router = useRouter();
  const auth = authStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showCompanyInfoModal, setShowCompanyInfoModal] = useState(false);
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

  // 회사 정보 미등록 체크 (admin 전용)
  useEffect(() => {
    if (
      !isLoading &&
      auth.user?.isAdmin &&
      auth.selectedTeam &&
      isCompanyInfoMissing(auth.selectedTeam)
    ) {
      setShowCompanyInfoModal(true);
    }
  }, [isLoading, auth.user, auth.selectedTeam]);

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

      {/* 회사 정보 미등록 안내 모달 */}
      <Modal
        isOpen={showCompanyInfoModal}
        onClose={() => setShowCompanyInfoModal(false)}
        title="회사 정보 등록 필요"
        size="md"
        closeOnOverlayClick={true}
        showCloseButton={true}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-800 font-medium">
                팀의 회사 정보가 등록되지 않았습니다.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                원활한 시스템 사용을 위해 회사명과 사업자등록번호를 포함한 회사 정보를 등록해주세요.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={() => setShowCompanyInfoModal(false)}
              variant="default"
            >
              나중에 등록하기
            </Button>
            <Button
              onClick={() => {
                setShowCompanyInfoModal(false);
                router.push("/admin?tab=team");
              }}
              variant="primary"
            >
              관리 페이지로 이동
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
