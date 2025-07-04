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
} from "@/types/(order)/orderRequestFormData";
// 패키지 관련 기능은 휠체어 발주에서 사용하지 않으므로 제거
import { authStore } from "@/store/authStore";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { Item } from "@/types/(item)/item";
import { uploadMultipleOrderFileById } from "@/api/order-api";
import { useQueryClient } from "@tanstack/react-query";
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

// 휠체어 전용 창고명
const WHEELCHAIR_WAREHOUSE_NAME = "캥스터즈 안산 연구소/휠체어";

export default function WheelchairOrderForm() {
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

  // 훅들
  const { useGetSuppliers } = useSuppliers();
  const { suppliers: suppliersResponse } = useGetSuppliers();
  const { warehouses } = useWarehouseItems();
  const [wheelchairWarehouse, setWheelchairWarehouse] =
    useState<Warehouse | null>(null);

  const { useGetItemsByWarehouse } = useItemStockManagement();
  const warehouseId = formData.warehouseId?.toString() || "";
  const { data: warehouseItemsData } = useGetItemsByWarehouse(warehouseId);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { useCreateOrder } = useOrder();
  const { mutate: createOrder } = useCreateOrder();
  const { user } = useCurrentUser();

  // 현재 창고의 모든 아이템들 (카테고리 제한 없음)
  const currentWarehouseItems = useMemo(() => {
    try {
      const items = (warehouseItemsData?.data as Item[]) || [];

      // 아이템 유효성 검사만 수행하고 카테고리 필터링은 제거
      const validItems = items.filter((item) => {
        // 아이템이 유효한지 확인
        if (!item || !item.teamItem) return false;
        return true;
      });

      return validItems;
    } catch {
      return [];
    }
  }, [warehouseItemsData]);

  // 휠체어 창고 자동 설정
  useEffect(() => {
    if (warehouses && !formData.warehouseId) {
      const targetWarehouse = warehouses.find(
        (warehouse) => warehouse.warehouseName === WHEELCHAIR_WAREHOUSE_NAME
      );

      if (targetWarehouse) {
        setWheelchairWarehouse(targetWarehouse);
        setFormData((prev) => ({
          ...prev,
          warehouseId: targetWarehouse.id,
        }));
      }
    }
  }, [warehouses, formData.warehouseId]);

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

  // 사용자 이름 자동 설정
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

  // 사용자 권한에 따른 예외 처리 (0.2초 후 실행)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user && auth?.name) {
        if (user.accessLevel === "supplier") {
          // supplier인 경우에도 requester는 본인 이름 유지
          setFormData((prev) => ({
            ...prev,
            requester: auth.name, // requester에 본인 이름 설정
            manager: "조정흠(010-3338-2722)", // manager에 캥스터즈 담당자 설정
          }));
        }
      }
    }, 200); // 0.2초 후 실행

    return () => clearTimeout(timer);
  }, [user, auth?.name]);

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
      const stockItem = currentWarehouseItems.find(
        (stockItem) => stockItem.teamItem.itemCode === item.teamItem.itemCode
      );

      const stockAvailable = stockItem
        ? stockItem.itemQuantity >= item.quantity
        : false;
      const stockQuantity = stockItem?.itemQuantity || 0;

      if (
        item.stockAvailable === stockAvailable &&
        item.stockQuantity === stockQuantity
      ) {
        return item;
      }

      return {
        ...item,
        stockAvailable,
        stockQuantity,
      };
    });

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

      createOrder(orderData, {
        onSuccess: async (response) => {
          if (response.success && response.data) {
            if (fileUpload.files.length > 0) {
              try {
                const orderId = response.data.id;

                if (!orderId) {
                  toast.error(
                    "발주 요청은 성공했으나 주문 ID를 찾을 수 없어 파일 업로드를 진행할 수 없습니다"
                  );
                } else {
                  const orderIdAsNumber =
                    typeof orderId === "string"
                      ? parseInt(orderId, 10)
                      : orderId;

                  if (isNaN(orderIdAsNumber)) {
                    toast.error(
                      "발주 요청은 성공했으나 유효하지 않은 주문 ID로 인해 파일 업로드를 진행할 수 없습니다"
                    );
                    return;
                  }

                  const maxFileSize = 50 * 1024 * 1024; // 50MB
                  const oversizedFiles = fileUpload.files.filter(
                    (file) => file.size > maxFileSize
                  );

                  if (oversizedFiles.length > 0) {
                    toast.error(
                      "50MB를 초과하는 파일이 있어 업로드할 수 없습니다"
                    );
                    return;
                  }

                  try {
                    toast.loading("파일 업로드 중...");
                    const uploadResponse = await uploadMultipleOrderFileById(
                      orderIdAsNumber,
                      fileUpload.files
                    );
                    toast.dismiss();

                    if (uploadResponse.success) {
                      const uploadedFileNames = uploadResponse.data
                        ?.map((file) => file.fileName)
                        .join(", ");
                      toast.success(
                        `휠체어 발주 요청 및 파일 '${uploadedFileNames}' 업로드가 완료되었습니다`
                      );
                    } else {
                      toast.error(
                        `발주 요청은 성공했으나 파일 업로드에 실패했습니다: ${
                          uploadResponse.error || "알 수 없는 오류"
                        }`
                      );
                    }
                  } catch (error) {
                    console.error("파일 업로드 API 오류:", error);
                    toast.error("파일 업로드 과정에서 오류가 발생했습니다");
                  }
                }
              } catch (error) {
                console.error("파일 업로드 전체 과정 오류:", error);
                toast.error(
                  "발주 요청은 성공했으나 파일 업로드 중 오류가 발생했습니다"
                );
              }
            } else {
              toast.success("휠체어 발주 요청이 완료되었습니다");
            }

            setIsProcessing(true);
            toast.loading("처리 중... 잠시만 기다려주세요.");

            setTimeout(async () => {
              try {
                const currentTeamId =
                  authStore.getState().selectedTeam?.id || 1;
                await queryClient.invalidateQueries({
                  queryKey: ["orders", "team", currentTeamId],
                });

                await queryClient.refetchQueries({
                  queryKey: ["orders", "team", currentTeamId],
                });

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
            toast.error(response.message || "휠체어 발주 요청에 실패했습니다");
          }
        },
        onError: (error) => {
          setIsSubmitting(false);
          console.error("발주 요청 실패:", error);
          toast.error("휠체어 발주 요청에 실패했습니다");
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      console.error("발주 요청 실패:", error);
      toast.error("휠체어 발주 요청에 실패했습니다");
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
    // 이미 추가된 아이템인지 확인 (itemCode가 중복되는 경우를 대비하여 warehouseItemId로 체크)
    const isItemExists = orderItems.some(
      (orderItem) => orderItem.warehouseItemId === item.id
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
    <div className="container p-4 mx-auto max-w-2xl">
      <div className="p-2 mb-6 text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-center">
          휠체어 발주 요청
        </h1>
        {/* <p className="text-center text-purple-100">전문 휠체어 발주 시스템</p> */}
      </div>

      {/* 창고 정보 표시 */}
      {wheelchairWarehouse && (
        <div className="p-4 mb-6 bg-purple-50 rounded-lg border border-purple-200 shadow-sm">
          <div className="flex gap-3 items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <span className="text-sm font-medium text-purple-800">
                발주 창고:
              </span>
              <span className="ml-2 text-sm font-semibold text-purple-700">
                {wheelchairWarehouse.warehouseName}
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 품목 추가 버튼 */}
        <div className="p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            {/* <label className="block text-sm font-medium text-gray-700">
              휠체어 관련 품목 <span className="text-red-500">*</span>
            </label> */}
            <button
              type="button"
              onClick={handleOpenItemModal}
              disabled={!formData.warehouseId}
              className="px-4 py-2 text-white bg-purple-500 rounded-md transition-colors hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} className="inline mr-1" />
              품목 추가
            </button>
          </div>
          {!formData.warehouseId && (
            <p className="text-xs text-amber-600">창고 설정을 기다리는 중...</p>
          )}
          {orderItems.length === 0 && formData.warehouseId && (
            <p className="text-xs text-gray-500">
              품목 추가 버튼을 클릭하여 품목을 추가하세요.
            </p>
          )}
        </div>

        {/* 선택된 품목 목록 */}
        {orderItems.length > 0 && (
          <div className="p-4 bg-white rounded-lg border shadow-sm">
            <h3 className="mb-3 font-medium text-gray-800">선택된 품목</h3>
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div
                  key={item.warehouseItemId}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex gap-2 items-center">
                      <p className="font-medium text-gray-800">
                        {item.teamItem.itemName}
                      </p>
                      {item.stockAvailable === false && (
                        <div className="flex items-center text-xs text-red-500">
                          <AlertCircle size={14} className="mr-1" />
                          재고 부족
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      코드: {item.teamItem.itemCode}
                      {item.stockQuantity !== undefined && (
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
                      className="p-1 bg-gray-200 rounded transition-colors hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 font-medium text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, true)}
                      className="p-1 bg-gray-200 rounded transition-colors hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.warehouseItemId)}
                      className="p-1 ml-2 text-red-600 bg-red-100 rounded transition-colors hover:bg-red-200"
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
          focusRingColor="purple"
        />

        {/* 담당자 정보 */}
        <ContactInfoSection
          requester={formData.requester}
          manager={formData.manager}
          onChange={handleChange}
          focusRingColor="purple"
          userAccessLevel={user?.accessLevel}
        />

        {/* 날짜 정보 */}
        <DateInfoSection
          requestDate={requestDate}
          setupDate={setupDate}
          onDateChange={handleDateChange}
          focusRingColor="purple"
        />

        {/* 거래처 선택 */}
        {user?.accessLevel !== "supplier" && (
          <SupplierSection
            suppliers={suppliers}
            onChange={handleSupplierChange}
            focusRingColor="purple"
          />
        )}

        {/* 수령인 정보 */}
        <RecipientInfoSection
          receiver={formData.receiver}
          receiverPhone={formData.receiverPhone}
          onChange={handleChange}
          focusRingColor="purple"
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
          focusRingColor="purple"
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
          buttonText="휠체어 발주 요청하기"
          processingText="휠체어 발주 처리 중..."
          completingText="완료 처리 중..."
          color="purple"
        />
      </form>

      {/* 품목 추가 모달 */}
      <ItemSelectionModal
        isOpen={isItemModalOpen}
        onClose={handleCloseItemModal}
        onAddItem={handleAddItemFromModal}
        currentWarehouseItems={currentWarehouseItems}
        orderItems={orderItems}
        title="휠체어 품목 추가"
      />

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
}
