"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrder } from "@/hooks/useOrder";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { OrderComment } from "@/types/(order)/orderComment";
import { IUser } from "@/types/(auth)/user";
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
  Trash2,
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
import {
  useOrderComments,
  type CreateOrderCommentDto,
  type UpdateOrderCommentDto,
} from "@/hooks/useOrderComments";
import { useDeleteOrder } from "@/hooks/(useOrder)/useOrderMutations";
import OrderEditModal from "./OrderEditModal";

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

// 날짜 포맷팅 함수 추가
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);
  const [userAccessLevel, setUserAccessLevel] =
    useState<UserAccessLevel>("user");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] =
    useState<IOrderRecord | null>(null);

  const { useAllOrders, useSupplierOrders } = useOrder();
  const { useGetSuppliers } = useSuppliers();
  const { refetchAll: refetchWarehouseItems } = useWarehouseItems();
  const { user: currentUser } = useCurrentUser();
  const auth = authStore((state) => state.user);
  // const router = useRouter();
  const queryClient = useQueryClient();

  // 주문 상태 업데이트 hook 추가
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // 주문 삭제 hook 추가
  const deleteOrderMutation = useDeleteOrder();

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
        OrderStatus.rejectedByShipper,
        "주문 접수", // 서버 응답 호환성
      ].includes(order.status as OrderStatus);

      const isShipmentCompleted =
        order.status === OrderStatus.shipmentCompleted;

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
        order.receiver?.toLowerCase().includes(searchTerm.toLowerCase());

      // 상태 필터링
      const matchesStatus =
        statusFilter === "" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orderRecords, searchTerm, statusFilter, currentUser, shipmentTab]);

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

  // 행 클릭 핸들러 추가
  const handleRowClick = (recordId: number) => {
    // 이미 확장된 행을 다시 클릭하면 접기
    if (expandedRowId === recordId) {
      setExpandedRowId(null);
    } else {
      // 다른 행을 클릭하면 해당 행 확장
      setExpandedRowId(recordId);
    }

    // URL에 발주 ID 파라미터 추가
    const url = new URL(window.location.href);
    url.searchParams.set("orderId", recordId.toString());
    window.history.pushState({}, "", url.toString());
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
      alert("주문 상태 업데이트에 실패했습니다.");
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

  // 삭제 권한 확인 함수 추가
  const canDeleteOrder = (record: IOrderRecord) => {
    if (!auth) return false;

    const isAdmin = auth.isAdmin;
    const isAuthor = record.userId === auth.id;

    // admin인 경우 상태에 상관없이 삭제 가능
    if (isAdmin) return true;

    // 일반 사용자는 자신이 작성한 requested 상태의 발주만 삭제 가능
    const isRequestedStatus =
      record.status === OrderStatus.requested || record.status === "주문 접수";
    return isAuthor && isRequestedStatus;
  };

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

  // 발주 삭제 핸들러
  const handleDeleteOrder = async (record: IOrderRecord) => {
    if (
      !confirm(
        `발주 건을 삭제하시겠습니까?\n\n발주자: ${record.requester}\n수령자: ${
          record.receiver
        }\n상태: ${getStatusText(record.status)}`
      )
    ) {
      return;
    }

    try {
      await deleteOrderMutation.mutateAsync(record.id.toString());
      toast.success("발주가 삭제되었습니다.");
    } catch (error) {
      toast.error("발주 삭제에 실패했습니다.");
      console.error("발주 삭제 오류:", error);
    }
  };

  // 상태 변경 드롭다운 컴포넌트
  const StatusDropdown = ({ record }: { record: IOrderRecord }) => {
    // 권한이 없는 경우 상태만 표시
    if (!hasPermissionToChangeStatus()) {
      return (
        <div className="flex gap-2 items-center">
          <div
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
              record.status
            )}`}
          >
            {getStatusIcon(record.status)}
            {getStatusText(record.status)}
          </div>
        </div>
      );
    }

    // 출고 완료 상태인 경우 상태만 표시하고 변경 불가
    if (record.status === OrderStatus.shipmentCompleted) {
      return (
        <div className="flex gap-2 items-center">
          <div
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
              record.status
            )} cursor-not-allowed`}
            title="출고 완료된 주문은 상태를 변경할 수 없습니다"
          >
            {getStatusIcon(record.status)}
            {getStatusText(record.status)}
          </div>
        </div>
      );
    }

    // admin 권한 사용자의 경우 특정 상태일 때만 드롭다운 표시
    if (userAccessLevel === "admin") {
      const allowedStatusesForAdmin = [
        OrderStatus.approved,
        OrderStatus.confirmedByShipper,
        OrderStatus.shipmentCompleted,
        OrderStatus.rejectedByShipper,
      ];

      if (!allowedStatusesForAdmin.includes(record.status as OrderStatus)) {
        return (
          <div className="flex gap-2 items-center">
            <div
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
                record.status
              )}`}
            >
              {getStatusIcon(record.status)}
              {getStatusText(record.status)}
            </div>
          </div>
        );
      }
    }

    // 권한이 있는 경우 드롭다운과 현재 상태 표시
    return (
      <div className="flex gap-3 items-center">
        {/* 현재 상태 표시 */}
        <div className="flex gap-2 items-center">
          <div
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${getStatusColorClass(
              record.status
            )}`}
          >
            {getStatusIcon(record.status)}
            {getStatusText(record.status)}
          </div>
        </div>

        {/* 상태 변경 드롭다운 */}
        <div className="relative">
          <select
            value={record.status}
            onChange={(e) =>
              handleStatusChange(record.id, e.target.value as OrderStatus)
            }
            disabled={isUpdatingStatus === record.id}
            className="px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300 hover:border-gray-400 transition-colors"
          >
            {/* 권한에 따라 다른 선택지 표시 */}
            {userAccessLevel === "moderator" ? (
              // Moderator: 요청, 승인, 반려만 가능 (단, 본인 발주는 승인/반려 불가)
              <>
                <option value={OrderStatus.requested}>요청</option>
                <option
                  value={OrderStatus.approved}
                  disabled={record.userId === auth?.id}
                >
                  승인{record.userId === auth?.id ? " (본인 발주)" : ""}
                </option>
                <option
                  value={OrderStatus.rejected}
                  disabled={record.userId === auth?.id}
                >
                  반려{record.userId === auth?.id ? " (본인 발주)" : ""}
                </option>
              </>
            ) : userAccessLevel === "admin" ? (
              // Admin: 출고팀 확인, 출고 완료, 출고 보류만 가능
              <>
                <option value={OrderStatus.confirmedByShipper}>
                  출고팀 확인
                </option>
                <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
                <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
              </>
            ) : (
              // 기본값 (권한이 없는 경우)
              <>
                <option value={OrderStatus.requested}>요청</option>
                <option value={OrderStatus.approved}>승인</option>
                <option value={OrderStatus.rejected}>반려</option>
                <option value={OrderStatus.confirmedByShipper}>
                  출고팀 확인
                </option>
                <option value={OrderStatus.shipmentCompleted}>출고 완료</option>
                <option value={OrderStatus.rejectedByShipper}>출고 보류</option>
              </>
            )}
          </select>
          {isUpdatingStatus === record.id && (
            <div className="flex absolute inset-0 justify-center items-center bg-gray-100 bg-opacity-50 rounded-md">
              <div className="w-4 h-4 rounded-full border-2 animate-spin border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"></div>
            </div>
          )}
        </div>
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
          거래처별
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
    <div className="container px-0 mx-auto max-w-7xl sm:px-2">
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

          {/* 거래처 선택 */}
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

        {/* 데이터 테이블 */}
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
            formatDate={formatDate}
            getStatusText={getStatusText}
            getStatusColorClass={getStatusColorClass}
            hasPermissionToEdit={hasPermissionToEdit}
            onEditClick={handleEditClick}
            onDetailClick={(record) => {
              const teamId = currentTeamId;
              const url = `/orderRecord/${record.id}?teamId=${teamId}`;
              window.open(url, "_blank");
            }}
            // 상태 변경 관련 props 추가
            hasPermissionToChangeStatus={hasPermissionToChangeStatus}
            handleStatusChange={handleStatusChange}
            isUpdatingStatus={isUpdatingStatus}
            userAccessLevel={userAccessLevel}
            auth={currentUser}
          />
        ) : (
          <>
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="overflow-hidden mx-1 my-2 w-full bg-white rounded-2xl shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 tracking-wider w-[15%] sm:w-2/12">
                      생성일
                    </th>
                    <th className="px-1 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 tracking-wider w-[25%] sm:w-3/12">
                      제목
                    </th>
                    <th className="px-1 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 tracking-wider w-[15%] sm:w-2/12">
                      발주자
                    </th>
                    <th className="px-1 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 tracking-wider w-[20%] sm:w-2/12">
                      출고예정일
                    </th>
                    <th className="px-1 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 tracking-wider w-[15%] sm:w-2/12">
                      상태
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
                          {/* 데스크톱 UI */}
                          <td className="hidden px-1 py-2 text-xs text-gray-700 whitespace-nowrap sm:table-cell sm:px-6 sm:py-4 sm:text-sm">
                            <Calendar
                              size={14}
                              className="inline-block mr-1 text-gray-500"
                            />
                            {formatDate(record.createdAt)}
                          </td>
                          <td className="hidden sm:table-cell px-1 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 truncate max-w-[120px] sm:max-w-[200px]">
                            <div className="truncate" title={record.title}>
                              <span
                                className={`mr-1 px-1 py-0.5 text-xs font-medium rounded ${
                                  record.packageId && record.packageId > 0
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {record.packageId && record.packageId > 0
                                  ? "패키지"
                                  : "개별"}
                              </span>
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
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-1 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 truncate max-w-[80px] sm:max-w-none">
                            {record.requester}
                          </td>
                          <td className="hidden px-1 py-2 text-xs text-gray-700 whitespace-nowrap sm:table-cell sm:px-6 sm:py-4 sm:text-sm">
                            {record.packageId && record.packageId > 0 ? (
                              <Package
                                size={14}
                                className="inline-block mr-1 text-purple-500"
                              />
                            ) : (
                              <Package
                                size={14}
                                className="inline-block mr-1 text-blue-500"
                              />
                            )}
                            {formatDate(record.outboundDate)}
                          </td>
                          <td className="hidden px-1 py-2 text-xs text-gray-700 whitespace-nowrap sm:table-cell sm:px-6 sm:py-4 sm:text-sm">
                            <div className="flex justify-between items-center">
                              <span
                                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-xs rounded-full ${getStatusColorClass(
                                  record.status
                                )}`}
                              >
                                {getStatusText(record.status)}
                              </span>
                              <div className="flex justify-center items-center ml-1 w-5 h-5 bg-gray-100 rounded-full transition-colors sm:ml-2 sm:w-6 sm:h-6 hover:bg-gray-200">
                                {expandedRowId === record.id ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-gray-500"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-gray-500"
                                  />
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 모바일 UI */}
                          <td className="px-3 py-3 sm:hidden">
                            <div className="flex flex-col gap-2">
                              {/* 첫 번째 줄: 생성일, 제목 */}
                              <div className="flex gap-2 items-center">
                                <div className="flex items-center text-gray-500">
                                  <Calendar size={14} className="mr-1" />
                                  <span className="text-xs">
                                    {formatDate(record.createdAt)}
                                  </span>
                                </div>
                                <div className="flex-1 text-xs font-medium text-gray-700 truncate">
                                  <span
                                    className={`mr-1 px-1 py-0.5 text-xs font-medium rounded ${
                                      record.packageId && record.packageId > 0
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {record.packageId && record.packageId > 0
                                      ? "패키지"
                                      : "개별"}
                                  </span>
                                  {record.title || "제목 없음"}
                                </div>
                              </div>
                              {/* 두 번째 줄: 발주자, 출고예정일 */}
                              <div className="flex gap-2 items-center">
                                <div className="text-xs text-gray-600">
                                  {record.requester}
                                </div>
                                <div className="flex items-center text-gray-500">
                                  {record.packageId && record.packageId > 0 ? (
                                    <Package
                                      size={14}
                                      className="mr-1 text-purple-500"
                                    />
                                  ) : (
                                    <Package
                                      size={14}
                                      className="mr-1 text-blue-500"
                                    />
                                  )}
                                  <span className="text-xs">
                                    {formatDate(record.outboundDate)}
                                  </span>
                                </div>
                              </div>
                              {/* 세 번째 줄: 상태 */}
                              <div className="flex justify-between items-center">
                                <div className="flex gap-1 items-center">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${getStatusColorClass(
                                      record.status
                                    )}`}
                                  >
                                    {getStatusText(record.status)}
                                  </span>
                                </div>
                                <div className="flex justify-center items-center w-5 h-5 bg-gray-100 rounded-full">
                                  {expandedRowId === record.id ? (
                                    <ChevronUp
                                      size={14}
                                      className="text-gray-500"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={14}
                                      className="text-gray-500"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {expandedRowId === record.id && (
                          <tr className="bg-gray-50 transition-all duration-200 ease-in-out">
                            <td colSpan={5} className="p-2 sm:p-4">
                              {/* 수정/삭제 버튼 섹션 */}
                              {(hasPermissionToEdit(record) ||
                                canDeleteOrder(record)) && (
                                <div className="p-3 mb-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:mb-6 sm:p-6">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2 w-5 h-5 text-blue-500 sm:h-6 sm:w-6 sm:mr-3"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                      <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
                                        주문 관리
                                      </h3>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          const teamId = currentTeamId;
                                          const url = `/orderRecord/${record.id}?teamId=${teamId}`;
                                          window.open(url, "_blank");
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md transition-colors hover:bg-green-600"
                                      >
                                        상세보기
                                      </button>
                                      {hasPermissionToEdit(record) && (
                                        <button
                                          onClick={() =>
                                            handleEditClick(record)
                                          }
                                          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md transition-colors hover:bg-blue-600"
                                        >
                                          수정하기
                                        </button>
                                      )}
                                      {canDeleteOrder(record) && (
                                        <button
                                          onClick={() =>
                                            handleDeleteOrder(record)
                                          }
                                          disabled={
                                            deleteOrderMutation.isPending
                                          }
                                          className="p-2 text-white bg-red-500 rounded-md transition-colors hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                          title={
                                            deleteOrderMutation.isPending
                                              ? "삭제 중..."
                                              : "삭제하기"
                                          }
                                        >
                                          {deleteOrderMutation.isPending ? (
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                          ) : (
                                            <Trash2 className="w-5 h-5" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {/* 상태 변경 섹션 */}

                              <div className="p-3 mb-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:mb-6 sm:p-6">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <span
                                      className={`mr-2 px-2 py-1 text-xs font-medium rounded-full ${
                                        record.packageId && record.packageId > 0
                                          ? "bg-purple-100 text-purple-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {record.packageId && record.packageId > 0
                                        ? "패키지"
                                        : "개별"}
                                    </span>
                                    <h3 className="text-base font-semibold text-gray-700 sm:text-lg">
                                      {record.title ||
                                        `${
                                          record.warehouse?.warehouseName ||
                                          "알 수 없는 창고"
                                        }에서 ${
                                          record.orderItems &&
                                          record.orderItems.length > 0
                                            ? record.orderItems.length > 1
                                              ? `${
                                                  record.orderItems[0]?.item
                                                    ?.teamItem?.itemName ||
                                                  "품목"
                                                } 등 ${
                                                  record.orderItems.length
                                                }개 품목`
                                              : `${
                                                  record.orderItems[0]?.item
                                                    ?.teamItem?.itemName ||
                                                  "품목"
                                                }`
                                            : "품목"
                                        } 출고`}
                                    </h3>
                                  </div>
                                  <StatusDropdown record={record} />
                                </div>
                              </div>

                              <div className="space-y-6 animate-fadeIn">
                                {/* 상단 2열 레이아웃 */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
                                  {/* 왼쪽: 발주 상세 정보 */}
                                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm sm:p-5">
                                    <h3 className="flex items-center pb-2 mb-3 text-sm font-bold text-gray-700 border-b sm:text-base">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2 w-4 h-4 text-gray-500 sm:h-5 sm:w-5"
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
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          제목:
                                        </span>
                                        <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-blue-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.title ||
                                            `${
                                              record.warehouse?.warehouseName ||
                                              "알 수 없는 창고"
                                            }에서 ${
                                              record.orderItems &&
                                              record.orderItems.length > 0
                                                ? record.orderItems.length > 1
                                                  ? `${
                                                      record.orderItems[0]?.item
                                                        ?.teamItem?.itemName ||
                                                      "품목"
                                                    } 등 ${
                                                      record.orderItems.length
                                                    }개 품목`
                                                  : `${
                                                      record.orderItems[0]?.item
                                                        ?.teamItem?.itemName ||
                                                      "품목"
                                                    }`
                                                : "품목"
                                            } 출고`}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          생성일:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {formatDate(record.createdAt)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          구매일:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.purchaseDate
                                            ? formatDate(record.purchaseDate)
                                            : "-"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          출고예정일:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.outboundDate
                                            ? formatDate(record.outboundDate)
                                            : "-"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          설치요청일:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.installationDate
                                            ? formatDate(
                                                record.installationDate
                                              )
                                            : "-"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          발주자:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.requester}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          담당자:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.manager || "-"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          출고 창고:
                                        </span>
                                        <span className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-md sm:px-3 sm:text-sm">
                                          {record.warehouse?.warehouseName ||
                                            "창고 정보 없음"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* 추가 요청사항 */}
                                    {record.memo && (
                                      <div className="flex flex-col  justify-between items-start border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          추가 요청사항:
                                        </span>
                                        <span className="px-2 py-2 w-full text-xs text-center text-gray-800 bg-gray-50 rounded-md sm:text-sm">
                                          {record.memo}
                                        </span>
                                      </div>
                                    )}

                                    <OrderCommentSection
                                      record={record}
                                      currentUser={currentUser}
                                    />
                                  </div>

                                  {/* 오른쪽: 배송 정보 */}
                                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm sm:p-5">
                                    <h3 className="flex items-center pb-2 mb-3 text-sm font-bold text-gray-700 border-b sm:text-base">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2 w-4 h-4 text-gray-500 sm:h-5 sm:w-5"
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
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          수령자:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.receiver}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                                          연락처:
                                        </span>
                                        <span className="px-2 py-1 text-xs text-gray-800 bg-gray-50 rounded-md sm:px-3 sm:text-sm">
                                          {record.receiverPhone}
                                        </span>
                                      </div>
                                      <div className="flex flex-col border-b border-gray-100 py-1.5 sm:py-2">
                                        <span className="mb-1 text-xs font-medium text-gray-600 sm:text-sm">
                                          주소:
                                        </span>
                                        <span className="p-2 text-xs text-gray-800 break-words bg-gray-50 rounded-md sm:p-3 sm:text-sm">
                                          {record.receiverAddress}
                                        </span>
                                      </div>
                                    </div>

                                    {/* 첨부 파일 */}
                                    {record.files &&
                                      record.files.length > 0 && (
                                        <div className="mt-4">
                                          <h4 className="flex items-center mb-3 text-xs font-medium text-gray-700 sm:text-sm">
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="mr-2 w-3 h-3 text-gray-500 sm:h-4 sm:w-4"
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
                                                  className="flex items-center text-xs text-blue-500 hover:text-blue-700 hover:underline sm:text-sm"
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="mr-1 w-3 h-3 sm:h-4 sm:w-4 sm:mr-2"
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

                                {/* 하단: 주문 품목 목록 (전체 너비) */}
                                {record.orderItems &&
                                  record.orderItems.length > 0 && (
                                    <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm sm:p-5">
                                      <h3 className="flex items-center pb-2 mb-3 text-sm font-bold text-gray-700 border-b sm:text-base">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="mr-2 w-4 h-4 text-gray-500 sm:h-5 sm:w-5"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                        </svg>
                                        주문 품목 목록 (
                                        {record.orderItems.length}개)
                                      </h3>

                                      {/* 패키지 이름이 없거나 공백이거나 -면 안보이게 */}
                                      {record.package?.packageName &&
                                        record.package.packageName.trim() !==
                                          "" &&
                                        record.package.packageName !== "-" && (
                                          <div className="p-3 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-medium text-blue-700">
                                                패키지:
                                              </span>
                                              <span className="text-sm font-semibold text-blue-800">
                                                {record.package.packageName}
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border-b border-gray-200">
                                          <span className="flex-1">품목명</span>
                                          <span className="w-20 text-center">
                                            수량
                                          </span>
                                        </div>
                                        <ul className="divide-y divide-gray-200">
                                          {record.orderItems.map((item) => (
                                            <li
                                              key={item.id}
                                              className="px-4 py-4 transition-colors hover:bg-gray-100"
                                            >
                                              <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                  <span className="text-sm font-medium text-gray-800">
                                                    {item.item?.teamItem
                                                      ?.itemName ||
                                                      "알 수 없는 품목"}
                                                    {item.item?.teamItem
                                                      ?.itemCode && (
                                                      <span className="ml-2 text-xs text-gray-500">
                                                        (
                                                        {
                                                          item.item.teamItem
                                                            .itemCode
                                                        }
                                                        )
                                                      </span>
                                                    )}
                                                  </span>
                                                  {/* {item.memo && (
                                                    <p className="mt-1 text-xs italic text-gray-500">
                                                      메모: {item.memo}
                                                    </p>
                                                  )} */}
                                                </div>
                                                <div className="w-20 text-center">
                                                  <span className="px-3 py-1 text-black text-md">
                                                    {item.quantity}개
                                                  </span>
                                                </div>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
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
                        className="py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Package size={40} className="mb-2 text-gray-300" />
                          <p>표시할 데이터가 없습니다.</p>
                          <p className="mt-1 text-sm text-gray-400">
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
            <div className="flex justify-between items-center p-4 mt-6 bg-white rounded-xl shadow-sm">
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

      {/* 주문 수정 모달 */}
      <OrderEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        orderRecord={selectedOrderForEdit}
      />
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

// 상태에 따른 아이콘 반환 함수 추가
const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case OrderStatus.requested:
    case "주문 접수":
      return (
        <svg
          className="inline-block mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case OrderStatus.approved:
      return (
        <svg
          className="inline-block mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 1.414l2 2a1 1 0 010 1.414l-4 4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case OrderStatus.rejected:
      return (
        <svg
          className="inline-block mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    case OrderStatus.confirmedByShipper:
      return (
        <svg
          className="inline-block mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2v5a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-9a1 1 0 00-.293-.707l-2-2A1 1 0 0017 3h-1c0-.552-.447-1-1-1H5a1 1 0 00-1 1H3z" />
        </svg>
      );
    case OrderStatus.shipmentCompleted:
      return (
        <svg
          className="inline-block mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case OrderStatus.rejectedByShipper:
      return (
        <svg
          className="inline-block mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="inline-block mr-1 w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 100 2 1 1 0 000-2zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

// 댓글 섹션 컴포넌트
interface OrderCommentSectionProps {
  record: IOrderRecord;
  currentUser: IUser | undefined;
}

const OrderCommentSection: React.FC<OrderCommentSectionProps> = ({
  record,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // 실제 API를 사용한 댓글 관리
  const {
    comments,
    isLoading,
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useOrderComments(record.id);

  // 권한 확인 함수들
  const canEditComment = (comment: OrderComment) => {
    if (!currentUser) return false;
    // 수정은 오직 본인 댓글만 가능 (Admin도 본인 댓글만)
    return comment.userId === currentUser.id;
  };

  const canDeleteComment = (comment: OrderComment) => {
    if (!currentUser) return false;
    // 삭제는 본인 댓글 + Admin은 모든 댓글 가능
    return (
      comment.userId === currentUser.id || currentUser.accessLevel === "admin"
    );
  };

  // 댓글 작성 시간 포맷팅
  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;

    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 댓글 작성 핸들러
  const handleSubmitComment = () => {
    if (!newComment.trim() || !currentUser) return;

    const commentData: CreateOrderCommentDto = {
      content: newComment.trim(),
    };

    createComment(commentData);
    setNewComment("");
  };

  // 댓글 수정 핸들러
  const handleEditComment = (commentId: number) => {
    if (!editingContent.trim()) return;

    const updateData: UpdateOrderCommentDto = {
      content: editingContent.trim(),
    };

    updateComment({ commentId, data: updateData });
    setEditingCommentId(null);
    setEditingContent("");
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    deleteComment(commentId);
  };

  return (
    <div className="p-2 mt-4 bg-white rounded-xl border border-gray-100 shadow-sm sm:p-5">
      <h3 className="flex items-center pb-2 mb-3 text-sm font-bold text-gray-700 border-b sm:text-base">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2 w-4 h-4 text-gray-500 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
        댓글 ({comments.length})
      </h3>

      {/* 댓글 목록 */}
      <div className="overflow-y-auto mb-4 space-y-3 max-h-60">
        {isLoading ? (
          <p className="py-4 text-sm text-center text-gray-500">
            댓글을 불러오는 중...
          </p>
        ) : comments.length === 0 ? (
          <p className="py-4 text-sm text-center text-gray-500">
            아직 댓글이 없습니다.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCommentDate(comment.createdAt)}
                  </span>
                  {comment.createdAt !== comment.updatedAt && (
                    <span className="text-xs text-gray-400">(수정됨)</span>
                  )}
                </div>

                {(canEditComment(comment) || canDeleteComment(comment)) && (
                  <div className="flex space-x-1">
                    {canEditComment(comment) && (
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditingContent(comment.content);
                        }}
                        disabled={isUpdating || isDeleting}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                      >
                        수정
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={isUpdating || isDeleting}
                        className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400"
                      >
                        {isDeleting ? "삭제중..." : "삭제"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="p-2 w-full text-sm rounded-md border border-gray-300 resize-none"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      disabled={isUpdating}
                      className="px-3 py-1 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      {isUpdating ? "저장중..." : "저장"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingContent("");
                      }}
                      disabled={isUpdating}
                      className="px-3 py-1 text-xs text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {currentUser && (
        <div className="pt-3 border-t">
          <div className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력해주세요..."
              className="p-3 w-full text-sm rounded-md border border-gray-300 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isCreating}
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isCreating}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isCreating ? "작성 중..." : "댓글 작성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderRecordTabs;
