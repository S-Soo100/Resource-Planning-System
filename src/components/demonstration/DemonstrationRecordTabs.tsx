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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { DemoResponse } from "@/types/demo/demo";
import { useDemo } from "@/hooks/useDemo";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
// import { useCurrentUser } from "@/hooks/useCurrentUser"; // 제거됨
import { authStore } from "@/store/authStore";
import DemoEditModal from "./DemoEditModal";
import { useRouter } from "next/navigation";
// import { useDeleteDemo } from "@/hooks/(useDemo)/useDemoMutations"; // 제거됨
import { DemoStatus } from "@/types/demo/demo";
import { formatDateForDisplay, formatDateForDisplayUTC } from "@/utils/dateUtils";
import { formatDateTimeToKorean } from "@/utils/calendar/calendarUtils";

type TabType = "ongoing" | "completed";

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

const DemonstrationRecordTabs = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ongoing");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
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

  // 검색, 필터링 및 정렬 적용
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
          record.receiverPhone
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

    // 시연 시작일 기준 정렬
    filtered.sort((a, b) => {
      const dateA = new Date(a.demoStartDate || '');
      const dateB = new Date(b.demoStartDate || '');

      // 날짜가 유효하지 않은 경우 처리
      const isValidDateA = !isNaN(dateA.getTime());
      const isValidDateB = !isNaN(dateB.getTime());

      // 둘 다 유효한 날짜인 경우
      if (isValidDateA && isValidDateB) {
        return sortOrder === "desc"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      }

      // 하나만 유효한 날짜인 경우, 유효한 날짜를 앞에 배치
      if (isValidDateA && !isValidDateB) return -1;
      if (!isValidDateA && isValidDateB) return 1;

      // 둘 다 유효하지 않은 경우, ID 기준으로 정렬
      return sortOrder === "desc"
        ? b.id - a.id
        : a.id - b.id;
    });

    return filtered;
  }, [demoRecords, searchTerm, statusFilter, sortOrder]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
    setStatusFilter("");
  };

  // 정렬 순서 변경 핸들러
  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    setCurrentPage(1);
  };

  // 카드 토글 핸들러
  const handleCardToggle = (recordId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
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
          <button
            onClick={handleSortOrderChange}
            className="flex items-center px-3 py-2 space-x-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            title={`시연 시작일 기준 ${sortOrder === "desc" ? "최신순" : "오래된순"} 정렬`}
          >
            {sortOrder === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {sortOrder === "desc" ? "최신순" : "오래된순"}
            </span>
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => handleTabChange("ongoing")}
          className={`flex-1 px-5 py-2 rounded-xl font-semibold text-base transition-colors shadow-sm ${
            activeTab === "ongoing"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          진행중
        </button>
        <button
          onClick={() => handleTabChange("completed")}
          className={`flex-1 px-5 py-2 rounded-xl font-semibold text-base transition-colors shadow-sm ${
            activeTab === "completed"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          시연종료
        </button>
      </div>

      {/* 탭별 기록 수 표시 */}
      <div className="mb-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {activeTab === "ongoing" ? "진행중" : "시연종료"} 시연:{" "}
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

      {/* 카드형 테이블 */}
      <div className="space-y-4">
        {isLoading() ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          </div>
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
        ) : (
          currentRecords.map((record: DemoResponse, index: number) => {
            const isExpanded = expandedCards.has(record.id);
            return (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => handleCardToggle(record.id)}
                >
                  {/* 왼쪽: 인덱스 + 기본 정보 */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-sm text-gray-500 font-medium w-6">
                      {startIndex + index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {record.demoTitle || "제목 없음"}
                      </h3>
                      <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>
                          {record.requester} • {formatDateTimeToKorean(record.demoStartDate)}
                          {record.demoPaymentType === "유료" && record.demoPrice && (
                            <span className="text-green-600 font-medium">
                              {" "}({record.demoPrice.toLocaleString()}원)
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-400">
                          생성일: {formatDateForDisplayUTC(record.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 상태 표시 + 상태 변경 + 상세보기 버튼 */}
                  <div className="flex items-center space-x-2">
                    {/* 현재 상태 색상 표시 */}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColorClass(
                        record.demoStatus
                      )}`}
                    >
                      {getStatusText(record.demoStatus)}
                    </span>

                    {/* 상태 변경 (권한이 있는 경우만) */}
                    {canChangeStatus() && (
                      <select
                        value={record.demoStatus}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(
                            record.id,
                            e.target.value as DemoStatus
                          );
                        }}
                        disabled={updatingStatusId === record.id}
                        className="text-xs bg-white border border-gray-300 rounded px-2 py-1 disabled:opacity-50 min-w-[100px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 권한에 따라 다른 선택지 표시 */}
                        {userAccessLevel === "moderator" ? (
                          // Moderator: 초기 승인 단계만 가능
                          <>
                            <option value="requested">요청</option>
                            <option value="approved">승인</option>
                            <option value="rejected">반려</option>
                          </>
                        ) : userAccessLevel === "admin" ? (
                          // Admin: 모든 상태 변경 가능
                          <>
                            <option value="requested">요청</option>
                            <option value="approved">승인</option>
                            <option value="rejected">반려</option>
                            <option value="confirmedByShipper">출고팀 확인</option>
                            <option value="shipmentCompleted">출고 완료</option>
                            <option value="rejectedByShipper">출고팀 반려</option>
                            <option value="demoCompleted">시연 완료</option>
                          </>
                        ) : null}
                      </select>
                    )}

                    {updatingStatusId === record.id && (
                      <div className="w-4 h-4 rounded-full border-2 animate-spin border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                    )}

                    {/* 상세보기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(record.id);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 transition-colors"
                    >
                      상세보기
                    </button>
                  </div>
                </div>

                {/* 확장된 정보 */}
                {isExpanded && (
                  <div className="px-4 pb-3 border-t border-gray-100 bg-gray-50">
                    <div className="pt-3 space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">물품 일정:</span>
                        <span className="text-gray-600">
                          상차: {formatDateTimeToKorean(record.demoStartDate, record.demoStartTime)} / 하차: {formatDateTimeToKorean(record.demoEndDate, record.demoEndTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">시연품 배송장소:</span>
                        <span className="text-gray-600">
                          {record.demoAddress || "미정"}
                          {(record.demoStartDeliveryMethod || record.demoEndDeliveryMethod) && (
                            <span className="text-gray-500">
                              {" "}(상차: {record.demoStartDeliveryMethod || "미정"} / 하차: {record.demoEndDeliveryMethod || "미정"})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-gray-700 flex-shrink-0">시연 품목:</span>
                        <div className="text-gray-600">
                          {record.demoItems && record.demoItems.length > 0 ? (
                            <div className="space-y-1">
                              {record.demoItems.map((item, itemIndex) => (
                                <div key={itemIndex} className="text-sm">
                                  {item.item?.teamItem?.itemName || "품목명 없음"} ({item.quantity || 0}개)
                                </div>
                              ))}
                            </div>
                          ) : (
                            "품목 정보 없음"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
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
            {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} /{" "}
            {filteredRecords.length}개
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
