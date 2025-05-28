/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UpdateItemQuantityRequest } from "@/types/(item)/item";
import React, { useState, useEffect } from "react";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useItemStockManagement } from "@/hooks/useItemStockManagement";
import { CreateInventoryRecordDto } from "@/types/(inventoryRecord)/inventory-record";
import EditQuantityModal from "./modal/EditQuantityModal";
import InboundModal from "./modal/InboundModal";
import OutboundModal from "./modal/OutboundModal";
import { inventoryRecordService } from "@/services/inventoryRecordService";
import { useSuppliers } from "@/hooks/useSupplier";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import WarehouseCard from "./components/WarehouseCard";
import StockTableHeader from "./components/StockTableHeader";
import StockTableDesktop from "./components/StockTableDesktop";
import StockItemCard from "./components/StockItemCard";
import StockTableEmpty from "./components/StockTableEmpty";
import {
  useCreateInventoryRecord,
  useUploadInventoryRecordFile,
} from "@/hooks/useInventoryRecord";
import { useCategory } from "@/hooks/useCategory";
import { useQueryClient } from "@tanstack/react-query";
// import { authService } from "@/services/authService";

// 파일 타입 정의 추가
export interface AttachedFile {
  file: File;
  preview: string;
  name: string;
  type: string;
  size: number;
}

export interface StockTableFormValues {
  itemId?: number;
  warehouseId: number;
  inboundDate?: string;
  outboundDate?: string;
  inboundPlace?: string;
  inboundAddress?: string;
  inboundAddressDetail?: string;
  outboundPlace?: string;
  outboundAddress?: string;
  outboundAddressDetail?: string;
  inboundQuantity?: number;
  outboundQuantity?: number;
  remarks?: string;
  supplierId?: number;
  packageId?: number;
  userId?: number;
  name?: string;
  description?: string;
  attachedFiles?: File[];
  attachedFilesPreview?: AttachedFile[];
}

export default function StockTable() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const {
    items,
    warehouses,
    isLoading: isDataLoading,
    isError,
    invalidateInventory,
  } = useWarehouseItems();
  const { useUpdateItemQuantity } = useItemStockManagement();
  const updateQuantityMutation = useUpdateItemQuantity();
  const { createInventoryRecordAsync } = useCreateInventoryRecord();
  const { uploadFileAsync } = useUploadInventoryRecordFile();
  const { categories } = useCategory();
  const queryClient = useQueryClient();
  const [isEditQuantityModalOpen, setIsEditQuantityModalOpen] = useState(false);
  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [hideZeroStock, setHideZeroStock] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [selectedInboundItem, setSelectedInboundItem] = useState<any | null>(
    null
  );
  const [selectedOutboundItem, setSelectedOutboundItem] = useState<any | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const [quantityEditValues, setQuantityEditValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    currentQuantity: number;
    newQuantity: number;
    warehouseId: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    currentQuantity: 0,
    newQuantity: 0,
    warehouseId: 0,
  });

  const [inboundValues, setInboundValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    quantity: number;
    date: string;
    inboundPlace: string;
    inboundAddress: string;
    inboundAddressDetail: string;
    remarks: string;
    warehouseId: number;
    attachedFiles: AttachedFile[];
    supplierId?: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    inboundPlace: "",
    inboundAddress: "",
    inboundAddressDetail: "",
    remarks: "",
    warehouseId: 0,
    attachedFiles: [],
  });

  const [outboundValues, setOutboundValues] = useState<{
    itemId: number | null;
    itemCode: string;
    itemName: string;
    currentQuantity: number;
    quantity: number;
    date: string;
    outboundPlace: string;
    outboundAddress: string;
    outboundAddressDetail: string;
    remarks: string;
    warehouseId: number;
    attachedFiles: AttachedFile[];
    supplierId?: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    currentQuantity: 0,
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    outboundPlace: "",
    outboundAddress: "",
    outboundAddressDetail: "",
    remarks: "",
    warehouseId: 0,
    attachedFiles: [],
  });

  const { useGetSuppliers } = useSuppliers();
  const { suppliers: suppliersResponse } = useGetSuppliers();
  const [suppliersList, setSuppliersList] = useState<
    {
      id: number;
      supplierName: string;
      supplierAddress: string;
    }[]
  >([]);

  useEffect(() => {
    if (suppliersResponse) {
      if (
        typeof suppliersResponse === "object" &&
        "data" in suppliersResponse
      ) {
        setSuppliersList(
          suppliersResponse.data as {
            id: number;
            supplierName: string;
            supplierAddress: string;
          }[]
        );
      } else {
        setSuppliersList(
          suppliersResponse as {
            id: number;
            supplierName: string;
            supplierAddress: string;
          }[]
        );
      }
    }
  }, [suppliersResponse]);

  // 페이지 로드 시 첫 번째 창고 자동 선택
  useEffect(() => {
    if (
      !isDataLoading &&
      warehouses &&
      warehouses.length > 0 &&
      selectedWarehouseId === null
    ) {
      const firstWarehouseId = Number(warehouses[0].id);
      setSelectedWarehouseId(firstWarehouseId);
    }
  }, [isDataLoading, warehouses, selectedWarehouseId]);

  // 재고 데이터 자동 갱신을 위한 설정 (통합된 구독)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // 디바운싱 적용 (500ms로 증가)
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const warehouseItemsData = queryClient.getQueryData(["warehouseItems"]);
        const ordersData = queryClient.getQueryData(["orders"]);

        if (warehouseItemsData || ordersData) {
          // 불필요한 refetch 제거
          invalidateInventory();
        }
      }, 500);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [queryClient, invalidateInventory]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleOpenEditQuantityModal = (item: any) => {
    // moderator는 재고 수량을 직접 수정할 수 없도록 처리
    if (user?.accessLevel !== "admin") {
      return;
    }

    setQuantityEditValues({
      itemId: item.id,
      itemCode: item.teamItem?.itemCode || "",
      itemName: item.teamItem?.itemName || "",
      currentQuantity: item.itemQuantity,
      newQuantity: item.itemQuantity,
      warehouseId: item.warehouseId,
    });
    setIsEditQuantityModalOpen(true);
  };

  const handleCloseEditQuantityModal = () => {
    setIsEditQuantityModalOpen(false);
  };

  const handleOpenInboundModal = (warehouseId: number) => {
    setInboundValues({
      ...inboundValues,
      warehouseId,
      itemId: null,
      itemCode: "",
      itemName: "",
    });
    setSelectedWarehouseId(warehouseId);
    setSelectedInboundItem(null);
    setIsInboundModalOpen(true);
  };

  const handleCloseInboundModal = () => {
    setIsInboundModalOpen(false);
    setSelectedInboundItem(null);
  };

  const handleOpenOutboundModal = (warehouseId: number) => {
    setOutboundValues({
      ...outboundValues,
      warehouseId,
      itemId: null,
      itemCode: "",
      itemName: "",
      currentQuantity: 0,
    });
    setSelectedWarehouseId(warehouseId);
    setSelectedOutboundItem(null);
    setIsOutboundModalOpen(true);
  };

  const handleCloseOutboundModal = () => {
    setIsOutboundModalOpen(false);
    setSelectedOutboundItem(null);
  };

  const handleQuantityEditFormChange = (
    field: string,
    value: string | number
  ) => {
    setQuantityEditValues({
      ...quantityEditValues,
      [field]: value,
    });
  };

  const handleInboundFormChange = (
    field: string,
    value: string | number | null | AttachedFile[] | undefined
  ) => {
    if (field === "itemId") {
      const selectedItem = items.find((item) => item.id === value);
      setSelectedInboundItem(selectedItem || null);

      if (selectedItem) {
        setInboundValues({
          ...inboundValues,
          itemId: selectedItem.id,
          itemCode: selectedItem.itemCode || "",
          itemName: selectedItem.itemName || "",
        });
      } else {
        setInboundValues({
          ...inboundValues,
          itemId: null,
          itemCode: "",
          itemName: "",
        });
      }
    } else if (field === "supplierId") {
      const selectedSupplier = suppliersList?.find(
        (supplier) => supplier.id === value
      );
      setInboundValues({
        ...inboundValues,
        supplierId: value as number | undefined,
        inboundPlace: selectedSupplier?.supplierName || "",
        inboundAddress: selectedSupplier?.supplierAddress || "",
      });
    } else {
      setInboundValues({
        ...inboundValues,
        [field]: value,
      });
    }
  };

  const handleOutboundFormChange = (
    field: string,
    value: string | number | null | AttachedFile[] | undefined
  ) => {
    if (field === "itemId") {
      const selectedItem = items.find((item) => item.id === value);
      setSelectedOutboundItem(selectedItem || null);

      if (selectedItem) {
        setOutboundValues({
          ...outboundValues,
          itemId: selectedItem.id,
          itemCode: selectedItem.itemCode || "",
          itemName: selectedItem.itemName || "",
          currentQuantity: selectedItem.itemQuantity,
        });
      } else {
        setOutboundValues({
          ...outboundValues,
          itemId: null,
          itemCode: "",
          itemName: "",
          currentQuantity: 0,
        });
      }
    } else if (field === "supplierId") {
      const selectedSupplier = suppliersList?.find(
        (supplier) => supplier.id === value
      );
      setOutboundValues({
        ...outboundValues,
        supplierId: value as number | undefined,
        outboundPlace: selectedSupplier?.supplierName || "",
        outboundAddress: selectedSupplier?.supplierAddress || "",
      });
    } else {
      setOutboundValues({
        ...outboundValues,
        [field]: value,
      });
    }
  };

  // 파일 업로드 처리 함수 (입고)
  const handleInboundFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => {
      // 파일 미리보기 URL 생성
      const preview = URL.createObjectURL(file);

      return {
        file,
        preview,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    });

    setInboundValues({
      ...inboundValues,
      attachedFiles: [...inboundValues.attachedFiles, ...newFiles],
    });
  };

  // 파일 업로드 처리 함수 (발주)
  const handleOutboundFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => {
      // 파일 미리보기 URL 생성
      const preview = URL.createObjectURL(file);

      return {
        file,
        preview,
        name: file.name,
        type: file.type,
        size: file.size,
      };
    });

    setOutboundValues({
      ...outboundValues,
      attachedFiles: [...outboundValues.attachedFiles, ...newFiles],
    });
  };

  // 파일 삭제 처리 함수 (입고)
  const handleInboundFileDelete = (index: number) => {
    const updatedFiles = [...inboundValues.attachedFiles];

    // 미리보기 URL 해제
    URL.revokeObjectURL(updatedFiles[index].preview);

    // 파일 배열에서 제거
    updatedFiles.splice(index, 1);

    setInboundValues({
      ...inboundValues,
      attachedFiles: updatedFiles,
    });
  };

  // 파일 삭제 처리 함수 (발주)
  const handleOutboundFileDelete = (index: number) => {
    const updatedFiles = [...outboundValues.attachedFiles];

    // 미리보기 URL 해제
    URL.revokeObjectURL(updatedFiles[index].preview);

    // 파일 배열에서 제거
    updatedFiles.splice(index, 1);

    setOutboundValues({
      ...outboundValues,
      attachedFiles: updatedFiles,
    });
  };

  const handleUpdateQuantity = () => {
    if (!quantityEditValues.itemId) return;

    try {
      const data: UpdateItemQuantityRequest = {
        quantity: quantityEditValues.newQuantity,
      };

      updateQuantityMutation.mutate(
        {
          id: quantityEditValues.itemId.toString(),
          data,
          itemWarehouseId: quantityEditValues.warehouseId.toString(),
        },
        {
          onSuccess: async (response) => {
            if (response.success) {
              // 재고 기록 생성
              const currentQuantity = quantityEditValues.currentQuantity;
              const newQuantity = quantityEditValues.newQuantity;

              const recordData: CreateInventoryRecordDto = {
                itemId: quantityEditValues.itemId!,
                inboundQuantity:
                  newQuantity > currentQuantity
                    ? newQuantity - currentQuantity
                    : undefined,
                outboundQuantity:
                  newQuantity < currentQuantity
                    ? currentQuantity - newQuantity
                    : undefined,
                inboundDate:
                  newQuantity > currentQuantity
                    ? new Date().toISOString()
                    : undefined,
                outboundDate:
                  newQuantity < currentQuantity
                    ? new Date().toISOString()
                    : undefined,
                remarks: "",
              };

              // 재고 기록 저장 및 캐시 업데이트
              await inventoryRecordService.createInventoryRecord(recordData);
              await invalidateInventory();

              alert("재고 수량이 성공적으로 업데이트되었습니다.");
              handleCloseEditQuantityModal();
            } else {
              alert(
                `오류 발생: ${
                  response.message || "알 수 없는 오류가 발생했습니다."
                }`
              );
            }
          },
          onError: (error) => {
            console.error("수량 업데이트 중 오류 발생:", error);
            alert("수량 업데이트 중 오류가 발생했습니다.");
          },
        }
      );
    } catch (error) {
      console.error("수량 업데이트 중 오류 발생:", error);
      alert("수량 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitInbound = async () => {
    if (!inboundValues.itemId) return;

    try {
      // 입고 기록 데이터 준비
      const recordData: CreateInventoryRecordDto = {
        itemId: inboundValues.itemId!,
        inboundQuantity: inboundValues.quantity,
        inboundDate: new Date(inboundValues.date).toISOString(),
        inboundLocation: [
          inboundValues.inboundPlace,
          inboundValues.inboundAddress,
          inboundValues.inboundAddressDetail,
        ]
          .filter(Boolean)
          .join(" "),
        remarks: inboundValues.remarks,
        supplierId: inboundValues.supplierId,
        warehouseId: inboundValues.warehouseId,
        userId: user?.id,
      };

      try {
        const recordId = await createInventoryRecordAsync(recordData);
        console.log("입고 기록 생성 성공, recordId:", recordId);

        // 파일 업로드와 캐시 업데이트를 병렬로 처리
        const uploadPromises = inboundValues.attachedFiles.map(async (file) => {
          if (recordId) {
            try {
              return await uploadFileAsync({
                recordId,
                file: file.file,
              });
            } catch (error) {
              console.error("파일 업로드 실패:", error);
              return null;
            }
          }
          return null;
        });

        await Promise.all([...uploadPromises, invalidateInventory()]);

        alert("입고가 성공적으로 처리되었습니다.");

        // 입고 모달 데이터 초기화
        setInboundValues({
          itemId: null,
          itemCode: "",
          itemName: "",
          quantity: 1,
          date: new Date().toISOString().split("T")[0],
          inboundPlace: "",
          inboundAddress: "",
          inboundAddressDetail: "",
          remarks: "",
          warehouseId: inboundValues.warehouseId,
          attachedFiles: [],
          supplierId: undefined,
        });

        handleCloseInboundModal();
      } catch (error: any) {
        console.error("입고 기록 생성 실패:", error);
        alert(error.error || "입고 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("입고 처리 중 오류 발생:", error);
      alert("입고 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSubmitOutbound = async () => {
    if (!outboundValues.itemId) return;

    try {
      const currentQuantity =
        getItemById(outboundValues.itemId)?.itemQuantity || 0;

      if (outboundValues.quantity > currentQuantity) {
        alert("발주 수량이 현재 재고보다 많습니다.");
        return;
      }

      // 발주 기록 데이터 준비
      const recordData: CreateInventoryRecordDto = {
        itemId: outboundValues.itemId!,
        outboundQuantity: outboundValues.quantity,
        outboundDate: new Date(outboundValues.date).toISOString(),
        outboundLocation: [
          outboundValues.outboundPlace,
          outboundValues.outboundAddress,
          outboundValues.outboundAddressDetail,
        ]
          .filter(Boolean)
          .join(" "),
        remarks: outboundValues.remarks,
        warehouseId: outboundValues.warehouseId,
        userId: user?.id,
        supplierId: outboundValues.supplierId,
      };

      try {
        const recordId = await createInventoryRecordAsync(recordData);
        console.log("발주 기록 생성 성공, recordId:", recordId);

        // 파일 업로드와 캐시 업데이트를 병렬로 처리
        const uploadPromises = outboundValues.attachedFiles.map(
          async (file) => {
            if (recordId) {
              try {
                return await uploadFileAsync({
                  recordId,
                  file: file.file,
                });
              } catch (error) {
                console.error("파일 업로드 실패:", error);
                return null;
              }
            }
            return null;
          }
        );

        await Promise.all([...uploadPromises, invalidateInventory()]);

        alert("발주가 성공적으로 처리되었습니다.");
        handleCloseOutboundModal();
      } catch (error: any) {
        console.error("발주 기록 생성 실패:", error);
        alert(error.error || "발주 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("발주 처리 중 오류 발생:", error);
      alert("발주 처리 중 오류가 발생했습니다.");
    }
  };

  // 창고별로 아이템 필터링
  const getWarehouseItems = (warehouseId: number) => {
    // API 응답에서 아이템에 warehouseId가 없는 경우를 처리
    // 창고 ID가 일치하는 아이템만 필터링하거나,
    // warehouseId가 없는 경우 창고 자체의 items 배열을 사용
    const warehouseData = warehouses.find((w) => Number(w.id) === warehouseId);

    if (warehouseData && warehouseData.items) {
      return warehouseData.items;
    }

    // 기존 방식으로 필터링 시도 (items에 warehouseId가 있는 경우)
    return items.filter((item) => item.warehouseId === warehouseId);
  };

  // 아이템 ID로 아이템 찾기
  const getItemById = (itemId: number) => {
    return items.find((item) => item.id === itemId);
  };

  // 검색 기능
  const getFilteredItems = (warehouseItems: any[]) => {
    return warehouseItems.filter((item) => {
      // 검색 대상 필드들
      const itemCode = item.teamItem?.itemCode || "";
      const itemName = item.teamItem?.itemName || "";
      const memo = item.teamItem?.memo || "";
      const categoryName = item.teamItem?.category?.name || "";

      // 검색어를 소문자로 변환
      const searchLower = searchText.toLowerCase();

      // 각 필드에서 검색어 포함 여부 확인
      const matchesSearch =
        itemCode.toLowerCase().includes(searchLower) ||
        itemName.toLowerCase().includes(searchLower) ||
        memo.toLowerCase().includes(searchLower) ||
        categoryName.toLowerCase().includes(searchLower);

      // 재고가 0인 품목 필터링
      const passesZeroFilter = hideZeroStock ? item.itemQuantity > 0 : true;

      return matchesSearch && passesZeroFilter;
    });
  };

  // 창고 선택 핸들러
  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
  };

  // 입고 모달에서 카테고리 선택 핸들러
  const handleInboundCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setInboundValues({
      ...inboundValues,
      itemId: null,
      itemCode: "",
      itemName: "",
    });
    setSelectedInboundItem(null);
  };

  // 발주 모달에서 카테고리 선택 핸들러
  const handleOutboundCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setOutboundValues({
      ...outboundValues,
      itemId: null,
      itemCode: "",
      itemName: "",
      currentQuantity: 0,
    });
    setSelectedOutboundItem(null);
  };

  if (isUserLoading || isDataLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );

  if (!user || user.accessLevel === "supplier")
    return (
      <StockTableEmpty
        message="열람 권한이 없습니다"
        subMessage="해당 페이지에 접근할 수 있는 권한이 없습니다."
      />
    );

  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <>
      <div key="warehouse-container" className="overflow-x-auto relative">
        {/* 창고 선택 카드 목록 */}
        <div className="mb-6 px-4">
          <h2 className="text-xl font-bold mb-4">창고 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {warehouses.map((warehouse) => (
              <WarehouseCard
                key={`warehouse-card-${warehouse.id}`}
                warehouse={warehouse}
                isSelected={selectedWarehouseId === Number(warehouse.id)}
                itemCount={getWarehouseItems(Number(warehouse.id)).length}
                onClick={handleWarehouseSelect}
              />
            ))}
          </div>
        </div>

        {selectedWarehouseId && (
          <>
            <StockTableHeader
              searchText={searchText}
              onSearch={handleSearch}
              hideZeroStock={hideZeroStock}
              onHideZeroStockChange={setHideZeroStock}
              warehouseName={
                warehouses.find((w) => Number(w.id) === selectedWarehouseId)
                  ?.warehouseName || `창고 ${selectedWarehouseId}`
              }
              onInboundClick={() => handleOpenInboundModal(selectedWarehouseId)}
              onOutboundClick={() =>
                handleOpenOutboundModal(selectedWarehouseId)
              }
              showButtons={user?.accessLevel !== "user"}
            />

            {/* 창고 주소 표시 */}
            <div className="mb-4 px-4">
              <p className="text-sm text-gray-500">
                {warehouses.find((w) => Number(w.id) === selectedWarehouseId)
                  ?.warehouseAddress || "주소 정보가 없습니다."}
              </p>
            </div>

            {/* 선택된 창고의 재고 테이블 */}
            <div className="hidden md:block">
              <div className="mx-3 my-2 bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <tbody>
                    <StockTableDesktop
                      items={getFilteredItems(
                        getWarehouseItems(selectedWarehouseId)
                      )}
                      onEditQuantity={handleOpenEditQuantityModal}
                      showEditButton={user?.accessLevel === "admin"}
                    />
                  </tbody>
                </table>
              </div>
            </div>

            {/* 모바일용 카드 뷰 */}
            <div className="md:hidden px-4">
              <StockItemCard
                items={getFilteredItems(getWarehouseItems(selectedWarehouseId))}
                onEditQuantity={handleOpenEditQuantityModal}
                showEditButton={user?.accessLevel === "admin"}
              />
            </div>
          </>
        )}

        {!selectedWarehouseId && warehouses.length > 0 && <StockTableEmpty />}

        <EditQuantityModal
          isOpen={isEditQuantityModalOpen}
          onClose={handleCloseEditQuantityModal}
          quantityEditValues={quantityEditValues}
          onFormChange={handleQuantityEditFormChange}
          onUpdateQuantity={handleUpdateQuantity}
        />
        <InboundModal
          isOpen={isInboundModalOpen}
          onClose={handleCloseInboundModal}
          inboundValues={inboundValues}
          onFormChange={handleInboundFormChange}
          onSubmitInbound={handleSubmitInbound}
          warehouseItems={getWarehouseItems(selectedWarehouseId || 0)}
          selectedItem={selectedInboundItem}
          onFileUpload={handleInboundFileUpload}
          onFileDelete={handleInboundFileDelete}
          suppliers={suppliersList}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleInboundCategoryChange}
        />
        <OutboundModal
          isOpen={isOutboundModalOpen}
          onClose={handleCloseOutboundModal}
          outboundValues={outboundValues}
          onFormChange={handleOutboundFormChange}
          onSubmitOutbound={handleSubmitOutbound}
          warehouseItems={getWarehouseItems(selectedWarehouseId || 0)}
          selectedItem={selectedOutboundItem}
          onFileUpload={handleOutboundFileUpload}
          onFileDelete={handleOutboundFileDelete}
          suppliers={suppliersList}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={handleOutboundCategoryChange}
        />
      </div>
    </>
  );
}
