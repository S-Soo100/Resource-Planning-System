"use client";
import { useEffect, useState, useMemo } from "react";
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
import ItemSelectionModal from "../ui/ItemSelectionModal";
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

  // 공통 훅 사용
  const fileUpload = useFileUpload();
  const addressSearch = useAddressSearch();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const auth = authStore((state) => state.user);
  const { user } = useCurrentUser();

  // 아이템 관련 상태
  const [orderItems, setOrderItems] = useState<
    (OrderItemWithDetails & { warehouseItemId: number })[]
  >([]);

  const [formData, setFormData] = useState<OrderRequestFormData>({
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
        manager:
          user?.accessLevel === "supplier"
            ? "조정흠(010-3338-2722)"
            : prev.manager,
      }));
    }
  }, [auth, user?.accessLevel]);

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
  const effectiveWarehousesList = propWarehousesList || warehousesList;

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

  // 거래처 목록 설정
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
  }, [currentWarehouseItems, formData.warehouseId]);

  // 초기 날짜 설정
  useEffect(() => {
    // 현재 날짜를 ISO 형식(YYYY-MM-DD)으로 변환
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    setRequestDate(formattedDate);
    setSetupDate(formattedDate);

    setFormData((prev) => ({
      ...prev,
      requestDate: formattedDate,
      setupDate: formattedDate,
    }));
  }, []);

  const [packageQuantity, setPackageQuantity] = useState(1);

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

    const itemCodes = selectedPackage.itemlist.split(", ");
    const newItems = itemCodes
      .map((itemCode) => {
        const warehouseItem = currentWarehouseItems.find(
          (item) => item.teamItem.itemCode === itemCode
        );
        if (!warehouseItem) return null;

        return {
          teamItem: warehouseItem.teamItem,
          quantity: packageQuantity,
          stockAvailable: warehouseItem.itemQuantity >= packageQuantity,
          stockQuantity: warehouseItem.itemQuantity,
          warehouseItemId: warehouseItem.id,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    setOrderItems(newItems);
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
    if (supplierId === 0) {
      setFormData({
        ...formData,
        supplierId: null,
        receiver: "",
        receiverPhone: "",
        address: "",
      });
      return;
    }

    const selectedSupplier = suppliers?.find(
      (supplier: Supplier) => supplier.id === supplierId
    );
    if (selectedSupplier) {
      setFormData({
        ...formData,
        supplierId,
        receiver: selectedSupplier.supplierName,
        receiverPhone: selectedSupplier.supplierPhoneNumber,
        address: selectedSupplier.supplierAddress,
      });
    }
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

  const validateForm = (): boolean => {
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

    try {
      const orderData: CreateOrderDto = {
        userId: auth?.id ?? 0,
        manager: formData.manager,
        supplierId: formData.supplierId ?? null,
        packageId: formData.packageId ?? null,
        warehouseId: formData.warehouseId ?? 0,
        requester: formData.requester,
        receiver: formData.receiver,
        receiverPhone: formData.receiverPhone,
        receiverAddress: `${formData.address} ${formData.detailAddress}`.trim(),
        purchaseDate: formData.requestDate,
        outboundDate: formData.requestDate,
        installationDate: formData.setupDate,
        status: OrderStatus.requested,
        memo: formData.notes,
        orderItems: orderItems
          .filter((item) => item.quantity > 0)
          .map((item) => ({
            itemId: item.warehouseItemId,
            quantity: item.quantity,
            memo: formData.notes,
          })),
      };
      console.log(orderData);
      createOrder(orderData, {
        onSuccess: async (response) => {
          if (response.success && response.data) {
            //! 파일이 첨부된 경우 추가 처리
            if (fileUpload.files.length > 0) {
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
                      fileUpload.files
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

                // 페이지 이동
                router.replace("/orderRecord");
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
            toast.error(response.message || "발주 요청에 실패했습니다");
          }
        },
        onError: (error) => {
          setIsSubmitting(false);
          console.error("발주 요청 실패:", error);
          toast.error("발주 요청에 실패했습니다");
        },
      });
    } catch (error) {
      setIsSubmitting(false);
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
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-center">{title}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
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
              const hasAccess = !user || hasWarehouseAccess(user, warehouse.id);
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
                className="px-4 py-2 text-white bg-blue-500 rounded-md transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h3 className="mb-2 font-medium">선택된 품목</h3>
            <div className="p-3 rounded-md border">
              {orderItems.map((item, index) => (
                <div
                  key={item.warehouseItemId}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex gap-2 items-center">
                      <p className="font-medium">{item.teamItem.itemName}</p>
                      {formData.warehouseId &&
                        item.stockAvailable === false && (
                          <div className="flex items-center text-xs text-red-500">
                            <AlertCircle size={14} className="mr-1" />
                            재고 부족
                          </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">
                      코드: {item.teamItem.itemCode}
                      {formData.warehouseId &&
                        item.stockQuantity !== undefined && (
                          <span className="ml-2">
                            (재고: {item.stockQuantity}개)
                          </span>
                        )}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, false)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, true)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.warehouseItemId)}
                      className="p-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
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
          userAccessLevel={user?.accessLevel}
        />

        {/* 날짜 정보 */}
        <DateInfoSection
          requestDate={requestDate}
          setupDate={setupDate}
          onDateChange={handleDateChange}
          focusRingColor="blue"
        />

        {/* 거래처 선택 */}
        {user?.accessLevel !== "supplier" && (
          <SupplierSection
            suppliers={suppliers}
            onChange={handleSupplierChange}
            focusRingColor="blue"
          />
        )}

        {/* 수령인 정보 */}
        <RecipientInfoSection
          receiver={formData.receiver}
          receiverPhone={formData.receiverPhone}
          onChange={handleChange}
          focusRingColor="blue"
        />

        {/* 수령지 주소 */}
        <AddressSection
          address={formData.address}
          detailAddress={formData.detailAddress}
          isAddressOpen={addressSearch.isAddressOpen}
          onChange={handleChange}
          onAddressChange={(data) =>
            addressSearch.handleAddressChange(data, setFormData)
          }
          onToggleAddressModal={addressSearch.handleToggleAddressModal}
          onCloseAddressModal={addressSearch.handleCloseAddressModal}
          focusRingColor="blue"
        />

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
    </div>
  );
};

export default OrderRequestForm;
