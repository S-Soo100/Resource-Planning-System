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
  Settings,
  CheckCircle,
  Clock,
  RefreshCw,
  Edit,
  Search,
  Filter,
} from "lucide-react";
import { DemoResponse, DemoStatus } from "@/types/demo/demo";
import { useDemo } from "@/hooks/useDemo";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { authStore } from "@/store/authStore";
import DemoEditModal from "./DemoEditModal";
import { useRouter } from "next/navigation";

type TabType = "all" | "user" | "supplier";

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

// 날짜 포맷팅 함수 추가
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const DemonstrationRecordTabs = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [userId, setUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<DemoResponse | null>(null);

  const recordsPerPage = 10;

  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { useDemosByTeam, useUpdateDemoStatus } = useDemo();
  const { team: currentTeam } = useCurrentTeam();
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  // 상태 변경 훅
  const updateDemoStatusMutation = useUpdateDemoStatus();

  // 현재 로그인한 사용자 ID 가져오기
  useEffect(() => {
    const user = authStore.getState().user;
    if (user && user.id) {
      setUserId(user.id.toString());
      console.log("현재 사용자 ID:", user.id.toString());

      // 사용자 접근 레벨 설정
      // setUserAccessLevel(user.isAdmin ? "admin" : "user"); // Removed as per edit hint
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

  // 상태 변경 후에도 확장 상태 유지
  useEffect(() => {
    // 데이터가 새로고침된 후에도 마지막 확장된 행을 다시 확장
    // 현재는 상세 페이지로 이동하므로 확장 상태 유지 기능은 비활성화
  }, [demosResponse, expandedRowId]);

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
    if (activeTab === "user" && userId) {
      // '내 시연 기록' 탭인 경우 전체 데이터에서 현재 사용자의 시연만 필터링
      const userIdNum = parseInt(userId);
      const filtered = allDemoRecords.filter((record: DemoResponse) => {
        if (record.userId === null || record.userId === undefined) {
          return false;
        }

        const recordUserId =
          typeof record.userId === "string"
            ? parseInt(record.userId)
            : record.userId;

        return recordUserId === userIdNum;
      });

      console.log(`사용자별 필터링 결과: ${filtered.length}개`);
      return filtered;
    }

    // '전체 시연 기록' 탭인 경우 전체 데이터 반환
    console.log(`전체 시연 기록: ${allDemoRecords.length}개`);
    return allDemoRecords;
  }, [allDemoRecords, activeTab, userId]);

  // 검색 및 필터링 적용
  const filteredRecords = useMemo((): DemoResponse[] => {
    let filtered = demoRecords;

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(
        (record: DemoResponse) =>
          record.demoTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.demoManager
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.demoAddress?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // 파일 다운로드 핸들러
  const handleFileDownload = async (file: DemoResponse["files"][number]) => {
    try {
      if (!file.fileUrl) {
        toast.error("파일 URL이 없습니다.");
        return;
      }

      // 파일 확장자 확인
      const fileName = file.fileName || "";
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      // 이미지나 PDF는 새 탭에서 열기, 나머지는 다운로드
      const isViewableFile = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "pdf",
      ].includes(fileExtension || "");

      const link = document.createElement("a");
      link.href = file.fileUrl;

      if (isViewableFile) {
        // 새 탭에서 열기
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        toast.success("파일이 새 탭에서 열렸습니다.");
      } else {
        // 다운로드
        link.download = file.fileName || "download";
        toast.success("파일이 다운로드되었습니다.");
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("파일 처리 중 오류:", error);
      toast.error("파일 처리에 실패했습니다.");
    }
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

  // 권한 확인 함수들
  const canManageShipment = () => {
    return currentUser?.accessLevel === "admin";
  };

  const canApproveDemo = () => {
    return (
      currentUser?.accessLevel === "admin" ||
      currentUser?.accessLevel === "moderator"
    );
  };

  // 현재 상태에서 가능한 다음 상태들 반환
  const getAvailableStatuses = (currentStatus: string): DemoStatus[] => {
    switch (currentStatus) {
      case "requested":
        return canApproveDemo()
          ? [DemoStatus.approved, DemoStatus.rejected]
          : [];
      case "approved":
        return canManageShipment()
          ? [
              DemoStatus.confirmedByShipper,
              DemoStatus.shipmentCompleted,
              DemoStatus.rejected,
            ]
          : [];
      case "confirmedByShipper":
        return canManageShipment()
          ? [DemoStatus.shipmentCompleted, DemoStatus.rejectedByShipper]
          : [];
      case "shipmentCompleted":
        return canManageShipment() ? [DemoStatus.demoCompleted] : [];
      default:
        return [];
    }
  };

  // 상태 변경 핸들러
  const handleStatusChange = async (demoId: number, newStatus: DemoStatus) => {
    try {
      // 현재 확장된 행 ID를 저장
      const currentExpandedId = expandedRowId;

      await updateDemoStatusMutation.mutateAsync({
        id: demoId,
        data: { status: newStatus },
      });

      toast.success("시연 상태가 변경되었습니다.");

      // 상태 변경 완료 후에도 확장 상태 유지
      // React Query의 캐시 무효화로 인한 리렌더링 후에도 확장 상태 유지
      setTimeout(() => {
        if (currentExpandedId === demoId) {
          setExpandedRowId(demoId);
        }
      }, 100);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  // 상태 변경 버튼 렌더링
  const renderStatusChangeButtons = (record: DemoResponse) => {
    const availableStatuses = getAvailableStatuses(record.demoStatus);

    if (availableStatuses.length === 0) {
      return null;
    }

    return (
      <div className="p-4 mt-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex gap-2 items-center mb-3">
          <Settings className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-900">상태 변경</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(record.id, status)}
              disabled={updateDemoStatusMutation.isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                status === DemoStatus.approved
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : status === DemoStatus.rejected
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : status === DemoStatus.confirmedByShipper
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : status === DemoStatus.shipmentCompleted
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  : status === DemoStatus.rejectedByShipper
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : status === DemoStatus.demoCompleted
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {updateDemoStatusMutation.isPending ? (
                <div className="mr-1 w-3 h-3 rounded-full border-2 border-current animate-spin border-t-transparent"></div>
              ) : (
                <>
                  {status === DemoStatus.approved && (
                    <CheckCircle className="mr-1 w-3 h-3" />
                  )}
                  {status === DemoStatus.rejected && (
                    <XCircle className="mr-1 w-3 h-3" />
                  )}
                  {status === DemoStatus.confirmedByShipper && (
                    <Clock className="mr-1 w-3 h-3" />
                  )}
                  {status === DemoStatus.shipmentCompleted && (
                    <Truck className="mr-1 w-3 h-3" />
                  )}
                  {status === DemoStatus.rejectedByShipper && (
                    <XCircle className="mr-1 w-3 h-3" />
                  )}
                  {status === DemoStatus.demoCompleted && (
                    <CheckCircle className="mr-1 w-3 h-3" />
                  )}
                </>
              )}
              {updateDemoStatusMutation.isPending
                ? "변경 중..."
                : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 수정 모달 열기
  const handleEditClick = (record: DemoResponse) => {
    setSelectedDemo(record);
    setIsEditModalOpen(true);
  };

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
    <div className="relative px-4 py-6 mx-auto max-w-3xl">
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
            시연 요청 및 진행 상황을 확인할 수 있습니다.
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

      {/* 탭 */}
      <div className="flex mb-4 space-x-2">
        <button
          onClick={() => handleTabChange("all")}
          className={`px-5 py-2 rounded-xl font-semibold text-base transition-colors shadow-sm ${
            activeTab === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          전체 시연 기록
        </button>
        <button
          onClick={() => handleTabChange("user")}
          className={`px-5 py-2 rounded-xl font-semibold text-base transition-colors shadow-sm ${
            activeTab === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          내 시연 기록
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="시연 제목, 요청자, 담당자, 주소로 검색..."
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
          currentRecords.map((record: DemoResponse) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm transition-shadow cursor-pointer hover:shadow-md"
              onClick={() => handleRowClick(record.id)}
            >
              {/* 상단 요약 */}
              <div className="flex justify-between items-start px-4 py-3 border-b border-gray-100">
                {/* 왼쪽: 타이틀 + 유/무료, 요청자 */}
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-gray-900 truncate">
                    {record.demoTitle || "제목 없음"}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {record.demoPaymentType}{" "}
                    {record.demoPrice &&
                      `(${record.demoPrice.toLocaleString()}원)`}{" "}
                    • {record.requester}
                  </div>
                </div>
                {/* 오른쪽: 날짜 + 상태 */}
                <div className="flex flex-col gap-1 items-end ml-3">
                  <div className="text-xs text-gray-400">
                    {formatDate(record.demoStartDate)} ~{" "}
                    {formatDate(record.demoEndDate)}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColorClass(
                      record.demoStatus
                    )}`}
                  >
                    {getStatusIcon(record.demoStatus)}
                    <span className="ml-1">
                      {getStatusText(record.demoStatus)}
                    </span>
                  </span>
                </div>
              </div>
              {/* 상세 정보 */}
              {expandedRowId === record.id && (
                <div className="px-4 py-4 bg-gray-50 rounded-b-xl">
                  {/* 상세보기 버튼 */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/demoRecord/${record.id}?teamId=${
                            currentTeam?.id || ""
                          }`
                        );
                      }}
                      className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      상세보기
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-6 pb-4 mb-4 border-b border-gray-200 md:grid-cols-2">
                    <div>
                      <div className="mb-2 font-semibold text-gray-900">
                        시연 상세 정보
                      </div>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">시연 제목:</span>{" "}
                          {record.demoTitle}
                        </div>
                        <div>
                          <span className="font-medium">시연 장소:</span>{" "}
                          {record.demoAddress}
                        </div>
                        <div>
                          <span className="font-medium">시연 유형:</span>{" "}
                          {record.demoNationType} • {record.demoPaymentType}
                        </div>
                        {record.demoPrice && (
                          <div>
                            <span className="font-medium">시연 비용:</span>{" "}
                            {record.demoPrice.toLocaleString()}원
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 font-semibold text-gray-900">
                        시연 일정
                      </div>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">상차:</span>{" "}
                          {formatDate(record.demoStartDate)}{" "}
                          {record.demoStartTime} (
                          {record.demoStartDeliveryMethod})
                        </div>
                        <div>
                          <span className="font-medium">하차:</span>{" "}
                          {formatDate(record.demoEndDate)} {record.demoEndTime}{" "}
                          ({record.demoEndDeliveryMethod})
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 품목 테이블 */}
                  {record.demoItems && record.demoItems.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 font-semibold text-gray-900">
                        시연 품목 ({record.demoItems.length}개)
                      </div>
                      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 font-medium text-left text-gray-500">
                                품목명
                              </th>
                              <th className="px-4 py-2 font-medium text-left text-gray-500">
                                수량
                              </th>
                              <th className="px-4 py-2 font-medium text-left text-gray-500">
                                메모
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.demoItems.map(
                              (
                                item: DemoResponse["demoItems"][number],
                                index: number
                              ) => (
                                <tr
                                  key={index}
                                  className="border-t border-gray-100"
                                >
                                  <td className="px-4 py-2 text-gray-900">
                                    {item.item?.teamItem?.itemName ||
                                      "알 수 없는 품목"}
                                  </td>
                                  <td className="px-4 py-2 text-gray-700">
                                    {item.quantity}개
                                  </td>
                                  <td className="px-4 py-2 text-gray-500">
                                    {item.memo || "-"}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {/* 메모 */}
                  {record.memo && (
                    <div className="mb-4">
                      <div className="mb-2 font-semibold text-gray-900">
                        메모
                      </div>
                      <div className="p-3 text-sm text-gray-700 bg-white rounded-xl border border-gray-200">
                        {record.memo}
                      </div>
                    </div>
                  )}
                  {/* 첨부 파일 */}
                  {record.files && record.files.length > 0 && (
                    <div className="mb-2">
                      <div className="mb-2 font-semibold text-gray-900">
                        첨부 파일 ({record.files.length}개)
                      </div>
                      <div className="space-y-2">
                        {record.files.map(
                          (
                            file: DemoResponse["files"][number],
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <FileText className="w-4 h-4 text-gray-400" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileDownload(file);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {file.fileName || `파일 ${index + 1}`}
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 상태 변경 섹션 */}
                  {renderStatusChangeButtons(record)}

                  {/* 수정 버튼 - 시연 종료 상태가 아닐 때만 표시 */}
                  {record.demoStatus !== "demoCompleted" && (
                    <div className="p-4 mt-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex gap-2 items-center mb-3">
                        <Edit className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-900">
                          기록 수정
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(record);
                          }}
                          className="flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                          <Edit className="mr-1 w-3 h-3" />
                          수정하기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
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
    </div>
  );
};

export default DemonstrationRecordTabs;
