"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrder } from "@/hooks/useOrder";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { authStore } from "@/store/authStore";
import { useSuppliers } from "@/hooks/useSupplier";
import { Supplier } from "@/types/supplier";
import { ApiResponse } from "@/types/common";
import { Order, OrderStatus } from "@/types/(order)/order";
import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Package,
  Truck,
} from "lucide-react";

type TabType = "all" | "user" | "supplier";

interface OrderResponse extends ApiResponse {
  data: Order[];
}

// API 응답 데이터를 IOrderRecord 형식으로 변환하는 함수
const convertToOrderRecord = (order: Order): IOrderRecord => {
  return {
    id: order.id,
    userId: order.userId,
    supplierId: order.supplierId || 0,
    packageId: order.packageId || 0,
    requester: order.user?.name || "알 수 없음",
    receiver: order.receiver || "",
    receiverPhone: order.receiverPhone || "",
    receiverAddress: order.receiverAddress || "",
    purchaseDate: order.purchaseDate || new Date(order.createdAt).toISOString(),
    outboundDate: order.outboundDate || "",
    installationDate: order.installationDate || "",
    manager: order.manager || "",
    status: order.status || OrderStatus.requested,
    memo: order.memo || "",
    createdAt: order.createdAt,
    updatedAt: order.updatedAt || order.createdAt,
    deletedAt: order.deletedAt || null,
    user: order.user
      ? {
          id: order.user.id,
          email: order.user.email || "",
          name: order.user.name || "",
        }
      : undefined,
    supplier: order.supplier,
    package: order.package
      ? {
          id: order.package.id,
          packageName: order.package.packageName || "개별 품목",
          itemlist: Array.isArray(order.package.itemlist)
            ? order.package.itemlist
            : [],
        }
      : undefined,
    orderItems: order.orderItems || [],
    files: order.files || [],
  };
};

const OrderRecordTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [userId, setUserId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const recordsPerPage = 10;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { useAllOrders, useSupplierOrders } = useOrder();
  const { useGetSuppliers } = useSuppliers();

  // 현재 로그인한 사용자 ID 가져오기
  useEffect(() => {
    const user = authStore.getState().user;
    if (user && user.id) {
      setUserId(user.id.toString());
      console.log("현재 사용자 ID:", user.id.toString());
    }
  }, []);

  // 거래처 목록 조회 훅 사용
  const { suppliers: suppliersResponse, isLoading: suppliersLoading } =
    useGetSuppliers();

  // 거래처 목록 가져오기 (지연 로딩 적용)
  useEffect(() => {
    if (activeTab === "supplier") {
      // 거래처 탭으로 변경될 때 0.5초 후 로딩 시작
      const timer = setTimeout(() => {
        setIsLoadingSuppliers(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 거래처 목록 설정
  useEffect(() => {
    if (suppliersResponse && !suppliersLoading && isLoadingSuppliers) {
      // API 응답 데이터 구조에 맞게 처리
      if (
        typeof suppliersResponse === "object" &&
        "data" in suppliersResponse
      ) {
        setSuppliers(suppliersResponse.data as Supplier[]);
      } else {
        setSuppliers(suppliersResponse as Supplier[]);
      }
      setIsLoadingSuppliers(false);
    }
  }, [suppliersResponse, suppliersLoading, isLoadingSuppliers]);

  // 전체 주문 데이터와 공급업체별 주문 데이터만 API에서 가져오기
  const currentTeamId =
    Number(authStore((state) => state.selectedTeam?.id)) || 1;
  const { data: allOrders, isLoading: allLoading } =
    useAllOrders(currentTeamId);
  const { data: supplierOrders, isLoading: supplierLoading } =
    useSupplierOrders(supplierId);

  // 현재 활성화된 탭에 따라 기본 데이터 선택
  const baseApiResponse = useMemo(() => {
    switch (activeTab) {
      case "supplier":
        return supplierOrders as OrderResponse;
      case "all":
      case "user": // 사용자별 데이터도 전체 데이터에서 필터링
      default:
        return allOrders as OrderResponse;
    }
  }, [activeTab, allOrders, supplierOrders]);

  // API 응답 데이터를 IOrderRecord 형식으로 변환 (useMemo로 최적화)
  const allOrderRecords = useMemo(() => {
    if (baseApiResponse?.success && baseApiResponse?.data) {
      // console.log(
      //   `기본 데이터 변환 중 - 데이터 개수: ${baseApiResponse.data.length}`
      // );
      return baseApiResponse.data.map(convertToOrderRecord);
    }
    return [];
  }, [baseApiResponse]);

  // 현재 탭에 맞게 필터링된 주문 기록
  const orderRecords = useMemo(() => {
    if (activeTab === "user" && userId) {
      // '내 발주 기록' 탭인 경우 전체 데이터에서 현재 사용자의 주문만 필터링
      const userIdNum = parseInt(userId);
      // console.log(
      //   `현재 사용자 ID(숫자): ${userIdNum}, 타입: ${typeof userIdNum}`
      // );

      // 첫 번째 레코드의 userId 타입과 값 로깅 (디버깅용)
      // if (allOrderRecords.length > 0) {
      //   const firstRecord = allOrderRecords[0];
      //   console.log(
      //     `첫 번째 레코드의 userId: ${
      //       firstRecord.userId
      //     }, 타입: ${typeof firstRecord.userId}`
      //   );
      // }

      const filtered = allOrderRecords.filter((record) => {
        // userId가 null이나 undefined인 경우 처리
        if (record.userId === null || record.userId === undefined) {
          // console.log(
          //   `userId가 null 또는 undefined인 레코드 발견: ${record.id}`
          // );
          return false;
        }

        // record.userId가 문자열인 경우를 대비해 양쪽 모두 숫자로 변환하여 비교
        const recordUserId =
          typeof record.userId === "string"
            ? parseInt(record.userId)
            : record.userId;

        // 비교 결과 로깅 (디버깅용)
        if (recordUserId === userIdNum) {
          console.log(
            `일치하는 레코드 발견: recordUserId=${recordUserId}, userIdNum=${userIdNum}`
          );
        }

        return recordUserId === userIdNum;
      });

      // console.log(`사용자 ID ${userId}로 필터링된 주문: ${filtered.length}개`);
      // console.log(`필터링 전 전체 주문: ${allOrderRecords.length}개`);
      return filtered;
    }
    return allOrderRecords;
  }, [activeTab, allOrderRecords, userId]);

  // 검색 필터링 적용 (useMemo로 최적화)
  const filteredOrders = useMemo(() => {
    // console.log(
    //   `검색어 "${searchTerm}"로 ${orderRecords.length}개 항목 필터링`
    // );
    return orderRecords.filter(
      (order: IOrderRecord) =>
        order.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.package?.packageName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.receiver?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orderRecords, searchTerm]);

  // 페이지네이션 계산 (useMemo로 최적화)
  const { totalPages, currentRecords } = useMemo(() => {
    const total = Math.ceil(filteredOrders.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const records = filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);

    console.log(
      `페이지네이션: ${currentPage}/${total} 페이지, ${records.length}개 표시`
    );

    return {
      totalPages: total,
      currentRecords: records,
    };
  }, [filteredOrders, currentPage, recordsPerPage]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    console.log(`탭 변경: ${activeTab} -> ${tab}`);
    setActiveTab(tab);
    setCurrentPage(1); // 탭 변경 시 첫 페이지로 이동
  };

  // 검색 핸들러
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSupplierId(e.target.value);
    console.log(`거래처 변경: ${e.target.value}`);
  };

  // 페이지네이션 핸들러
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // 로딩 상태 확인
  const isLoading = () => {
    switch (activeTab) {
      case "supplier":
        return supplierLoading && supplierId !== "";
      case "all":
      case "user": // 사용자 탭은 전체 데이터를 사용하므로 전체 데이터 로딩 상태 확인
      default:
        return allLoading;
    }
  };

  // 주문 상태를 한글로 변환
  const getStatusText = (status: string): string => {
    switch (status) {
      case OrderStatus.requested:
        return "요청됨";
      case OrderStatus.approved:
        return "승인됨";
      case OrderStatus.rejected:
        return "반려됨";
      case OrderStatus.confirmedByShipper:
        return "출고자 확인";
      case OrderStatus.shipmentCompleted:
        return "출고 완료";
      case OrderStatus.rejectedByShipper:
        return "출고자 반려";
      default:
        return status;
    }
  };

  // 행 클릭 핸들러 추가
  const handleRowClick = (recordId: number) => {
    // 이미 확장된 행을 다시 클릭하면 접기
    if (expandedRowId === recordId) {
      setExpandedRowId(null);
    } else {
      // 다른 행을 클릭하면 해당 행 확장
      setExpandedRowId(recordId);
    }
  };

  // 데이터 새로고침 핸들러 추가
  const handleRefresh = () => {
    setIsRefreshing(true);
    // 현재 탭에 따라 적절한 쿼리 다시 가져오기
    setTimeout(() => {
      setIsRefreshing(false);
      setCurrentPage(1);
    }, 800);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Package className="mr-2 text-blue-600" />
            발주 기록 관리
          </h1>
          <button
            onClick={handleRefresh}
            className="mt-2 md:mt-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-sm transition-colors"
          >
            <RefreshCw
              size={16}
              className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`}
            />
            새로고침
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="flex mb-6 border-b">
          <button
            onClick={() => handleTabChange("all")}
            className={`py-3 px-5 font-medium text-sm transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <Package size={18} className="inline-block mr-1" />
            전체 발주 기록
          </button>
          <button
            onClick={() => handleTabChange("user")}
            className={`py-3 px-5 font-medium text-sm transition-colors ${
              activeTab === "user"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <User size={18} className="inline-block mr-1" />내 발주 기록
          </button>
          <button
            onClick={() => handleTabChange("supplier")}
            className={`py-3 px-5 font-medium text-sm transition-colors ${
              activeTab === "supplier"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <Truck size={18} className="inline-block mr-1" />
            거래처별 발주 기록
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="relative flex-grow">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="발주자, 패키지, 수령자 검색..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {activeTab === "user" && (
              <div className="flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-md">
                <User size={16} className="mr-2 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  {authStore.getState().user?.name || "사용자"}의 발주
                </span>
              </div>
            )}

            {activeTab === "supplier" && (
              <div className="flex items-center gap-2 min-w-[200px]">
                <Filter size={16} className="text-gray-500" />
                {isLoadingSuppliers ? (
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                    거래처 목록 로딩 중...
                  </div>
                ) : (
                  <select
                    value={supplierId}
                    onChange={handleSupplierChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">거래처 선택</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id.toString()}>
                        {supplier.supplierName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 데이터 테이블 */}
        {isLoading() ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="mx-3 my-2 bg-white rounded-2xl overflow-hidden shadow-sm w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      발주자
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-3/12">
                      패키지/품목
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-1/12">
                      수량
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      수령자
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      날짜
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-2/12">
                      현재상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentRecords.length > 0 ? (
                    currentRecords.map((record: IOrderRecord) => (
                      <React.Fragment key={record.id}>
                        <tr
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            expandedRowId === record.id
                              ? "bg-gray-50"
                              : "bg-white"
                          }`}
                          onClick={() => handleRowClick(record.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.requester}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">
                            {record.package?.packageName &&
                            record.package.packageName !== "개별 품목"
                              ? record.package.packageName
                              : record.orderItems &&
                                record.orderItems.length > 0
                              ? record.orderItems
                                  .slice(0, 2)
                                  .map(
                                    (item) =>
                                      `${
                                        item.item?.itemName || "알 수 없는 품목"
                                      }${item.quantity}개`
                                  )
                                  .join(", ") +
                                (record.orderItems.length > 2 ? " 외" : "")
                              : "품목 없음"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                            {record.orderItems?.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            ) || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.receiver}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <Calendar
                              size={14}
                              className="inline-block mr-1 text-gray-500"
                            />
                            {new Date(record.createdAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2.5 py-1 text-xs rounded-full ${getStatusColorClass(
                                  record.status
                                )}`}
                              >
                                {getStatusText(record.status)}
                              </span>
                              <div className="ml-2 w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
                                {expandedRowId === record.id ? (
                                  <ChevronUp
                                    size={16}
                                    className="text-gray-500"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={16}
                                    className="text-gray-500"
                                  />
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                        {expandedRowId === record.id && (
                          <tr className="bg-gray-50 transition-all duration-200 ease-in-out">
                            <td colSpan={6} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                  <h3 className="font-bold mb-3 text-gray-700 border-b pb-2 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 mr-2 text-gray-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    발주 상세 정보
                                  </h3>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        생성일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {new Date(
                                          record.createdAt
                                        ).toLocaleDateString("ko-KR")}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        구매일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {record.purchaseDate
                                          ? new Date(
                                              record.purchaseDate
                                            ).toLocaleDateString("ko-KR")
                                          : "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        출고예정일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {record.outboundDate
                                          ? new Date(
                                              record.outboundDate
                                            ).toLocaleDateString("ko-KR")
                                          : "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        설치요청일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {record.installationDate
                                          ? new Date(
                                              record.installationDate
                                            ).toLocaleDateString("ko-KR")
                                          : "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        발주자:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {record.requester}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        담당자:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {record.manager || "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        상태:
                                      </span>
                                      <span
                                        className={`px-3 py-1 text-sm rounded-full ${getStatusColorClass(
                                          record.status
                                        )}`}
                                      >
                                        {getStatusText(record.status)}
                                      </span>
                                    </div>

                                    {/* 주문 아이템 목록 추가 */}
                                    {record.orderItems &&
                                      record.orderItems.length > 0 && (
                                        <div className="mt-5">
                                          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4 mr-2 text-gray-500"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                            </svg>
                                            주문 품목 목록
                                          </h4>

                                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                              <span className="font-medium text-gray-600">
                                                패키지:
                                              </span>
                                              <span className="text-gray-800">
                                                {record.package?.packageName ||
                                                  "-"}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="bg-gray-50 rounded-lg overflow-hidden">
                                            <div className="px-3 py-2 bg-gray-100 text-sm font-medium text-gray-600 flex justify-between">
                                              <span>품목</span>
                                              <span>수량</span>
                                            </div>
                                            <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                                              {record.orderItems.map((item) => (
                                                <li
                                                  key={item.id}
                                                  className="py-2 px-3 hover:bg-gray-100 transition-colors"
                                                >
                                                  <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-700">
                                                      {item.item?.itemName ||
                                                        "알 수 없는 품목"}
                                                    </span>
                                                    <span className="text-gray-600 bg-white px-2 py-1 rounded-md text-sm">
                                                      {item.quantity}개
                                                    </span>
                                                  </div>
                                                  {item.memo && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">
                                                      메모: {item.memo}
                                                    </p>
                                                  )}
                                                </li>
                                              ))}
                                            </ul>
                                            {record.memo && (
                                              <div className="py-2 px-3 bg-gray-100">
                                                <p className="flex justify-between items-center">
                                                  <span className="font-medium text-gray-600">
                                                    추가 요청사항:
                                                  </span>
                                                  <span className="text-gray-800 text-sm italic">
                                                    {record.memo}
                                                  </span>
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                  <h3 className="font-bold mb-3 text-gray-700 border-b pb-2 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 mr-2 text-gray-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-9a1 1 0 00-.293-.707l-2-2A1 1 0 0017 3h-1c0-.552-.447-1-1-1H5a1 1 0 00-1 1H3z" />
                                    </svg>
                                    배송 정보
                                  </h3>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        수령자:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {record.receiver}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600">
                                        연락처:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-3 py-1 rounded-md">
                                        {record.receiverPhone}
                                      </span>
                                    </div>
                                    <div className="flex flex-col border-b border-gray-100 py-2">
                                      <span className="font-medium text-gray-600 mb-1">
                                        주소:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 p-3 rounded-md text-sm break-words">
                                        {record.receiverAddress}
                                      </span>
                                    </div>

                                    {/* 첨부 파일 URL 표시 추가 */}
                                    {record.files &&
                                      record.files.length > 0 && (
                                        <div className="mt-5">
                                          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4 mr-2 text-gray-500"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            첨부 파일
                                          </h4>
                                          <ul className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                                            {record.files.map((file) => (
                                              <li
                                                key={file.id}
                                                className="py-2 px-3 hover:bg-gray-100 transition-colors"
                                              >
                                                <a
                                                  href={file.fileUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-500 hover:text-blue-700 hover:underline flex items-center"
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                    />
                                                  </svg>
                                                  {file.fileName}
                                                </a>
                                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                                  업로드:{" "}
                                                  {new Date(
                                                    file.createdAt
                                                  ).toLocaleDateString("ko-KR")}
                                                </p>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Package size={40} className="text-gray-300 mb-2" />
                          <p>표시할 데이터가 없습니다.</p>
                          <p className="text-sm text-gray-400 mt-1">
                            다른 검색어나 필터를 시도해보세요.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-sm">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } transition-colors`}
              >
                이전
              </button>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  페이지 <span className="font-medium">{currentPage}</span> /{" "}
                  {totalPages || 1}
                </span>
                <span className="mx-4 text-sm text-gray-500">
                  총 {filteredOrders.length}개 항목
                </span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-4 py-2 rounded-full ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } transition-colors`}
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 상태에 따른 색상 클래스 반환 함수 추가
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case OrderStatus.requested:
      return "bg-yellow-50 text-yellow-600";
    case OrderStatus.approved:
      return "bg-green-50 text-green-600";
    case OrderStatus.rejected:
      return "bg-red-50 text-red-600";
    case OrderStatus.confirmedByShipper:
      return "bg-blue-50 text-blue-600";
    case OrderStatus.shipmentCompleted:
      return "bg-purple-50 text-purple-600";
    case OrderStatus.rejectedByShipper:
      return "bg-orange-50 text-orange-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

export default OrderRecordTabs;
