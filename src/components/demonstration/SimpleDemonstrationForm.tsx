"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { DeliveryMethodSelector } from "@/components/ui/delivery-method-selector";
import { Send, Calendar, User, Paperclip, X } from "lucide-react";
import DemoItemSelector, { SelectedDemoItem } from "./DemoItemSelector";
import { toast } from "react-hot-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { getTodayString, formatDateToLocalString } from "@/utils/dateUtils";
import AddressSection from "@/components/common/AddressSection";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import { Address } from "react-daum-postcode";
import { useCreateDemo } from "@/hooks/(useDemo)/useDemoMutations";
import { CreateDemoRequest, DemonstrationFormData } from "@/types/demo/demo";
import { uploadMultipleDemoFileById, getDemoByTeamId } from "@/api/demo-api";
import { getDisplayFileName, formatFileSize } from "@/utils/fileUtils";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

const SimpleDemonstrationForm: React.FC = () => {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { team: currentTeam } = useCurrentTeam();
  const { warehouses } = useWarehouseItems();
  const [selectedItems, setSelectedItems] = useState<SelectedDemoItem[]>([]);
  const [isHandlerSelf, setIsHandlerSelf] = useState(false);

  // 시연 생성 훅 사용
  const createDemoMutation = useCreateDemo();

  // 파일 업로드 처리 함수
  const handleFileUpload = async (demoId: number): Promise<boolean> => {
    try {
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
        toast.error("50MB를 초과하는 파일이 있어 업로드할 수 없습니다");
        return false;
      }

      // uploadMultipleDemoFileById API 호출
      toast.loading("파일 업로드 중...");
      const uploadResponse = await uploadMultipleDemoFileById(
        demoId,
        fileUpload.getEncodedFiles()
      );
      toast.dismiss();

      if (uploadResponse.success) {
        console.log("파일 업로드 성공:", uploadResponse.data);
        const uploadedFileNames = uploadResponse.data
          ?.map((file) => file.fileName)
          .join(", ");
        toast.success(
          `시연 신청 및 파일 '${uploadedFileNames}' 업로드가 완료되었습니다`
        );
        return true;
      } else {
        console.error("파일 업로드 실패:", uploadResponse.error);
        toast.error(
          `시연 신청은 성공했으나 파일 업로드에 실패했습니다: ${
            uploadResponse.error || "알 수 없는 오류"
          }`
        );
        return false;
      }
    } catch (uploadApiError) {
      console.error("파일 업로드 API 호출 중 오류:", uploadApiError);
      toast.error("파일 업로드 과정에서 오류가 발생했습니다");
      return false;
    }
  };

  const [formData, setFormData] = useState<DemonstrationFormData>({
    requester: user?.name || "",
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
    demoCurrencyUnit: "KRW",
    demoStartDate: "",
    demoStartTime: "",
    demoStartDeliveryMethod: "",
    demoEndDate: "",
    demoEndTime: "",
    demoEndDeliveryMethod: "",
    userId: user?.id || 0,
    warehouseId: 0,
    address: "",
    detailAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 로딩 상태 관리
  const [loadingState, setLoadingState] = useState({
    isVisible: false,
    title: "처리 중...",
    message: "잠시만 기다려주세요.",
    progress: 0,
  });

  // 주소 검색 훅 사용
  const {
    isAddressOpen,
    handleAddressChange: handleAddressChangeFromHook,
    handleToggleAddressModal,
    handleCloseAddressModal,
  } = useAddressSearch();

  // 파일 업로드 훅 사용
  const fileUpload = useFileUpload();

  // 시연 창고 필터링 및 자동 선택
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

  // 현재 사용자 정보로 신청자 설정
  React.useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({
        ...prev,
        requester: user.name,
        userId: user.id,
      }));
    }
  }, [user]);

  // 창고 자동 선택 (시연 창고 우선, 없으면 첫 번째 창고)
  React.useEffect(() => {
    if (availableWarehouses.length > 0 && formData.warehouseId === 0) {
      setFormData((prev) => ({
        ...prev,
        warehouseId: availableWarehouses[0].id,
      }));
    }
  }, [availableWarehouses, formData.warehouseId]);

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

  // 숫자를 3자리씩 끊어서 표시하는 함수
  const formatNumber = (value: string): string => {
    // 숫자가 아닌 문자 제거
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue === "") return "";

    // 3자리씩 끊어서 쉼표 추가
    return parseInt(numericValue).toLocaleString();
  };

  // 시연 비용 표시용 상태 추가
  const [demoPriceDisplay, setDemoPriceDisplay] = useState<string>("");

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
      address: data.address,
      demoAddress: fullAddress,
    }));
    handleAddressChangeFromHook(data, setFormData);
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const requiredFields = [
      { field: formData.warehouseId, name: "시연 창고" },
      { field: formData.demoTitle, name: "시연/행사 명" },
      { field: formData.demoNationType, name: "국내/해외 시연" },
      { field: formData.demoPaymentType, name: "결제 유형" },
      { field: formData.demoManager, name: "현지 담당자" },
      { field: formData.demoManagerPhone, name: "현지 담당자 연락처" },
      { field: formData.demoStartDate, name: "물품 상차 일자" },
      { field: formData.demoStartTime, name: "물품 상차 시간" },
      { field: formData.demoEndDate, name: "물품 하차일" },
      { field: formData.demoEndTime, name: "물품 하차 시간" },
      { field: formData.demoAddress || formData.address, name: "시연 장소" },
    ];

    for (const { field, name } of requiredFields) {
      if (!field || !field.toString().trim()) {
        toast.error(`${name}을 입력해주세요.`);
        return false;
      }
    }

    // 날짜/시간 유효성 검사 (로컬 시간대 기준)
    if (formData.demoStartDate && formData.demoEndDate) {
      // 로컬 시간대에서 안전하게 Date 객체 생성
      const createLocalDate = (dateStr: string, timeStr: string) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hour, minute] = (timeStr || "00:00").split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute);
      };

      const startDate = createLocalDate(formData.demoStartDate, formData.demoStartTime || "00:00");
      const endDate = createLocalDate(formData.demoEndDate, formData.demoEndTime || "00:00");

      if (endDate < startDate) {
        toast.error("물품 하차 일정은 물품 상차 일정과 같거나 이후여야 합니다.");
        return false;
      }
    }

    if (selectedItems.length === 0) {
      toast.error("시연 아이템을 선택해주세요.");
      return false;
    }

    return true;
  };

  // 테스트 데이터 자동 채우기 함수 (팀 ID가 1인 경우)
  const fillTestData = useCallback(() => {
    if (currentTeam?.id !== 1) return; // 팀 ID가 1이 아니면 실행하지 않음

    console.log("[테스트 모드] 테스트 데이터로 폼을 자동으로 채웁니다...");

    // 오늘 날짜 기준으로 계산
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // 통합 날짜 유틸리티 사용
    const formatDate = (date: Date) => {
      return formatDateToLocalString(date);
    };

    setFormData({
      requester: user?.name || "테스트 신청자",
      handler: "김개발",
      demoManager: "박시연",
      demoManagerPhone: "010-1234-5678",
      memo: "🧪 이것은 테스트 팀의 테스트 데이터입니다.\n\n- 자동화된 테스트 시연 신청\n- 모든 필드가 테스트용 더미 데이터로 채워짐\n- 실제 시연이 아닌 개발/테스트 목적\n\n※ 주의: 실제 운영 환경에서는 이 기능이 비활성화됩니다.",
      demoTitle: "🧪 [테스트] 자동화 제품 시연 데모",
      demoNationType: "국내",
      demoAddress: "서울특별시 강남구 테헤란로 123 테스트빌딩",
      demoPaymentType: "유료",
      demoPrice: 1500000,
      demoPaymentDate: formatDate(nextWeek),
      demoCurrencyUnit: "KRW",
      demoStartDate: formatDate(tomorrow),
      demoStartTime: "09:00",
      demoStartDeliveryMethod: "용차",
      demoEndDate: formatDate(dayAfterTomorrow),
      demoEndTime: "18:00",
      demoEndDeliveryMethod: "용차",
      userId: user?.id || 0,
      warehouseId: formData.warehouseId || 0,
      address: "서울특별시 강남구 테헤란로 123",
      detailAddress: "테스트빌딩 5층 501호",
    });

    // 가격 표시도 업데이트
    setDemoPriceDisplay("1,500,000");

    // 사내 담당자 체크박스 해제 (다른 사람으로 설정)
    setIsHandlerSelf(false);

    // 테스트용 시연 아이템 자동 선택은 비활성화
    // (아이템은 수동으로 선택하도록 함)

    // 테스트 토스트 메시지
    toast.success("🧪 테스트 데이터가 자동으로 채워졌습니다!", {
      duration: 4000,
      icon: "🧪",
    });

    console.log("[테스트 모드] 폼 데이터 자동 입력 완료 (아이템 제외)");
  }, [currentTeam?.id, user?.name, user?.id, formData.warehouseId]);

  // 테스트 데이터 자동 채우기 (팀 ID가 1인 경우, 2초 후 실행)
  useEffect(() => {
    if (currentTeam?.id === 1) {
      console.log("[테스트 모드] 2초 후 테스트 데이터를 자동으로 채웁니다...");
      const timer = setTimeout(() => {
        fillTestData();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentTeam?.id, fillTestData]); // currentTeam이나 fillTestData가 변경될 때만 재실행

  // 타임아웃 후 시연 생성 확인 함수
  const checkDemoCreationAfterTimeout = async () => {
    try {
      // 3초 후에 시연 목록을 다시 조회해서 최근 생성된 시연이 있는지 확인
      setTimeout(async () => {
        try {
          if (!currentTeam?.id) return;

          // 최근 시연 목록 조회 (최근 생성된 것 확인)
          const response = await getDemoByTeamId(currentTeam.id);
          if (response.success && response.data?.data) {
            // 방금 입력한 시연 제목과 일치하는 최근 시연이 있는지 확인
            const recentDemo = response.data.data.find(
              (demo: {
                demoTitle: string;
                requester: string;
                createdAt: string;
              }) =>
                demo.demoTitle === formData.demoTitle &&
                demo.requester === formData.requester &&
                // 최근 1분 내에 생성된 것만 확인
                new Date(demo.createdAt).getTime() > Date.now() - 60000
            );

            if (recentDemo) {
              // 지연된 성공 상태
              setLoadingState({
                isVisible: true,
                title: "시연 생성 확인 완료!",
                message: "시연이 성공적으로 생성되었습니다.",
                progress: 100,
              });

              toast.success("시연이 성공적으로 생성되었습니다!", {
                duration: 5000,
              });

              // 잠시 후 로딩 상태 숨기기
              setTimeout(() => {
                setLoadingState({
                  isVisible: false,
                  title: "",
                  message: "",
                  progress: 0,
                });
              }, 1500);

              // 폼 초기화 및 페이지 이동
              setFormData({
                requester: user?.name || "",
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
                demoCurrencyUnit: "KRW",
                demoStartDate: "",
                demoStartTime: "",
                demoStartDeliveryMethod: "",
                demoEndDate: "",
                demoEndTime: "",
                demoEndDeliveryMethod: "",
                userId: user?.id || 0,
                warehouseId: 0,
                address: "",
                detailAddress: "",
              });
              setSelectedItems([]);
              fileUpload.resetFiles();
              setDemoPriceDisplay("");

              router.push("/demonstration-record");
            } else {
              setLoadingState({
                isVisible: false,
                title: "",
                message: "",
                progress: 0,
              });
              toast.error(
                "시연 생성을 확인할 수 없습니다. 시연 기록을 확인해보세요.",
                {
                  duration: 6000,
                }
              );
            }
          }
        } catch (checkError) {
          console.error("시연 생성 확인 오류:", checkError);
          setLoadingState({
            isVisible: false,
            title: "",
            message: "",
            progress: 0,
          });
          toast.error(
            "시연 생성 확인 중 오류가 발생했습니다. 시연 기록을 직접 확인해보세요.",
            {
              duration: 6000,
            }
          );
        }
      }, 3000);
    } catch (error) {
      console.error("타임아웃 후 확인 로직 오류:", error);
    }
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoadingState({
      isVisible: true,
      title: "시연 신청서 검증 중...",
      message: "입력하신 정보를 확인하고 있습니다.",
      progress: 10,
    });

    try {
      // 주소 정보를 demoAddress에 결합
      const fullAddress = formData.detailAddress
        ? `${formData.address} ${formData.detailAddress}`
        : formData.address;

      const submitData: CreateDemoRequest = {
        requester: formData.requester,
        handler: formData.handler,
        demoManager: formData.demoManager,
        demoManagerPhone: formData.demoManagerPhone,
        memo: formData.memo,
        demoTitle: formData.demoTitle,
        demoNationType: formData.demoNationType,
        demoAddress: fullAddress,
        demoPaymentType: formData.demoPaymentType,
        demoPrice: formData.demoPrice,
        demoPaymentDate:
          formData.demoPaymentDate && formData.demoPaymentDate.trim() !== ""
            ? formData.demoPaymentDate
            : undefined,
        demoStartDate: formData.demoStartDate,
        demoStartTime: formData.demoStartTime,
        demoStartDeliveryMethod: formData.demoStartDeliveryMethod,
        demoEndDate: formData.demoEndDate,
        demoEndTime: formData.demoEndTime,
        demoEndDeliveryMethod: formData.demoEndDeliveryMethod,
        userId: user?.id || 0,
        warehouseId: formData.warehouseId || 0,
        demoItems: selectedItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          memo: item.memo,
        })),
      };

      // 날짜 필드 디버깅 로그
      console.log("[디버깅] 날짜 필드 상세 정보:", {
        demoPaymentDate: {
          value: formData.demoPaymentDate,
          type: typeof formData.demoPaymentDate,
          length: formData.demoPaymentDate?.length,
          isEmpty:
            !formData.demoPaymentDate || formData.demoPaymentDate.trim() === "",
        },
      });

      console.log("selectedItems:", selectedItems);
      console.log("시연 신청 데이터:", submitData);
      console.log("전송되는 데이터 JSON:", JSON.stringify(submitData, null, 2));

      // 서버로 전송 중
      setLoadingState({
        isVisible: true,
        title: "시연 신청서 전송 중...",
        message: "서버에 데이터를 전송하고 있습니다. 잠시만 기다려주세요.",
        progress: 30,
      });

      // 실제 API 호출
      const response = await createDemoMutation.mutateAsync(submitData);

      if (response.success) {
        // 시연 생성 성공
        setLoadingState({
          isVisible: true,
          title: "시연 신청이 완료되었습니다!",
          message: "시연 정보가 성공적으로 저장되었습니다.",
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
            const demoId = (response.data as { id: number })?.id;

            if (!demoId) {
              console.error("시연 ID가 없습니다:", response.data);
              toast.error(
                "시연 신청은 성공했으나 시연 ID를 찾을 수 없어 파일 업로드를 진행할 수 없습니다"
              );
            } else {
              // demoId가 string 타입일 가능성이 있으므로 명시적으로 숫자 변환
              const demoIdAsNumber =
                typeof demoId === "string" ? parseInt(demoId, 10) : demoId;

              if (isNaN(demoIdAsNumber)) {
                console.error("시연 ID가 유효한 숫자가 아닙니다:", demoId);
                toast.error(
                  "시연 신청은 성공했으나 유효하지 않은 시연 ID로 인해 파일 업로드를 진행할 수 없습니다"
                );
                return;
              }

              // 파일 업로드 처리
              await handleFileUpload(demoIdAsNumber);
            }
          } catch (uploadError) {
            console.error("파일 업로드 전체 과정 중 오류:", uploadError);
            toast.error(
              "시연 신청은 성공했으나 파일 업로드 중 오류가 발생했습니다"
            );
          }
        } else {
          toast.success("시연 신청이 완료되었습니다!");
        }

        // 최종 완료 상태
        setLoadingState({
          isVisible: true,
          title: "완료!",
          message: "시연 신청이 성공적으로 처리되었습니다.",
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
        }, 1500);

        // 폼 초기화 (성공 시에만)
        setFormData({
          requester: user?.name || "",
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
          demoCurrencyUnit: "KRW",
          demoStartDate: "",
          demoStartTime: "",
          demoStartDeliveryMethod: "",
          demoEndDate: "",
          demoEndTime: "",
          demoEndDeliveryMethod: "",
          userId: user?.id || 0,
          warehouseId: 0,
          address: "",
          detailAddress: "",
        });
        setSelectedItems([]);
        fileUpload.resetFiles();
        setDemoPriceDisplay("");

        // 시연 기록 페이지로 이동
        router.push("/demonstration-record");
      } else {
        setLoadingState({
          isVisible: false,
          title: "",
          message: "",
          progress: 0,
        });
        toast.error(response.message || "시연 신청에 실패했습니다.");
      }
    } catch (error: unknown) {
      console.error("시연 신청 오류:", error);

      // 에러 타입별 구체적인 메시지
      if (error instanceof Error) {
        if (error.message?.includes("timeout")) {
          // 타임아웃 특별 상태
          setLoadingState({
            isVisible: true,
            title: "처리 시간 초과",
            message:
              "서버 응답이 지연되고 있습니다. 시연 생성 여부를 확인하고 있습니다...",
            progress: 85,
          });

          // 타임아웃 발생 시 시연이 실제로 생성되었는지 확인
          checkDemoCreationAfterTimeout();
          toast.error(
            "처리 시간이 길어지고 있습니다. 시연이 생성되었는지 확인 중...",
            {
              duration: 8000,
            }
          );
        } else if (error.message?.includes("Network Error")) {
          setLoadingState({
            isVisible: false,
            title: "",
            message: "",
            progress: 0,
          });
          toast.error("네트워크 연결을 확인해주세요.", {
            duration: 6000,
          });
        } else {
          setLoadingState({
            isVisible: false,
            title: "",
            message: "",
            progress: 0,
          });
          toast.error(
            "시연 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            {
              duration: 6000,
            }
          );
        }
      } else {
        setLoadingState({
          isVisible: false,
          title: "",
          message: "",
          progress: 0,
        });
        toast.error(
          "시연 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          {
            duration: 6000,
          }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingOverlay
        isVisible={loadingState.isVisible}
        title={loadingState.title}
        message={loadingState.message}
        progress={loadingState.progress}
      />
      <div className="p-6 mx-auto space-y-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            제품 시연 신청
          </h1>
          <p className="text-gray-600">
            제품 시연을 위한 상세 정보를 입력해주세요.
          </p>

          {/* 테스트 모드 표시 */}
          {currentTeam?.id === 1 && (
            <div className="p-3 mx-auto mt-4 max-w-md bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
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
                  className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-200 rounded-md transition-colors hover:bg-yellow-300"
                >
                  지금 채우기
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                  value={formData.requester}
                  onChange={handleInputChange}
                  placeholder="신청자명이 자동으로 설정됩니다"
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
                    className={isHandlerSelf ? "flex-1 bg-gray-100" : "flex-1"}
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        화폐 단위
                      </label>
                      <select
                        name="demoCurrencyUnit"
                        value={formData.demoCurrencyUnit}
                        onChange={handleInputChange}
                        className="p-2 w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="KRW">KRW (원)</option>
                        <option value="USD">USD (달러)</option>
                        <option value="EUR">EUR (유로)</option>
                        <option value="JPY">JPY (엔)</option>
                        <option value="CNY">CNY (위안)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        시연 비용{" "}
                        <span className="text-xs text-red-500">* VAT 포함</span>
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
                  시연기관 담당자 연락처 <span className="text-red-500">*</span>
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
                물품 상차 일정
              </h3>
              <div className="space-y-6">
                <div>
                  <DateTimePicker
                    label="물품 상차 일정"
                    date={formData.demoStartDate}
                    time={formData.demoStartTime}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, demoStartDate: date }))
                    }
                    onTimeChange={(time) =>
                      setFormData((prev) => ({ ...prev, demoStartTime: time }))
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
                    helperText="시연품을 시연 장소로 운송하는 방법입니다"
                  />
                </div>
              </div>
            </div>

            {/* 시연 장소 */}
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-medium text-gray-700">
                시연 장소
              </h3>
              <AddressSection
                address={formData.address}
                detailAddress={formData.detailAddress}
                isAddressOpen={isAddressOpen}
                onChange={handleInputChange}
                onAddressChange={handleAddressChange}
                onToggleAddressModal={handleToggleAddressModal}
                onCloseAddressModal={handleCloseAddressModal}
                focusRingColor="blue"
                label="시연 장소"
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
                      setFormData((prev) => ({ ...prev, demoEndTime: time }))
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
            warehouseId={formData.warehouseId}
          />

          {/* 제출 버튼 */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-8 py-3 space-x-2 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-b-2 border-white animate-spin" />
                  <span>시연 신청 처리 중... (최대 1-2분 소요)</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>시연 신청</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SimpleDemonstrationForm;
