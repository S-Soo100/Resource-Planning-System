"use client";

import { useState, useEffect, useMemo } from "react";
import { useDemo } from "@/hooks/useDemo";
import { DemoResponse } from "@/types/demo/demo";
import { authStore } from "@/store/authStore";
import React from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Package,
  Truck,
  Trash2,
  FileText,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";

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
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [userId, setUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const recordsPerPage = 10;

  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { useDemosByTeam } = useDemo();
  const { team: currentTeam } = useCurrentTeam();
  const queryClient = useQueryClient();

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
  const { data: demosResponse, isLoading: isLoadingDemos } = useDemosByTeam(
    currentTeam?.id || 0
  );

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
        return "출고팀 확인";
      case "demoShipmentCompleted":
        return "시연 출고 완료";
      case "demoShipmentRejected":
        return "출고팀 반려";
      case "demoCompletedAndReturned":
        return "시연 복귀 완료";
      default:
        return status;
    }
  };

  // 행 클릭 핸들러
  const handleRowClick = (recordId: number) => {
    setExpandedRowId(expandedRowId === recordId ? null : recordId);
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
      case "demoShipmentCompleted":
        return "bg-purple-100 text-purple-800";
      case "demoShipmentRejected":
        return "bg-red-100 text-red-800";
      case "demoCompletedAndReturned":
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
      case "demoShipmentCompleted":
        return <Package className="w-4 h-4" />;
      case "demoShipmentRejected":
        return <Trash2 className="w-4 h-4" />;
      case "demoCompletedAndReturned":
        return <Calendar className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            시연 기록
          </h1>
          <p className="text-gray-500 mt-1 text-base">
            시연 요청 및 진행 상황을 확인할 수 있습니다.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading()}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          새로고침
        </button>
      </div>

      {/* 탭 */}
      <div className="flex space-x-2 mb-4">
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
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="시연 제목, 요청자, 담당자, 주소로 검색..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-11 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base"
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
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
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
                    {record.demoPaymentType} • {record.requester}
                  </div>
                </div>
                {/* 오른쪽: 날짜 + 상태 */}
                <div className="flex flex-col items-end gap-1 ml-3">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-4 mb-4">
                    <div>
                      <div className="font-semibold text-gray-900 mb-2">
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
                      <div className="font-semibold text-gray-900 mb-2">
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
                      <div className="font-semibold text-gray-900 mb-2">
                        시연 품목 ({record.demoItems.length}개)
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
                                품목명
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
                                수량
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-gray-500">
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
                      <div className="font-semibold text-gray-900 mb-2">
                        메모
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-3 text-sm text-gray-700">
                        {record.memo}
                      </div>
                    </div>
                  )}
                  {/* 첨부 파일 */}
                  {record.files && record.files.length > 0 && (
                    <div className="mb-2">
                      <div className="font-semibold text-gray-900 mb-2">
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
                              <span className="text-gray-700">
                                {file.fileName || `파일 ${index + 1}`}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} /{" "}
            {filteredRecords.length}개
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
