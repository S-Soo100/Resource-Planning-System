"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import { Paperclip, Plus, Minus, X, AlertCircle, Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";
import { useTeamItems } from "@/hooks/useTeamItems";
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
import { PackageApi } from "@/types/package";
import { authStore } from "@/store/authStore";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { useItems } from "@/hooks/useItems";
import { Item } from "@/types/item";

const OrderRequestForm: React.FC<OrderRequestFormProps> = ({
  isPackageOrder = false,
  title = "발주 요청",
  warehousesList: propWarehousesList,
  warehouseItems: propWarehouseItems,
  onWarehouseChange,
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [setupDate, setSetupDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const selectedFiles = useRef<HTMLInputElement>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const auth = authStore((state) => state.user);

  // 아이템 관련 상태
  const [orderItems, setOrderItems] = useState<
    (OrderItemWithDetails & { warehouseItemId: number })[]
  >([]);

  const [formData, setFormData] = useState<OrderRequestFormData>({
    manager: "",
    requester: "",
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

  // 훅 호출
  const { useGetPackages } = usePackages();
  const { packages } = useGetPackages();
  const { useCreateOrder } = useOrder();
  const {
    mutate: createOrder,
    // data: createOrderResponse
  } = useCreateOrder();
  const { useGetTeamItems } = useTeamItems();
  const { data: teamItems } = useGetTeamItems();
  const { useGetSuppliers } = useSuppliers();
  const { suppliers: suppliersResponse } = useGetSuppliers();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // 창고 관련 상태와 훅 - props가 없을 경우에만 사용
  const { warehouses } = useWarehouseItems();
  const [warehousesList, setWarehousesList] = useState<Warehouse[]>([]);

  // 창고별 아이템 재고 조회 - props가 없을 경우에만 사용
  const { useGetItemsByWarehouse } = useItems();
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

  // 공급업체 목록 설정
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
        (stockItem) => stockItem.itemCode === item.teamItem.itemCode
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
      (item, index) => item !== orderItems[index]
    );

    if (hasChanges) {
      setTimeout(() => {
        setOrderItems(updatedItems);
      }, 0);
    }
  }, [currentWarehouseItems, formData.warehouseId, orderItems]);

  // 파일 선택 핸들러
  const handleFileSelection = () => {
    if (selectedFiles.current && selectedFiles.current.files) {
      const fileList = Array.from(selectedFiles.current.files);
      setFiles(fileList);
    }
  };

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

  // 패키지 선택 핸들러
  const handlePackageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const packageId = parseInt(e.target.value);
    if (packageId === 0) {
      setTimeout(() => {
        setOrderItems([]);
      }, 0);
      return;
    }

    const selectedPackage = packages?.find(
      (pkg: PackageApi) => pkg.id === packageId
    );
    if (!selectedPackage) return;

    // 패키지의 아이템 목록을 파싱
    const itemCodes = selectedPackage.itemlist.split(", ");

    // 각 아이템 코드에 대해 teamItems에서 해당 아이템을 찾아 orderItems에 추가
    const newItems = itemCodes
      .map((itemCode) => {
        const teamItem = teamItems?.find((item) => item.itemCode === itemCode);
        if (!teamItem) return null;

        // 현재 창고에 있는 아이템 중 일치하는 코드 찾기
        const stockItem =
          warehouseItemsData && formData.warehouseId
            ? (warehouseItemsData.data as Item[]).find(
                (stockItem) => stockItem.itemCode === itemCode
              )
            : null;

        return {
          teamItem,
          quantity: 1,
          stockAvailable: stockItem ? stockItem.itemQuantity >= 1 : false,
          stockQuantity: stockItem?.itemQuantity || 0,
          warehouseItemId: stockItem?.id || 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    setTimeout(() => {
      setOrderItems(newItems);
    }, 0);
  };

  // 아이템 선택 핸들러
  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = parseInt(e.target.value);
    if (itemId === 0) {
      return;
    }

    // 창고 아이템에서 선택된 아이템 찾기
    const selected = currentWarehouseItems.find((item) => item.id === itemId);
    if (!selected) {
      return;
    }

    // 이미 추가된 아이템인지 확인
    const isItemExists = orderItems.some(
      (item) => item.teamItem.itemCode === selected.itemCode
    );

    if (isItemExists) {
      toast.error("이미 추가된 아이템입니다");
      return;
    }

    // 팀 아이템 정보 찾기 (itemCode로 매칭)
    const teamItem =
      teamItems?.find((item) => item.itemCode === selected.itemCode) || null;
    if (!teamItem) {
      toast.error("팀 품목 정보를 찾을 수 없습니다");
      return;
    }

    // 아이템 추가 - 창고 아이템 ID도 함께 저장
    setTimeout(() => {
      setOrderItems((prev) => [
        ...prev,
        {
          teamItem,
          quantity: 1,
          stockAvailable: selected.itemQuantity >= 1,
          stockQuantity: selected.itemQuantity,
          warehouseItemId: selected.id, // 창고 아이템 ID 저장
        },
      ]);
    }, 0);

    // 선택 초기화
    e.target.value = "0";
  };

  // 아이템 제거 핸들러
  const handleRemoveItem = (itemId: number) => {
    setTimeout(() => {
      setOrderItems((prev) =>
        prev.filter((item) => item.warehouseItemId !== itemId)
      );
    }, 0);
  };

  // 아이템 수량 변경 핸들러
  const handleQuantityChange = (index: number, increment: boolean) => {
    setTimeout(() => {
      setOrderItems((prev) => {
        const updated = prev.map((item, idx) => {
          if (idx === index) {
            const newQuantity = increment
              ? item.quantity + 1
              : item.quantity > 0
              ? item.quantity - 1
              : item.quantity;

            return {
              ...item,
              quantity: newQuantity,
              stockAvailable:
                item.stockQuantity !== undefined
                  ? item.stockQuantity >= newQuantity
                  : false,
            };
          }
          return item;
        });
        return updated;
      });
    }, 0);
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

  const handleAddressChange = (data: Address) => {
    setFormData({ ...formData, address: data.address });
    setIsAddressOpen(false);
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
    setFormData({
      ...formData,
      warehouseId: warehouseId === 0 ? null : warehouseId,
    });

    // 창고가 변경되면 선택된 아이템을 완전히 초기화
    setTimeout(() => {
      setOrderItems([]);
    }, 0);

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
    if (!formData.address) {
      toast.error("배송지를 입력해주세요");
      return false;
    }
    if (!formData.requestDate) {
      toast.error("배송일을 선택해주세요");
      return false;
    }
    if (!formData.warehouseId) {
      toast.error("출고할 창고를 선택해주세요");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
        orderItems: orderItems.map((item) => ({
          itemId: item.warehouseItemId, // 창고 아이템 ID 사용
          quantity: item.quantity,
          memo: formData.notes,
        })),
      };
      console.log(orderData);

      createOrder(orderData, {
        onSuccess: (response) => {
          if (response.success && response.data) {
            // 파일이 첨부된 경우 추가 처리
            if (files.length > 0) {
              // TODO: 파일 업로드 처리
              console.log("파일 업로드 필요:", files);

              // 여기에 파일 업로드 로직 추가
            }

            toast.success("발주 요청이 완료되었습니다");

            // 2초 후 orderRecord 페이지로 이동
            setTimeout(() => {
              router.push("/orderRecord");
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* 창고 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            출고 창고 선택 <span className="text-red-500">*</span>
          </label>
          <select
            name="warehouseId"
            onChange={handleWarehouseChange}
            value={formData.warehouseId || 0}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="0">창고 선택</option>
            {effectiveWarehousesList.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouseName}
              </option>
            ))}
          </select>
        </div>

        {/* 패키지 선택 (패키지 출고 요청인 경우에만 표시) */}
        {isPackageOrder && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              패키지 선택
            </label>
            <select
              name="package"
              onChange={handlePackageSelect}
              className="w-full px-3 py-2 border rounded-md"
              required={isPackageOrder}
            >
              <option value="0">패키지 선택</option>
              {packages?.map((pkg: PackageApi) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.packageName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 개별품목 선택 (개별품목 출고 요청인 경우에만 표시) */}
        {!isPackageOrder && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              품목 선택
            </label>
            <select
              name="item"
              onChange={handleItemSelect}
              className="w-full px-3 py-2 border rounded-md"
              required={!isPackageOrder}
              disabled={!formData.warehouseId}
            >
              <option value="0">품목 선택</option>
              {currentWarehouseItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemName} ({item.itemCode}) - 재고: {item.itemQuantity}
                  개
                </option>
              ))}
            </select>
            {!formData.warehouseId && (
              <p className="text-xs text-amber-600">
                창고를 먼저 선택해주세요.
              </p>
            )}
          </div>
        )}

        {orderItems.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">선택된 품목</h3>
            <div className="border rounded-md p-3">
              {orderItems.map((item, index) => (
                <div
                  key={item.warehouseItemId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.teamItem.itemName}</p>
                      {formData.warehouseId &&
                        item.stockAvailable === false && (
                          <div className="flex items-center text-red-500 text-xs">
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, false)}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(index, true)}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.warehouseItemId)}
                      className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <label htmlFor="notes" className="block text-sm font-medium">
          기타 요청 사항
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <label htmlFor="requester" className="block text-sm font-medium">
          요청자
        </label>
        <input
          type="text"
          id="requester"
          name="requester"
          value={formData.requester}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />

        <label htmlFor="manager" className="block text-sm font-medium">
          담당자
        </label>
        <input
          type="text"
          id="manager"
          name="manager"
          value={formData.manager}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />

        <label htmlFor="requestDate" className="block text-sm font-medium">
          출고 요청일
        </label>
        <input
          type="date"
          id="requestDate"
          name="requestDate"
          data-placeholder="날짜 선택"
          value={requestDate}
          onChange={(e) => handleDateChange(e, "requestDate")}
          className="p-2 border rounded"
          required
        />

        <label htmlFor="setupDate" className="block text-sm font-medium">
          설치 기한
        </label>
        <input
          type="date"
          id="setupDate"
          name="setupDate"
          data-placeholder="날짜 선택"
          value={setupDate}
          onChange={(e) => handleDateChange(e, "setupDate")}
          className="p-2 border rounded"
          required
        />
        {/* 공급업체 선택 */}
        <div className="space-y-2">
          <label className="flex gap-3 flex-row text-sm font-medium text-gray-700">
            공급업체 선택
            <p className="text-xs text-red-500">*업체 공급시에만</p>
          </label>
          <select
            name="supplier"
            onChange={handleSupplierChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="0">공급업체 선택</option>
            {Array.isArray(suppliers) && suppliers?.length > 0 ? (
              suppliers.map((supplier: Supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierName}
                </option>
              ))
            ) : (
              <option value="" disabled>
                공급업체 목록을 불러올 수 없습니다
              </option>
            )}
          </select>
        </div>
        <label htmlFor="receiver" className="block text-sm font-medium">
          수령인
        </label>
        <input
          type="text"
          id="receiver"
          name="receiver"
          value={formData.receiver}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />

        <label htmlFor="phone" className="block text-sm font-medium">
          수령인 연락처
        </label>
        <input
          type="tel"
          id="phone"
          name="receiverPhone"
          value={formData.receiverPhone}
          onChange={handleChange}
          placeholder="xxx-xxxx-xxxx"
          className="p-2 border rounded"
          required
        />

        <label htmlFor="address" className="block text-sm font-medium">
          수령지 주소
        </label>
        <div className="flex flex-row">
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="주소를 입력하세요"
            required
          />
          <button
            type="button"
            className="ml-3 p-2 border rounded text-black hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={() => setIsAddressOpen(!isAddressOpen)}
          >
            주소 검색
          </button>
        </div>
        {isAddressOpen && (
          <SearchAddressModal onCompletePost={handleAddressChange} />
        )}

        <input
          type="text"
          id="detailAddress"
          name="detailAddress"
          value={formData.detailAddress}
          onChange={handleChange}
          className="p-2 border rounded"
          placeholder="상세 주소"
        />

        <label htmlFor="file-upload">파일 업로드</label>
        <div
          onClick={() => selectedFiles.current?.click()}
          className="flex flex-row items-center gap-2 p-2 border rounded hover:bg-blue-100"
        >
          <Paperclip className="w-4 h-4" />
          파일 업로드
          <p className="text-xs text-red-600">
            *현재는 하나의 파일만 올라갑니다.
          </p>
        </div>
        <input
          ref={selectedFiles}
          type={"file"}
          hidden
          multiple={true}
          onChange={handleFileSelection}
        />
        <div className="border p-2 rounded-md">
          <div className="mb-2">업로드된 파일</div>
          <ul className="p-2 border rounded text-black ">
            {files.length == 0 ? (
              <div className="text-gray-400 text-sm">
                업로드 항목이 없습니다.
              </div>
            ) : null}
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-500 text-white py-2 px-4 rounded mt-4 flex items-center justify-center ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              처리 중...
            </>
          ) : (
            "발주 요청하기"
          )}
        </button>
      </form>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
    </div>
  );
};

export default OrderRequestForm;
