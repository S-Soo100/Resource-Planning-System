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
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import dynamic from "next/dynamic";
import { hasWarehouseAccess } from "@/utils/warehousePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import OrderEditModal from "./OrderEditModal";
import { formatDateForDisplay, formatDateForDisplayUTC } from "@/utils/dateUtils";

// 사용자 접근 레벨 타입 추가
type UserAccessLevel = "user" | "admin" | "supplier" | "moderator";

type TabType = "all" | "user" | "supplier";
type ShipmentTabType = "pending" | "completed";

interface OrderResponse extends ApiResponse {
  data: Order[];
}

// API 응답 데이터를 IOrderRecord 형식으로 변환하는 함수
const convertToOrderRecord = (order: Order): IOrderRecord => {
  return {
    id: order.id,
    title: order.title || "", // 제목 필드 추가
    userId: order.userId,
    supplierId: order.supplierId || 0,
    packageId: order.packageId || 0,
    warehouseId: order.warehouseId || 0,
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
          itemlist:
            typeof order.package.itemlist === "string"
              ? order.package.itemlist.split(", ").filter(Boolean)
              : Array.isArray(order.package.itemlist)
              ? order.package.itemlist
              : [],
        }
      : undefined,
    warehouse: order.warehouse
      ? {
          id: order.warehouse.id,
          warehouseName: order.warehouse.warehouseName || "알 수 없는 창고",
        }
      : undefined,
    orderItems: order.orderItems || [],
    files: order.files || [],
  };
};

// 통합 날짜 유틸리티 사용 - 중복 함수 제거됨

const OrderRecordTabsMobile = dynamic(() => import("./OrderRecordTabsMobile"), {
  ssr: false,
});

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

const OrderRecordTabs = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [shipmentTab, setShipmentTab] = useState<ShipmentTabType>("pending");
  const [userId, setUserId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const recordsPerPage = 10;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);
  const [userAccessLevel, setUserAccessLevel] =
    useState<UserAccessLevel>("user");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] =
    useState<IOrderRecord | null>(null);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details: string;
    shouldRefresh?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    details: "",
    shouldRefresh: false,
  });

  const { useAllOrders, useSupplierOrders } = useOrder();
  const { useGetSuppliers } = useSuppliers();
  const { refetchAll: refetchWarehouseItems } = useWarehouseItems();
  const { user: currentUser } = useCurrentUser();
  const auth = authStore((state) => state.user);
  // const router = useRouter();
  const queryClient = useQueryClient();

  // 주문 상태 업데이트 hook 추가
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // 주문 삭제 hook - 확장 기능 제거로 인해 주석 처리
  // const deleteOrderMutation = useDeleteOrder();

  // 에러 모달 닫기
  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      title: "",
      message: "",
      details: "",
      shouldRefresh: false,
    });
  };

  // 에러 모달에서 새로고침 핸들러
  const handleErrorModalRefresh = () => {
    handleRefresh();
    closeErrorModal();
  };

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

  // URL 파라미터에서 orderId를 읽어서 해당 발주를 자동으로 확장
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get("orderId");
    if (orderIdParam) {
      const orderId = parseInt(orderIdParam);
      if (!isNaN(orderId)) {
        setExpandedRowId(orderId);
      }
    }
  }, []);

  // 납품처 목록 조회 훅 사용
  const { suppliers: suppliersResponse, isLoading: suppliersLoading } =
    useGetSuppliers();

  // 납품처 목록 가져오기 (지연 로딩 적용)
  useEffect(() => {
    if (activeTab === "supplier") {
      // 납품처 탭으로 변경될 때 0.5초 후 로딩 시작
      const timer = setTimeout(() => {
        setIsLoadingSuppliers(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 납품처 목록 설정
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

  // 전체 주문 데이터와 납품처별 주문 데이터만 API에서 가져오기
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

  // 검색 필터링 및 창고 권한 체크 적용 (useMemo로 최적화)
  const filteredOrders = useMemo(() => {
    // console.log(
    //   `검색어 "${searchTerm}"로 ${orderRecords.length}개 항목 필터링`
    // );
    return orderRecords.filter((order: IOrderRecord) => {
      // 출고 상태별 필터링 추가
      const isShipmentPending = [
        OrderStatus.requested,
        OrderStatus.approved,
        OrderStatus.confirmedByShipper,
        "주문 접수", // 서버 응답 호환성
      ].includes(order.status as OrderStatus);

      const isShipmentCompleted = [
        OrderStatus.shipmentCompleted,
        OrderStatus.rejected,
        OrderStatus.rejectedByShipper,
      ].includes(order.status as OrderStatus);

      // 현재 선택된 출고 탭에 따라 필터링
      if (shipmentTab === "pending" && !isShipmentPending) {
        return false;
      }
      if (shipmentTab === "completed" && !isShipmentCompleted) {
        return false;
      }

      // 창고 접근 권한 체크 (Admin이 아닌 경우에만)
      if (
        currentUser &&
        currentUser.accessLevel !== "admin" &&
        order.warehouseId
      ) {
        const warehouseAccessible = hasWarehouseAccess(
          currentUser,
          order.warehouseId
        );
        if (!warehouseAccessible) {
          return false; // 접근 불가능한 창고의 발주는 필터링
        }
      }

      // 검색어 필터링
      const matchesSearch =
        order.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.package?.packageName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.receiver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.receiverAddress?.toLowerCase().includes(searchTerm.toLowerCase());

      // 상태 필터링
      const matchesStatus =
        statusFilter === "" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orderRecords, searchTerm, statusFilter, currentUser, shipmentTab]);

  // 페이지네이션 계산 (useMemo로 최적화)
  const { totalPages, currentRecords, startIndex } = useMemo(() => {
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
      startIndex: indexOfFirstRecord,
    };
  }, [filteredOrders, currentPage, recordsPerPage]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    console.log(`탭 변경: ${activeTab} -> ${tab}`);
    setActiveTab(tab);
    setCurrentPage(1); // 탭 변경 시 첫 페이지로 이동
  };

  // 출고 상태 탭 변경 핸들러 추가
  const handleShipmentTabChange = (tab: ShipmentTabType) => {
    console.log(`출고 상태 탭 변경: ${shipmentTab} -> ${tab}`);
    setShipmentTab(tab);
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
    console.log(`납품처 변경: ${e.target.value}`);
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
      case "주문 접수":
        return "요청";
      case OrderStatus.approved:
        return "승인";
      case OrderStatus.rejected:
        return "반려";
      case OrderStatus.confirmedByShipper:
        return "출고팀 확인";
      case OrderStatus.shipmentCompleted:
        return "출고 완료";
      case OrderStatus.rejectedByShipper:
        return "출고 보류";
      default:
        return status;
    }
  };

  // 행 클릭 핸들러 - 상세 페이지로 이동
  const handleRowClick = (recordId: number) => {
    const teamId = currentTeamId;
    const url = `/orderRecord/${recordId}?teamId=${teamId}`;
    window.location.href = url;
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
    // moderator 권한 사용자가 본인이 생성한 발주를 승인/반려하려고 할 때 제한
    if (userAccessLevel === "moderator") {
      const currentOrder = currentRecords.find(
        (record) => record.id === orderId
      );

      if (currentOrder && currentOrder.userId === auth?.id) {
        if (
          newStatus === OrderStatus.approved ||
          newStatus === OrderStatus.rejected
        ) {
          alert("요청자 본인 이외의 승인권자가 승인해야 합니다");
          return;
        }
      }
    }

    // 사용자에게 확인 요청
    if (
      !window.confirm(
        `정말 주문 상태를 '${getStatusText(newStatus)}'(으)로 변경하시겠습니까?`
      )
    ) {
      return; // 취소한 경우 함수 종료
    }

    // 출고 관련 상태로 변경하는 경우 재고 확인(클라이언트 체크 제거, 서버에서만 처리)
    if (
      newStatus === OrderStatus.confirmedByShipper ||
      newStatus === OrderStatus.shipmentCompleted ||
      newStatus === OrderStatus.rejectedByShipper
    ) {
      // 현재 주문 정보 찾기
      const currentOrder = currentRecords.find(
        (record) => record.id === orderId
      );
      if (!currentOrder) {
        alert("주문 정보를 찾을 수 없습니다.");
        return;
      }
      // 재고 부족 체크 및 confirm 등은 서버에서 처리
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
          // 모든 관련 쿼리를 한 번에 무효화
          queryClient.invalidateQueries({
            queryKey: [
              ["warehouseItems"],
              ["inventoryRecords"],
              ["items"],
              ["warehouse"],
            ],
          });

          // 데이터 리페칭 보장
          await Promise.all([
            queryClient.refetchQueries({ queryKey: ["warehouseItems"] }),
            queryClient.refetchQueries({ queryKey: ["inventoryRecords"] }),
          ]);

          // 1초 대기 후 useWarehouseItems 리페칭
          setTimeout(async () => {
            await refetchWarehouseItems();
          }, 1000);

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

      // 서버에서 오는 에러 메시지를 그대로 표시
      let errorMessage = "상태 변경에 실패했습니다.";
      let errorDetails = "";
      let errorTitle = "상태 변경 실패";
      let shouldRefresh = false;

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;

        // 에러 타입별로 추가 정보 제공
        if (error.message.includes("재고")) {
          errorTitle = "재고 부족";
          errorDetails =
            "재고가 부족하여 출고가 불가능합니다.\n\n• 재고 현황을 확인해주세요\n• 품목 수량을 조정해주세요\n• 담당자에게 문의해주세요";
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
          shouldRefresh = true;
          errorDetails =
            "요청 시간이 초과되었습니다. 서버에서 처리가 완료되었을 수 있으니 새로고침 후 확인해주세요.\n\n• 아래 '새로고침' 버튼을 클릭해주세요\n• 상태가 변경되지 않았다면 다시 시도해주세요\n• 문제가 지속되면 관리자에게 문의해주세요";
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
        shouldRefresh: shouldRefresh,
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
      setIsUpdatingStatus(null);
    }
  };

  // 권한 확인 함수 추가
  const hasPermissionToChangeStatus = () => {
    return userAccessLevel === "admin" || userAccessLevel === "moderator";
  };

  // 수정 권한 확인 함수 추가
  const hasPermissionToEdit = (record: IOrderRecord) => {
    if (!auth) return false;

    const isAdmin = auth.isAdmin;
    const isAuthor = record.userId === auth.id;

    // admin인 경우 상태에 상관없이 수정 가능
    if (isAdmin) return true;

    // 일반 사용자는 자신이 작성한 requested 상태의 발주만 수정 가능
    const isRequestedStatus = record.status === OrderStatus.requested;
    return isAuthor && isRequestedStatus;
  };

  // 삭제 권한 확인 함수 - 확장 기능 제거로 인해 주석 처리
  // const canDeleteOrder = (record: IOrderRecord) => {
  //   if (!auth) return false;

  //   const isAdmin = auth.isAdmin;
  //   const isAuthor = record.userId === auth.id;

  //   // admin인 경우 상태에 상관없이 삭제 가능
  //   if (isAdmin) return true;

  //   // 일반 사용자는 자신이 작성한 requested 상태의 발주만 삭제 가능
  //   const isRequestedStatus =
  //     record.status === OrderStatus.requested || record.status === "주문 접수";
  //   return isAuthor && isRequestedStatus;
  // };

  // 수정 모달 열기 핸들러
  const handleEditClick = (record: IOrderRecord) => {
    setSelectedOrderForEdit(record);
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기 핸들러
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedOrderForEdit(null);
  };

  // 발주 삭제 핸들러 - 확장 기능 제거로 인해 주석 처리
  // const handleDeleteOrder = async (record: IOrderRecord) => {
  //   if (
  //     !confirm(
  //       `발주 건을 삭제하시겠습니까?\n\n발주자: ${record.requester}\n수령자: ${
  //         record.receiver
  //       }\n상태: ${getStatusText(record.status)}`
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     await deleteOrderMutation.mutateAsync(record.id.toString());
  //     toast.success("발주가 삭제되었습니다.");
  //   } catch (error) {
  //     toast.error("발주 삭제에 실패했습니다.");
  //     console.error("발주 삭제 오류:", error);
  //   }
  // };

  // 상태 변경 드롭다운 컴포넌트 - 확장 기능 제거로 인해 주석 처리
  // const StatusDropdown = ({ record }: { record: IOrderRecord }) => {
  //   // 권한이 없는 경우 상태만 표시
  //   if (!hasPermissionToChangeStatus()) {
  //     return (
  //       <div className="flex gap-2 items-center">
  //         <div
  //           className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
  //             record.status
  //           )}`}
  //         >
  //           {getStatusIcon(record.status)}
  //           {getStatusText(record.status)}
  //         </div>
  //       </div>
  //     );
  //   }

  //   // 출고 완료 상태인 경우 상태만 표시하고 변경 불가
  //   if (record.status === OrderStatus.shipmentCompleted) {
  //     return (
  //       <div className="flex gap-2 items-center">
  //         <div
  //           className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
  //             record.status
  //           )} cursor-not-allowed`}
  //           title="출고 완료된 주문은 상태를 변경할 수 없습니다"
  //         >
  //           {getStatusIcon(record.status)}
  //           {getStatusText(record.status)}
  //         </div>
  //       </div>
  //     );
  //   }

  //   // admin 권한 사용자의 경우 특정 상태일 때만 드롭다운 표시
  //   if (userAccessLevel === "admin") {
  //     const allowedStatusesForAdmin = [
  //       OrderStatus.approved,
  //       OrderStatus.confirmedByShipper,
  //       OrderStatus.shipmentCompleted,
  //       OrderStatus.rejectedByShipper,
  //     ];

  //     if (!allowedStatusesForAdmin.includes(record.status as OrderStatus)) {
  //       return (
  //         <div className="flex gap-2 items-center">
  //           <div
  //             className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
  //               record.status
  //             )}`}
  //           >
  //             {getStatusIcon(record.status)}
  //             {getStatusText(record.status)}
  //           </div>
  //         </div>
  //       );
  //     }
  //   }

  //   // 권한이 있는 경우 드롭다운과 현재 상태 표시
  //   return (
  //     <div className="flex gap-3 items-center">
  //       {/* 현재 상태 표시 */}
  //       <div className="flex gap-2 items-center">
  //         <div
  //           className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
  //             record.status
  //           )}`}
  //         >
  //           {getStatusIcon(record.status)}
  //           {getStatusText(record.status)}
  //         </div>
  //       </div>

  //       {/* 상태 변경 드롭다운 */}
  //       <div className="relative">
  //         <select
  //           value={record.status}
  //           onChange={(e) =>
  //             handleStatusChange(record.id, e.target.value as OrderStatus)
  //           }
  //           disabled={isUpdatingStatus === record.id}
  //           className="px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300 hover:border-gray-400 transition-colors"
  //         >
  //           {/* 권한에 따라 다른 선택지 표시 */}
  //           {userAccessLevel === "moderator" ? (
  //             // Moderator: 요청, 승인, 반려만 가능 (단, 본인 발주는 승인/반려 불가)
  //             <>
  //               <option value={OrderStatus.requested}>요청</option>
  //               <option
  //                 value={OrderStatus.approved}
  //                 disabled={record.userId === auth?.id}
  //               >
  //                 승인{record.userId === auth?.id ? " (본인 발주)" : ""}
  //               </option>
  //               <option
  //                 value={OrderStatus.rejected}
  //                 disabled={record.userId === auth?.id}
  //               >
  //                 반려{record.userId === auth?.id ? " (본인 발주)" : ""}
  //               </option>
  //             </>
  //           ) : userAccessLevel === "admin" ? (
  //             // Admin: 출고팀 확인, 출고 완료, 출고 보류만 가능
  //             <>
  //               <option value={OrderStatus.confirmedByShipper}>
  //                 출고팀 확인
  //               </option>
  //               <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
  //               <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
  //             </>
  //           ) : (
  //             // 기본값 (권한이 없는 경우)
  //             <>
  //               <option value={OrderStatus.requested}>요청</option>
  //               <option value={OrderStatus.approved}>승인</option>
  //               <option value={OrderStatus.rejected}>반려</option>
  //               <option value={OrderStatus.confirmedByShipper}>
  //                 출고팀 확인
  //               </option>
  //               <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
  //               <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
  //             </>
  //           )}
  //         </select>
  //         {isUpdatingStatus === record.id && (
  //           <div className="flex absolute inset-0 justify-center items-center bg-gray-100 bg-opacity-50 rounded-md">
  //             <div className="w-4 h-4 rounded-full border-2 animate-spin border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };

  // // 뒤로가기 핸들러 추가
  // const handleBack = () => {
  //   router.replace("/"); // 메인 메뉴로 이동하며 현재 페이지를 히스토리에서 대체
  // };

  // 탭 버튼 렌더링
  const renderTabs = () => {
    // supplier인 경우 '내 발주 기록' 탭만 표시
    if (userAccessLevel === "supplier") {
      return (
        <div className="flex gap-2 mb-4 sm:mb-6">
          <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full shadow-sm">
            <User size={16} className="mr-2" />내 발주 기록
          </div>
        </div>
      );
    }

    // supplier가 아닌 경우 모든 탭 표시
    return (
      <div className="flex gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => handleTabChange("all")}
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "all"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Package size={16} className="mr-2" />
          전체
        </button>
        <button
          onClick={() => handleTabChange("user")}
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "user"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <User size={16} className="mr-2" />내 발주
        </button>
        <button
          onClick={() => handleTabChange("supplier")}
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTab === "supplier"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Truck size={16} className="mr-2" />
          납품처별
        </button>
      </div>
    );
  };

  // 출고 상태 탭 렌더링
  const renderShipmentTabs = () => {
    return (
      <div className="flex gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => handleShipmentTabChange("pending")}
          className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            shipmentTab === "pending"
              ? "bg-orange-500 text-white shadow-lg"
              : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
          }`}
        >
          <div className="flex gap-2 justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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
            출고 전
          </div>
        </button>
        <button
          onClick={() => handleShipmentTabChange("completed")}
          className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            shipmentTab === "completed"
              ? "bg-green-500 text-white shadow-lg"
              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
          }`}
        >
          <div className="flex gap-2 justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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
            출고 완료
          </div>
        </button>
      </div>
    );
  };

  const isMobile = useMediaQuery("(max-width: 759px)");

  return (
    <div className="px-0 sm:px-2">
      <div className="p-1 mb-4 bg-white rounded-lg shadow-md sm:p-4 sm:mb-8">
        <div className="flex flex-col justify-between items-start mb-4 md:flex-row md:items-center sm:mb-6">
          <div className="flex gap-1 items-center sm:gap-4">
            {/* <button
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs sm:text-sm transition-colors"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">메인 메뉴로</span>
              <span className="sm:hidden">메인</span>
            </button> */}
            <h1 className="flex items-center text-base font-bold text-gray-800 sm:text-2xl">
              <Package className="mr-1 w-4 h-4 text-blue-600 sm:mr-2 sm:w-5 sm:h-5" />
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

        {/* 기존 탭 버튼 (최상위 탭) */}
        {renderTabs()}

        {/* 출고 상태 탭 (중간 탭) */}
        {renderShipmentTabs()}

        {/* 검색 및 필터 */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          {/* 검색 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 text-gray-400 transform -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="검색어 입력..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* 상태 필터 */}
          <div className="flex gap-2 items-center">
            <Filter size={16} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm min-w-[120px]"
            >
              <option value="">모든 상태</option>
              {shipmentTab === "pending" ? (
                <>
                  <option value={OrderStatus.requested}>요청</option>
                  <option value={OrderStatus.approved}>승인</option>
                  <option value={OrderStatus.rejected}>반려</option>
                  <option value={OrderStatus.confirmedByShipper}>
                    출고팀 확인
                  </option>
                  <option value={OrderStatus.rejectedByShipper}>
                    출고 보류
                  </option>
                </>
              ) : (
                <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
              )}
            </select>
          </div>

          {/* 사용자 표시 */}
          {activeTab === "user" && (
            <div className="flex items-center px-3 py-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-lg">
              <User size={16} className="mr-2" />
              {authStore.getState().user?.name || "사용자"}님의 발주
            </div>
          )}

          {/* 납품처 선택 */}
          {activeTab === "supplier" && (
            <div className="flex gap-2 items-center">
              <Truck size={16} className="text-gray-500" />
              {isLoadingSuppliers ? (
                <div className="flex items-center px-3 py-2 text-sm text-gray-500">
                  <div className="mr-2 w-4 h-4 rounded-full border-2 animate-spin border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
                  로딩중...
                </div>
              ) : (
                <select
                  value={supplierId}
                  onChange={handleSupplierChange}
                  className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm min-w-[150px]"
                >
                  <option value="">납품처 선택</option>
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

        {/* 카드형 리스트 */}
        {isLoading() ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="mb-4 w-12 h-12 rounded-full border-4 border-gray-200 animate-spin border-t-blue-500"></div>
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : isMobile ? (
          <OrderRecordTabsMobile
            records={currentRecords}
            expandedRowId={expandedRowId}
            onRowClick={handleRowClick}
            formatDateForDisplay={formatDateForDisplay}
            formatDateForDisplayUTC={formatDateForDisplayUTC}
            getStatusText={getStatusText}
            getStatusColorClass={getStatusColorClass}
            hasPermissionToEdit={hasPermissionToEdit}
            onEditClick={handleEditClick}
            onDetailClick={(record) => {
              const teamId = currentTeamId;
              const url = `/orderRecord/${record.id}?teamId=${teamId}`;
              window.location.href = url;
            }}
            // 상태 변경 관련 props 추가
            hasPermissionToChangeStatus={hasPermissionToChangeStatus}
            handleStatusChange={handleStatusChange}
            isUpdatingStatus={isUpdatingStatus}
            userAccessLevel={userAccessLevel}
            auth={currentUser}
          />
        ) : (
          /* 카드형 리스트 */
          <div className="space-y-4">
            {currentRecords.length > 0 ? (
              currentRecords.map((record: IOrderRecord, index: number) => {
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
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded ${
                                record.packageId && record.packageId > 0
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {record.packageId && record.packageId > 0
                                ? "패키지"
                                : "개별"}
                            </span>
                            <h3 className="font-medium text-gray-900 truncate">
                              {record.title ||
                                `${
                                  record.warehouse?.warehouseName ||
                                  "알 수 없는 창고"
                                }에서 ${
                                  record.orderItems &&
                                  record.orderItems.length > 0
                                    ? record.orderItems.length > 1
                                      ? `${
                                          record.orderItems[0]?.item?.teamItem
                                            ?.itemName || "품목"
                                        } 등 ${record.orderItems.length}개 품목`
                                      : `${
                                          record.orderItems[0]?.item?.teamItem
                                            ?.itemName || "품목"
                                        }`
                                    : "품목"
                                } 출고`}
                              {record.status === OrderStatus.shipmentCompleted && record.outboundDate && (
                                <span className="ml-1 text-sm text-gray-500">
                                  (완료:{formatDateForDisplayUTC(record.outboundDate)})
                                </span>
                              )}
                            </h3>
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {record.requester} • 생성일: {formatDateForDisplayUTC(record.createdAt)} • 출고예정일: {formatDateForDisplayUTC(record.outboundDate)}
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽: 상태 표시 + 상태 변경 + 상세보기 버튼 */}
                      <div className="flex items-center space-x-2">
                        {/* 현재 상태 색상 표시 */}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColorClass(
                            record.status
                          )}`}
                        >
                          {getStatusText(record.status)}
                        </span>

                        {/* 상태 변경 드롭다운 (권한이 있는 경우만) */}
                        {hasPermissionToChangeStatus() && (
                          <select
                            value={record.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(record.id, e.target.value as OrderStatus);
                            }}
                            disabled={isUpdatingStatus === record.id}
                            className="text-xs bg-white border border-gray-300 rounded px-2 py-1 disabled:opacity-50 min-w-[100px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {userAccessLevel === "moderator" ? (
                              // Moderator: 초기 승인 단계만 가능
                              <>
                                <option value={OrderStatus.requested}>요청</option>
                                <option value={OrderStatus.approved} disabled={record.userId === auth?.id}>
                                  승인{record.userId === auth?.id ? " (본인)" : ""}
                                </option>
                                <option value={OrderStatus.rejected} disabled={record.userId === auth?.id}>
                                  반려{record.userId === auth?.id ? " (본인)" : ""}
                                </option>
                              </>
                            ) : userAccessLevel === "admin" ? (
                              // Admin: 모든 상태 변경 가능
                              <>
                                <option value={OrderStatus.requested}>요청</option>
                                <option value={OrderStatus.approved}>승인</option>
                                <option value={OrderStatus.rejected}>반려</option>
                                <option value={OrderStatus.confirmedByShipper}>출고팀 확인</option>
                                <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
                                <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
                              </>
                            ) : null}
                          </select>
                        )}

                        {isUpdatingStatus === record.id && (
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
                            <span className="font-medium text-gray-700">발주 창고:</span>
                            <span className="text-gray-600">
                              {record.warehouse?.warehouseName || "창고 정보 없음"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">수령자:</span>
                            <span className="text-gray-600">
                              {record.receiver || "수령자 미정"} {record.receiverPhone && `(${record.receiverPhone})`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">배송 주소:</span>
                            <span className="text-gray-600">
                              {record.receiverAddress || "배송 주소 미정"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">담당자:</span>
                            <span className="text-gray-600">
                              {record.manager || "담당자 미정"}
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="font-medium text-gray-700 flex-shrink-0">발주 품목:</span>
                            <div className="text-gray-600">
                              {record.orderItems && record.orderItems.length > 0 ? (
                                <div className="space-y-1">
                                  {record.orderItems.map((item, itemIndex) => (
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
                          {record.memo && (
                            <div className="flex items-start space-x-2">
                              <span className="font-medium text-gray-700 flex-shrink-0">메모:</span>
                              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-gray-600 text-sm">
                                {record.memo}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl shadow-sm">
                <Package className="mx-auto w-12 h-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  발주 기록이 없습니다
                </h3>
                <p className="mt-1 text-base text-gray-500">
                  {searchTerm || statusFilter
                    ? "검색 조건을 변경해보세요."
                    : "아직 발주 요청이 없습니다."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              {startIndex + 1}-{Math.min(startIndex + recordsPerPage, filteredOrders.length)} /{" "}
              {filteredOrders.length}개
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

      {/* 주문 수정 모달 */}
      <OrderEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        orderRecord={selectedOrderForEdit}
      />

      {/* 에러 모달 */}
      {errorModal.isOpen && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-red-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex gap-3 items-start p-6 pb-4 border-b border-red-100">
              <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-red-100 rounded-full">
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
                <h3 className="mb-1 text-lg font-bold text-red-700 sm:text-xl">
                  {errorModal.title}
                </h3>
                <p className="text-sm leading-relaxed text-red-600">
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
                      className="flex-shrink-0 w-4 h-4"
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
                  <div className="space-y-2 text-sm leading-relaxed text-red-700">
                    {errorModal.details.split("\n").map((line, index) => (
                      <div key={index}>
                        {line.startsWith("•") ? (
                          <div className="flex gap-2 items-start">
                            <span className="flex-shrink-0 mt-1 text-xs text-red-500">
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
            <div className="flex gap-3 justify-end p-6 pt-4 border-t border-red-100">
              {errorModal.shouldRefresh && (
                <button
                  onClick={handleErrorModalRefresh}
                  className="px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl shadow-sm transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <RefreshCw size={16} className="inline mr-2" />
                  새로고침
                </button>
              )}
              <button
                onClick={closeErrorModal}
                className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-xl shadow-sm transition-colors duration-200 hover:bg-red-700 active:bg-red-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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

// 상태에 따른 색상 클래스 반환 함수 추가
const getStatusColorClass = (status: string): string => {
  switch (status) {
    case OrderStatus.requested:
    case "주문 접수":
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
