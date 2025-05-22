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
  // ArrowLeft,
} from "lucide-react";
// import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateOrderStatus } from "@/hooks/(useOrder)/useOrderMutations";
import { userApi } from "@/api/user-api";
import { toast } from "react-hot-toast";

// 사용자 접근 레벨 타입 추가
type UserAccessLevel = "user" | "admin" | "supplier" | "moderator";

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

// 날짜 포맷팅 함수 추가
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const OrderRecordTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [userId, setUserId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const recordsPerPage = 10;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);
  const [userAccessLevel, setUserAccessLevel] =
    useState<UserAccessLevel>("user");

  const { useAllOrders, useSupplierOrders } = useOrder();
  const { useGetSuppliers } = useSuppliers();
  // const router = useRouter();
  const queryClient = useQueryClient();

  // 주문 상태 업데이트 hook 추가
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // 현재 로그인한 사용자 ID 가져오기
  useEffect(() => {
    const user = authStore.getState().user;
    if (user && user.id) {
      setUserId(user.id.toString());
      console.log("현재 사용자 ID:", user.id.toString());

      // 사용자 접근 레벨 가져오기
      const fetchUserInfo = async () => {
        try {
          const response = await userApi.getUser(user.id.toString());
          if (response.success && response.data) {
            setUserAccessLevel(response.data.accessLevel);
            console.log("사용자 접근 레벨:", response.data.accessLevel);

            // supplier인 경우 자동으로 "user" 탭 선택
            if (response.data.accessLevel === "supplier") {
              setActiveTab("user");
            }
          } else {
            // 기본값: 관리자인 경우 admin, 아닌 경우 user
            setUserAccessLevel(user.isAdmin ? "admin" : "user");
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 실패:", error);
          setUserAccessLevel(user.isAdmin ? "admin" : "user");
        }
      };

      fetchUserInfo();
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

  // 전체 주문 데이터와 거래처별 주문 데이터만 API에서 가져오기
  const currentTeamId =
    Number(authStore((state) => state.selectedTeam?.id)) || 1;
  const { data: allOrders, isLoading: allLoading } =
    useAllOrders(currentTeamId);
  const { data: supplierOrders, isLoading: supplierLoading } =
    useSupplierOrders(supplierId);

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log("전체 주문 데이터:", allOrders);
    console.log("로딩 상태:", allLoading);
    console.log("현재 팀 ID:", currentTeamId);
  }, [allOrders, allLoading, currentTeamId]);

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
      console.log("API 응답 데이터:", baseApiResponse);
      console.log(
        "변환된 주문 기록:",
        baseApiResponse.data.map(convertToOrderRecord)
      );
      return baseApiResponse.data.map(convertToOrderRecord);
    }
    console.log("API 응답이 없거나 실패:", baseApiResponse);
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
    return orderRecords.filter((order: IOrderRecord) => {
      // 검색어 필터링
      const matchesSearch =
        order.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.package?.packageName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.receiver?.toLowerCase().includes(searchTerm.toLowerCase());

      // 상태 필터링
      const matchesStatus =
        statusFilter === "" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orderRecords, searchTerm, statusFilter]);

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

  // 상태 필터 핸들러 추가
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
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
        return "요청";
      case OrderStatus.approved:
        return "승인";
      case OrderStatus.rejected:
        return "반려";
      case OrderStatus.confirmedByShipper:
        return "출확";
      case OrderStatus.shipmentCompleted:
        return "출고";
      case OrderStatus.rejectedByShipper:
        return "출반";
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

  // 데이터 새로고침 핸들러 수정
  const handleRefresh = () => {
    setIsRefreshing(true);

    // 현재 탭에 따라 적절한 쿼리 키를 무효화합니다
    if (activeTab === "supplier" && supplierId) {
      queryClient.invalidateQueries({
        queryKey: ["orders", "supplier", supplierId],
      });
    } else if (activeTab === "user" && userId) {
      queryClient.invalidateQueries({ queryKey: ["orders", "user", userId] });
    } else {
      queryClient.invalidateQueries({
        queryKey: ["orders", "team", currentTeamId],
      });
    }

    // 데이터가 다시 로드될 때까지 약간의 지연 후 로딩 상태 해제
    setTimeout(() => {
      setIsRefreshing(false);
      setCurrentPage(1); // 첫 페이지로 이동
    }, 800);
  };

  // 상태 변경 핸들러 추가
  const handleStatusChange = async (
    orderId: number,
    newStatus: OrderStatus
  ) => {
    // 사용자에게 확인 요청
    if (
      !window.confirm(
        `정말 주문 상태를 '${getStatusText(newStatus)}'(으)로 변경하시겠습니까?`
      )
    ) {
      return; // 취소한 경우 함수 종료
    }

    try {
      setIsUpdatingStatus(orderId);

      // useUpdateOrderStatus hook 호출
      await updateOrderStatusMutation.mutateAsync({
        id: orderId.toString(),
        data: { status: newStatus },
      });

      // 출고 완료 상태로 변경된 경우 추가 액션 수행
      if (newStatus === OrderStatus.shipmentCompleted) {
        try {
          // 1. 재고 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["inventory"] });

          // 2. 입/출고 정보 최신화
          await queryClient.invalidateQueries({ queryKey: ["shipments"] });

          // 3. 주문 정보도 함께 최신화
          await queryClient.invalidateQueries({ queryKey: ["orders"] });

          alert("출고 완료, 재고에 반영 했습니다.");
          toast.success(
            "출고 완료 처리되었습니다. 재고가 업데이트되었습니다.",
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
        } catch (error) {
          console.error("데이터 최신화 실패:", error);
          alert("출고 완료 처리 중 오류가 발생했습니다.");
          toast.error("데이터 최신화 중 오류가 발생했습니다.", {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#F44336",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
          });
        }
      } else {
        alert("주문 상태가 변경되었습니다.");
        toast.success("주문 상태가 변경되었습니다.", {
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

      console.log(`주문 ID ${orderId}의 상태를 ${newStatus}로 변경했습니다.`);

      // 상태 업데이트 후 데이터 새로고침
      handleRefresh();
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      alert("주문 상태 업데이트에 실패했습니다.");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // 권한 확인 함수 추가
  const hasPermissionToChangeStatus = () => {
    return userAccessLevel === "admin" || userAccessLevel === "moderator";
  };

  // 상태 변경 드롭다운 컴포넌트
  const StatusDropdown = ({ record }: { record: IOrderRecord }) => {
    // 권한이 없는 경우 상태만 표시
    if (!hasPermissionToChangeStatus()) {
      return (
        <div
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
            record.status
          )}`}
        >
          {getStatusText(record.status)}
        </div>
      );
    }

    // 출고 완료 상태인 경우 상태만 표시하고 변경 불가
    if (record.status === OrderStatus.shipmentCompleted) {
      return (
        <div
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
            record.status
          )} cursor-not-allowed`}
          title="출고 완료된 주문은 상태를 변경할 수 없습니다"
        >
          {getStatusText(record.status)}
        </div>
      );
    }

    // 권한이 있는 경우 드롭다운 표시
    return (
      <div className="relative">
        <select
          value={record.status}
          onChange={(e) =>
            handleStatusChange(record.id, e.target.value as OrderStatus)
          }
          disabled={isUpdatingStatus === record.id}
          className={`px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColorClass(
            record.status
          )}`}
        >
          <option value={OrderStatus.requested}>요청됨</option>
          <option value={OrderStatus.approved}>승인됨</option>
          <option value={OrderStatus.rejected}>반려됨</option>
          <option value={OrderStatus.confirmedByShipper}>출고자 확인</option>
          <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
          <option value={OrderStatus.rejectedByShipper}>출고자 반려</option>
        </select>
        {isUpdatingStatus === record.id && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-md">
            <div className="w-4 h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  };

  // // 뒤로가기 핸들러 추가
  // const handleBack = () => {
  //   router.replace("/"); // 메인 메뉴로 이동하며 현재 페이지를 히스토리에서 대체
  // };

  // 탭 버튼 렌더링
  const renderTabs = () => {
    // supplier인 경우 '내 발주 기록' 탭만 표시
    if (userAccessLevel === "supplier") {
      return (
        <div className="flex mb-4 sm:mb-6 border-b">
          <button className="py-2 sm:py-3 px-3 sm:px-5 font-medium text-xs sm:text-sm transition-colors border-b-2 border-blue-500 text-blue-600">
            <User size={16} className="inline-block mr-1" />
            <span className="hidden sm:inline">내 발주 기록</span>
            <span className="sm:hidden">내 발주</span>
          </button>
        </div>
      );
    }

    // supplier가 아닌 경우 모든 탭 표시
    return (
      <div className="flex mb-4 sm:mb-6 border-b">
        <button
          onClick={() => handleTabChange("all")}
          className={`py-2 sm:py-3 px-3 sm:px-5 font-medium text-xs sm:text-sm transition-colors ${
            activeTab === "all"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          <Package size={16} className="inline-block mr-1" />
          <span className="hidden sm:inline">전체 발주 기록</span>
          <span className="sm:hidden">전체</span>
        </button>
        <button
          onClick={() => handleTabChange("user")}
          className={`py-2 sm:py-3 px-3 sm:px-5 font-medium text-xs sm:text-sm transition-colors ${
            activeTab === "user"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          <User size={16} className="inline-block mr-1" />
          <span className="hidden sm:inline">내 발주 기록</span>
          <span className="sm:hidden">내 발주</span>
        </button>
        <button
          onClick={() => handleTabChange("supplier")}
          className={`py-2 sm:py-3 px-3 sm:px-5 font-medium text-xs sm:text-sm transition-colors ${
            activeTab === "supplier"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          <Truck size={16} className="inline-block mr-1" />
          <span className="hidden sm:inline">거래처별 발주 기록</span>
          <span className="sm:hidden">거래처</span>
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-1 sm:px-2 max-w-7xl">
      <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 mb-4 sm:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* <button
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs sm:text-sm transition-colors"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">메인 메뉴로</span>
              <span className="sm:hidden">메인</span>
            </button> */}
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
              <Package className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="hidden sm:inline">발주 기록 관리</span>
              <span className="sm:hidden">발주 기록</span>
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-2 md:mt-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center text-xs sm:text-sm transition-colors"
          >
            <RefreshCw
              size={14}
              className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">새로고침</span>
            <span className="sm:hidden">새로고침</span>
          </button>
        </div>

        {/* 탭 버튼 */}
        {renderTabs()}

        {/* 검색 및 필터 */}
        <div className="bg-gray-50 p-2 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 sm:gap-4">
            <div className="relative flex-grow">
              <Search
                size={16}
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="검색..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 상태 필터 추가 */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[150px]">
              <Filter size={14} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">모든 상태</option>
                <option value={OrderStatus.requested}>요청됨</option>
                <option value={OrderStatus.approved}>승인됨</option>
                <option value={OrderStatus.rejected}>반려됨</option>
                <option value={OrderStatus.confirmedByShipper}>
                  출고자 확인
                </option>
                <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
                <option value={OrderStatus.rejectedByShipper}>
                  출고자 반려
                </option>
              </select>
            </div>

            {activeTab === "user" && (
              <div className="flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-50 border border-blue-100 rounded-md">
                <User size={14} className="mr-1 sm:mr-2 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium text-blue-700">
                  {authStore.getState().user?.name || "사용자"}의 발주
                </span>
              </div>
            )}

            {activeTab === "supplier" && (
              <div className="flex items-center gap-1 sm:gap-2 min-w-[120px] sm:min-w-[200px]">
                <Filter size={14} className="text-gray-500" />
                {isLoadingSuppliers ? (
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                    로딩중...
                  </div>
                ) : (
                  <select
                    value={supplierId}
                    onChange={handleSupplierChange}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="mx-3 my-2 bg-white rounded-2xl overflow-hidden shadow-sm w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-[20%] sm:w-2/12">
                      발주자
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-[30%] sm:w-3/12">
                      패키지/품목
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-[10%] sm:w-1/12">
                      수량
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-[20%] sm:w-2/12">
                      수령자
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-[20%] sm:w-2/12">
                      날짜
                    </th>
                    <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider w-[20%] sm:w-2/12">
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
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[100px] sm:max-w-none">
                            {record.requester}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-700 truncate max-w-[150px] sm:max-w-[200px]">
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
                                        item.item?.teamItem?.itemName ||
                                        "알 수 없는 품목"
                                      }${item.quantity}개`
                                  )
                                  .join(", ") +
                                (record.orderItems.length > 2 ? " 외" : "")
                              : "품목 없음"}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                            {record.orderItems?.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            ) || 0}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-[100px] sm:max-w-none">
                            {record.receiver}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <Calendar
                              size={14}
                              className="inline-block mr-1 text-gray-500"
                            />
                            {formatDate(record.createdAt)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
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
                            <td colSpan={6} className="p-2 sm:p-4">
                              {/* 상태 변경 섹션 */}
                              <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                                      발주 상태
                                    </h3>
                                  </div>
                                  <StatusDropdown record={record} />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fadeIn">
                                {/* 왼쪽: 발주 상세 정보 */}
                                <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
                                  <h3 className="font-bold mb-3 text-gray-700 border-b pb-2 flex items-center text-sm sm:text-base">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500"
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
                                  <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                        생성일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                        {formatDate(record.createdAt)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                        구매일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                        {record.purchaseDate
                                          ? formatDate(record.purchaseDate)
                                          : "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                        출고예정일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                        {record.outboundDate
                                          ? formatDate(record.outboundDate)
                                          : "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                        설치요청일:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                        {record.installationDate
                                          ? formatDate(record.installationDate)
                                          : "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                        발주자:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                        {record.requester}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                      <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                        담당자:
                                      </span>
                                      <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                        {record.manager || "-"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* 오른쪽: 배송 정보와 주문품목목록 */}
                                <div className="space-y-4 sm:space-y-6">
                                  {/* 배송 정보 */}
                                  <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold mb-3 text-gray-700 border-b pb-2 flex items-center text-sm sm:text-base">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-9a1 1 0 00-.293-.707l-2-2A1 1 0 0017 3h-1c0-.552-.447-1-1-1H5a1 1 0 00-1 1H3z" />
                                      </svg>
                                      배송 정보
                                    </h3>
                                    <div className="space-y-2 sm:space-y-3">
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                          수령자:
                                        </span>
                                        <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                          {record.receiver}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                          연락처:
                                        </span>
                                        <span className="text-gray-800 bg-gray-50 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                                          {record.receiverPhone}
                                        </span>
                                      </div>
                                      <div className="flex flex-col border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="font-medium text-gray-600 mb-1 text-xs sm:text-sm">
                                          주소:
                                        </span>
                                        <span className="text-gray-800 bg-gray-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm break-words">
                                          {record.receiverAddress}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 주문 품목 목록 */}
                                  {record.orderItems &&
                                    record.orderItems.length > 0 && (
                                      <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center text-xs sm:text-sm">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                          </svg>
                                          주문 품목 목록
                                        </h4>

                                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                              패키지:
                                            </span>
                                            <span className="text-gray-800 text-xs sm:text-sm">
                                              {record.package?.packageName ||
                                                "-"}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                                          <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-xs sm:text-sm font-medium text-gray-600 flex justify-between">
                                            <span>품목</span>
                                            <span>수량</span>
                                          </div>
                                          <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                                            {record.orderItems.map((item) => (
                                              <li
                                                key={item.id}
                                                className="py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-gray-100 transition-colors"
                                              >
                                                <div className="flex justify-between items-center">
                                                  <span className="font-medium text-gray-700 text-xs sm:text-sm">
                                                    {item.item?.teamItem
                                                      ?.itemName ||
                                                      "알 수 없는 품목"}
                                                  </span>
                                                  <span className="text-gray-600 bg-white px-2 py-1 rounded-md text-xs sm:text-sm">
                                                    {item.quantity}개
                                                  </span>
                                                </div>
                                                {item.memo && (
                                                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 italic">
                                                    메모: {item.memo}
                                                  </p>
                                                )}
                                              </li>
                                            ))}
                                          </ul>
                                          {record.memo && (
                                            <div className="py-1.5 sm:py-2 px-2 sm:px-3 bg-gray-100">
                                              <p className="flex justify-between items-center">
                                                <span className="font-medium text-gray-600 text-xs sm:text-sm">
                                                  추가 요청사항:
                                                </span>
                                                <span className="text-gray-800 text-xs sm:text-sm italic">
                                                  {record.memo}
                                                </span>
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* 첨부 파일 */}
                                  {record.files && record.files.length > 0 && (
                                    <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-100">
                                      <h4 className="font-medium text-gray-700 mb-3 flex items-center text-xs sm:text-sm">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500"
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
                                            className="py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-gray-100 transition-colors"
                                          >
                                            <a
                                              href={file.fileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-500 hover:text-blue-700 hover:underline flex items-center text-xs sm:text-sm"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2"
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
                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 ml-4 sm:ml-6">
                                              업로드:{" "}
                                              {formatDate(file.createdAt)}
                                            </p>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
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
