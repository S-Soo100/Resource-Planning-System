"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useInventoryRecordsByTeamId } from "@/hooks/useInventoryRecordsByTeamId";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Plus, Minus } from "lucide-react";
import { filterRecordsByDateRange } from "@/utils/dateFilter";
import InventoryRecordDetail from "./InventoryRecordDetail";
import { Button } from "@/components/ui/button";
import { filterAccessibleWarehouses } from "@/utils/warehousePermissions";
import { CreateInventoryRecordDto } from "@/types/(inventoryRecord)/inventory-record";
import { AttachedFile } from "@/types/common";
import InboundModal from "../stock/modal/InboundModal";
import OutboundModal from "../stock/modal/OutboundModal";
import { useSuppliers } from "@/hooks/useSupplier";
import {
  useCreateInventoryRecord,
  useUploadInventoryRecordFile,
  useUpdateInventoryRecord,
} from "@/hooks/useInventoryRecord";
import { useCategory } from "@/hooks/useCategory";
import { useQueryClient } from "@tanstack/react-query";
import { getTodayString, formatDateToLocalString, formatDateForDisplayUTC } from "@/utils/dateUtils";
import { LoadingCentered } from "@/components/ui/Loading";
import { getRecordPurposeLabel, MANUAL_RECORD_PURPOSES } from "@/constants/recordPurpose";

// 로컬 formatDate 함수 완전 제거 - formatDateForDisplayUTC 직접 사용

// 비고에서 "주문 ID X - " 패턴 제거 함수
const removeOrderIdPrefix = (remarks: string | null | undefined): string => {
  if (!remarks) return "";
  // "주문 ID 숫자 - " 패턴을 찾아서 제거
  return remarks.replace(/^주문\s*ID\s*\d+\s*-\s*/, "");
};

// 타입 필터 옵션
type TypeFilter = "all" | "inbound" | "outbound";

export default function IoHistoryList() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { warehouses = [], items, invalidateInventory } = useWarehouseItems();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  // 3개월 전 날짜 계산 함수 (현재 월 포함하여 3개월)
  const getThreeMonthsAgo = () => {
    const today = new Date();
    // 현재 월을 포함하여 3개월 전 계산 (예: 7월이면 5,6,7월)
    const threeMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 2,
      1
    );
    return formatDateToLocalString(threeMonthsAgo);
  };

  const [startDate, setStartDate] = useState<string>(getThreeMonthsAgo());
  const [endDate, setEndDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateToLocalString(tomorrow);
  });
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  // 타입 필터 상태 추가
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // 입고/출고 모달 관련 상태
  const { createInventoryRecordAsync } = useCreateInventoryRecord();
  const { uploadFileAsync } = useUploadInventoryRecordFile();
  const { updateInventoryRecordAsync } = useUpdateInventoryRecord();
  const { categories } = useCategory();
  const queryClient = useQueryClient();
  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [selectedInboundItem, setSelectedInboundItem] = useState<
    unknown | null
  >(null);
  const [selectedOutboundItem, setSelectedOutboundItem] = useState<
    unknown | null
  >(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

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
    recordPurpose?: string;
    warehouseId: number;
    attachedFiles: AttachedFile[];
    supplierId?: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    quantity: 1,
    date: getTodayString(),
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
    recordPurpose?: string;
    warehouseId: number;
    attachedFiles: AttachedFile[];
    supplierId?: number;
  }>({
    itemId: null,
    itemCode: "",
    itemName: "",
    currentQuantity: 0,
    quantity: 1,
    date: getTodayString(),
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

  const {
    records,
    isLoading: isDataLoading,
    error,
  } = useInventoryRecordsByTeamId();

  // 날짜 필터 초기화 함수
  const resetDateFilter = () => {
    setStartDate(getThreeMonthsAgo());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEndDate(getTodayString());
  };

  // 모든 필터 초기화 함수
  const resetAllFilters = () => {
    resetDateFilter();
    setTypeFilter("all");
    setCurrentPage(1); // 필터 초기화 시 첫 페이지로 이동
  };

  // 필터링된 기록
  const filteredRecords = useMemo(() => {
    // 날짜로 필터링
    const dateFilteredRecords = filterRecordsByDateRange(
      records,
      startDate,
      endDate
    );

    // 창고로 필터링
    let warehouseFilteredRecords = dateFilteredRecords;
    if (selectedWarehouseId) {
      warehouseFilteredRecords = dateFilteredRecords.filter(
        (record) => record.item?.warehouseId === selectedWarehouseId
      );
    }

    // 타입으로 필터링
    if (typeFilter === "inbound") {
      return warehouseFilteredRecords.filter(
        (record) => record.inboundQuantity
      );
    } else if (typeFilter === "outbound") {
      return warehouseFilteredRecords.filter(
        (record) => record.outboundQuantity
      );
    }

    return warehouseFilteredRecords;
  }, [records, startDate, endDate, selectedWarehouseId, typeFilter]);

  // 페이지네이션 계산
  const { totalPages, currentRecords } = useMemo(() => {
    const total = Math.ceil(filteredRecords.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const records = filteredRecords.slice(
      indexOfFirstRecord,
      indexOfLastRecord
    );

    console.log(
      `페이지네이션: ${currentPage}/${total} 페이지, ${records.length}개 표시`
    );

    return {
      totalPages: total,
      currentRecords: records,
    };
  }, [filteredRecords, currentPage, recordsPerPage]);

  // 페이지네이션 핸들러
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // 필터 변경 시 페이지 초기화
  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    if (field === "startDate") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setCurrentPage(1); // 날짜 변경 시 첫 페이지로 이동
  };

  const handleTypeFilterChange = (filter: TypeFilter) => {
    setTypeFilter(filter);
    setCurrentPage(1); // 타입 필터 변경 시 첫 페이지로 이동
  };

  const handleWarehouseChange = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    setCurrentPage(1); // 창고 변경 시 첫 페이지로 이동
  };

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(Number(warehouses[0].id));
    }
  }, [warehouses, selectedWarehouseId]);

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

  // 입고/출고 모달 핸들러들
  const handleOpenInboundModal = (warehouseId: number) => {
    setInboundValues({
      ...inboundValues,
      warehouseId,
      itemId: null,
      itemCode: "",
      itemName: "",
    });
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
    setSelectedOutboundItem(null);
    setIsOutboundModalOpen(true);
  };

  const handleCloseOutboundModal = () => {
    setIsOutboundModalOpen(false);
    setSelectedOutboundItem(null);
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

  const handleInboundFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => {
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

  const handleOutboundFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = Array.from(files).map((file) => {
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

  const handleInboundFileDelete = (index: number) => {
    const updatedFiles = inboundValues.attachedFiles.filter(
      (_, i) => i !== index
    );
    // URL 해제
    const fileToDelete = inboundValues.attachedFiles[index];
    if (fileToDelete?.preview) {
      URL.revokeObjectURL(fileToDelete.preview);
    }
    setInboundValues({
      ...inboundValues,
      attachedFiles: updatedFiles,
    });
  };

  const handleOutboundFileDelete = (index: number) => {
    const updatedFiles = outboundValues.attachedFiles.filter(
      (_, i) => i !== index
    );
    // URL 해제
    const fileToDelete = outboundValues.attachedFiles[index];
    if (fileToDelete?.preview) {
      URL.revokeObjectURL(fileToDelete.preview);
    }
    setOutboundValues({
      ...outboundValues,
      attachedFiles: updatedFiles,
    });
  };

  const handleSubmitInbound = async () => {
    if (!inboundValues.itemId) return;

    try {
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
        recordPurpose: inboundValues.recordPurpose,
        supplierId: inboundValues.supplierId,
        warehouseId: inboundValues.warehouseId,
        userId: user?.id,
      };

      try {
        const recordId = await createInventoryRecordAsync(recordData);

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

        await Promise.all([
          ...uploadPromises,
          invalidateInventory(),
          queryClient.invalidateQueries({
            queryKey: ["inventoryRecordsByTeam"],
          }),
        ]);

        alert("입고가 성공적으로 처리되었습니다.");

        setInboundValues({
          itemId: null,
          itemCode: "",
          itemName: "",
          quantity: 1,
          date: getTodayString(),
          inboundPlace: "",
          inboundAddress: "",
          inboundAddressDetail: "",
          remarks: "",
          warehouseId: inboundValues.warehouseId,
          attachedFiles: [],
          supplierId: undefined,
        });

        handleCloseInboundModal();
      } catch (error: unknown) {
        console.error("입고 기록 생성 실패:", error);
        const errorMessage =
          error instanceof Error && "error" in error
            ? (error as { error?: string }).error
            : "입고 처리 중 오류가 발생했습니다.";
        alert(errorMessage);
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
        items.find((item) => item.id === outboundValues.itemId)?.itemQuantity ||
        0;

      if (outboundValues.quantity > currentQuantity) {
        alert("출고 수량이 현재 재고보다 많습니다.");
        return;
      }

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
        recordPurpose: outboundValues.recordPurpose,
        warehouseId: outboundValues.warehouseId,
        userId: user?.id,
        supplierId: outboundValues.supplierId,
      };

      try {
        const recordId = await createInventoryRecordAsync(recordData);

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

        await Promise.all([
          ...uploadPromises,
          invalidateInventory(),
          queryClient.invalidateQueries({
            queryKey: ["inventoryRecordsByTeam"],
          }),
        ]);

        alert("출고가 성공적으로 처리되었습니다.");
        handleCloseOutboundModal();
      } catch (error: unknown) {
        console.error("출고 기록 생성 실패:", error);
        const errorMessage =
          error instanceof Error && "error" in error
            ? (error as { error?: string }).error
            : "출고 처리 중 오류가 발생했습니다.";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("출고 처리 중 오류 발생:", error);
      alert("출고 처리 중 오류가 발생했습니다.");
    }
  };

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

  const handleRecordPurposeChange = async (recordId: number, newPurpose: string) => {
    try {
      await updateInventoryRecordAsync({
        id: String(recordId),
        data: {
          recordPurpose: newPurpose || undefined,
        },
      });
    } catch (error) {
      console.error("목적 변경 실패:", error);
    }
  };

  const getWarehouseItems = (warehouseId: number) => {
    const warehouseData = warehouses.find((w) => Number(w.id) === warehouseId);

    if (warehouseData && warehouseData.items) {
      return warehouseData.items;
    }

    return items.filter((item) => item.warehouseId === warehouseId);
  };

  if (isUserLoading || isDataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingCentered size="lg" />
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        에러 발생:{" "}
        {error.message || "데이터를 불러오는 중 문제가 발생했습니다."}
      </div>
    );
  }

  // 사용자가 접근 가능한 창고만 필터링
  const accessibleWarehouses = user
    ? filterAccessibleWarehouses(user, warehouses)
    : warehouses;

  // 허용된 창고와 제한된 창고 콘솔 출력
  if (user) {
    const accessibleWarehouseNames = accessibleWarehouses
      .map((w) => w.warehouseName)
      .join(", ");
    const restrictedWarehouseNames = warehouses
      .filter((w) => !accessibleWarehouses.some((aw) => aw.id === w.id))
      .map((w) => w.warehouseName)
      .join(", ");

    console.log(
      `[입출고내역] ${user.name}(${user.accessLevel}): 허용된 창고: [${accessibleWarehouseNames}] | 제한된 창고: [${restrictedWarehouseNames}]`
    );
  }

  return (
    <div className="container p-4 mx-auto">
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4">
        {accessibleWarehouses.map((warehouse: Warehouse) => (
          <div
            key={warehouse.id}
            onClick={() => handleWarehouseChange(Number(warehouse.id))}
            className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
              selectedWarehouseId === Number(warehouse.id)
                ? "bg-blue-500 text-white ring-2 ring-blue-600 transform scale-105"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                selectedWarehouseId === Number(warehouse.id)
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              {warehouse.warehouseName}
            </h3>
            {warehouse.warehouseAddress && (
              <div
                className={`text-sm mt-1 truncate ${
                  selectedWarehouseId === Number(warehouse.id)
                    ? "text-blue-100"
                    : "text-gray-500"
                }`}
              >
                {warehouse.warehouseAddress}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 입고/출고 버튼 섹션 */}
      {selectedWarehouseId && user?.accessLevel !== "user" && (
        <div className="flex justify-end mb-6 space-x-2">
          <Button
            variant="default"
            onClick={() => handleOpenInboundModal(selectedWarehouseId)}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            className="text-white bg-blue-500 hover:bg-blue-600"
          >
            입고
          </Button>
          <Button
            variant="default"
            onClick={() => handleOpenOutboundModal(selectedWarehouseId)}
            icon={<Minus className="w-4 h-4" />}
            iconPosition="left"
            className="text-white bg-red-500 hover:bg-red-600"
          >
            출고
          </Button>
        </div>
      )}

      {/* 필터 섹션 */}
      <div className="mb-6 space-y-4">
        {/* 날짜 필터 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              조회 시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="block px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              조회 종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="block px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetAllFilters}
              className="flex gap-2 items-center px-4 py-2 w-full text-gray-700 bg-gray-100 rounded-full transition-colors hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              초기화
            </button>
          </div>
        </div>

        {/* 타입 필터 */}
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">구분:</span>
          <button
            onClick={() => handleTypeFilterChange("all")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              typeFilter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => handleTypeFilterChange("inbound")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              typeFilter === "inbound"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            입고
          </button>
          <button
            onClick={() => handleTypeFilterChange("outbound")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              typeFilter === "outbound"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            출고
          </button>
        </div>
      </div>

      {/* 기록 목록 테이블 */}
      {filteredRecords.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">데이터가 없습니다</p>
          <p className="mt-2 text-sm text-gray-400">
            {typeFilter === "inbound"
              ? "선택한 기간에 입고 기록이 없습니다"
              : typeFilter === "outbound"
              ? "선택한 기간에 출고 기록이 없습니다"
              : "선택한 기간에 입출고 기록이 없습니다"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="overflow-hidden min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[13%]">
                  일자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  구분
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                  목적
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[30%]">
                  품목
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  수량
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[31%]">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRecords.map((record) => (
                <React.Fragment key={record.id}>
                  <tr
                    onClick={() =>
                      setExpandedRecordId(
                        expandedRecordId === record.id ? null : record.id
                      )
                    }
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {record.inboundQuantity
                        ? (record.inboundDate ? formatDateForDisplayUTC(record.inboundDate) : "N/A")
                        : (record.outboundDate ? formatDateForDisplayUTC(record.outboundDate) : "N/A")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.inboundQuantity
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.inboundQuantity ? "입고" : "출고"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}>
                      <select
                        value={record.recordPurpose || ""}
                        onChange={(e) => handleRecordPurposeChange(record.id, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">미분류</option>
                        {MANUAL_RECORD_PURPOSES.map((purpose) => (
                          <option key={purpose.value} value={purpose.value}>
                            {purpose.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {record.item?.teamItem ? (
                        <div className="space-y-1">
                          <div className="font-medium text-blue-700">
                            {record.item.teamItem.itemName}
                          </div>
                          <div className="text-xs text-gray-500">
                            코드: {record.item.teamItem.itemCode}
                          </div>
                          {record.item.teamItem.category?.name && (
                            <div className="text-xs text-gray-400">
                              카테고리: {record.item.teamItem.category.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-500">
                          품목 정보 없음 (ID: {record.itemId})
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {record.inboundQuantity || record.outboundQuantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {removeOrderIdPrefix(record.remarks)}
                    </td>
                  </tr>
                  {expandedRecordId === record.id && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 bg-gray-50">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {record.item?.teamItem ? (
                              <>
                                [{record.item.teamItem.itemCode}]{" "}
                                {record.item.teamItem.itemName}
                                {record.item.teamItem.category?.name && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    ({record.item.teamItem.category.name})
                                  </span>
                                )}
                              </>
                            ) : (
                              `품목 ID: ${record.itemId}`
                            )}{" "}
                            {record.inboundQuantity ? "입고" : "출고"}건 (
                            {record.inboundQuantity || record.outboundQuantity}
                            개) -{" "}
                            {warehouses.find(
                              (w) => w.id === record.item?.warehouseId
                            )?.warehouseName || "알 수 없는 창고"}
                          </h3>
                        </div>
                        <InventoryRecordDetail record={record} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 UI */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center p-4 mt-6 bg-white rounded-xl shadow-sm">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-full ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } transition-colors`}
          >
            이전
          </Button>
          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              페이지 <span className="font-medium">{currentPage}</span> /{" "}
              {totalPages || 1}
            </span>
            <span className="mx-4 text-sm text-gray-500">
              총 {filteredRecords.length}개 항목
            </span>
          </div>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`px-4 py-2 rounded-full ${
              currentPage === totalPages || totalPages === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } transition-colors`}
          >
            다음
          </Button>
        </div>
      )}

      {/* 입고 모달 */}
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

      {/* 출고 모달 */}
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
  );
}
