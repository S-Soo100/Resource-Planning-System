"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  FileText,
  Package,
  Trash2,
  Truck,
  XCircle,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import { DemoResponse } from "@/types/demo/demo";
import { useDemo } from "@/hooks/useDemo";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
// import { useCurrentUser } from "@/hooks/useCurrentUser"; // 제거됨
import { authStore } from "@/store/authStore";
import DemoEditModal from "./DemoEditModal";
import DemoRecordTable from "./DemoRecordTable";
import { useRouter } from "next/navigation";
// import { useDeleteDemo } from "@/hooks/(useDemo)/useDemoMutations"; // 제거됨
import { DemoStatus } from "@/types/demo/demo";
import { formatDateForDisplay, formatDateForDisplayUTC } from "@/utils/dateUtils";

type TabType = "ongoing" | "long-term" | "completed";
type SortField = "createdAt" | "demoStartDate" | "demoTitle" | "demoStatus";
type SortOrder = "asc" | "desc" | null;

// API 응답 데이터를 DemoResponse 형식으로 변환하는 함수
const convertToDemoRecord = (demo: DemoResponse): DemoResponse => {
  return {
    ...demo,
    requester: demo.requester || "알 수 없음",
    handler: demo.handler || "",
    demoManager: demo.demoManager || "",
    demoManagerPhone: demo.demoManagerPhone || "",
    memo: demo.memo || "",
    demoTitle: demo.demoTitle || "",
    demoNationType: demo.demoNationType || "국내",
    demoAddress: demo.demoAddress || "",
    demoPaymentType: demo.demoPaymentType || "",
    demoPrice: demo.demoPrice || 0,
    demoPaymentDate: demo.demoPaymentDate,
    demoStartDate: demo.demoStartDate || "",
    demoStartTime: demo.demoStartTime || "",
    demoStartDeliveryMethod: demo.demoStartDeliveryMethod || "",
    demoEndDate: demo.demoEndDate || "",
    demoEndTime: demo.demoEndTime || "",
    demoEndDeliveryMethod: demo.demoEndDeliveryMethod || "",
    userId: demo.userId || 0,
    warehouseId: demo.warehouseId || 0,
    demoItems: demo.demoItems || [],
    files: demo.files || [],
    createdAt: demo.createdAt,
    updatedAt: demo.updatedAt,
    demoStatus: demo.demoStatus || "requested",
    user: demo.user || {
      id: 0,
      email: "",
      name: "",
      accessLevel: "user",
      isAdmin: false,
      teamUserMap: [],
    },
  };
};

// 통합 날짜 유틸리티 사용 - 중복 함수 제거됨

// 새로운 기록인지 확인하는 함수
const isNewRecord = (createdAt: string, status: string): boolean => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

  // 72시간 이내이고, 완료 상태가 아닌 경우
  const isWithin72Hours = hoursDiff <= 72;
  const isNotCompleted = !["demoCompleted", "demoCompletedAndReturned", "rejected", "rejectedByShipper"].includes(status);

  return isWithin72Hours && isNotCompleted;
};

// 미디어 쿼리 훅
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

const DemonstrationRecordTabs = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ongoing");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<DemoResponse | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    details: "",
  });

  const recordsPerPage = 10;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userAccessLevel, setUserAccessLevel] = useState<string>("");

  const { useDemosByTeam, useUpdateDemoStatus } = useDemo();
  const { team: currentTeam } = useCurrentTeam();
  // const { user: currentUser } = useCurrentUser(); // 제거됨
  const queryClient = useQueryClient();

  // 상태 변경 훅
  const updateDemoStatusMutation = useUpdateDemoStatus();

  // 삭제 훅 - 제거됨 (확장 기능과 함께 사용됨)
  // const deleteDemoMutation = useDeleteDemo();

  // 현재 로그인한 사용자의 accessLevel 가져오기
  useEffect(() => {
    const user = authStore.getState().user;
    if (user && user.id) {
      console.log("시연 기록 - 현재 사용자 ID:", user.id.toString());

      // 사용자 접근 레벨 가져오기
      const fetchUserInfo = async () => {
        try {
          const { userApi } = await import("@/api/user-api");
          const response = await userApi.getUser(user.id.toString());
          if (response.success && response.data) {
            setUserAccessLevel(response.data.accessLevel);
            console.log("시연 기록 - 사용자 접근 레벨:", response.data.accessLevel);
          } else {
            // 기본값: 관리자인 경우 admin, 아닌 경우 user
            setUserAccessLevel(user.isAdmin ? "admin" : "user");
          }
        } catch (error) {
          console.error("시연 기록 - 사용자 정보 가져오기 실패:", error);
          setUserAccessLevel(user.isAdmin ? "admin" : "user");
        }
      };

      fetchUserInfo();
    }
  }, []);

  // 시연 데이터 조회 - 팀별 시연 목록
  const {
    data: demosResponse,
    isLoading: isLoadingDemos,
    refetch,
  } = useDemosByTeam(currentTeam?.id || 0);

  // 페이지 진입 시 자동 새로고침
  useEffect(() => {
    if (currentTeam?.id) {
      refetch();
    }
  }, [currentTeam?.id, refetch]);

  // API 응답 데이터를 DemoResponse 형식으로 변환 (useMemo로 최적화)
  const allDemoRecords = useMemo((): DemoResponse[] => {
    if (demosResponse?.success && demosResponse?.data) {
      const data = demosResponse.data as unknown as DemoResponse[];
      return data.map((demo: DemoResponse) => convertToDemoRecord(demo));
    }
    return [];
  }, [demosResponse]);

  // 현재 탭에 맞게 필터링된 시연 기록
  const demoRecords = useMemo((): DemoResponse[] => {
    if (activeTab === "ongoing") {
      // '진행중' 탭인 경우 진행 중인 시연만 필터링
      return allDemoRecords.filter((record: DemoResponse) => {
        // 시연이 완료되지 않은 상태들 (rejected와 rejectedByShipper 제외)
        return ![
          "demoCompleted",
          "demoCompletedAndReturned",
          "rejected",
          "rejectedByShipper",
        ].includes(record.demoStatus);
      });
    } else if (activeTab === "long-term") {
      // '장기 시연' 탭인 경우 - 장기시연만 표시 (진행 여부 무관)
      return allDemoRecords.filter((record: DemoResponse) => {
        return record.isLongTerm === true;
      });
    } else {
      // '시연종료' 탭인 경우 완료된 시연만 필터링
      return allDemoRecords.filter((record: DemoResponse) => {
        // 시연이 완료된 상태들 (rejected와 rejectedByShipper 포함)
        return [
          "demoCompleted",
          "demoCompletedAndReturned",
          "rejected",
          "rejectedByShipper",
        ].includes(record.demoStatus);
      });
    }
  }, [allDemoRecords, activeTab]);

  // 검색 및 필터링 적용
  const filteredRecords = useMemo((): DemoResponse[] => {
    let filtered = demoRecords;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (record: DemoResponse) =>
          record.demoTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.handler?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.demoManager
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.demoManagerPhone
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.demoAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.demoNationType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.demoItems?.some(
            (item) =>
              item.item?.teamItem?.itemName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
          ) ||
          record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (statusFilter) {
      filtered = filtered.filter(
        (record: DemoResponse) => record.demoStatus === statusFilter
      );
    }

    return filtered;
  }, [demoRecords, searchTerm, statusFilter]);

  // 페이지네이션 및 정렬
  const { sortedRecords, totalPages, startIndex, endIndex, currentRecords } = useMemo(() => {
    // 정렬 적용
    let sorted = [...filteredRecords];

    if (sortField && sortOrder) {
      sorted.sort((a, b) => {
        let compareResult = 0;

        switch (sortField) {
          case "createdAt": {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            compareResult = dateA.getTime() - dateB.getTime();
            break;
          }
          case "demoStartDate": {
            const dateA = new Date(a.demoStartDate || a.createdAt);
            const dateB = new Date(b.demoStartDate || b.createdAt);
            compareResult = dateA.getTime() - dateB.getTime();
            break;
          }
          case "demoTitle": {
            const titleA = a.demoTitle || "";
            const titleB = b.demoTitle || "";
            compareResult = titleA.localeCompare(titleB);
            break;
          }
          case "demoStatus": {
            compareResult = a.demoStatus.localeCompare(b.demoStatus);
            break;
          }
          default:
            compareResult = 0;
        }

        return sortOrder === "asc" ? compareResult : -compareResult;
      });
    }

    const total = Math.ceil(sorted.length / recordsPerPage);
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const current = sorted.slice(start, end);

    return {
      sortedRecords: sorted,
      totalPages: total,
      startIndex: start,
      endIndex: end,
      currentRecords: current,
    };
  }, [filteredRecords, currentPage, recordsPerPage, sortField, sortOrder]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
    setStatusFilter("");
  };

  // 검색 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 상태 필터 변경 핸들러
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // 정렬 핸들러 추가
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder(null);
        setSortField("createdAt");
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
  };

  // 페이지 변경 핸들러
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 로딩 상태 확인
  const isLoading = () => {
    return isLoadingDemos || isRefreshing;
  };

  // 시연 상태 텍스트 변환
  const getStatusText = (status: string): string => {
    switch (status) {
      case "requested":
        return "요청";
      case "approved":
        return "승인";
      case "rejected":
        return "반려";
      case "confirmedByShipper":
        return "출고자 확인";
      case "shipmentCompleted":
        return "출고 완료";
      case "rejectedByShipper":
        return "출고자 반려";
      case "demoCompleted":
        return "시연 종료";
      default:
        return status;
    }
  };

  // 행 클릭 핸들러
  const handleRowClick = (recordId: number) => {
    // 상세 페이지로 이동
    router.push(`/demoRecord/${recordId}?teamId=${currentTeam?.id || ""}`);
  };

  // 새로고침 핸들러
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["demos"] });
      toast.success("시연 기록이 새로고침되었습니다.");
    } catch (error) {
      console.error("새로고침 중 오류:", error);
      toast.error("새로고침 중 오류가 발생했습니다.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // 에러 모달 닫기
  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      title: "",
      message: "",
      details: "",
    });
  };

  // 상태 변경 핸들러 추가
  const handleStatusChange = async (demoId: number, newStatus: DemoStatus) => {
    if (!currentTeam?.id) {
      toast.error("팀 정보를 찾을 수 없습니다.");
      return;
    }

    // 확인 다이얼로그
    if (
      !window.confirm(
        `정말 시연 상태를 '${getStatusText(newStatus)}'(으)로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setUpdatingStatusId(demoId);

      // 서버에 상태 변경 요청
      await updateDemoStatusMutation.mutateAsync({
        id: demoId,
        data: { status: newStatus },
      });

      // 성공 시 토스트 메시지
      toast.success(
        `시연 상태가 '${getStatusText(newStatus)}'로 변경되었습니다.`
      );

      // 데이터 새로고침
      await refetch();
    } catch (error) {
      console.error("상태 변경 실패:", error);

      // 서버에서 오는 에러 메시지를 그대로 표시
      let errorMessage = "상태 변경에 실패했습니다.";
      let errorDetails = "";
      let errorTitle = "상태 변경 실패";

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;

        // 에러 타입별로 추가 정보 제공
        if (error.message.includes("재고")) {
          errorTitle = "재고 부족";
          errorDetails =
            "재고가 부족하여 상태 변경이 불가능합니다.\n\n• 재고 현황을 확인해주세요\n• 품목 수량을 조정해주세요\n• 담당자에게 문의해주세요";
        } else if (error.message.includes("권한")) {
          errorTitle = "권한 부족";
          errorDetails =
            "해당 작업을 수행할 권한이 없습니다.\n\n• 관리자에게 문의해주세요\n• 필요한 권한을 요청해주세요";
        } else if (error.message.includes("네트워크")) {
          errorTitle = "네트워크 오류";
          errorDetails =
            "네트워크 연결에 문제가 있습니다.\n\n• 인터넷 연결을 확인해주세요\n• 잠시 후 다시 시도해주세요";
        } else if (error.message.includes("시간")) {
          errorTitle = "요청 시간 초과";
          errorDetails =
            "요청 시간이 초과되었습니다.\n\n• 잠시 후 다시 시도해주세요\n• 서버 상태를 확인해주세요";
        } else if (error.message.includes("서버")) {
          errorTitle = "서버 오류";
          errorDetails =
            "서버에서 오류가 발생했습니다.\n\n• 잠시 후 다시 시도해주세요\n• 문제가 지속되면 관리자에게 문의해주세요";
        }
      }

      // 에러 모달 표시
      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
        details: errorDetails,
      });

      // 토스트로도 간단한 메시지 표시
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#F44336",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
          maxWidth: "400px",
        },
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // 상태 변경 권한 확인
  const canChangeStatus = () => {
    const hasPermission = userAccessLevel === "admin" || userAccessLevel === "moderator";
    console.log("시연 기록 - canChangeStatus 체크:", { userAccessLevel, hasPermission });
    return hasPermission;
  };

  // 상태 색상 클래스
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "confirmedByShipper":
        return "bg-blue-100 text-blue-800";
      case "shipmentCompleted":
        return "bg-purple-100 text-purple-800";
      case "rejectedByShipper":
        return "bg-orange-100 text-orange-800";
      case "demoCompleted":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 상태 호버 클래스
  const getStatusHoverClass = (status: string): string => {
    switch (status) {
      case "requested":
        return "hover:bg-yellow-100 focus:ring-yellow-400";
      case "approved":
        return "hover:bg-green-100 focus:ring-green-400";
      case "rejected":
        return "hover:bg-red-100 focus:ring-red-400";
      case "confirmedByShipper":
        return "hover:bg-blue-100 focus:ring-blue-400";
      case "shipmentCompleted":
        return "hover:bg-purple-100 focus:ring-purple-400";
      case "rejectedByShipper":
        return "hover:bg-orange-100 focus:ring-orange-400";
      case "demoCompleted":
        return "hover:bg-gray-100 focus:ring-gray-400";
      default:
        return "hover:bg-gray-100 focus:ring-gray-400";
    }
  };

  // 상태 아이콘
  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "requested":
        return <FileText className="w-4 h-4" />;
      case "approved":
        return <Package className="w-4 h-4" />;
      case "rejected":
        return <Trash2 className="w-4 h-4" />;
      case "confirmedByShipper":
        return <Truck className="w-4 h-4" />;
      case "shipmentCompleted":
        return <Package className="w-4 h-4" />;
      case "rejectedByShipper":
        return <XCircle className="w-4 h-4" />;
      case "demoCompleted":
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // 권한 확인 함수들 - 제거됨 (확장 기능과 함께 사용됨)
  // const canManageShipment = () => {
  //   return currentUser?.accessLevel === "admin";
  // };

  // const canApproveDemo = () => {
  //   return (
  //     currentUser?.accessLevel === "admin" ||
  //     currentUser?.accessLevel === "moderator"
  //   );
  // };

  // 현재 상태에서 가능한 다음 상태들 반환 - 제거됨 (확장 기능과 함께 사용됨)
  // const getAvailableStatuses = (currentStatus: string): DemoStatus[] => {
  //   // 상태 반환 로직
  // };

  // 수정 모달 닫기
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedDemo(null);
  };

  // 수정 성공 후 처리
  const handleEditSuccess = () => {
    handleRefresh();
  };

  const isMobile = useMediaQuery("(max-width: 759px)");

  return (
    <div className="relative px-4 py-6">
      {/* 로딩 오버레이 */}
      {updateDemoStatusMutation.isPending && (
        <div className="flex absolute inset-0 z-10 justify-center items-center rounded-2xl backdrop-blur-sm bg-gray-900/30">
          <div className="flex flex-col gap-4 items-center p-8 rounded-2xl border border-gray-200 shadow-2xl backdrop-blur-sm bg-white/95">
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 animate-spin border-t-transparent"></div>
            <div className="text-base font-semibold text-gray-800">
              상태 변경 중...
            </div>
            <div className="text-sm text-center text-gray-600">
              잠시만 기다려주세요
            </div>
          </div>
        </div>
      )}
      {/* 헤더 */}
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            시연 기록
          </h1>
          <p className="mt-1 text-base text-gray-500">
            {activeTab === "ongoing"
              ? "진행 중인 시연 요청 및 진행 상황을 확인할 수 있습니다."
              : activeTab === "long-term"
              ? "장기 시연 기록을 확인할 수 있습니다."
              : "완료된 시연 기록을 확인할 수 있습니다."}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading()}
          className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl shadow-sm hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          새로고침
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="제목, 요청자, 담당자, 전화번호, 주소, 품목명 등으로 검색..."
            value={searchTerm}
            onChange={handleSearch}
            className="py-2 pr-4 pl-11 w-full text-base bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 text-base bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="">모든 상태</option>
            <option value="requested">요청</option>
            <option value="approved">승인</option>
            <option value="rejected">반려</option>
            <option value="confirmedByShipper">출고팀 확인</option>
            <option value="demoShipmentCompleted">시연 출고 완료</option>
            <option value="demoShipmentRejected">출고팀 반려</option>
            <option value="demoCompletedAndReturned">시연 복귀 완료</option>
          </select>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex mb-4 gap-1.5 sm:gap-2">
        <button
          onClick={() => handleTabChange("ongoing")}
          className={`group flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-[1.02] ${
            activeTab === "ongoing"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border border-gray-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === "ongoing" ? "animate-pulse" : "group-hover:rotate-12"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="whitespace-nowrap">진행중</span>
          </div>
        </button>
        <button
          onClick={() => handleTabChange("long-term")}
          className={`group flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-[1.02] ${
            activeTab === "long-term"
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200"
              : "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 border border-purple-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === "long-term" ? "" : "group-hover:scale-110"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="whitespace-nowrap">장기 시연</span>
          </div>
        </button>
        <button
          onClick={() => handleTabChange("completed")}
          className={`group flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-base transition-all duration-300 transform hover:scale-[1.02] ${
            activeTab === "completed"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200"
              : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border border-green-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform duration-300 ${activeTab === "completed" ? "" : "group-hover:scale-110"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="whitespace-nowrap">시연종료</span>
          </div>
        </button>
      </div>

      {/* 탭별 기록 수 표시 */}
      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activeTab === "ongoing" ? "진행중" : activeTab === "long-term" ? "장기 시연" : "시연종료"} 시연:{" "}
            <span className="font-semibold text-gray-900">
              {filteredRecords.length}
            </span>
            개
          </div>
          <div className="text-xs text-gray-500">
            전체 시연: {allDemoRecords.length}개
          </div>
        </div>
      </div>

      {/* 현재 페이지 유료 시연 총액 표시 */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        {/* 기간 정보 */}
        {(() => {
          const paidRecords = currentRecords.filter(record => record.demoPrice && record.demoPrice > 0);

          if (paidRecords.length === 0) return null;

          const dates = paidRecords
            .map(record => record.demoStartDate || record.createdAt)
            .filter(date => date)
            .map(date => new Date(date))
            .sort((a, b) => a.getTime() - b.getTime());

          const startDate = dates[0];
          const endDate = dates[dates.length - 1];

          return dates.length > 0 ? (
            <div className="mb-3 pb-3 border-b border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-blue-700 font-medium">시연 기간:</span>
                <span className="text-gray-700">
                  {formatDateForDisplayUTC(startDate.toISOString())}
                  {startDate.getTime() !== endDate.getTime() && (
                    <>
                      <span className="mx-1.5 text-blue-600">~</span>
                      {formatDateForDisplayUTC(endDate.toISOString())}
                    </>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1)}일)
                </span>
              </div>
            </div>
          ) : null;
        })()}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-blue-600 font-medium">현재 페이지 유료 시연</div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-blue-700">
                  {currentRecords.filter(record => record.demoPrice && record.demoPrice > 0).length}
                </span>
                건
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-600 font-medium mb-1">총 대금</div>
            <div className="text-lg font-bold text-blue-700">
              {currentRecords
                .filter(record => record.demoPrice && record.demoPrice > 0)
                .reduce((sum, record) => sum + (record.demoPrice || 0), 0)
                .toLocaleString('ko-KR')}
              <span className="text-sm font-medium ml-1">원</span>
            </div>
          </div>
        </div>

        {/* 결제 유형별 통계 */}
        {(() => {
          const paidRecords = currentRecords.filter(record => record.demoPrice && record.demoPrice > 0);
          const paymentTypes = paidRecords.reduce((acc, record) => {
            const type = record.demoPaymentType || '미지정';
            if (!acc[type]) {
              acc[type] = { count: 0, amount: 0 };
            }
            acc[type].count += 1;
            acc[type].amount += record.demoPrice || 0;
            return acc;
          }, {} as Record<string, { count: number; amount: number }>);

          return Object.keys(paymentTypes).length > 0 ? (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex flex-wrap gap-2">
                {Object.entries(paymentTypes).map(([type, data]) => (
                  <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-blue-100">
                    <span className="text-xs font-medium text-gray-700">{type}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-blue-600 font-semibold">{data.count}건</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-900 font-semibold">
                      {data.amount.toLocaleString('ko-KR')}원
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* 테이블형 리스트 */}
      <div>
        {isLoading() ? (
          <LoadingSkeleton type={isMobile ? 'card' : 'table'} count={10} />
        ) : currentRecords.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl shadow-sm">
            <Package className="mx-auto w-12 h-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              시연 기록이 없습니다
            </h3>
            <p className="mt-1 text-base text-gray-500">
              {searchTerm || statusFilter
                ? "검색 조건을 변경해보세요."
                : "아직 시연 요청이 없습니다."}
            </p>
          </div>
        ) : isMobile ? (
          /* 모바일 카드형 리스트 */
          <div className="space-y-3">
            {currentRecords.map((record, index) => (
              <div
                key={record.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRowClick(record.id)}
              >
                {/* 제목 및 NEW 배지 */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {record.demoTitle || `시연 #${record.id}`}
                      </h3>
                      {isNewRecord(record.createdAt, record.demoStatus) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-sm animate-pulse flex-shrink-0">
                          <Sparkles className="w-3 h-3" />
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      요청자: {record.requester}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getStatusColorClass(
                      record.demoStatus
                    )}`}
                  >
                    {getStatusText(record.demoStatus)}
                  </span>
                </div>

                {/* 시연 정보 */}
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  {record.demoStartDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>시작: {formatDateForDisplayUTC(record.demoStartDate)}</span>
                    </div>
                  )}
                  {record.demoManager && (
                    <div>담당자: {record.demoManager}</div>
                  )}
                  {record.demoNationType && (
                    <div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        record.demoNationType === "국내" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {record.demoNationType}
                      </span>
                    </div>
                  )}
                </div>

                {/* 하단 액션 버튼 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    생성: {formatDateForDisplayUTC(record.createdAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(record.id);
                    }}
                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-colors"
                  >
                    상세
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 데스크톱 테이블형 리스트 */
          <DemoRecordTable
            records={currentRecords}
            getStatusText={getStatusText}
            getStatusColorClass={getStatusColorClass}
            getStatusHoverClass={getStatusHoverClass}
            canChangeStatus={canChangeStatus}
            handleStatusChange={handleStatusChange}
            updatingStatusId={updatingStatusId}
            userAccessLevel={userAccessLevel}
            onDetailClick={(record) => {
              handleRowClick(record.id);
            }}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            activeTab={activeTab}
          />
        )}
      </div>

      {/* 수정 모달 */}
      <DemoEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        demo={selectedDemo}
        onSuccess={handleEditSuccess}
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            {startIndex + 1}-{Math.min(endIndex, sortedRecords.length)} /{" "}
            {sortedRecords.length}개
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 에러 모달 */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-red-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex gap-3 items-start p-6 pb-4 border-b border-red-100">
              <div className="flex-shrink-0 flex justify-center items-center w-10 h-10 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-1">
                  {errorModal.title}
                </h3>
                <p className="text-sm text-red-600 leading-relaxed">
                  {errorModal.message}
                </p>
              </div>
            </div>

            {/* 상세 내용 */}
            {errorModal.details && (
              <div className="p-6 pt-4">
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <h4 className="flex gap-2 items-center mb-3 font-semibold text-red-800">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm sm:text-base">해결 방법</span>
                  </h4>
                  <div className="text-sm leading-relaxed text-red-700 space-y-2">
                    {errorModal.details.split("\n").map((line, index) => (
                      <div key={index}>
                        {line.startsWith("•") ? (
                          <div className="flex gap-2 items-start">
                            <span className="flex-shrink-0 mt-1 text-red-500 text-xs">
                              •
                            </span>
                            <span className="text-sm">
                              {line.substring(1).trim()}
                            </span>
                          </div>
                        ) : line.trim() ? (
                          <span className="block">{line}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-end p-6 pt-4 border-t border-red-100">
              <button
                onClick={closeErrorModal}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-xl shadow-sm transition-colors duration-200 hover:bg-red-700 active:bg-red-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemonstrationRecordTabs;
