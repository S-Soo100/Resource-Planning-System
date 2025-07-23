"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDemoById } from "@/api/demo-api";
import { DemoResponse } from "@/types/demo/demo";
import { DemoStatus } from "@/types/demo/demo";
import { ArrowLeft, Package, Calendar, Presentation } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateDemoStatus } from "@/hooks/(useDemo)/useDemoMutations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import DemoEditModal from "@/components/demoRecord/DemoEditModal";
import LoginModal from "@/components/login/LoginModal";
import { IAuth } from "@/types/(auth)/auth";
import { authService } from "@/services/authService";
import { authStore } from "@/store/authStore";

// 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

// 상태 텍스트 변환 함수
const getStatusText = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "요청";
    case DemoStatus.approved:
      return "승인";
    case DemoStatus.rejected:
      return "반려";
    case DemoStatus.confirmedByShipper:
      return "출고팀 확인";
    case DemoStatus.shipmentCompleted:
      return "출고 완료";
    case DemoStatus.rejectedByShipper:
      return "출고 보류";
    case DemoStatus.demoCompleted:
      return "시연 종료";
    default:
      return status;
  }
};

// 상태 색상 클래스 함수
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "bg-yellow-100 text-yellow-800";
    case DemoStatus.approved:
      return "bg-green-100 text-green-800";
    case DemoStatus.rejected:
      return "bg-red-100 text-red-800";
    case DemoStatus.confirmedByShipper:
      return "bg-blue-100 text-blue-800";
    case DemoStatus.shipmentCompleted:
      return "bg-purple-100 text-purple-800";
    case DemoStatus.rejectedByShipper:
      return "bg-orange-100 text-orange-800";
    case DemoStatus.demoCompleted:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 상태 아이콘 함수
const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case DemoStatus.requested:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case DemoStatus.approved:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case DemoStatus.rejected:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

const DemoRecordDetail = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoId = params.id as string;
  const teamId = searchParams.get("teamId");

  const [demo, setDemo] = useState<DemoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { user: auth } = useCurrentUser();
  const queryClient = useQueryClient();
  const updateDemoStatusMutation = useUpdateDemoStatus();
  const { refetchAll: refetchWarehouseItems } = useWarehouseItems();

  // authStore에서 직접 로그인 상태 확인
  const isAuthenticated = authStore.getState().isAuthenticated;

  useEffect(() => {
    const fetchDemo = async () => {
      setIsLoading(true);

      // authStore에서 직접 로그인 상태 확인
      const currentAuth = authStore.getState();
      console.log("🔍 로그인 상태 확인:", {
        auth,
        isAuthenticated,
        currentAuth,
        demoId,
        teamId,
      });

      // 로그인되지 않은 상태에서는 모달을 먼저 표시
      if (!currentAuth.isAuthenticated || !currentAuth.user) {
        console.log("비로그인 상태 - 로그인 모달 표시");
        setIsLoginModalOpen(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await getDemoById(parseInt(demoId));
        console.log("📋 시연 조회 결과:", res);
        if (res.success && res.data) {
          setDemo(res.data as unknown as DemoResponse);
        } else {
          console.error("시연 조회 실패:", res.message);
          toast.error(res.message || "해당 시연을 찾을 수 없습니다.");
          router.push("/demonstration-record");
        }
      } catch (error) {
        console.error("시연 조회 중 오류:", error);
        // API 호출 실패 시에도 로그인 모달 표시
        if (!currentAuth.isAuthenticated || !currentAuth.user) {
          setIsLoginModalOpen(true);
        } else {
          toast.error("시연 조회 중 네트워크 오류가 발생했습니다.");
          router.push("/demonstration-record");
        }
      }
      setIsLoading(false);
    };
    if (demoId) {
      fetchDemo();
    }
  }, [demoId, router]);

  // teamId가 있으면 콘솔에 출력 (디버깅용)
  useEffect(() => {
    if (teamId) {
      console.log("Team ID from URL params:", teamId);
    }
  }, [teamId]);

  // 로그인 성공 핸들러
  const handleLoginSuccess = async (userData: IAuth) => {
    console.log("로그인 성공:", userData);
    if (teamId) {
      // 팀 정보 설정
      await authService.selectTeam(parseInt(teamId));

      // 잠시 대기 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // 상태 변경 핸들러
  const handleStatusChange = async (newStatus: DemoStatus) => {
    if (!demo) return;

    // moderator 권한 사용자가 본인이 생성한 시연을 승인/반려하려고 할 때 제한
    if (auth?.accessLevel === "moderator") {
      if (demo.userId === auth?.id) {
        if (
          newStatus === DemoStatus.approved ||
          newStatus === DemoStatus.rejected
        ) {
          alert("요청자 본인 이외의 승인권자가 승인해야 합니다");
          return;
        }
      }
    }

    if (
      !window.confirm(
        `정말 시연 상태를 '${getStatusText(newStatus)}'(으)로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await updateDemoStatusMutation.mutateAsync({
        id: parseInt(demoId),
        data: { status: newStatus },
      });

      // 시연 출고 완료 상태로 변경된 경우 추가 액션
      if (newStatus === DemoStatus.shipmentCompleted) {
        queryClient.invalidateQueries({
          queryKey: [
            ["warehouseItems"],
            ["inventoryRecords"],
            ["items"],
            ["warehouse"],
          ],
        });
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ["warehouseItems"] }),
          queryClient.refetchQueries({ queryKey: ["inventoryRecords"] }),
        ]);
        setTimeout(async () => {
          await refetchWarehouseItems();
        }, 1000);
        alert("시연 출고 완료, 재고에 반영 했습니다.");
        toast.success(
          "시연 출고 완료 처리되었습니다. 재고가 업데이트되었습니다.",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#4CAF50",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
          }
        );
      }
      // 시연 완료 상태로 변경된 경우 재고 복구
      else if (newStatus === DemoStatus.demoCompleted) {
        queryClient.invalidateQueries({
          queryKey: [
            ["warehouseItems"],
            ["inventoryRecords"],
            ["items"],
            ["warehouse"],
          ],
        });
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ["warehouseItems"] }),
          queryClient.refetchQueries({ queryKey: ["inventoryRecords"] }),
        ]);
        setTimeout(async () => {
          await refetchWarehouseItems();
        }, 1000);
        alert("시연 완료, 재고가 복구되었습니다.");
        toast.success("시연 완료 처리되었습니다. 재고가 복구되었습니다.", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#4CAF50",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      } else {
        alert("시연 상태가 변경되었습니다.");
        toast.success("시연 상태가 변경되었습니다.", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#2196F3",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      }

      // 상태 업데이트 후 데이터 새로고침
      window.location.reload();
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      toast.error("시연 상태 업데이트에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 수정 권한 확인
  const hasPermissionToEdit = (record: DemoResponse) => {
    if (!auth) return false;
    const isAdmin = auth.isAdmin;
    const isAuthor = record.userId === auth.id;
    if (isAdmin) return true;
    const isRequestedStatus = record.demoStatus === DemoStatus.requested;
    return isAuthor && isRequestedStatus;
  };

  // 상태 변경 권한 확인
  const hasPermissionToChangeStatus = () => {
    return auth?.accessLevel === "admin" || auth?.accessLevel === "moderator";
  };

  // 권한별 상태 변경 가능 여부 확인
  const canChangeStatus = (currentStatus: string) => {
    if (!auth) return false;

    console.log("🔍 권한 디버깅:", {
      userAccessLevel: auth.accessLevel,
      currentStatus: currentStatus,
      isAdmin: auth.isAdmin,
      userId: auth.id,
      demoUserId: demo?.userId,
    });

    // Moderator 권한 체크
    if (auth.accessLevel === "moderator") {
      // Moderator는 requested, approved, rejected 상태만 변경 가능
      const canChange = [
        DemoStatus.requested,
        DemoStatus.approved,
        DemoStatus.rejected,
      ].includes(currentStatus as DemoStatus);
      console.log("📋 Moderator 권한 체크:", {
        allowedStatuses: [
          DemoStatus.requested,
          DemoStatus.approved,
          DemoStatus.rejected,
        ],
        currentStatus,
        canChange,
      });
      return canChange;
    }

    // Admin 권한 체크
    if (auth.accessLevel === "admin") {
      // Admin은 approved, confirmedByShipper, shipmentCompleted, rejectedByShipper 상태일 때만 변경 가능
      const allowedStatuses = [
        DemoStatus.approved,
        DemoStatus.confirmedByShipper,
        DemoStatus.shipmentCompleted,
        DemoStatus.rejectedByShipper,
        DemoStatus.demoCompleted,
      ];
      const canChange = allowedStatuses.includes(currentStatus as DemoStatus);
      console.log("📋 Admin 권한 체크:", {
        allowedStatuses,
        currentStatus,
        canChange,
      });
      return canChange;
    }

    console.log("❌ 권한 없음 - accessLevel:", auth.accessLevel);
    return false;
  };

  // 권한별 사용 가능한 상태 옵션 반환
  const getAvailableStatusOptions = () => {
    if (!auth) return [];

    if (auth.accessLevel === "moderator") {
      // Moderator는 초기 승인 단계만 담당
      return [
        { value: DemoStatus.requested, label: "요청" },
        {
          value: DemoStatus.approved,
          label: "승인",
          disabled: demo?.userId === auth?.id,
        },
        {
          value: DemoStatus.rejected,
          label: "반려",
          disabled: demo?.userId === auth?.id,
        },
      ];
    }

    if (auth.accessLevel === "admin") {
      // Admin은 출고 단계만 담당
      return [
        { value: DemoStatus.confirmedByShipper, label: "출고팀 확인" },
        { value: DemoStatus.shipmentCompleted, label: "출고 완료" },
        { value: DemoStatus.rejectedByShipper, label: "출고 보류" },
        { value: DemoStatus.demoCompleted, label: "시연 종료" },
      ];
    }

    return [];
  };

  if (isLoading) {
    return (
      <div className="p-4 min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            {/* 헤더 스켈레톤 */}
            <div className="flex gap-4 items-center">
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-48 h-8 bg-gray-200 rounded"></div>
            </div>

            {/* 상태 스켈레톤 */}
            <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>

            {/* 카드 스켈레톤 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200">
                <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 주소 스켈레톤 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="w-full h-4 bg-gray-200 rounded"></div>
            </div>

            {/* 시연품 스켈레톤 */}
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2"
                  >
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 로그인 모달 */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        teamId={teamId || undefined}
      />

      {/* 비로그인 상태면 아래 UI를 렌더링하지 않음 */}
      {!isLoginModalOpen && !authStore.getState().isAuthenticated ? null : (
        <>
          {/* demo가 null이고 로그인 상태일 때만 '시연을 찾을 수 없습니다' */}
          {!demo && authStore.getState().isAuthenticated && (
            <div className="flex flex-col justify-center items-center h-96">
              <p className="mb-4 text-lg text-gray-600">
                시연을 찾을 수 없습니다
              </p>
              <button
                className="px-4 py-2 text-white bg-blue-500 rounded"
                onClick={() => router.push("/demonstration-record")}
              >
                시연 목록으로 돌아가기
              </button>
            </div>
          )}
          {/* 기존 demo 상세 UI는 그대로 유지 */}
          {demo && (
            <div className="p-4 min-h-screen bg-gray-50">
              <div className="mx-auto max-w-4xl">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => router.push("/demonstration-record")}
                      className="flex gap-2 items-center px-3 py-2 text-gray-600 transition-colors hover:text-gray-800"
                    >
                      <ArrowLeft size={20} />
                      <span>목록으로</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                      시연 상세 정보
                    </h1>
                  </div>
                </div>

                {/* 현재 상태 표시 */}
                <div className="mb-6">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColorClass(
                      demo.demoStatus
                    )}`}
                  >
                    {getStatusIcon(demo.demoStatus)}
                    <span className="font-medium">
                      {getStatusText(demo.demoStatus)}
                    </span>
                  </div>
                </div>

                {/* 상태 변경 섹션 */}
                {(() => {
                  const hasPermission = hasPermissionToChangeStatus();
                  const canChange = canChangeStatus(demo.demoStatus);
                  console.log("🎯 상태 변경 섹션 조건 체크:", {
                    hasPermission,
                    canChange,
                    demoStatus: demo.demoStatus,
                    authLevel: auth?.accessLevel,
                  });
                  return hasPermission && canChange;
                })() && (
                  <div className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      상태 변경
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">
                          현재 상태:
                        </span>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getStatusColorClass(
                            demo.demoStatus
                          )}`}
                        >
                          {getStatusIcon(demo.demoStatus)}
                          <span className="text-sm font-medium">
                            {getStatusText(demo.demoStatus)}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                      <div className="relative">
                        <select
                          value={demo.demoStatus}
                          onChange={(e) =>
                            handleStatusChange(e.target.value as DemoStatus)
                          }
                          disabled={isUpdatingStatus}
                          className="px-4 py-2 pr-10 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {getAvailableStatusOptions().map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                            >
                              {option.label}
                              {option.disabled &&
                              auth?.accessLevel === "moderator" &&
                              demo?.userId === auth?.id
                                ? " (본인 시연)"
                                : ""}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {isUpdatingStatus && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-blue-500 animate-spin border-t-transparent"></div>
                          <span className="text-sm text-gray-500">
                            변경 중...
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-sm text-blue-800">
                          {auth?.accessLevel === "moderator"
                            ? "1차승인권자는 초기 승인 단계만 담당합니다."
                            : auth?.accessLevel === "admin"
                            ? "관리자는 출고 단계를 담당합니다."
                            : "상태 변경 권한이 없습니다."}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 권한 정보 섹션 (상태 변경 권한이 없는 경우) */}
                {!hasPermissionToChangeStatus() && (
                  <div className="p-4 mb-6 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">
                          상태 변경 권한 없음
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700">
                          {auth?.accessLevel === "user"
                            ? "일반 사용자는 상태 변경 권한이 없습니다."
                            : auth?.accessLevel === "supplier"
                            ? "공급업체는 상태 변경 권한이 없습니다."
                            : "상태 변경 권한이 없습니다."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 시연 정보 카드 */}
                <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
                  {/* 기본 정보 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <Package size={20} />
                      기본 정보
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 ID:</span>
                        <span className="font-medium">#{demo.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">생성일:</span>
                        <span className="font-medium">
                          {formatDate(demo.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">요청자:</span>
                        <span className="font-medium">{demo.requester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">행사 담당자:</span>
                        <span className="font-medium">{demo.handler}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 창고:</span>
                        <span className="font-medium text-blue-600">
                          {demo.warehouse?.warehouseName || "창고 정보 없음"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 시연 정보 */}
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <Presentation size={20} />
                      시연 정보
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 제목:</span>
                        <span className="font-medium">{demo.demoTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 유형:</span>
                        <span className="font-medium">
                          {demo.demoNationType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">결제 유형:</span>
                        <span className="font-medium">
                          {demo.demoPaymentType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">시연 가격:</span>
                        <span className="font-medium">
                          {demo.demoPrice ? `${demo.demoPrice} 원` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 시연 일정 정보 */}
                <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                    <Calendar size={20} />
                    시연 일정
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">상차 정보</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">상차 날짜:</span>
                          <span className="font-medium">
                            {demo.demoStartDate
                              ? formatDate(demo.demoStartDate)
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">상차 시간:</span>
                          <span className="font-medium">
                            {demo.demoStartTime || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">상차 방법:</span>
                          <span className="font-medium">
                            {demo.demoStartDeliveryMethod || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">하차 정보</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">하차 날짜:</span>
                          <span className="font-medium">
                            {demo.demoEndDate
                              ? formatDate(demo.demoEndDate)
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">하차 시간:</span>
                          <span className="font-medium">
                            {demo.demoEndTime || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">하차 방법:</span>
                          <span className="font-medium">
                            {demo.demoEndDeliveryMethod || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 시연 주소 정보 */}
                <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    시연 주소
                  </h2>
                  <p className="text-gray-800 break-words">
                    {demo.demoAddress}
                  </p>
                </div>

                {/* 시연품 정보 */}
                <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    시연품 목록
                  </h2>
                  {demo.demoItems && demo.demoItems.length > 0 ? (
                    <div className="space-y-3">
                      {demo.demoItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.item?.teamItem?.itemName ||
                                "알 수 없는 품목"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.item?.teamItem?.itemCode || "코드 없음"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {item.quantity}개
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.memo || "메모 없음"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">시연품이 없습니다.</p>
                  )}
                </div>

                {/* 메모 */}
                {demo.memo && (
                  <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      메모
                    </h2>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {demo.memo}
                    </p>
                  </div>
                )}

                {/* 첨부파일 */}
                {demo.files && demo.files.length > 0 && (
                  <div className="p-6 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="flex gap-2 items-center mb-4 text-lg font-semibold text-gray-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a3 3 0 00-3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      첨부파일
                    </h2>
                    <div className="space-y-3">
                      {demo.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex gap-3 items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <div className="font-medium text-gray-900">
                                {file.fileName}
                              </div>
                              <div className="text-sm text-gray-500">
                                업로드: {formatDate(demo.createdAt)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = file.fileUrl;
                              link.download = file.fileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-md transition-colors hover:bg-blue-100"
                          >
                            다운로드
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 수정 버튼 */}
                {hasPermissionToEdit(demo) && (
                  <div className="flex justify-end mb-6">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-2 text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600"
                    >
                      시연 수정
                    </button>
                  </div>
                )}

                {/* 수정 모달 */}
                {isEditModalOpen && demo && (
                  <DemoEditModal
                    isOpen={isEditModalOpen}
                    demoRecord={demo}
                    onClose={() => {
                      setIsEditModalOpen(false);
                      window.location.reload();
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DemoRecordDetail;
