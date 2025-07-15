"use client";

/**
 * 시연 요청 폼 컴포넌트
 *
 * ⚠️ API 통신 미개발 상태
 * 현재 이 컴포넌트는 데모용으로만 동작하며, 실제 API 연동이 필요합니다.
 *
 * TODO: 다음 기능들의 API 연동이 필요합니다:
 * - 시연 요청 데이터 전송
 * - 파일 업로드 처리
 * - 서버 응답 처리
 * - 에러 핸들링
 */

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import { Paperclip, Plus, Minus, X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  OrderItemWithDetails,
  OrderRequestFormData,
  OrderRequestFormProps,
} from "@/types/(order)/orderRequestFormData";
import { usePackages } from "@/hooks/usePackages";
import { authStore } from "@/store/authStore";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { Item } from "@/types/(item)/item";
import {
  hasWarehouseAccess,
  getWarehouseAccessDeniedMessage,
} from "@/utils/warehousePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import React from "react";

const DemonstrationRequestForm: React.FC<OrderRequestFormProps> = ({
  isPackageOrder = false,
  title = "시연 요청",
  warehousesList: propWarehousesList,
  warehouseItems: propWarehouseItems,
  onWarehouseChange,
}) => {
  // ⚠️ API 미개발 상태 알림
  console.warn(
    "DemonstrationRequestForm: API 통신이 미개발 상태입니다. 데모용으로만 동작합니다."
  );
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const selectedFiles = useRef<HTMLInputElement>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const auth = authStore((state) => state.user);
  const { user } = useCurrentUser();

  // 아이템 관련 상태
  const [orderItems, setOrderItems] = useState<
    (OrderItemWithDetails & { warehouseItemId: number; id: number })[]
  >([]);

  const [formData, setFormData] = useState<OrderRequestFormData>({
    manager: "",
    requester: user?.name || auth?.name || "",
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

  // 사용자 정보가 로드되면 자동으로 요청자 정보 설정
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        requester: user.name,
      }));
    }
  }, [user]);

  // 훅 호출
  const { useGetPackages } = usePackages();
  const { packages } = useGetPackages();

  // 창고 관련 상태와 훅 - props가 없을 경우에만 사용
  const { warehouses } = useWarehouseItems();
  const [warehousesList, setWarehousesList] = useState<Warehouse[]>([]);

  // 창고별 아이템 재고 조회 - props가 없을 경우에만 사용
  const { useGetItemsByWarehouse } = useItemStockManagement();
  const warehouseId = formData.warehouseId?.toString() || "";
  const { data: warehouseItemsData } = useGetItemsByWarehouse(
    warehouseId || undefined
  );

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

  // 파일 선택 핸들러
  const handleFileSelection = () => {
    selectedFiles.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 개별 아이템 선택 핸들러
  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = parseInt(e.target.value);
    if (itemId) {
      const selectedItem = currentWarehouseItems.find(
        (item) => item.id === itemId
      );
      if (selectedItem) {
        // 이미 추가된 아이템인지 확인
        const existingItem = orderItems.find(
          (item) => item.teamItem.itemCode === selectedItem.teamItem.itemCode
        );

        if (!existingItem) {
          // 새 아이템 추가
          const newItem: OrderItemWithDetails & {
            warehouseItemId: number;
            id: number;
          } = {
            id: Date.now(),
            teamItem: {
              id: selectedItem.teamItem.id,
              itemCode: selectedItem.teamItem.itemCode,
              itemName: selectedItem.teamItem.itemName,
              categoryId: selectedItem.teamItem.categoryId,
              category: selectedItem.teamItem.category,
              teamId: selectedItem.teamItem.teamId,
              memo: selectedItem.teamItem.memo || "",
            },
            quantity: 1,
            stockAvailable: selectedItem.itemQuantity >= 1,
            stockQuantity: selectedItem.itemQuantity,
            warehouseItemId: selectedItem.id,
          };
          setOrderItems((prev) => [...prev, newItem]);
        }
      }
    }
  };

  // 아이템 제거 핸들러
  const handleRemoveItem = (itemId: number) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // 수량 변경 핸들러
  const handleQuantityChange = (index: number, increment: boolean) => {
    const updatedItems = [...orderItems];
    const currentQuantity = updatedItems[index].quantity;

    if (increment) {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: currentQuantity + 1,
      };
    } else if (currentQuantity > 1) {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: currentQuantity - 1,
      };
    } else {
      // 수량이 1일 때 감소시키면 아이템 제거
      setOrderItems(updatedItems.filter((_, i) => i !== index));
      return;
    }

    setOrderItems(updatedItems);
  };

  // 폼 입력 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 주소 변경 핸들러
  const handleAddressChange = (data: Address) => {
    setFormData((prev) => ({
      ...prev,
      address: data.address,
    }));
    setIsAddressOpen(false);
  };

  // 날짜 변경 핸들러
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "requestDate" | "setupDate"
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // 창고 변경 핸들러
  const handleWarehouseChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const warehouseId = parseInt(e.target.value);

    // 권한 확인
    if (user && !hasWarehouseAccess(user, warehouseId)) {
      const warehouseName =
        effectiveWarehousesList.find((w) => w.id === warehouseId)
          ?.warehouseName || "선택된 창고";
      toast.error(getWarehouseAccessDeniedMessage(warehouseName));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      warehouseId: warehouseId || null,
    }));

    // props로 전달된 핸들러가 있으면 호출
    if (onWarehouseChange) {
      onWarehouseChange(warehouseId);
    }

    // 창고가 변경되면 아이템 목록 초기화
    setOrderItems([]);
  };

  // 폼 검증
  const validateForm = (): boolean => {
    if (!formData.requester.trim()) {
      toast.error("요청자 정보가 없습니다.");
      return false;
    }
    if (!formData.receiver.trim()) {
      toast.error("수령자를 입력해주세요.");
      return false;
    }
    if (!formData.receiverPhone.trim()) {
      toast.error("수령자 연락처를 입력해주세요.");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("주소를 입력해주세요.");
      return false;
    }
    if (!formData.requestDate) {
      toast.error("요청일을 입력해주세요.");
      return false;
    }
    if (!formData.warehouseId) {
      toast.error("창고를 선택해주세요.");
      return false;
    }
    if (orderItems.length === 0) {
      toast.error("시연품을 선택해주세요.");
      return false;
    }

    return true;
  };

  // 폼 제출 핸들러
  // TODO: API 통신 미개발 상태 - 실제 API 연동 필요
  // 현재는 데모용으로 성공 메시지만 표시하고 폼을 초기화합니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: API 통신 미개발 상태
      // 실제 구현 시에는 다음과 같은 API 호출이 필요합니다:
      // - 시연 요청 데이터를 서버로 전송
      // - 파일 업로드 처리
      // - 서버 응답에 따른 적절한 처리

      // 임시로 성공 메시지만 표시 (API 미개발 상태)
      toast.success("시연 요청이 완료되었습니다! (API 미개발 상태 - 데모용)");

      // 폼 초기화
      setFormData({
        manager: "",
        requester: user?.name || auth?.name || "",
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
      setOrderItems([]);
      setFiles([]);

      // 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("시연 요청 중 오류 발생:", error);
      toast.error("시연 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <React.Fragment>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 섹션 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                수령자
              </label>
              <input
                type="text"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                수령자 연락처
              </label>
              <input
                type="tel"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                창고 선택
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId || ""}
                onChange={handleWarehouseChange}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">창고를 선택하세요</option>
                {effectiveWarehousesList.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 주소 섹션 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              배송 주소
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="주소를 입력하세요"
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                readOnly
              />
              <button
                type="button"
                onClick={() => setIsAddressOpen(true)}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                주소 검색
              </button>
            </div>
            <input
              type="text"
              name="detailAddress"
              value={formData.detailAddress}
              onChange={handleChange}
              placeholder="상세주소를 입력하세요"
              className="px-3 py-2 mt-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 날짜 섹션 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                요청일
              </label>
              <input
                type="date"
                value={formData.requestDate}
                onChange={(e) => handleDateChange(e, "requestDate")}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                설치일
              </label>
              <input
                type="date"
                value={formData.setupDate}
                onChange={(e) => handleDateChange(e, "setupDate")}
                className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 시연품 선택 섹션 */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              시연품 선택
            </h2>

            {isPackageOrder ? (
              // 패키지 시연품 선택
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    패키지 선택
                  </label>
                  <select
                    value={formData.supplierId || ""}
                    onChange={handleItemSelect}
                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">패키지를 선택하세요</option>
                    {packages?.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.packageName} - {pkg.packageName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              // 개별 시연품 선택
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  시연품 선택
                </label>
                <select
                  onChange={handleItemSelect}
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">시연품을 선택하세요</option>
                  {currentWarehouseItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.teamItem.itemName} ({item.teamItem.itemCode}) -
                      재고: {item.itemQuantity}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 선택된 시연품 목록 */}
            {orderItems.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-medium text-gray-700 text-md">
                  선택된 시연품
                </h3>
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {item.teamItem.itemName}
                        </div>
                        <div className="text-sm text-gray-500">
                          코드: {item.teamItem.itemCode}
                        </div>
                        {item.teamItem.category && (
                          <div className="text-sm text-gray-400">
                            카테고리: {item.teamItem.category.name}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          재고: {item.stockQuantity}개
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, false)}
                          className="p-1 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(index, true)}
                          className="p-1 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-white bg-gray-500 rounded hover:bg-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {!item.stockAvailable && (
                        <div className="flex gap-1 items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          재고 부족
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 첨부파일 섹션 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              첨부파일
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleFileSelection}
                className="flex gap-2 items-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                <Paperclip className="w-4 h-4" />
                파일 선택
              </button>
              <input
                ref={selectedFiles}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              {files.length > 0 && (
                <div className="space-y-1">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 비고 섹션 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              비고
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="추가 요청사항이나 특이사항을 입력하세요"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex gap-2 items-center px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="⚠️ API 미개발 상태 - 데모용으로만 동작합니다"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "처리 중..." : "시연 요청 (API 미개발)"}
            </button>
          </div>
        </form>
      </div>

      {/* 주소 검색 모달 */}
      {isAddressOpen && (
        <SearchAddressModal
          onCompletePost={handleAddressChange}
          onClose={() => setIsAddressOpen(false)}
        />
      )}
    </React.Fragment>
  );
};

export default DemonstrationRequestForm;
