"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, X, AlertCircle } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";
import { useSuppliers } from "@/hooks/useSupplier";
import { toast } from "react-hot-toast";
import { CreateOrderDto, OrderStatus } from "@/types/(order)/order";
import { Supplier } from "@/types/supplier";
import {
  OrderItemWithDetails,
  OrderRequestFormData,
  OrderRequestFormProps,
} from "@/types/(order)/orderRequestFormData";
import { usePackages } from "@/hooks/usePackages";
import { PackageApi } from "@/types/(item)/package";
import { authStore } from "@/store/authStore";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { Item } from "@/types/(item)/item";
import { uploadMultipleOrderFileById } from "@/api/order-api";
import { useQueryClient } from "@tanstack/react-query";
import {
  hasWarehouseAccess,
  getWarehouseAccessDeniedMessage,
} from "@/utils/warehousePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import {
  getTodayString,
  formatDateToLocalString,
  formatDateForServer,
} from "@/utils/dateUtils";
import ItemSelectionModal from "../ui/ItemSelectionModal";
import LoadingOverlay from "../ui/LoadingOverlay";
import {
  FileUploadSection,
  ContactInfoSection,
  DateInfoSection,
  RecipientInfoSection,
  AddressSection,
  SupplierSection,
  NotesSection,
  SubmitButton,
} from "../common";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import AddSupplierModal from "../supplier/AddSupplierModal";
import SelectSupplierModal from "../supplier/SelectSupplierModal";

const OrderRequestForm: React.FC<OrderRequestFormProps> = ({
  isPackageOrder = false,
  title = "발주 요청",
  warehousesList: propWarehousesList,
  warehouseItems: propWarehouseItems,
  onWarehouseChange,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [setupDate, setSetupDate] = useState("");

  // 로딩 상태 관리
  const [loadingState, setLoadingState] = useState({
    isVisible: false,
    title: "처리 중...",
    message: "잠시만 기다려주세요.",
    progress: 0,
  });

  // 공통 훅 사용
  const fileUpload = useFileUpload();
  const addressSearch = useAddressSearch();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isSelectSupplierModalOpen, setIsSelectSupplierModalOpen] =
    useState(false);
  const auth = authStore((state) => state.user);
  const { user } = useCurrentUser();
  const { isSupplier, accessLevel: permissionAccessLevel } = usePermission();
  const { team: currentTeam } = useCurrentTeam();

  // 아이템 관련 상태
  const [orderItems, setOrderItems] = useState<
    (OrderItemWithDetails & { warehouseItemId: number })[]
  >([]);

  // 🆕 전체 영세율 상태
  const [isAllZeroRated, setIsAllZeroRated] = useState(false);

  const [formData, setFormData] = useState<OrderRequestFormData>({
    title: "", // 제목 필드 추가
    manager: "",
    requester: auth?.name || "",
    receiver: "",
    receiverPhone: "",
    address: "",
    detailAddress: "",
    requestDate: "",
    setupDate: "",
    notes: "",
    supplierId: null,
    warehouseId: null,
  });

  // auth가 변경될 때 requester와 manager 업데이트
  useEffect(() => {
    if (auth?.name) {
      setFormData((prev) => ({
        ...prev,
        requester: auth.name,
        manager: isSupplier ? "조정흠(010-3338-2722)" : prev.manager,
      }));
    }
  }, [auth, isSupplier]);

  // 훅 호출
  const { useGetPackages } = usePackages();
  const { packages } = useGetPackages();
  const { useCreateOrder } = useOrder();
  const {
    mutate: createOrder,
    // data: createOrderResponse
  } = useCreateOrder();
  const { useGetSuppliers } = useSuppliers();
  const { suppliers: suppliersResponse } = useGetSuppliers();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // 창고 관련 상태와 훅 - props가 없을 경우에만 사용
  const { warehouses } = useWarehouseItems();
  const [warehousesList, setWarehousesList] = useState<Warehouse[]>([]);

  // 창고별 아이템 재고 조회 - props가 없을 경우에만 사용
  const { useGetItemsByWarehouse } = useItemStockManagement();
  const warehouseId = formData.warehouseId?.toString() || "";
  const { data: warehouseItemsData } = useGetItemsByWarehouse(warehouseId);

  // 실제 사용할 창고 목록과 아이템 데이터 (props 우선)
  const baseWarehousesList = propWarehousesList || warehousesList;

  // 임시 조치: 모든 팀에서 모든 창고 선택 가능
  const effectiveWarehousesList = useMemo(() => {
    return baseWarehousesList;
  }, [baseWarehousesList]);

  // 현재 선택된 창고의 아이템 목록
  const currentWarehouseItems = useMemo(() => {
    if (propWarehouseItems && warehouseId) {
      return propWarehouseItems[warehouseId] || [];
    }
    return (warehouseItemsData?.data as Item[]) || [];
  }, [propWarehouseItems, warehouseId, warehouseItemsData]);

  // 창고 목록 설정 (props가 없을 경우에만)
  useEffect(() => {
    if (!propWarehousesList && warehouses) {
      setWarehousesList(warehouses);
    }
  }, [propWarehousesList, warehouses]);
  //     // 창고 목록이 있으면 첫 번째 창고를 자동으로 선택
  //     if (warehouses.length > 0 && !formData.warehouseId) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         warehouseId: warehouses[0].id,
  //       }));
  //     }
  //   }
  // }, [propWarehousesList, warehouses, formData.warehouseId]);

  // // props로 전달된 창고 목록이 있으면 첫 번째 창고를 자동으로 선택
  // useEffect(() => {
  //   if (
  //     propWarehousesList &&
  //     propWarehousesList.length > 0 &&
  //     !formData.warehouseId
  //   ) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       warehouseId: propWarehousesList[0].id,
  //     }));
  //   }
  // }, [propWarehousesList, formData.warehouseId]);

  // 납품처 목록 설정
  useEffect(() => {
    if (suppliersResponse) {
      if (
        typeof suppliersResponse === "object" &&
        "data" in suppliersResponse
      ) {
        setSuppliers(suppliersResponse.data as Supplier[]);
      } else {
        setSuppliers(suppliersResponse as Supplier[]);
      }
    }
  }, [suppliersResponse]);

  // 현재 창고의 아이템 데이터가 변경되면 재고 상태 업데이트
  useEffect(() => {
    if (
      !currentWarehouseItems ||
      !formData.warehouseId ||
      orderItems.length === 0
    ) {
      return;
    }

    const updatedItems = orderItems.map((item) => {
      // 현재 창고에 있는 아이템 중 일치하는 코드 찾기
      const stockItem = currentWarehouseItems.find(
        (stockItem) => stockItem.teamItem.itemCode === item.teamItem.itemCode
      );

      // 재고 상태 계산
      const stockAvailable = stockItem
        ? stockItem.itemQuantity >= item.quantity
        : false;
      const stockQuantity = stockItem?.itemQuantity || 0;

      // 재고 상태가 이미 동일하면 객체를 새로 생성하지 않고 그대로 반환
      if (
        item.stockAvailable === stockAvailable &&
        item.stockQuantity === stockQuantity
      ) {
        return item;
      }

      // 재고 상태가 변경된 경우에만 새 객체 생성
      return {
        ...item,
        stockAvailable,
        stockQuantity,
      };
    });

    // 변경된 항목이 있는 경우에만 상태 업데이트
    const hasChanges = updatedItems.some(
      (item, index) =>
        item.stockAvailable !== orderItems[index].stockAvailable ||
        item.stockQuantity !== orderItems[index].stockQuantity
    );

    if (hasChanges) {
      setOrderItems(updatedItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWarehouseItems, formData.warehouseId]); // orderItems는 무한 루프 방지를 위해 의존성에서 제외

  // 패키지 수량 상태 (로컬스토리지 함수보다 먼저 선언)
  const [packageQuantity, setPackageQuantity] = useState(1);

  // 🆕 총 금액에서 공급가액과 VAT 계산 (v2.6.0)
  const calculatePriceBreakdown = (
    totalPrice: string,
    isZeroRated: boolean
  ): { sellingPrice: number; vat: number } => {
    const total = parseInt(totalPrice || "0", 10);

    if (total === 0) {
      return { sellingPrice: 0, vat: 0 };
    }

    if (isZeroRated) {
      // 영세율: 전체 금액이 공급가액, VAT = 0
      return {
        sellingPrice: total,
        vat: 0,
      };
    } else {
      // 일반 부가세: 총액 ÷ 1.1 = 공급가액
      const sellingPrice = Math.round(total / 1.1);
      const vat = total - sellingPrice; // 차액이 VAT (반올림 오차 방지)
      return { sellingPrice, vat };
    }
  };

  // 로컬스토리지 키
  const FORM_DATA_KEY = `orderForm_${isPackageOrder ? "package" : "regular"}_${currentTeam?.id || "default"}`;

  // 폼 데이터 로컬스토리지에 저장
  const saveFormDataToLocalStorage = useCallback(() => {
    try {
      const dataToSave = {
        formData,
        orderItems,
        packageQuantity,
        requestDate,
        setupDate,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("폼 데이터 저장 실패:", error);
    }
  }, [
    formData,
    orderItems,
    packageQuantity,
    requestDate,
    setupDate,
    FORM_DATA_KEY,
  ]);

  // 로컬스토리지에서 폼 데이터 복원
  const restoreFormDataFromLocalStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(FORM_DATA_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // 24시간 이내 데이터만 복원
        const savedTime = new Date(parsed.timestamp).getTime();
        const now = new Date().getTime();
        if (now - savedTime < 24 * 60 * 60 * 1000) {
          setFormData(parsed.formData);
          setOrderItems(parsed.orderItems || []);
          setPackageQuantity(parsed.packageQuantity || 1);
          setRequestDate(parsed.requestDate || getTodayString());
          setSetupDate(parsed.setupDate || getTodayString());
          return true;
        } else {
          // 24시간 지난 데이터는 삭제
          localStorage.removeItem(FORM_DATA_KEY);
        }
      }
    } catch (error) {
      console.error("폼 데이터 복원 실패:", error);
    }
    return false;
  }, [FORM_DATA_KEY]);

  // 로컬스토리지 데이터 삭제
  const clearFormDataFromLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(FORM_DATA_KEY);
    } catch (error) {
      console.error("폼 데이터 삭제 실패:", error);
    }
  }, [FORM_DATA_KEY]);

  // 초기 날짜 설정 및 로컬스토리지 복원
  useEffect(() => {
    // 로컬스토리지에서 데이터 복원 시도
    const restored = restoreFormDataFromLocalStorage();

    // 복원 실패 시 초기 날짜 설정
    if (!restored) {
      const formattedDate = getTodayString();
      setRequestDate(formattedDate);
      setSetupDate(formattedDate);

      setFormData((prev) => ({
        ...prev,
        requestDate: formattedDate,
        setupDate: formattedDate,
      }));
    }
  }, [restoreFormDataFromLocalStorage]);

  // 패키지 수량 변경 핸들러
  const handlePackageQuantityChange = (increment: boolean) => {
    setPackageQuantity((prev) => {
      const newQuantity = increment ? prev + 1 : prev > 1 ? prev - 1 : prev;

      // 패키지 아이템들의 수량도 함께 업데이트
      setOrderItems((prevItems) =>
        prevItems.map((item) => {
          const stockItem = currentWarehouseItems?.find(
            (stockItem) =>
              stockItem.teamItem.itemCode === item.teamItem.itemCode
          );

          return {
            ...item,
            quantity: newQuantity,
            stockAvailable: stockItem
              ? stockItem.itemQuantity >= newQuantity
              : false,
          };
        })
      );

      return newQuantity;
    });
  };

  // 패키지 선택 핸들러 수정
  const handlePackageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const packageId = parseInt(e.target.value);
    if (packageId === 0) {
      setOrderItems([]);
      setPackageQuantity(1);
      setFormData((prev) => ({
        ...prev,
        packageId: null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      packageId,
    }));

    const selectedPackage = packages?.find(
      (pkg: PackageApi) => pkg.id === packageId
    );
    if (!selectedPackage) return;

    // packageItems 또는 itemlist에서 아이템 코드 추출
    let itemsWithMemo: Array<{ code: string; memo?: string }> = [];

    // 1. packageItems 배열이 있고 비어있지 않은 경우
    if (
      selectedPackage.packageItems &&
      selectedPackage.packageItems.length > 0
    ) {
      itemsWithMemo = selectedPackage.packageItems
        .filter((pkgItem) => pkgItem.deletedAt === null) // 삭제되지 않은 아이템만
        .map((pkgItem) => ({
          code: pkgItem.item.teamItem.itemCode,
          memo: pkgItem.item.teamItem.memo || undefined, // 패키지 아이템의 메모 포함
        }));
    }
    // 2. packageItems가 비어있고 itemlist가 있는 경우 (구버전 데이터)
    else if (selectedPackage.itemlist) {
      itemsWithMemo = selectedPackage.itemlist
        .split(",")
        .map((code) => code.trim())
        .filter((code) => code)
        .map((code) => ({ code, memo: undefined })); // 구버전은 메모 없음
    }

    if (itemsWithMemo.length === 0) {
      toast.error("패키지에 포함된 아이템이 없습니다");
      return;
    }

    // 추출된 아이템 코드로 창고 아이템 찾기
    const newItems = itemsWithMemo
      .map(({ code, memo }) => {
        const warehouseItem = currentWarehouseItems.find(
          (item) => item.teamItem.itemCode === code
        );
        if (!warehouseItem) {
          console.warn(`창고에서 품목 코드 '${code}'를 찾을 수 없습니다`);
          return null;
        }

        return {
          teamItem: warehouseItem.teamItem,
          quantity: packageQuantity,
          stockAvailable: warehouseItem.itemQuantity >= packageQuantity,
          stockQuantity: warehouseItem.itemQuantity,
          warehouseItemId: warehouseItem.id,
          memo: memo, // 패키지 아이템의 메모 할당
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (newItems.length === 0) {
      toast.error("선택한 창고에 패키지 아이템이 없습니다");
      return;
    }

    setOrderItems(newItems);
    toast.success(`${newItems.length}개의 품목이 추가되었습니다`);
  };

  // 아이템 제거 핸들러
  const handleRemoveItem = (itemId: number) => {
    setOrderItems((prev) =>
      prev.filter((item) => item.warehouseItemId !== itemId)
    );
  };

  // 아이템 수량 변경 핸들러
  const handleQuantityChange = (index: number, increment: boolean) => {
    setOrderItems((prev) => {
      const updated = prev.map((item, idx) => {
        if (idx === index) {
          const newQuantity = increment
            ? item.quantity + 1
            : item.quantity > 0
              ? item.quantity - 1
              : item.quantity;

          // 현재 창고의 아이템에서 재고 확인
          const stockItem = currentWarehouseItems.find(
            (stockItem) =>
              stockItem.teamItem.itemCode === item.teamItem.itemCode
          );

          return {
            ...item,
            quantity: newQuantity,
            stockAvailable: stockItem
              ? stockItem.itemQuantity >= newQuantity
              : false,
            stockQuantity: stockItem?.itemQuantity || 0,
          };
        }
        return item;
      });
      return updated;
    });
  };

  // 🆕 전체 영세율 체크 핸들러 (v2.6.0)
  const handleAllZeroRatedChange = (checked: boolean) => {
    setIsAllZeroRated(checked);

    // 모든 품목의 가격 재계산
    setOrderItems((prev) =>
      prev.map((item) => {
        const { sellingPrice, vat } = calculatePriceBreakdown(
          item.totalPrice || "",
          checked
        );
        return {
          ...item,
          sellingPrice: sellingPrice.toString(),
          vat: vat.toString(),
        };
      })
    );
  };

  // 🆕 개별 영세율 체크 핸들러 (v2.6.0)
  const handleZeroRatedChange = (index: number, checked: boolean) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      const item = updated[index];

      // 영세율 상태 업데이트
      const newItem = { ...item, isZeroRated: checked };

      // 가격 재계산
      const { sellingPrice, vat } = calculatePriceBreakdown(
        newItem.totalPrice || "",
        checked
      );

      newItem.sellingPrice = sellingPrice.toString();
      newItem.vat = vat.toString();

      updated[index] = newItem;
      return updated;
    });
  };

  // 🆕 총 금액 입력 핸들러 (v2.6.0)
  const handleTotalPriceChange = (index: number, value: string) => {
    // 숫자만 허용
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    setOrderItems((prev) => {
      const updated = [...prev];
      const item = updated[index];

      // 영세율 여부 확인 (전체 또는 개별)
      const isZeroRated = isAllZeroRated || (item.isZeroRated ?? false);

      // 공급가액과 VAT 자동 계산
      const { sellingPrice, vat } = calculatePriceBreakdown(value, isZeroRated);

      // 업데이트
      updated[index] = {
        ...item,
        totalPrice: value,
        sellingPrice: sellingPrice.toString(),
        vat: vat.toString(),
      };

      return updated;
    });
  };

  // 품목별 메모 변경 핸들러
  const handleMemoChange = (index: number, value: string) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        memo: value,
      };
      return updated;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "requestDate" | "setupDate"
  ) => {
    const { value } = e.target;
    if (type === "requestDate") {
      setRequestDate(value);
    } else {
      setSetupDate(value);
    }

    setFormData({
      ...formData,
      [type]: value,
    });
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = parseInt(e.target.value);

    // 빈 값 선택 무시
    if (!supplierId || isNaN(supplierId)) {
      return;
    }

    const selectedSupplier = suppliers?.find(
      (supplier: Supplier) => supplier.id === supplierId
    );

    if (!selectedSupplier) return;

    // Supplier 정보로 수령인 필드 자동 채우기 (confirm 없이)
    setFormData({
      ...formData,
      supplierId,
      receiver: selectedSupplier.supplierName,
      receiverPhone: selectedSupplier.supplierPhoneNumber || "",
      address: selectedSupplier.supplierAddress || "",
      detailAddress: "", // 상세주소는 비우기
    });
  };

  // 모달에서 고객 선택 핸들러 (고객 정보 자동 채우기)
  const handleSupplierSelect = (supplier: Supplier) => {
    setFormData({
      ...formData,
      supplierId: supplier.id,
      receiver: supplier.representativeName || supplier.supplierName || "",
      receiverPhone: supplier.supplierPhoneNumber || "",
      address: supplier.supplierAddress || "",
      detailAddress: "", // 상세주소는 비워둠
    });
  };

  // 납품처 추가 성공 핸들러
  const handleAddSupplierSuccess = async () => {
    // 납품처 목록 새로고침 (React Query가 자동으로 UI 업데이트)
    await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
  };

  // 창고 선택 핸들러
  const handleWarehouseChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const warehouseId = parseInt(e.target.value);

    // 창고 접근 권한 체크
    if (warehouseId !== 0 && user && !hasWarehouseAccess(user, warehouseId)) {
      const warehouseName =
        effectiveWarehousesList.find((w) => w.id === warehouseId)
          ?.warehouseName || `창고 ${warehouseId}`;
      toast.error(getWarehouseAccessDeniedMessage(warehouseName));
      e.target.value = formData.warehouseId?.toString() || "0"; // 이전 값으로 복원
      return;
    }

    setFormData({
      ...formData,
      warehouseId: warehouseId,
    });

    // 창고가 변경되면 선택된 아이템을 완전히 초기화
    setOrderItems([]);

    if (warehouseId !== 0 && onWarehouseChange) {
      // 부모 컴포넌트에서 제공한 onWarehouseChange 함수 사용
      try {
        await onWarehouseChange(warehouseId);
      } catch (error) {
        console.error("창고 아이템 조회 실패:", error);
      }
    }
  };

  // 테스트 데이터 자동 채우기 함수 (팀 ID가 1인 경우)
  const fillTestData = useCallback(() => {
    if (currentTeam?.id !== 1) return; // 팀 ID가 1이 아니면 실행하지 않음

    console.log(
      "[테스트 모드] 개별품목발주 테스트 데이터로 폼을 자동으로 채웁니다..."
    );

    // 오늘 날짜 기준으로 계산
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // 통합 날짜 유틸리티 사용
    const formatDate = (date: Date) => {
      return formatDateToLocalString(date);
    };

    setFormData((prev) => ({
      ...prev,
      title: "🧪 [테스트] 자동화 개별품목 발주",
      manager: "김개발",
      receiver: "박수령",
      receiverPhone: "010-9876-5432",
      address: "서울특별시 강남구 테헤란로 456",
      detailAddress: "테스트타워 3층 301호",
      requestDate: formatDate(tomorrow),
      setupDate: formatDate(nextWeek),
      notes:
        "🧪 이것은 테스트 팀의 테스트 발주 데이터입니다.\n\n- 자동화된 테스트 개별품목 발주\n- 모든 필드가 테스트용 더미 데이터로 채워짐\n- 실제 발주가 아닌 개발/테스트 목적\n\n※ 주의: 실제 운영 환경에서는 이 기능이 비활성화됩니다.",
      supplierId: suppliers.length > 0 ? suppliers[0].id : null,
      warehouseId: warehouses.length > 0 ? warehouses[0].id : null,
    }));

    // 날짜 상태도 업데이트
    setRequestDate(formatDate(tomorrow));
    setSetupDate(formatDate(nextWeek));

    // 테스트 토스트 메시지
    toast.success("🧪 테스트 데이터가 자동으로 채워졌습니다!", {
      duration: 4000,
      icon: "🧪",
    });

    console.log(
      "[테스트 모드] 개별품목발주 폼 데이터 자동 입력 완료 (아이템 제외)"
    );
  }, [currentTeam?.id, suppliers, warehouses]);

  // 테스트 데이터 자동 채우기 (팀 ID가 1인 경우, 2초 후 실행)
  useEffect(() => {
    if (currentTeam?.id === 1) {
      console.log(
        "[테스트 모드] 2초 후 개별품목발주 테스트 데이터를 자동으로 채웁니다..."
      );
      const timer = setTimeout(() => {
        fillTestData();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentTeam?.id, fillTestData]);

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요");
      return false;
    }
    // 모든 계정에 대해 고객 선택 필수
    if (!formData.supplierId) {
      toast.error("고객을 선택해주세요");
      return false;
    }
    if (orderItems.length === 0) {
      toast.error("최소 하나 이상의 품목을 선택해주세요");
      return false;
    }
    if (!formData.requester) {
      toast.error("요청자를 입력해주세요");
      return false;
    }
    if (!formData.receiver) {
      toast.error("수령인을 입력해주세요");
      return false;
    }
    if (!formData.receiverPhone) {
      toast.error("수령인 연락처를 입력해주세요");
      return false;
    }
    if (!formData.address && !formData.detailAddress) {
      toast.error("배송지를 입력해주세요");
      return false;
    }
    if (!formData.requestDate) {
      toast.error("배송일을 선택해주세요");
      return false;
    }
    if (!formData.warehouseId) {
      toast.error("발주할 창고를 선택해주세요");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 확인 메시지 표시
    const isConfirmed = window.confirm(
      "발주서, 견적서 등 필요한 증빙을 모두 업로드 하셨나요?"
    );

    if (!isConfirmed) {
      return;
    }

    setIsSubmitting(true);
    setLoadingState({
      isVisible: true,
      title: "발주 요청서 검증 중...",
      message: "입력하신 정보를 확인하고 있습니다.",
      progress: 10,
    });

    try {
      // UTC 기반 날짜 처리로 시간대 변환 오류 방지
      const toUTCISOString = (dateString: string) => {
        if (!dateString) return "";
        const serverDate = formatDateForServer(dateString);
        return serverDate ? `${serverDate}T00:00:00.000Z` : "";
      };
      // 총 판매가격 계산 (VAT 포함)
      const calculatedTotalPrice = orderItems
        .filter((item) => item.quantity > 0)
        .reduce((sum, item) => {
          const sellingPrice = parseInt(item.sellingPrice || "0", 10);
          const vat = parseInt(item.vat || "0", 10);
          return sum + (sellingPrice + vat) * item.quantity;
        }, 0);

      const orderData: CreateOrderDto = {
        userId: auth?.id ?? 0,
        title: formData.title, // 제목 필드 추가
        manager: formData.manager,
        supplierId: formData.supplierId ?? 0, // Supplier 계정은 0으로 전송 (백엔드에서 처리)
        packageId: formData.packageId ?? null,
        warehouseId: formData.warehouseId ?? 0,
        requester: formData.requester,
        receiver: formData.receiver,
        receiverPhone: formData.receiverPhone,
        receiverAddress: `${formData.address} ${formData.detailAddress}`.trim(),
        purchaseDate: toUTCISOString(formData.requestDate),
        outboundDate: toUTCISOString(formData.requestDate),
        installationDate: toUTCISOString(formData.setupDate),
        status: OrderStatus.requested,
        memo: formData.notes,
        totalPrice: calculatedTotalPrice > 0 ? calculatedTotalPrice : undefined,
        orderItems: orderItems
          .filter((item) => item.quantity > 0)
          .map((item) => ({
            itemId: item.warehouseItemId,
            quantity: item.quantity,
            memo: item.memo || "",
            sellingPrice: item.sellingPrice
              ? parseInt(item.sellingPrice, 10)
              : undefined,
            vat: item.vat ? parseInt(item.vat, 10) : undefined,
          })),
      };

      // 서버로 전송 중
      setLoadingState({
        isVisible: true,
        title: "발주 요청서 전송 중...",
        message: "서버에 데이터를 전송하고 있습니다. 잠시만 기다려주세요.",
        progress: 30,
      });

      console.log(orderData);
      createOrder(orderData, {
        onSuccess: async (response) => {
          if (response.success && response.data) {
            // 발주 생성 성공
            setLoadingState({
              isVisible: true,
              title: "발주 요청이 완료되었습니다!",
              message: "발주 정보가 성공적으로 저장되었습니다.",
              progress: 60,
            });

            //! 파일이 첨부된 경우 추가 처리
            if (fileUpload.files.length > 0) {
              setLoadingState({
                isVisible: true,
                title: "파일 업로드 중...",
                message: `${fileUpload.files.length}개의 첨부파일을 업로드하고 있습니다.`,
                progress: 70,
              });
              try {
                const orderId = response.data.id;

                if (!orderId) {
                  console.error("주문 ID가 없습니다:", response.data);
                  toast.error(
                    "발주 요청은 성공했으나 주문 ID를 찾을 수 없어 파일 업로드를 진행할 수 없습니다"
                  );
                } else {
                  // orderId가 string 타입일 가능성이 있으므로 명시적으로 숫자 변환
                  const orderIdAsNumber =
                    typeof orderId === "string"
                      ? parseInt(orderId, 10)
                      : orderId;

                  if (isNaN(orderIdAsNumber)) {
                    console.error("주문 ID가 유효한 숫자가 아닙니다:", orderId);
                    toast.error(
                      "발주 요청은 성공했으나 유효하지 않은 주문 ID로 인해 파일 업로드를 진행할 수 없습니다"
                    );
                    return;
                  }

                  // 파일 크기 검사 (50MB 제한)
                  const maxFileSize = 50 * 1024 * 1024; // 50MB
                  const oversizedFiles = fileUpload.files.filter(
                    (file) => file.size > maxFileSize
                  );

                  if (oversizedFiles.length > 0) {
                    console.error(
                      "파일 크기가 너무 큰 파일이 있습니다:",
                      oversizedFiles.map((f) => f.name)
                    );
                    toast.error(
                      "50MB를 초과하는 파일이 있어 업로드할 수 없습니다"
                    );
                    return;
                  }

                  // uploadMultipleOrderFileById API 호출
                  try {
                    toast.loading("파일 업로드 중...");
                    const uploadResponse = await uploadMultipleOrderFileById(
                      orderIdAsNumber,
                      fileUpload.getEncodedFiles()
                    );
                    toast.dismiss();

                    if (uploadResponse.success) {
                      console.log("파일 업로드 성공:", uploadResponse.data);
                      const uploadedFileNames = uploadResponse.data
                        ?.map((file) => file.fileName)
                        .join(", ");
                      toast.success(
                        `발주 요청 및 파일 '${uploadedFileNames}' 업로드가 완료되었습니다`
                      );
                    } else {
                      console.error("파일 업로드 실패:", uploadResponse.error);
                      toast.error(
                        `발주 요청은 성공했으나 파일 업로드에 실패했습니다: ${
                          uploadResponse.error || "알 수 없는 오류"
                        }`
                      );
                    }
                  } catch (uploadApiError) {
                    console.error(
                      "파일 업로드 API 호출 중 오류:",
                      uploadApiError
                    );
                    toast.error("파일 업로드 과정에서 오류가 발생했습니다");
                  }
                }
              } catch (uploadError) {
                console.error("파일 업로드 전체 과정 중 오류:", uploadError);
                toast.error(
                  "발주 요청은 성공했으나 파일 업로드 중 오류가 발생했습니다"
                );
              }
            } else {
              toast.success("발주 요청이 완료되었습니다");
            }

            // 처리 중 상태로 변경
            setIsProcessing(true);
            toast.loading("처리 중... 잠시만 기다려주세요.");

            // 2초 후 캐시 갱신 및 페이지 이동
            setTimeout(async () => {
              try {
                // React Query 캐시 무효화
                const currentTeamId =
                  authStore.getState().selectedTeam?.id || 1;
                await queryClient.invalidateQueries({
                  queryKey: ["orders", "team", currentTeamId],
                });

                // 발주 목록 데이터 다시 가져오기
                await queryClient.refetchQueries({
                  queryKey: ["orders", "team", currentTeamId],
                });

                // 최종 완료 상태
                setLoadingState({
                  isVisible: true,
                  title: "완료!",
                  message: "발주 요청이 성공적으로 처리되었습니다.",
                  progress: 100,
                });

                // 잠시 완료 상태 보여주기
                setTimeout(() => {
                  setLoadingState({
                    isVisible: false,
                    title: "",
                    message: "",
                    progress: 0,
                  });
                  // 로컬스토리지 데이터 삭제
                  clearFormDataFromLocalStorage();
                  // 페이지 이동
                  router.replace("/orderRecord");
                }, 1500);
              } catch (error) {
                console.error("처리 중 오류 발생:", error);
                toast.error("처리 중 오류가 발생했습니다");
              } finally {
                setIsProcessing(false);
                toast.dismiss();
              }
            }, 2000);
          } else {
            setIsSubmitting(false);
            setLoadingState({
              isVisible: false,
              title: "",
              message: "",
              progress: 0,
            });
            toast.error(response.message || "발주 요청에 실패했습니다");
          }
        },
        onError: (error) => {
          setIsSubmitting(false);
          setLoadingState({
            isVisible: false,
            title: "",
            message: "",
            progress: 0,
          });
          console.error("발주 요청 실패:", error);
          toast.error("발주 요청에 실패했습니다");
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      setLoadingState({
        isVisible: false,
        title: "",
        message: "",
        progress: 0,
      });
      console.error("발주 요청 실패:", error);
      toast.error("발주 요청에 실패했습니다");
    }
  };

  // 모달 관련 핸들러
  const handleOpenItemModal = () => {
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
  };

  const handleAddItemFromModal = (item: Item) => {
    // 이미 추가된 아이템인지 확인
    const isItemExists = orderItems.some(
      (orderItem) =>
        orderItem.teamItem?.itemCode &&
        item.teamItem?.itemCode &&
        orderItem.teamItem.itemCode === item.teamItem.itemCode
    );

    if (isItemExists) {
      toast.error("이미 추가된 아이템입니다");
      return;
    }

    // 아이템 추가
    setOrderItems((prev) => [
      ...prev,
      {
        teamItem: item.teamItem,
        quantity: 1,
        stockAvailable: item.itemQuantity >= 1,
        stockQuantity: item.itemQuantity,
        warehouseItemId: item.id,
      },
    ]);

    toast.success(`${item.teamItem.itemName}이 추가되었습니다`);
  };

  return (
    <>
      <LoadingOverlay
        isVisible={loadingState.isVisible}
        title={loadingState.title}
        message={loadingState.message}
        progress={loadingState.progress}
      />
      <div className="p-4 mx-auto max-w-4xl">
        <h1 className="mb-4 text-2xl font-bold text-center">{title}</h1>

        {/* 테스트 모드 표시 */}
        {currentTeam?.id === 1 && (
          <div className="p-3 mx-auto mb-6 max-w-md bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-lg">🧪</div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-yellow-800">
                    테스트 모드 활성화
                  </p>
                  <p className="text-xs text-yellow-700">
                    2초 후 자동으로 테스트 데이터가 채워집니다
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fillTestData}
                className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded-full hover:bg-yellow-300 transition-colors"
              >
                지금 채우기
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="px-3 py-2 w-full rounded-md border focus:outline-none focus:ring-2 focus:ring-Primary-Main"
              placeholder="발주 제목을 입력하세요"
              required
            />
          </div>

          {/* 창고 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              발주 창고 선택 <span className="text-red-500">*</span>
            </label>
            <select
              name="warehouseId"
              onChange={handleWarehouseChange}
              value={formData.warehouseId || 0}
              className="px-3 py-2 w-full rounded-md border"
              required
            >
              <option value="0">창고 선택</option>
              {effectiveWarehousesList.map((warehouse) => {
                const hasAccess =
                  !user || hasWarehouseAccess(user, warehouse.id);
                return (
                  <option
                    key={warehouse.id}
                    value={warehouse.id}
                    disabled={!hasAccess}
                    style={{ color: hasAccess ? "inherit" : "#9CA3AF" }}
                  >
                    {warehouse.warehouseName}
                    {!hasAccess ? " (접근 불가)" : ""}
                  </option>
                );
              })}
            </select>
            {user &&
              effectiveWarehousesList.some(
                (w) => !hasWarehouseAccess(user, w.id)
              ) && (
                <p className="text-xs text-amber-600">
                  일부 창고는 접근 권한이 제한되어 있습니다.
                </p>
              )}
          </div>

          {/* 패키지 선택 (패키지 발주 요청인 경우에만 표시) */}
          {isPackageOrder && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                패키지 선택
              </label>
              <div className="flex gap-2 items-center">
                <select
                  name="packageId"
                  onChange={handlePackageSelect}
                  className="flex-1 px-3 py-2 rounded-md border"
                  required={isPackageOrder}
                  disabled={!formData.warehouseId}
                >
                  <option value="0">패키지 선택</option>
                  {packages?.map((pkg: PackageApi) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.packageName}
                    </option>
                  ))}
                </select>
                {formData.packageId && (
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => handlePackageQuantityChange(false)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{packageQuantity}</span>
                    <button
                      type="button"
                      onClick={() => handlePackageQuantityChange(true)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>
              {!formData.warehouseId && (
                <p className="text-xs text-amber-600">
                  창고를 먼저 선택해주세요.
                </p>
              )}
            </div>
          )}

          {/* 개별품목 선택 (개별품목 발주 요청인 경우에만 표시) */}
          {!isPackageOrder && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  품목 선택
                </label>
                <button
                  type="button"
                  onClick={handleOpenItemModal}
                  disabled={!formData.warehouseId}
                  className="px-4 py-2 text-white bg-blue-500 rounded-full transition-colors hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-Primary-Main focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="inline mr-1" />
                  품목 추가
                </button>
              </div>
              {!formData.warehouseId && (
                <p className="text-xs text-amber-600">
                  창고를 먼저 선택해주세요.
                </p>
              )}
              {orderItems.length === 0 && formData.warehouseId && (
                <p className="text-xs text-gray-500">
                  품목 추가 버튼을 클릭하여 품목을 선택하세요.
                </p>
              )}
            </div>
          )}

          {orderItems.length > 0 && (
            <div className="mt-4">
              {/* 🆕 전체 영세율 체크박스 (v2.6.0) */}
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllZeroRated}
                    onChange={(e) => handleAllZeroRatedChange(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="font-medium text-gray-700">
                    영세율(0%) 품목 (전체 적용)
                  </span>
                </label>
                <p className="ml-6 mt-1 text-xs text-amber-700">
                  체크 시: 모든 품목의 부가세가 0원으로 처리됩니다
                </p>
              </div>

              {/* 🆕 안내 메시지 (v2.6.0) */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
                    <p className="font-semibold mb-1">💡 가격 입력 방법</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        <strong>총 금액만 입력</strong>하세요. 공급가액과
                        부가세는 자동으로 계산됩니다.
                      </li>
                      <li>
                        <strong>일반 품목</strong>: 총 금액의 10%가 부가세로
                        자동 계산됩니다.
                      </li>
                      <li>
                        <strong>영세율 품목</strong>: 체크박스를 선택하면
                        부가세가 0원으로 처리됩니다.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="mb-2 font-medium">선택된 품목</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">
                        품목명
                      </th>
                      <th className="px-2 py-2 text-center text-sm font-medium text-gray-700">
                        수량
                      </th>
                      <th className="hidden md:table-cell px-2 py-2 text-center text-sm font-medium text-gray-700">
                        영세율
                      </th>
                      <th className="px-2 py-2 text-right text-sm font-medium text-gray-700">
                        총 금액 (원)
                        <span className="ml-1 text-xs text-blue-600">✏️</span>
                      </th>
                      <th className="hidden lg:table-cell px-2 py-2 text-right text-sm font-medium text-gray-500">
                        공급가액 (원)
                        <span className="ml-1 text-xs">💡</span>
                      </th>
                      <th className="hidden lg:table-cell px-2 py-2 text-right text-sm font-medium text-gray-500">
                        부가세 (원)
                        <span className="ml-1 text-xs">💡</span>
                      </th>
                      <th className="hidden sm:table-cell px-2 py-2 text-left text-sm font-medium text-gray-700">
                        메모
                      </th>
                      <th className="px-2 py-2 text-center text-sm font-medium text-gray-700">
                        삭제
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => {
                      // 🆕 영세율 여부 판단 (전체 또는 개별)
                      const isZeroRated =
                        isAllZeroRated || (item.isZeroRated ?? false);

                      // 🆕 자동 계산
                      const { sellingPrice, vat } = calculatePriceBreakdown(
                        item.totalPrice || "",
                        isZeroRated
                      );

                      const subtotal = (sellingPrice + vat) * item.quantity;
                      return (
                        <tr
                          key={item.warehouseItemId}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          {/* 품목명 + 재고 정보 통합 */}
                          <td className="px-2 py-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {item.teamItem.itemName}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">
                                  {item.teamItem.itemCode}
                                </span>
                                {formData.warehouseId &&
                                  item.stockQuantity !== undefined && (
                                    <span
                                      className={`text-xs ${item.stockAvailable ? "text-green-600" : "text-red-500"}`}
                                    >
                                      (재고: {item.stockQuantity}개)
                                    </span>
                                  )}
                              </div>
                              {formData.warehouseId &&
                                item.stockAvailable === false && (
                                  <div className="flex items-center text-xs text-red-500 mt-1">
                                    <AlertCircle size={12} className="mr-1" />
                                    재고 부족
                                  </div>
                                )}
                            </div>
                          </td>

                          {/* 수량 - 버튼 크기 축소 */}
                          <td className="px-2 py-2">
                            <div className="flex gap-0.5 items-center justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(index, false)
                                }
                                className="p-0.5 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(index, true)
                                }
                                className="p-0.5 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>

                          {/* 영세율 체크박스 - 크기 축소, 모바일 숨김 */}
                          <td className="hidden md:table-cell px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={item.isZeroRated ?? false}
                              onChange={(e) =>
                                handleZeroRatedChange(index, e.target.checked)
                              }
                              disabled={isAllZeroRated}
                              className="w-3.5 h-3.5 accent-blue-600"
                              title={
                                isAllZeroRated
                                  ? "전체 영세율 적용 중"
                                  : "개별 영세율"
                              }
                            />
                          </td>

                          {/* 총 금액 입력 - 패딩 축소 */}
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="총액"
                              value={item.totalPrice || ""}
                              onChange={(e) =>
                                handleTotalPriceChange(index, e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-sm text-right border-2 border-blue-300 rounded-lg
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                         bg-white font-medium"
                            />
                          </td>

                          {/* 공급가액 (자동 계산) - 모바일/태블릿 숨김 */}
                          <td className="hidden lg:table-cell px-2 py-2 text-right">
                            <span className="text-sm text-gray-600">
                              {sellingPrice > 0
                                ? sellingPrice.toLocaleString()
                                : "-"}
                            </span>
                          </td>

                          {/* 부가세 (자동 계산) - 모바일/태블릿 숨김 */}
                          <td className="hidden lg:table-cell px-2 py-2 text-right">
                            <span className="text-sm text-gray-600">
                              {vat > 0 ? vat.toLocaleString() : "0"}
                            </span>
                            {isZeroRated && (
                              <span className="ml-1 text-xs text-amber-600">
                                (0%)
                              </span>
                            )}
                          </td>

                          {/* 메모 - 크기 축소, 작은 모바일 숨김 */}
                          <td className="hidden sm:table-cell px-2 py-2">
                            <input
                              type="text"
                              placeholder="메모"
                              value={item.memo || ""}
                              onChange={(e) =>
                                handleMemoChange(index, e.target.value)
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-Primary-Main focus:border-Primary-Main"
                            />
                          </td>

                          {/* 삭제 버튼 - 크기 축소 */}
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItem(item.warehouseItemId)
                              }
                              className="p-1 text-red-600 bg-red-50 rounded hover:bg-Error-Container"
                              title="품목 제거"
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* 총 판매가격 표시 */}
                  {orderItems.some((item) => item.quantity > 0) && (
                    <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                      <tr>
                        <td
                          colSpan={6}
                          className="px-2 py-3 text-right text-base font-bold text-gray-900"
                        >
                          총 거래금액
                        </td>
                        <td className="px-2 py-3 text-right text-lg font-bold text-blue-700">
                          {orderItems
                            .filter((item) => item.quantity > 0)
                            .reduce((sum, item) => {
                              // 🆕 자동 계산된 값 사용
                              const isZeroRated =
                                isAllZeroRated || (item.isZeroRated ?? false);
                              const { sellingPrice, vat } =
                                calculatePriceBreakdown(
                                  item.totalPrice || "",
                                  isZeroRated
                                );
                              return sum + (sellingPrice + vat) * item.quantity;
                            }, 0)
                            .toLocaleString()}
                          원
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* 기타 요청 사항 */}
          <NotesSection
            notes={formData.notes}
            onChange={handleChange}
            focusRingColor="blue"
          />

          {/* 담당자 정보 */}
          <ContactInfoSection
            requester={formData.requester}
            manager={formData.manager}
            onChange={handleChange}
            focusRingColor="blue"
            userAccessLevel={permissionAccessLevel}
          />

          {/* 날짜 정보 */}
          <DateInfoSection
            requestDate={requestDate}
            setupDate={setupDate}
            onDateChange={handleDateChange}
            focusRingColor="blue"
          />

          {/* 고객 선택 */}
          <SupplierSection
            suppliers={suppliers}
            selectedSupplierId={formData.supplierId}
            onChange={handleSupplierChange}
            focusRingColor="blue"
            onAddSupplier={() => setIsAddSupplierModalOpen(true)}
            onOpenSelectModal={() => setIsSelectSupplierModalOpen(true)}
          />

          {/* 고객사 선택 후 표시되는 섹션 */}
          {formData.supplierId ? (
            <>
              {/* 수령인 정보 */}
              <RecipientInfoSection
                receiver={formData.receiver}
                receiverPhone={formData.receiverPhone}
                supplierId={formData.supplierId}
                onChange={handleChange}
                focusRingColor="blue"
              />

              {/* 수령지 주소 */}
              <AddressSection
                address={formData.address}
                detailAddress={formData.detailAddress}
                supplierId={formData.supplierId}
                isAddressOpen={addressSearch.isAddressOpen}
                onChange={handleChange}
                onAddressChange={(data) =>
                  addressSearch.handleAddressChange(data, setFormData)
                }
                onToggleAddressModal={addressSearch.handleToggleAddressModal}
                onCloseAddressModal={addressSearch.handleCloseAddressModal}
                focusRingColor="blue"
              />
            </>
          ) : (
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-600 mb-2">
                  👆 먼저 고객을 선택해주세요
                </p>
                <p className="text-sm text-gray-500">
                  고객을 선택하면 수령인 정보 입력 폼이 표시됩니다
                </p>
              </div>
            </div>
          )}

          {/* 파일 업로드 */}
          <FileUploadSection
            files={fileUpload.files}
            isDragOver={fileUpload.isDragOver}
            onFileSelection={fileUpload.handleFileSelection}
            onDragOver={fileUpload.handleDragOver}
            onDragLeave={fileUpload.handleDragLeave}
            onDrop={fileUpload.handleDrop}
            onRemoveFile={fileUpload.handleRemoveFile}
            selectedFiles={fileUpload.selectedFiles}
          />

          {/* 제출 버튼 */}
          <SubmitButton
            isSubmitting={isSubmitting}
            isProcessing={isProcessing}
            buttonText="발주 요청하기"
            processingText="발주 처리 중..."
            completingText="완료 처리 중..."
            color="blue"
          />
        </form>
        <div className="flex flex-col mb-12 h-32 text-white"> - </div>
        <div className="flex flex-col mb-12 h-32 text-white"> - </div>
        <div className="flex flex-col mb-12 h-32 text-white"> - </div>

        {/* 품목 추가 모달 */}
        <ItemSelectionModal
          isOpen={isItemModalOpen}
          onClose={handleCloseItemModal}
          onAddItem={handleAddItemFromModal}
          currentWarehouseItems={currentWarehouseItems}
          orderItems={orderItems}
          title="품목 추가"
        />

        {/* 고객 추가 모달 */}
        <AddSupplierModal
          isOpen={isAddSupplierModalOpen}
          onClose={() => setIsAddSupplierModalOpen(false)}
          onSuccess={handleAddSupplierSuccess}
        />

        {/* 고객 선택 모달 */}
        <SelectSupplierModal
          isOpen={isSelectSupplierModalOpen}
          onClose={() => setIsSelectSupplierModalOpen(false)}
          suppliers={suppliers || []}
          onSelect={handleSupplierSelect}
          selectedSupplierId={formData.supplierId}
          focusRingColor="blue"
          onAddSupplier={() => setIsAddSupplierModalOpen(true)}
        />
      </div>
    </>
  );
};

export default OrderRequestForm;
