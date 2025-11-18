"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Save,
  Loader2,
  User,
  Calendar,
  Paperclip,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { DemoResponse, PatchDemoRequest, DemoStatus } from "@/types/demo/demo";
import {
  useUpdateDemo,
  useDeleteDemo,
} from "@/hooks/(useDemo)/useDemoMutations";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { useFileUpload } from "@/hooks/useFileUpload";
import { uploadMultipleDemoFileById, deleteDemoFile } from "@/api/demo-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { DeliveryMethodSelector } from "@/components/ui/delivery-method-selector";
import AddressSection from "@/components/common/AddressSection";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { Address } from "react-daum-postcode";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import DemoItemSelector, { SelectedDemoItem } from "./DemoItemSelector";
import { TeamItem } from "@/types/(item)/team-item";
import { useQueryClient } from "@tanstack/react-query";
import { getDisplayFileName, formatFileSize } from "@/utils/fileUtils";
import {
  getTodayString,
  convertToUTC9,
  normalizeDateForDisplay,
  normalizeTimeForDisplay,
  isValidDateString
} from "@/utils/dateUtils";

// 통합 날짜 유틸리티 사용 - toKSTDateString은 formatDateForServer로 대체됨

// 통합 날짜 유틸리티 사용 - normalizeDateForDisplay는 dateUtils에서 제공됨

// 통합 날짜 유틸리티 사용 - normalizeTimeForDisplay는 dateUtils에서 제공됨

// 상태 텍스트 함수
const getStatusText = (status: string): string => {
  switch (status) {
    case DemoStatus.requested:
      return "요청";
    case DemoStatus.approved:
      return "승인";
    case DemoStatus.rejected:
      return "반려";
    case DemoStatus.confirmedByShipper:
      return "출고팀 확인";
    case DemoStatus.shipmentCompleted:
      return "출고 완료";
    case DemoStatus.rejectedByShipper:
      return "출고 보류";
    case DemoStatus.demoCompleted:
      return "시연 종료";
    default:
      return status;
  }
};

// 숫자 포맷팅 함수
const formatNumber = (value: string): string => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue === "") return "";
  return Number(numericValue).toLocaleString();
};

// 파일 타입 정의
interface DemoFile {
  id: number;
  fileName: string;
  fileUrl: string;
  createdAt?: string;
}

interface DemoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  demo: DemoResponse | null;
  onSuccess: () => void;
}

const DemoEditModal: React.FC<DemoEditModalProps> = ({
  isOpen,
  onClose,
  demo,
  onSuccess,
}) => {
  const { user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isHandlerSelf, setIsHandlerSelf] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedDemoItem[]>([]);
  const [demoPriceDisplay, setDemoPriceDisplay] = useState("");

  // 파일 관련 상태 추가
  const [existingFiles, setExistingFiles] = useState<DemoFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);

  const [formData, setFormData] = useState<PatchDemoRequest>({
    handler: "",
    demoManager: "",
    demoManagerPhone: "",
    memo: "",
    demoTitle: "",
    demoNationType: "국내",
    demoAddress: "",
    demoPaymentType: "",
    demoPrice: undefined,
    demoPaymentDate: "",
    demoStartDate: "",
    demoStartTime: "",
    demoStartDeliveryMethod: "",
    demoEndDate: "",
    demoEndTime: "",
    demoEndDeliveryMethod: "",
    eventStartDate: "",
    eventStartTime: "",
    eventEndDate: "",
    eventEndTime: "",
    warehouseId: 0,
    demoItems: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateDemoMutation = useUpdateDemo();
  const deleteDemoMutation = useDeleteDemo();
  // useWarehouseItems 훅 제거 - 모달이 열려있을 때만 창고 정보가 필요하므로 조건부로 처리
  const fileUpload = useFileUpload();
  const { isAddressOpen, handleToggleAddressModal, handleCloseAddressModal } =
    useAddressSearch();
  const queryClient = useQueryClient();

  // 창고 정보를 필요할 때만 가져오기
  const { warehouses } = useWarehouseItems({
    enabled: isOpen && !!demo,
    staleTime: 5 * 60 * 1000, // 5분으로 단축
    gcTime: 10 * 60 * 1000, // 10분으로 단축
  });

  // 시연 창고 필터링
  const demoWarehouses = React.useMemo(() => {
    if (!warehouses) return [];
    return warehouses.filter((warehouse) =>
      warehouse.warehouseName.includes("시연")
    );
  }, [warehouses]);

  // 사용 가능한 창고 목록 (시연 창고가 있으면 시연 창고, 없으면 모든 창고)
  const availableWarehouses = React.useMemo(() => {
    if (demoWarehouses.length > 0) {
      return demoWarehouses;
    }
    return warehouses || [];
  }, [demoWarehouses, warehouses]);

  // 창고 자동 선택 (시연 창고 우선, 없으면 첫 번째 창고)
  React.useEffect(() => {
    if (availableWarehouses.length > 0 && formData.warehouseId === 0) {
      setFormData((prev) => ({
        ...prev,
        warehouseId: availableWarehouses[0].id,
      }));
    }
  }, [availableWarehouses, formData.warehouseId]);

  // 초기 데이터 설정 (로딩 상태 포함)
  useEffect(() => {
    if (isOpen && demo) {
      setIsLoading(true);

      // 1초 후에 데이터 설정
      const timer = setTimeout(() => {
        console.log("기존 시연 데이터:", demo);
        // 결제 관련 값 타입/값 확인용 콘솔
        console.log(
          "[디버그] demoPaymentType:",
          demo.demoPaymentType,
          typeof demo.demoPaymentType
        );
        console.log(
          "[디버그] demoPrice:",
          demo.demoPrice,
          typeof demo.demoPrice
        );
        console.log(
          "[디버그] demoPaymentDate:",
          demo.demoPaymentDate,
          typeof demo.demoPaymentDate
        );

        // 기존 아이템을 SelectedDemoItem 형태로 변환 (TeamItem 타입 맞추기)
        const existingItems: SelectedDemoItem[] =
          demo.demoItems?.map((item) => {
            const t: Record<string, unknown> = item.item.teamItem;
            return {
              itemId: item.itemId,
              quantity: item.quantity,
              memo: typeof t.memo === "string" ? t.memo : "",
              itemName: typeof t.itemName === "string" ? t.itemName : "",
              teamItem: {
                id: typeof t.id === "number" ? t.id : 0,
                itemCode: typeof t.itemCode === "string" ? t.itemCode : "",
                itemName: typeof t.itemName === "string" ? t.itemName : "",
                memo: typeof t.memo === "string" ? t.memo : "",
                teamId: typeof t.teamId === "number" ? t.teamId : 0,
                category:
                  t.category &&
                  typeof t.category === "object" &&
                  t.category !== null
                    ? (t.category as TeamItem["category"])
                    : {
                        id: 0,
                        name: "",
                        priority: 0,
                        teamId: 0,
                        createdAt: "",
                        updatedAt: "",
                      },
              },
            };
          }) || [];

        // 중복 제거: itemId 기준
        const uniqueItems = Array.from(
          new Map(existingItems.map((item) => [item.itemId, item])).values()
        );
        setSelectedItems(uniqueItems);

        // 기존 파일 초기화
        setExistingFiles(demo.files || []);
        setFilesToDelete([]);
        fileUpload.resetFiles();

        setFormData({
          handler: demo.handler || "",
          demoManager: demo.demoManager || "",
          demoManagerPhone: demo.demoManagerPhone || "",
          memo: demo.memo || "",
          demoTitle: demo.demoTitle || "",
          demoNationType: demo.demoNationType || "국내",
          demoAddress: demo.demoAddress || "",
          demoPaymentType: demo.demoPaymentType || "",
          demoPrice: demo.demoPrice,
          demoPaymentDate: normalizeDateForDisplay(demo.demoPaymentDate || ""),
          demoStartDate: normalizeDateForDisplay(demo.demoStartDate || ""),
          demoStartTime: normalizeTimeForDisplay(demo.demoStartTime || ""),
          demoStartDeliveryMethod: demo.demoStartDeliveryMethod || "",
          demoEndDate: normalizeDateForDisplay(demo.demoEndDate || ""),
          demoEndTime: normalizeTimeForDisplay(demo.demoEndTime || ""),
          demoEndDeliveryMethod: demo.demoEndDeliveryMethod || "",
          eventStartDate: normalizeDateForDisplay(demo.eventStartDate || ""),
          eventStartTime: normalizeTimeForDisplay(demo.eventStartTime || ""),
          eventEndDate: normalizeDateForDisplay(demo.eventEndDate || ""),
          eventEndTime: normalizeTimeForDisplay(demo.eventEndTime || ""),
          warehouseId: demo.warehouseId || 0,
          demoItems: existingItems.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            memo: item.memo || "",
          })),
        });

        // 시연 비용 표시 설정
        if (demo.demoPrice) {
          setDemoPriceDisplay(formatNumber(demo.demoPrice.toString()));
        } else {
          setDemoPriceDisplay("");
        }

        // 사내 담당자가 현재 사용자와 같으면 체크박스 활성화
        setIsHandlerSelf(demo.handler === user?.name);

        setIsLoading(false);
        console.log("폼 데이터 설정 완료");
      }, 1000);

      return () => clearTimeout(timer);
    } else if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setIsLoading(true);
      setFormData({
        handler: "",
        demoManager: "",
        demoManagerPhone: "",
        memo: "",
        demoTitle: "",
        demoNationType: "국내",
        demoAddress: "",
        demoPaymentType: "",
        demoPrice: undefined,
        demoPaymentDate: "",
        demoStartDate: "",
        demoStartTime: "",
        demoStartDeliveryMethod: "",
        demoEndDate: "",
        demoEndTime: "",
        demoEndDeliveryMethod: "",
        eventStartDate: "",
        eventStartTime: "",
        eventEndDate: "",
        eventEndTime: "",
        warehouseId: 0,
        demoItems: [],
      });
      setSelectedItems([]);
      setDemoPriceDisplay("");
      setIsHandlerSelf(false);
      setExistingFiles([]);
      setFilesToDelete([]);
      fileUpload.resetFiles();
    }
  }, [demo, isOpen, user]); // fileUpload는 무한루프 방지를 위해 의존성에서 제외

  // 사내 담당자 체크박스 상태에 따라 handler 필드 자동 설정
  React.useEffect(() => {
    if (isHandlerSelf && user?.name) {
      setFormData((prev) => ({
        ...prev,
        handler: user.name,
      }));
    } else if (!isHandlerSelf) {
      setFormData((prev) => ({
        ...prev,
        handler: "",
      }));
    }
  }, [isHandlerSelf, user]);

  // 폼 입력 변경 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // 시연 비용 필드인 경우 숫자 포맷팅 적용
    if (name === "demoPrice") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = formatNumber(value);

      setDemoPriceDisplay(formattedValue);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue === "" ? undefined : Number(numericValue),
      }));
    }
    // 다른 숫자 필드들
    else if (name === "userId" || name === "warehouseId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 주소 변경 핸들러
  const handleAddressChange = (data: Address) => {
    const fullAddress = `${data.address} ${data.buildingName || ""}`.trim();
    setFormData((prev) => ({
      ...prev,
      demoAddress: fullAddress,
    }));
  };

  // 기존 파일 삭제 처리
  const handleDeleteExistingFile = useCallback((fileId: number) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  // 파일 삭제 취소
  const handleCancelDeleteFile = useCallback(
    (fileId: number) => {
      setFilesToDelete((prev) => prev.filter((id) => id !== fileId));
      // 원래 파일 목록에서 복원
      if (demo?.files) {
        const originalFile = demo.files.find((file) => file.id === fileId);
        if (originalFile) {
          setExistingFiles((prev) => [...prev, originalFile]);
        }
      }
    },
    [demo?.files]
  );

  // 파일 다운로드
  const handleDownloadFile = useCallback((file: DemoFile) => {
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = getDisplayFileName(file.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 폼 검증
  const validateForm = (): boolean => {
    const requiredFields = [
      { field: formData.warehouseId, name: "시연 창고" },
      { field: formData.demoTitle, name: "시연/행사 명" },
      { field: formData.demoNationType, name: "국내/해외 시연" },
      { field: formData.demoPaymentType, name: "결제 유형" },
      { field: formData.demoManager, name: "현지 담당자" },
      { field: formData.demoManagerPhone, name: "현지 담당자 연락처" },
      { field: formData.demoStartDate, name: "상차 일자" },
      { field: formData.demoStartTime, name: "상차 시간" },
      { field: formData.demoEndDate, name: "시연품 회수일" },
      { field: formData.demoEndTime, name: "회수 시간" },
      { field: formData.demoAddress, name: "시연품 배송장소" },
    ];

    for (const { field, name } of requiredFields) {
      if (!field || !field.toString().trim()) {
        toast.error(`${name}을 입력해주세요.`);
        return false;
      }
    }

    // 날짜/시간 유효성 검사
    if (formData.demoStartDate && formData.demoEndDate) {
      const startDate = new Date(
        `${formData.demoStartDate}T${formData.demoStartTime || "00:00"}`
      );
      const endDate = new Date(
        `${formData.demoEndDate}T${formData.demoEndTime || "00:00"}`
      );

      if (endDate <= startDate) {
        toast.error("회수 일정은 출고 일정보다 이후여야 합니다.");
        return false;
      }
    }

    if (selectedItems.length === 0) {
      toast.error("시연 아이템을 선택해주세요.");
      return false;
    }

    // 아이템 수량 검증 - 팀에서 알아서 처리하므로 제거
    // for (const item of selectedItems) {
    //   if (item.quantity <= 0) {
    //     toast.error(`"${item.itemName}"의 수량은 1개 이상이어야 합니다.`);
    //     return false;
    //   }
    // }

    // 전화번호 형식 검증 (간단한 형식 체크)
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (
      formData.demoManagerPhone &&
      !phoneRegex.test(formData.demoManagerPhone)
    ) {
      toast.error("현지 담당자 연락처 형식이 올바르지 않습니다.");
      return false;
    }

    // 날짜 형식 검증 - 통합 유틸리티 사용
    const validateDate = (dateString: string): boolean => {
      if (!dateString) return true;
      return isValidDateString(dateString);
    };

    if (formData.demoStartDate && !validateDate(formData.demoStartDate)) {
      toast.error("상차 일자 형식이 올바르지 않습니다.");
      return false;
    }
    if (formData.demoEndDate && !validateDate(formData.demoEndDate)) {
      toast.error("회수 일자 형식이 올바르지 않습니다.");
      return false;
    }

    // 시간 형식 검증
    const timeRegex = /^\d{2}:\d{2}$/;
    if (formData.demoStartTime && !timeRegex.test(formData.demoStartTime)) {
      toast.error("상차 시간 형식이 올바르지 않습니다.");
      return false;
    }
    if (formData.demoEndTime && !timeRegex.test(formData.demoEndTime)) {
      toast.error("회수 시간 형식이 올바르지 않습니다.");
      return false;
    }

    return true;
  };

  // 파일 업로드 처리
  const handleFileUpload = async (demoId: number): Promise<boolean> => {
    if (fileUpload.files.length === 0) return true;

    try {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      const oversizedFiles = fileUpload.files.filter(
        (file) => file.size > maxFileSize
      );

      if (oversizedFiles.length > 0) {
        toast.error("50MB를 초과하는 파일이 있어 업로드할 수 없습니다");
        return false;
      }

      toast.loading("파일 업로드 중...");
      const uploadResponse = await uploadMultipleDemoFileById(
        demoId,
        fileUpload.getEncodedFiles()
      );
      toast.dismiss();

      if (uploadResponse.success) {
        const uploadedFileNames = uploadResponse.data
          ?.map((file) => file.fileName)
          .join(", ");
        toast.success(`파일 '${uploadedFileNames}' 업로드가 완료되었습니다`);
        return true;
      } else {
        toast.error(
          `파일 업로드에 실패했습니다: ${
            uploadResponse.error || "알 수 없는 오류"
          }`
        );
        return false;
      }
    } catch (error) {
      console.error("파일 업로드 API 호출 중 오류:", error);
      toast.error("파일 업로드 과정에서 오류가 발생했습니다");
      return false;
    }
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !demo) return;

    // 권한 확인
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    // 수정 권한 확인 (admin이면 무조건 수정 가능)
    const isAdmin = user.isAdmin;
    const isAuthor = demo.userId === user.id;

    if (!isAdmin && !isAuthor) {
      toast.error("자신이 작성한 시연만 수정할 수 있습니다.");
      return;
    }

    // admin이면 상태 필터링 제거 - 무조건 수정 가능
    if (!isAdmin) {
      // 일반 사용자는 기존 상태 필터링 적용
      const nonEditableStatuses = [
        DemoStatus.approved,
        DemoStatus.rejected,
        DemoStatus.confirmedByShipper,
        DemoStatus.shipmentCompleted,
        DemoStatus.rejectedByShipper,
        DemoStatus.demoCompleted,
      ];

      if (nonEditableStatuses.includes(demo.demoStatus as DemoStatus)) {
        const statusText = getStatusText(demo.demoStatus);
        toast.error(`${statusText} 상태의 시연은 수정할 수 없습니다.`);
        return;
      }

      // 동시성 체크: 현재 시연 상태가 변경되었는지 확인 (일반 사용자만)
      if (demo.demoStatus !== "requested") {
        toast.error(
          "시연 상태가 변경되어 수정할 수 없습니다. 페이지를 새로고침해주세요."
        );
        return;
      }
    }

    // 재고 확인 (선택적 - 필요시 활성화)
    // const stockValidation = validateStock();
    // if (!stockValidation.isValid) {
    //   const itemList = stockValidation.insufficientItems.join("\n• ");
    //   toast.error(
    //     `다음 품목의 재고가 부족합니다:\n\n• ${itemList}\n\n수량을 조정하거나 담당자에게 문의하세요.`
    //   );
    //   return;
    // }

    // 수정 내용 확인 다이얼로그 개선
    const hasNewFiles = fileUpload.files.length > 0;
    const hasDeletedFiles = filesToDelete.length > 0;
    const hasFileChanges = hasNewFiles || hasDeletedFiles;

    let confirmMessage = "시연 정보를 수정하시겠습니까?";

    if (hasFileChanges) {
      confirmMessage += "\n\n파일 변경사항:";
      if (hasNewFiles) {
        confirmMessage += `\n• 새 파일 ${fileUpload.files.length}개 추가`;
      }
      if (hasDeletedFiles) {
        confirmMessage += `\n• 기존 파일 ${filesToDelete.length}개 삭제`;
      }
    }

    confirmMessage +=
      "\n\n※ 필요한 증빙서류(견적서, 시연 관련 자료 등)가 모두 첨부되었는지 확인해주세요.";

    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 날짜 변환 전 디버깅
      console.log("[디버깅] 원본 날짜 데이터:", {
        demoPaymentDate: formData.demoPaymentDate,
        demoStartDate: formData.demoStartDate,
        demoEndDate: formData.demoEndDate,
      });

      // 각 날짜 필드의 타입과 값 확인
      console.log("[디버깅] 날짜 필드 상세 정보:", {
        demoPaymentDate: {
          value: formData.demoPaymentDate,
          type: typeof formData.demoPaymentDate,
          length: formData.demoPaymentDate?.length,
          isEmpty:
            !formData.demoPaymentDate || formData.demoPaymentDate.trim() === "",
        },
        demoStartDate: {
          value: formData.demoStartDate,
          type: typeof formData.demoStartDate,
          length: formData.demoStartDate?.length,
          isEmpty:
            !formData.demoStartDate || formData.demoStartDate.trim() === "",
        },
        demoEndDate: {
          value: formData.demoEndDate,
          type: typeof formData.demoEndDate,
          length: formData.demoEndDate?.length,
          isEmpty: !formData.demoEndDate || formData.demoEndDate.trim() === "",
        },
      });

      const submitData: PatchDemoRequest = {
        ...formData,
        demoPaymentDate:
          formData.demoPaymentDate && formData.demoPaymentDate.trim() !== ""
            ? formData.demoPaymentDate
            : undefined,
        demoStartDate:
          formData.demoStartDate && formData.demoStartDate.trim() !== ""
            ? formData.demoStartDate
            : undefined,
        demoEndDate:
          formData.demoEndDate && formData.demoEndDate.trim() !== ""
            ? formData.demoEndDate
            : undefined,
        demoStartTime:
          formData.demoStartTime && formData.demoStartTime.trim() !== ""
            ? convertToUTC9(formData.demoStartTime)
            : formData.demoStartTime,
        demoEndTime:
          formData.demoEndTime && formData.demoEndTime.trim() !== ""
            ? convertToUTC9(formData.demoEndTime)
            : formData.demoEndTime,
        eventStartDate:
          formData.eventStartDate && formData.eventStartDate.trim() !== ""
            ? formData.eventStartDate
            : undefined,
        eventStartTime:
          formData.eventStartTime && formData.eventStartTime.trim() !== ""
            ? convertToUTC9(formData.eventStartTime)
            : formData.eventStartTime,
        eventEndDate:
          formData.eventEndDate && formData.eventEndDate.trim() !== ""
            ? formData.eventEndDate
            : undefined,
        eventEndTime:
          formData.eventEndTime && formData.eventEndTime.trim() !== ""
            ? convertToUTC9(formData.eventEndTime)
            : formData.eventEndTime,
        demoItems: selectedItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          memo: item.memo,
        })),
      };

      // 날짜 필드 유효성 재검증
      if (submitData.demoPaymentDate === "") {
        submitData.demoPaymentDate = undefined;
      }
      if (submitData.demoStartDate === "") {
        submitData.demoStartDate = undefined;
      }
      if (submitData.demoEndDate === "") {
        submitData.demoEndDate = undefined;
      }

      // 변환 후 디버깅
      console.log("[디버깅] 변환된 날짜 데이터:", {
        demoPaymentDate: submitData.demoPaymentDate,
        demoStartDate: submitData.demoStartDate,
        demoEndDate: submitData.demoEndDate,
      });

      // 서버 파싱 테스트를 위한 디버깅
      console.log("[디버깅] 서버 파싱 테스트:", {
        demoPaymentDate: submitData.demoPaymentDate
          ? new Date(submitData.demoPaymentDate)
          : null,
        demoStartDate: submitData.demoStartDate
          ? new Date(submitData.demoStartDate)
          : null,
        demoEndDate: submitData.demoEndDate
          ? new Date(submitData.demoEndDate)
          : null,
      });

      // undefined인 날짜 필드들 제거
      if (!submitData.demoPaymentDate) {
        delete submitData.demoPaymentDate;
        console.log("[디버깅] demoPaymentDate 제거됨");
      }
      if (!submitData.demoStartDate) {
        delete submitData.demoStartDate;
        console.log("[디버깅] demoStartDate 제거됨");
      }
      if (!submitData.demoEndDate) {
        delete submitData.demoEndDate;
        console.log("[디버깅] demoEndDate 제거됨");
      }

      // 최종 제거 후 디버깅
      console.log("[디버깅] 최종 제출 데이터:", {
        demoPaymentDate: submitData.demoPaymentDate,
        demoStartDate: submitData.demoStartDate,
        demoEndDate: submitData.demoEndDate,
      });

      // 전체 submitData 확인
      console.log(
        "[디버깅] 전체 submitData:",
        JSON.stringify(submitData, null, 2)
      );

      // 서버 전송 전 최종 검증
      const finalSubmitData = { ...submitData };

      // 빈 문자열이나 undefined인 날짜 필드 제거
      if (
        !finalSubmitData.demoPaymentDate ||
        finalSubmitData.demoPaymentDate === ""
      ) {
        delete finalSubmitData.demoPaymentDate;
      }
      if (
        !finalSubmitData.demoStartDate ||
        finalSubmitData.demoStartDate === ""
      ) {
        delete finalSubmitData.demoStartDate;
      }
      if (!finalSubmitData.demoEndDate || finalSubmitData.demoEndDate === "") {
        delete finalSubmitData.demoEndDate;
      }

      console.log("[디버깅] 서버 전송 전 최종 데이터:", {
        demoPaymentDate: finalSubmitData.demoPaymentDate,
        demoStartDate: finalSubmitData.demoStartDate,
        demoEndDate: finalSubmitData.demoEndDate,
      });

      // demoItems 부분만 alert로 출력
      // alert(
      //   "[시연 수정] 서버로 전송할 demoItems:\n" +
      //     JSON.stringify(submitData.demoItems, null, 2)
      // );

      const response = await updateDemoMutation.mutateAsync({
        id: demo.id,
        data: finalSubmitData,
      });

      if (response.success) {
        // ✅ 캐시 동기화: 상세/목록 쿼리 invalidate
        await queryClient.invalidateQueries({ queryKey: ["demo", demo.id] });
        await queryClient.invalidateQueries({
          queryKey: ["demos", "team", demo.warehouse.teamId],
        });
        // alert 이후에 페이지 이동/모달 닫기
        onSuccess();
        onClose();
        // 파일 처리
        try {
          // 삭제할 파일들 처리
          if (filesToDelete.length > 0) {
            setIsFileUploading(true);
            for (const fileId of filesToDelete) {
              await deleteDemoFile(demo.id, fileId);
            }
          }

          // 새로 업로드할 파일들 처리
          if (fileUpload.files.length > 0) {
            setIsFileUploading(true);
            await handleFileUpload(demo.id);
          }

          toast.success("시연 기록이 수정되었습니다!");
        } catch (fileError) {
          console.error("파일 처리 중 오류:", fileError);

          let fileErrorMessage =
            "시연은 수정되었으나 파일 처리 중 오류가 발생했습니다.";

          if (fileError instanceof Error) {
            if (fileError.message.includes("크기")) {
              fileErrorMessage =
                "파일 크기가 너무 큽니다. 50MB 이하의 파일만 업로드 가능합니다.";
            } else if (fileError.message.includes("형식")) {
              fileErrorMessage = "지원하지 않는 파일 형식입니다.";
            } else if (fileError.message.includes("권한")) {
              fileErrorMessage = "파일 업로드 권한이 없습니다.";
            } else if (fileError.message.includes("네트워크")) {
              fileErrorMessage = "네트워크 연결을 확인해주세요.";
            } else if (fileError.message.includes("서버")) {
              fileErrorMessage =
                "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            } else if (fileError.message.includes("저장공간")) {
              fileErrorMessage =
                "서버 저장공간이 부족합니다. 관리자에게 문의하세요.";
            } else {
              fileErrorMessage = `파일 처리 중 오류: ${fileError.message}`;
            }
          }

          toast.error(fileErrorMessage);
        }
      } else {
        // 구체적인 에러 메시지 처리
        let errorMessage = "시연 기록 수정에 실패했습니다.";

        if (response.message) {
          if (response.message.includes("승인된 시연")) {
            errorMessage = "승인된 시연은 수정할 수 없습니다.";
          } else if (response.message.includes("권한")) {
            errorMessage = "시연을 수정할 권한이 없습니다.";
          } else if (response.message.includes("필수")) {
            errorMessage =
              "필수 정보가 누락되었습니다. 모든 필수 항목을 입력해주세요.";
          } else if (response.message.includes("존재하지 않")) {
            errorMessage =
              "시연 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.";
          } else if (response.message.includes("동시")) {
            errorMessage =
              "다른 사용자가 시연을 수정 중입니다. 잠시 후 다시 시도해주세요.";
          } else if (response.message.includes("재고")) {
            errorMessage =
              "선택한 아이템의 재고가 부족합니다. 수량을 조정해주세요.";
          } else {
            errorMessage = response.message;
          }
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("시연 기록 수정 중 오류:", error);

      // 네트워크 에러 등 구체적인 에러 처리
      let errorMessage = "시연 기록 수정 중 오류가 발생했습니다.";

      if (error instanceof Error) {
        if (error.message.includes("Network")) {
          errorMessage = "네트워크 연결을 확인해주세요.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "요청 시간이 초과되었습니다. 다시 시도해주세요.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsFileUploading(false);
    }
  };

  // 삭제 핸들러
  const handleDeleteDemo = async () => {
    if (!demo) return;

    if (
      !confirm(
        `시연 신청을 삭제하시겠습니까?\n\n시연 제목: ${demo.demoTitle}\n신청자: ${demo.requester}\n상태: ${demo.demoStatus}`
      )
    ) {
      return;
    }

    try {
      await deleteDemoMutation.mutateAsync(demo.id);
      toast.success("시연 신청이 삭제되었습니다.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("시연 신청 삭제에 실패했습니다.");
      console.error("시연 삭제 오류:", error);
    }
  };

  if (!isOpen || !demo) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            시연 기록 수정
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-gray-600">시연 데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          /* 폼 */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 시연 창고 선택 */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                시연 창고 선택
              </h2>

              {availableWarehouses.length > 0 ? (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {demoWarehouses.length > 0 ? "시연 창고" : "창고"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        warehouseId: Number(e.target.value),
                      }))
                    }
                    className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {availableWarehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.warehouseName}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {demoWarehouses.length > 0
                      ? "현재 팀에서 사용 가능한 시연 창고가 자동으로 선택됩니다."
                      : "시연 창고가 없어 모든 창고 중 첫 번째 창고가 자동으로 선택됩니다."}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ 현재 팀에 사용 가능한 창고가 없습니다. 관리자에게
                    문의하세요.
                  </p>
                </div>
              )}
            </Card>

            {/* 신청자 정보 */}
            <Card className="p-6">
              <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
                <User className="mr-2 w-5 h-5" />
                신청자 정보
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    신청자
                  </label>
                  <Input
                    type="text"
                    name="requester"
                    value={demo.requester || ""}
                    placeholder="신청자명"
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    사내 담당자 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="text"
                      name="handler"
                      value={formData.handler}
                      onChange={handleInputChange}
                      placeholder={
                        isHandlerSelf
                          ? "사내 담당자명"
                          : "사내 담당자명을 입력하세요"
                      }
                      disabled={isHandlerSelf}
                      className={
                        isHandlerSelf ? "flex-1 bg-gray-100" : "flex-1"
                      }
                      required
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isHandlerSelf"
                        checked={isHandlerSelf}
                        onChange={(e) => setIsHandlerSelf(e.target.checked)}
                        className="mr-2 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="isHandlerSelf"
                        className="text-sm text-gray-700 whitespace-nowrap"
                      >
                        본인
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 시연 기본 정보 */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                시연/행사 기본 정보
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    시연/행사 명 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="demoTitle"
                    value={formData.demoTitle}
                    onChange={handleInputChange}
                    placeholder="시연 제목을 입력하세요"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      국내/해외 시연 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="demoNationType"
                      value={formData.demoNationType}
                      onChange={handleInputChange}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="국내">국내 시연</option>
                      <option value="해외">해외 시연</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      결제 유형 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="demoPaymentType"
                      value={formData.demoPaymentType}
                      onChange={handleInputChange}
                      className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">선택해주세요</option>
                      <option value="무료">무료</option>
                      <option value="유료">유료</option>
                    </select>
                  </div>
                </div>

                {formData.demoPaymentType === "유료" && (
                  <div className="space-y-4">
                    <h4 className="pb-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                      결제 정보
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          시연 비용{" "}
                          <span className="text-xs text-red-500">
                            * VAT 포함
                          </span>
                        </label>
                        <Input
                          type="text"
                          name="demoPrice"
                          value={demoPriceDisplay}
                          onChange={handleInputChange}
                          placeholder="시연 비용을 입력하세요 (예: 1,000,000)"
                          min="0"
                        />
                      </div>

                      <div>
                        <DatePicker
                          label="결제 예정일"
                          date={formData.demoPaymentDate}
                          onDateChange={(date) =>
                            setFormData((prev) => ({
                              ...prev,
                              demoPaymentDate: date,
                            }))
                          }
                          placeholder="결제 예정일을 선택하세요"
                          helperText="시연 비용 결제 예정일입니다"
                          minDate={getTodayString()}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 시연기관 담당자 정보 */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                시연기관 담당자 정보
              </h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    시연기관 담당자 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="demoManager"
                    value={formData.demoManager}
                    onChange={handleInputChange}
                    placeholder="시연기관 담당자명을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    시연기관 담당자 연락처{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="demoManagerPhone"
                    value={formData.demoManagerPhone}
                    onChange={handleInputChange}
                    placeholder="시연기관 담당자 연락처를 입력하세요"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* 시연 일정 */}
            <Card className="p-6">
              <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-800">
                <Calendar className="mr-2 w-5 h-5" />
                시연 일정 및 장소
              </h2>

              {/* 시연 시작 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  물품 출고 일정
                </h3>
                <div className="space-y-6">
                  <div>
                    <DateTimePicker
                      label="물품 출고 일정"
                      date={formData.demoStartDate}
                      time={formData.demoStartTime}
                      onDateChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          demoStartDate: date,
                        }))
                      }
                      onTimeChange={(time) =>
                        setFormData((prev) => ({
                          ...prev,
                          demoStartTime:
                            time && time.trim() !== ""
                              ? convertToUTC9(time)
                              : time,
                        }))
                      }
                      placeholder="물품 상차 일자와 시간을 선택하세요"
                      helperText="물품을 창고에서 상차하는 시간입니다"
                      minDate={getTodayString()}
                      businessHours={{ start: "00:00", end: "23:30" }}
                    />
                  </div>

                  <div>
                    <DeliveryMethodSelector
                      label="배송 방법"
                      value={formData.demoStartDeliveryMethod}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          demoStartDeliveryMethod: value,
                        }))
                      }
                      type="delivery"
                      placeholder="상차 시 배송 방법을 선택하세요"
                      helperText="시연품을 시연품 배송장소로 운송하는 방법입니다"
                    />
                  </div>
                </div>
              </div>

              {/* 시연품 배송장소 */}
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-medium text-gray-700">
                  시연품 배송장소
                </h3>
                <AddressSection
                  address={formData.demoAddress || ""}
                  detailAddress=""
                  isAddressOpen={isAddressOpen}
                  onChange={handleInputChange}
                  onAddressChange={handleAddressChange}
                  onToggleAddressModal={handleToggleAddressModal}
                  onCloseAddressModal={handleCloseAddressModal}
                  focusRingColor="blue"
                  label="시연품 배송장소"
                />
              </div>

              {/* 시연 종료 */}
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-medium text-gray-700">
                  물품 하차 일정
                </h3>
                <div className="space-y-6">
                  <div>
                    <DateTimePicker
                      label="물품 하차 일정"
                      date={formData.demoEndDate}
                      time={formData.demoEndTime}
                      onDateChange={(date) =>
                        setFormData((prev) => ({ ...prev, demoEndDate: date }))
                      }
                      onTimeChange={(time) =>
                        setFormData((prev) => ({
                          ...prev,
                          demoEndTime:
                            time && time.trim() !== ""
                              ? convertToUTC9(time)
                              : time,
                        }))
                      }
                      placeholder="물품 하차 일자와 시간을 선택하세요"
                      helperText="물품을 창고로 하차하는 시간입니다"
                      minDate={formData.demoStartDate || getTodayString()}
                      businessHours={{ start: "00:00", end: "23:30" }}
                    />
                  </div>

                  <div>
                    <DeliveryMethodSelector
                      label="회수 방법"
                      value={formData.demoEndDeliveryMethod}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          demoEndDeliveryMethod: value,
                        }))
                      }
                      type="pickup"
                      placeholder="회수 시 운송 방법을 선택하세요"
                      helperText="시연품을 창고로 반입하는 방법입니다"
                    />
                  </div>
                </div>
              </div>

              {/* 이벤트 날짜 (선택 사항) */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  이벤트 일정 (선택 사항)
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-gray-600">
                    💡 시연품 배송 일정과 별도로 <strong>실제 이벤트 개최 기간</strong>을 기록할 수 있습니다.
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <DateTimePicker
                      label="이벤트 시작 일시"
                      date={formData.eventStartDate || ""}
                      time={formData.eventStartTime || ""}
                      onDateChange={(date) =>
                        setFormData((prev) => ({ ...prev, eventStartDate: date }))
                      }
                      onTimeChange={(time) =>
                        setFormData((prev) => ({ ...prev, eventStartTime: time }))
                      }
                      placeholder="이벤트 시작 날짜와 시간을 선택하세요"
                      helperText="실제 이벤트가 시작되는 일시"
                      businessHours={{ start: "00:00", end: "23:30" }}
                    />
                  </div>
                  <div>
                    <DateTimePicker
                      label="이벤트 종료 일시"
                      date={formData.eventEndDate || ""}
                      time={formData.eventEndTime || ""}
                      onDateChange={(date) =>
                        setFormData((prev) => ({ ...prev, eventEndDate: date }))
                      }
                      onTimeChange={(time) =>
                        setFormData((prev) => ({ ...prev, eventEndTime: time }))
                      }
                      placeholder="이벤트 종료 날짜와 시간을 선택하세요"
                      helperText="실제 이벤트가 종료되는 일시"
                      minDate={formData.eventStartDate || undefined}
                      businessHours={{ start: "00:00", end: "23:30" }}
                    />
                  </div>
                </div>
              </div>

              {/* 파일 첨부 */}
              <div className="mt-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  첨부파일(견적서 등)
                </label>
                <div className="mb-2 text-xs text-amber-600">
                  * 파일 크기는 최대 50MB까지 업로드 가능합니다.
                </div>
                <div className="mb-3 text-xs text-gray-500">
                  * 시연 관련 자료나 참고 문서를 첨부해주세요.
                </div>
                <div
                  onClick={() => fileUpload.selectedFiles.current?.click()}
                  onDragOver={fileUpload.handleDragOver}
                  onDragLeave={fileUpload.handleDragLeave}
                  onDrop={fileUpload.handleDrop}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                    fileUpload.isDragOver
                      ? "bg-blue-50 border-blue-500"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Paperclip className="mb-2 w-8 h-8 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {fileUpload.isDragOver
                        ? "파일을 여기에 놓으세요"
                        : "클릭하여 파일 선택 또는 파일을 여기로 드래그"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, 이미지, 문서 파일 등
                    </p>
                  </div>
                </div>
                <input
                  ref={fileUpload.selectedFiles}
                  type="file"
                  hidden
                  multiple
                  onChange={fileUpload.handleFileSelection}
                />

                {/* 업로드된 파일 목록 */}
                <div className="p-3 mt-4 bg-gray-50 rounded-lg">
                  <div className="mb-2 text-sm font-medium text-gray-700">
                    업로드된 파일
                  </div>
                  <div className="space-y-1">
                    {fileUpload.files.length === 0 ? (
                      <div className="text-sm text-gray-400">
                        업로드 항목이 없습니다.
                      </div>
                    ) : (
                      fileUpload.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-white rounded border"
                        >
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-sm truncate"
                              title={getDisplayFileName(file.name)}
                            >
                              {getDisplayFileName(file.name)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => fileUpload.handleRemoveFile(index)}
                            className="p-1 text-red-600 transition-colors hover:text-red-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* 기존 파일 목록 */}
              {existingFiles.length > 0 && (
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    기존 첨부 파일
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <ul className="space-y-2">
                      {existingFiles.map((file) => (
                        <li
                          key={file.id}
                          className="flex justify-between items-center p-2 bg-white rounded border"
                        >
                          <div className="flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-gray-500"
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
                            <span className="text-sm text-gray-700">
                              {getDisplayFileName(file.fileName)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(file)}
                              className="px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                            >
                              다운로드
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingFile(file.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="파일 삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 삭제 예정 파일 목록 */}
              {filesToDelete.length > 0 && (
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    삭제 예정 파일 (취소 가능)
                  </label>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <ul className="space-y-2">
                      {filesToDelete.map((fileId) => {
                        const originalFile = demo.files.find(
                          (file) => file.id === fileId
                        );
                        if (!originalFile) return null;
                        return (
                          <li
                            key={fileId}
                            className="flex justify-between items-center p-2 bg-yellow-100 rounded border border-yellow-300"
                          >
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-yellow-800">
                                {originalFile.fileName}
                              </span>
                              <span className="text-xs text-yellow-600">
                                (삭제 예정)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCancelDeleteFile(fileId)}
                              className="px-2 py-1 text-xs text-yellow-700 bg-yellow-200 rounded hover:bg-yellow-300"
                            >
                              삭제 취소
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* 특이사항 */}
              <div className="mt-6">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  특이사항
                </label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  placeholder="시연과 관련된 특이사항이나 요청사항을 입력하세요"
                  rows={3}
                  className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </Card>

            {/* 시연 아이템 선택 */}
            <DemoItemSelector
              selectedItems={selectedItems}
              onItemsChange={setSelectedItems}
              warehouseId={formData.warehouseId || 0}
            />

            {/* 버튼 */}
            <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2"
              >
                취소
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteDemo}
                disabled={deleteDemoMutation.isPending}
                className="flex items-center px-4 py-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                {deleteDemoMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 w-4 h-4" />
                    삭제
                  </>
                )}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isFileUploading}
                className="flex items-center px-4 py-2"
              >
                {isSubmitting || isFileUploading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    {isFileUploading ? "파일 처리 중..." : "수정 중..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 w-4 h-4" />
                    수정 완료
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DemoEditModal;
