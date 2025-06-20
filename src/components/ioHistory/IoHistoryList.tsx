"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useInventoryRecordsByTeamId } from "@/hooks/useInventoryRecordsByTeamId";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Warehouse } from "@/types/warehouse";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { filterRecordsByDateRange } from "@/utils/dateFilter";
import InventoryRecordDetail from "./InventoryRecordDetail";
import { navigateByAuthStatus } from "@/utils/navigation";
import { Button } from "@/components/ui/button";
import { CreateInventoryRecordDto } from "@/types/(inventoryRecord)/inventory-record";
import { AttachedFile } from "@/types/common";
import InboundModal from "../stock/modal/InboundModal";
import OutboundModal from "../stock/modal/OutboundModal";
import { useSuppliers } from "@/hooks/useSupplier";
import {
  useCreateInventoryRecord,
  useUploadInventoryRecordFile,
} from "@/hooks/useInventoryRecord";
import { useCategory } from "@/hooks/useCategory";
import { useQueryClient } from "@tanstack/react-query";

// 날짜 포맷팅 유틸리티 함수
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 타입 필터 옵션
type TypeFilter = "all" | "inbound" | "outbound";

export default function IoHistoryList() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { warehouses = [], items, invalidateInventory } = useWarehouseItems();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .split("T")[0]
  );
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  // 타입 필터 상태 추가
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // 입고/출고 모달 관련 상태
  const { createInventoryRecordAsync } = useCreateInventoryRecord();
  const { uploadFileAsync } = useUploadInventoryRecordFile();
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

  const {
    records,
    isLoading: isDataLoading,
    error,
  } = useInventoryRecordsByTeamId();

  // 날짜 필터 초기화 함수
  const resetDateFilter = () => {
    setStartDate(
      new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split("T")[0]
    );
    setEndDate(
      new Date(new Date().setDate(new Date().getDate() + 1))
        .toISOString()
        .split("T")[0]
    );
  };

  // 모든 필터 초기화 함수
  const resetAllFilters = () => {
    resetDateFilter();
    setTypeFilter("all");
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

  const getWarehouseItems = (warehouseId: number) => {
    const warehouseData = warehouses.find((w) => Number(w.id) === warehouseId);

    if (warehouseData && warehouseData.items) {
      return warehouseData.items;
    }

    return items.filter((item) => item.warehouseId === warehouseId);
  };

  if (isUserLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.accessLevel === "supplier") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            열람 권한이 없습니다
          </h2>
          <p className="mb-6 text-gray-600">
            해당 페이지에 접근할 수 있는 권한이 없습니다.
          </p>
          <Button
            variant="outline"
            onClick={() => navigateByAuthStatus(router)}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            뒤로가기
          </Button>
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

  return (
    <div className="container p-4 mx-auto">
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4">
        {warehouses.map((warehouse: Warehouse) => (
          <div
            key={warehouse.id}
            onClick={() => setSelectedWarehouseId(Number(warehouse.id))}
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
        <div className="mb-6 flex justify-end space-x-2">
          <Button
            variant="default"
            onClick={() => handleOpenInboundModal(selectedWarehouseId)}
            icon={<Plus className="w-4 h-4" />}
            iconPosition="left"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            입고
          </Button>
          <Button
            variant="default"
            onClick={() => handleOpenOutboundModal(selectedWarehouseId)}
            icon={<Minus className="w-4 h-4" />}
            iconPosition="left"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            출고
          </Button>
        </div>
      )}

      {/* 필터 섹션 */}
      <div className="mb-6 space-y-4">
        {/* 날짜 필터 */}
        <div className="flex items-end gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              조회 시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              조회 종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
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

        {/* 타입 필터 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">구분:</span>
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              typeFilter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setTypeFilter("inbound")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              typeFilter === "inbound"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            입고
          </button>
          <button
            onClick={() => setTypeFilter("outbound")}
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
        <div className="py-8 text-center rounded-lg bg-gray-50">
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
          <table className="min-w-full overflow-hidden bg-white rounded-lg shadow-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                  일자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  구분
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                  품목
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  수량
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[34%]">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
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
                        ? formatDate(record.inboundDate)
                        : formatDate(record.outboundDate)}
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
                      {record.remarks}
                    </td>
                  </tr>
                  {expandedRecordId === record.id && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 bg-gray-50">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {record.item?.teamItem ? (
                              <>
                                [{record.item.teamItem.itemCode}]{" "}
                                {record.item.teamItem.itemName}
                                {record.item.teamItem.category?.name && (
                                  <span className="text-sm text-gray-500 ml-2">
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
