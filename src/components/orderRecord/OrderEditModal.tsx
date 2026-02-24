"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import { Paperclip, Plus, Minus, X, AlertCircle } from "lucide-react";
import { LoadingInline } from "@/components/ui/Loading";
import { useOrder } from "@/hooks/useOrder";
import { useSuppliers } from "@/hooks/useSupplier";
import { toast } from "react-hot-toast";
import { OrderStatus } from "@/types/(order)/order";
import { Supplier } from "@/types/supplier";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { usePackages } from "@/hooks/usePackages";
import { PackageApi } from "@/types/(item)/package";
import { authStore } from "@/store/authStore";
import { getDisplayFileName, formatFileSize } from "@/utils/fileUtils";
import { useQueryClient } from "@tanstack/react-query";
import { hasWarehouseAccess } from "@/utils/warehousePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatDateForServer } from "@/utils/dateUtils";
import { Modal } from "@/components/ui";
import { ItemSelectionModal } from "@/components/ui";
import { useWarehouseWithItems } from "@/hooks/useWarehouseWithItems";
import { Item } from "@/types/(item)/item";
import { Warehouse } from "@/types/warehouse";
import { ApiResponse } from "@/types/common";
import { uploadMultipleOrderFileById, deleteOrderFile } from "@/api/order-api";
import { OrderFile } from "@/types/(order)/order";
import { TeamItem } from "@/types/(item)/team-item";
import SelectSupplierModal from "../supplier/SelectSupplierModal";
import AddSupplierModal from "../supplier/AddSupplierModal";

interface OrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderRecord: IOrderRecord | null;
}

interface OrderItemWithDetails {
  teamItem: TeamItem;
  quantity: number;
  stockAvailable: boolean;
  stockQuantity: number;
  warehouseItemId: number;
  memo?: string;
  sellingPrice?: string; // 주문 품목 판매가 (입력은 문자열로)
  vat?: string; // 주문 품목 세금 (입력은 문자열로)
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({
  isOpen,
  onClose,
  orderRecord,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const selectedFiles = useRef<HTMLInputElement>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // 기존 파일 관리 상태
  const [existingFiles, setExistingFiles] = useState<OrderFile[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const auth = authStore((state) => state.user);
  const { user } = useCurrentUser();

  // 아이템 관련 상태 - 패키지와 개별 아이템 분리 관리
  const [packageItems, setPackageItems] = useState<OrderItemWithDetails[]>([]);
  const [individualItems, setIndividualItems] = useState<
    OrderItemWithDetails[]
  >([]);
  const [packageQuantity, setPackageQuantity] = useState(1);

  // ItemSelectionModal 상태 추가
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // SelectSupplierModal 상태 추가
  const [isSelectSupplierModalOpen, setIsSelectSupplierModalOpen] = useState(false);

  // AddSupplierModal 상태 추가
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "", // 제목 필드 추가
    manager: "",
    requester: "",
    receiver: "",
    receiverPhone: "",
    address: "",
    detailAddress: "",
    requestDate: "",
    setupDate: "",
    notes: "",
    supplierId: null as number | null,
    warehouseId: null as number | null,
    packageId: null as number | null,
    status: "" as string,
    totalPrice: "" as string, // 주문 총 판매가격
  });

  // 훅 호출
  const { useGetPackages } = usePackages();
  const { packages } = useGetPackages();
  const { useUpdateOrder } = useOrder();
  const { mutate: updateOrder } = useUpdateOrder();
  const { useGetSuppliers } = useSuppliers();
  const { suppliers: suppliersResponse } = useGetSuppliers();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { warehousesList, warehouseItems, handleWarehouseChange } =
    useWarehouseWithItems();

  // 현재 창고의 아이템들
  const currentWarehouseItems = useMemo(() => {
    if (!formData.warehouseId || !warehouseItems) return [];
    return warehouseItems[formData.warehouseId.toString()] || [];
  }, [formData.warehouseId, warehouseItems]);

  // 모든 주문 아이템 (패키지 + 개별)
  const allOrderItems = useMemo(() => {
    return [...packageItems, ...individualItems];
  }, [packageItems, individualItems]);

  // ItemSelectionModal용 orderItems 형식 변환
  const modalOrderItems = useMemo(() => {
    return allOrderItems.map((item) => ({
      ...item,
      item: { teamItem: item.teamItem },
      itemId: item.warehouseItemId,
    }));
  }, [allOrderItems]);

  // 패키지 선택 시 창고 아이템이 로드될 때까지 기다리는 useEffect
  useEffect(() => {
    if (
      formData.packageId &&
      formData.warehouseId &&
      currentWarehouseItems.length > 0
    ) {
      const selectedPackage = packages?.find(
        (pkg: PackageApi) => pkg.id === formData.packageId
      );

      if (selectedPackage && selectedPackage.packageItems) {
        // packageItems에서 itemCode 추출하여 처리
        const newPackageItems = selectedPackage.packageItems
          .filter((pkgItem) => pkgItem.deletedAt === null) // 삭제되지 않은 아이템만
          .map((pkgItem) => {
            const itemCode = pkgItem.item.teamItem.itemCode;
            const warehouseItem = currentWarehouseItems.find(
              (item: Item) => item.teamItem.itemCode === itemCode
            );

            if (!warehouseItem) {
              console.warn(
                `아이템 코드 ${itemCode}에 해당하는 창고 아이템을 찾을 수 없습니다.`
              );
              return null;
            }

            return {
              teamItem: warehouseItem.teamItem,
              quantity: packageQuantity,
              stockAvailable: warehouseItem.itemQuantity >= packageQuantity,
              stockQuantity: warehouseItem.itemQuantity,
              warehouseItemId: warehouseItem.id,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (newPackageItems.length > 0) {
          setPackageItems(newPackageItems);
          setIndividualItems([]);
        }
      }
    }
  }, [
    formData.packageId,
    formData.warehouseId,
    currentWarehouseItems,
    packages,
    packageQuantity,
  ]);

  // 주문 기록이 변경될 때 폼 데이터 초기화 - 창고 아이템 로딩 후 아이템 변환
  useEffect(() => {
    if (orderRecord) {
      // 주소 분리 (기존 주소에서 상세주소 분리)
      const addressParts = orderRecord.receiverAddress?.split(" ") || [];
      const detailAddress =
        addressParts.length > 1 ? addressParts.pop() || "" : "";
      const baseAddress = addressParts.join(" ");

      const newFormData = {
        title: orderRecord.title || "", // 제목 필드 추가
        manager: orderRecord.manager || "",
        requester: orderRecord.requester || "",
        receiver: orderRecord.receiver || "",
        receiverPhone: orderRecord.receiverPhone || "",
        address: baseAddress,
        detailAddress: detailAddress,
        requestDate: orderRecord.purchaseDate
          ? orderRecord.purchaseDate.split("T")[0]
          : "",
        setupDate: orderRecord.installationDate
          ? orderRecord.installationDate.split("T")[0]
          : "",
        notes: orderRecord.memo || "",
        supplierId: orderRecord.supplierId || null,
        warehouseId: orderRecord.warehouseId || null,
        packageId: orderRecord.packageId || null,
        status: orderRecord.status || "",
        totalPrice: orderRecord.totalPrice?.toString() || "",
      };

      setFormData(newFormData);

      // 기존 파일 초기화
      setExistingFiles(orderRecord.files || []);
      setFilesToDelete([]);
      setFiles([]);

      // 창고 아이템이 로드된 후 기존 아이템 변환
      if (orderRecord.warehouseId && warehouseItems) {
        const currentItems =
          warehouseItems[orderRecord.warehouseId.toString()] || [];

        if (orderRecord.orderItems && orderRecord.orderItems.length > 0) {
          const convertedItems = orderRecord.orderItems.map((item) => {
            const warehouseItem = currentItems.find(
              (wi: Item) =>
                wi.teamItem.itemCode === item.item?.teamItem?.itemCode
            );

            return {
              teamItem: item.item?.teamItem as TeamItem,
              quantity: item.quantity,
              stockAvailable: warehouseItem
                ? warehouseItem.itemQuantity >= item.quantity
                : false,
              stockQuantity: warehouseItem?.itemQuantity || 0,
              warehouseItemId: warehouseItem?.id || item.itemId || 0,
              memo: item.memo || "",
              sellingPrice: item.sellingPrice?.toString() || "",
              vat: item.vat?.toString() || "",
            };
          });

          // 패키지가 있는 경우 패키지 아이템으로 분리
          if (orderRecord.packageId) {
            setPackageItems(convertedItems);
            setIndividualItems([]);
            setPackageQuantity(convertedItems[0]?.quantity || 1);
          } else {
            setPackageItems([]);
            setIndividualItems(convertedItems);
            setPackageQuantity(1);
          }
        } else {
          setPackageItems([]);
          setIndividualItems([]);
          setPackageQuantity(1);
        }
      }
    }
  }, [orderRecord, warehouseItems]);

  // 창고 아이템 수동 로드 - orderRecord의 창고 ID로 아이템 로드
  useEffect(() => {
    if (
      orderRecord?.warehouseId &&
      !warehouseItems?.[orderRecord.warehouseId.toString()]
    ) {
      // handleWarehouseChange를 사용해서 창고 아이템 로드
      handleWarehouseChange(orderRecord.warehouseId).then(
        (response: ApiResponse) => {
          if (!response.success) {
            console.error("창고 아이템 로드 실패:", response.message);
          }
        }
      );
    }
  }, [orderRecord?.warehouseId, warehouseItems, handleWarehouseChange]);

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

  // 모달에서 고객 선택 핸들러 (고객 정보 자동 채우기)
  const handleSupplierSelect = useCallback((supplier: Supplier) => {
    setFormData((prev) => ({
      ...prev,
      supplierId: supplier.id,
      receiver: supplier.representativeName || supplier.supplierName || "",
      receiverPhone: supplier.supplierPhoneNumber || "",
      address: supplier.supplierAddress || "",
      detailAddress: "", // 상세주소는 사용자가 직접 입력
    }));
    setIsSelectSupplierModalOpen(false);
  }, []);

  // 고객 추가 성공 핸들러
  const handleAddSupplierSuccess = async () => {
    // 고객 목록 새로고침 (React Query가 자동으로 UI 업데이트)
    await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    toast.success("고객이 추가되었습니다");
  };

  // 레거시 데이터 감지 (고객 미입력 && 수령인 정보 있음)
  const hasLegacyData = useMemo(() => {
    return !formData.supplierId &&
           (!!formData.receiver || !!formData.receiverPhone || !!formData.address);
  }, [formData.supplierId, formData.receiver, formData.receiverPhone, formData.address]);

  // 빠른 고객 등록 핸들러 (기존 수령인 정보 활용)
  const handleQuickAddSupplier = () => {
    // 기존 정보를 기반으로 고객 추가 모달 열기 (initialData 전달)
    setIsAddSupplierModalOpen(true);
  };

  // 패키지 수량 변경 핸들러 - 패키지 아이템만 업데이트
  const handlePackageQuantityChange = useCallback(
    (increment: boolean) => {
      setPackageQuantity((prev) => {
        const newQuantity = increment ? prev + 1 : Math.max(1, prev - 1);

        // 패키지 아이템들의 수량만 업데이트 (개별 아이템은 유지)
        if (formData.packageId && packages) {
          const selectedPackage = packages.find(
            (pkg: PackageApi) => pkg.id === formData.packageId
          );
          if (selectedPackage && selectedPackage.packageItems) {
            // packageItems에서 itemCode 추출하여 처리
            const updatedPackageItems = selectedPackage.packageItems
              .filter((pkgItem) => pkgItem.deletedAt === null)
              .map((pkgItem) => {
                const itemCode = pkgItem.item.teamItem.itemCode;
                const warehouseItem = currentWarehouseItems.find(
                  (item: Item) => item.teamItem.itemCode === itemCode
                );
                if (!warehouseItem) return null;

                return {
                  teamItem: warehouseItem.teamItem,
                  quantity: newQuantity,
                  stockAvailable: warehouseItem.itemQuantity >= newQuantity,
                  stockQuantity: warehouseItem.itemQuantity,
                  warehouseItemId: warehouseItem.id,
                };
              })
              .filter(
                (item): item is NonNullable<typeof item> => item !== null
              );

            setPackageItems(updatedPackageItems);
          }
        }

        return newQuantity;
      });
    },
    [formData.packageId, packages, currentWarehouseItems]
  );

  // 패키지 선택 핸들러 - 개선된 버전
  const handlePackageSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const packageId = parseInt(e.target.value) || null;

      setFormData((prev) => ({
        ...prev,
        packageId,
      }));

      if (!packageId) {
        // 패키지 선택 해제 시 패키지 아이템들 초기화
        setPackageItems([]);
        setPackageQuantity(1);
      }
    },
    []
  );

  // 아이템 선택 핸들러 - ItemSelectionModal 사용
  const handleItemSelect = useCallback(
    (selectedItem: Item) => {
      // 패키지 아이템과 개별 아이템 모두에서 중복 체크
      const isItemExists = allOrderItems.some(
        (item) => item.warehouseItemId === selectedItem.id
      );

      if (isItemExists) {
        toast.error("이미 추가된 아이템입니다");
        return;
      }

      setIndividualItems((prev) => [
        ...prev,
        {
          teamItem: selectedItem.teamItem,
          quantity: 1,
          stockAvailable: selectedItem.itemQuantity >= 1,
          stockQuantity: selectedItem.itemQuantity,
          warehouseItemId: selectedItem.id,
        },
      ]);
    },
    [allOrderItems]
  );

  // 아이템 제거 핸들러 - 패키지 아이템도 제거 가능
  const handleRemoveItem = useCallback(
    (itemId: number, isPackageItem: boolean = false) => {
      if (isPackageItem) {
        // 패키지 아이템의 경우 패키지 아이템 목록에서 제거
        setPackageItems((prev) =>
          prev.filter((item) => item.warehouseItemId !== itemId)
        );
      } else {
        // 개별 아이템의 경우 개별 아이템 목록에서 제거
        setIndividualItems((prev) =>
          prev.filter((item) => item.warehouseItemId !== itemId)
        );
      }
    },
    []
  );

  // 아이템 수량 변경 핸들러
  const handleQuantityChange = useCallback(
    (index: number, increment: boolean, isPackageItem: boolean = false) => {
      if (isPackageItem) {
        // 패키지 아이템의 경우 패키지 수량 변경
        handlePackageQuantityChange(increment);
        return;
      }

      setIndividualItems((prev) => {
        const updated = prev.map((item, idx) => {
          if (idx === index) {
            const newQuantity = increment
              ? item.quantity + 1
              : item.quantity > 0
              ? item.quantity - 1
              : item.quantity;

            const stockItem = currentWarehouseItems.find(
              (stockItem: Item) =>
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
    },
    [currentWarehouseItems, handlePackageQuantityChange]
  );

  // 품목별 판매가 변경 핸들러
  const handleSellingPriceChange = useCallback(
    (index: number, value: string, isPackageItem: boolean = false) => {
      // 입력값 검증: 빈 문자열 또는 양의 정수만 허용
      if (value !== "" && !/^\d+$/.test(value)) {
        return; // 음수, 소수점 등 유효하지 않은 값은 무시
      }

      // 숫자 범위 검증: PostgreSQL INT 최대값 (약 21억)
      if (value !== "") {
        const numValue = parseInt(value, 10);
        const MAX_PRICE = 2147483647;

        if (numValue > MAX_PRICE) {
          toast.error(`판매가는 최대 ${MAX_PRICE.toLocaleString()}원까지 입력 가능합니다.`);
          return;
        }
      }

      if (isPackageItem) {
        setPackageItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            sellingPrice: value,
          };
          return updated;
        });
      } else {
        setIndividualItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            sellingPrice: value,
          };
          return updated;
        });
      }
    },
    []
  );

  // VAT 변경 핸들러
  const handleVatChange = useCallback(
    (index: number, value: string, isPackageItem: boolean) => {
      if (isPackageItem) {
        setPackageItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            vat: value,
          };
          return updated;
        });
      } else {
        setIndividualItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            vat: value,
          };
          return updated;
        });
      }
    },
    []
  );

  // 품목별 메모 변경 핸들러
  const handleMemoChange = useCallback(
    (index: number, value: string, isPackageItem: boolean = false) => {
      if (isPackageItem) {
        setPackageItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            memo: value,
          };
          return updated;
        });
      } else {
        setIndividualItems((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            memo: value,
          };
          return updated;
        });
      }
    },
    []
  );

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
    setFormData((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // 파일 관련 핸들러들
  const handleFileSelection = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        const newFiles = Array.from(selectedFiles);
        setFiles((prev) => [...prev, ...newFiles]);
      }
    },
    []
  );

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

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
      if (orderRecord?.files) {
        const originalFile = orderRecord.files.find(
          (file) => file.id === fileId
        );
        if (originalFile) {
          setExistingFiles((prev) => [...prev, originalFile]);
        }
      }
    },
    [orderRecord?.files]
  );

  // 파일 다운로드
  const handleDownloadFile = useCallback((file: OrderFile) => {
    console.log("[파일 다운로드] 다운로드 시작:", {
      originalFileName: file.fileName,
      fileUrl: file.fileUrl,
    });

    const displayFileName = getDisplayFileName(file.fileName);
    console.log("[파일 다운로드] 표시 파일명:", {
      original: file.fileName,
      display: displayFileName,
      isChanged: file.fileName !== displayFileName,
    });

    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = displayFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("[파일 다운로드] 다운로드 완료:", displayFileName);
  }, []);

  // 재고 확인 로직 - 수정 시에는 재고 부족해도 수정 가능하도록 주석 처리
  // const validateStock = useCallback((): {
  //   isValid: boolean;
  //   insufficientItems: string[];
  // } => {
  //   const insufficientItems: string[] = [];

  //   allOrderItems.forEach((item) => {
  //     if (!item.stockAvailable) {
  //       insufficientItems.push(
  //         `${item.teamItem.itemName} (요청: ${item.quantity}개, 재고: ${item.stockQuantity}개)`
  //       );
  //     }
  //   });

  //   return {
  //     isValid: insufficientItems.length === 0,
  //     insufficientItems,
  //   };
  // }, [allOrderItems]);

  // 연락처 유효성 검사 - 형식 제한 없음
  const validatePhoneNumber = useCallback((phone: string): boolean => {
    // 연락처는 비어있지 않으면 유효
    return phone.trim().length > 0;
  }, []);

  // 날짜 유효성 검사
  const validateDates = useCallback((): string | null => {
    if (!formData.requestDate || !formData.setupDate) {
      return null; // 날짜가 없으면 다른 검증에서 처리
    }

    const requestDate = new Date(formData.requestDate);
    const setupDate = new Date(formData.setupDate);

    // 설치 기한이 요청일보다 이전인지 검증
    if (setupDate < requestDate) {
      return "설치 기한은 발주 요청일과 같거나 이후로 설정해주세요.";
    }

    return null;
  }, [formData.requestDate, formData.setupDate]);

  const validateForm = useCallback((): boolean => {
    // 고객 선택 검증 (모든 계정 필수)
    if (!formData.supplierId) {
      toast.error("고객을 선택해주세요.");
      return false;
    }

    // 품목 선택 검증
    if (allOrderItems.length === 0) {
      toast.error("최소 하나 이상의 품목을 선택해주세요.");
      return false;
    }

    // 필수 입력 항목 검증
    const requiredFields = [
      {
        field: formData.title,
        message: "발주 제목을 입력해주세요.",
      },
      {
        field: formData.requester,
        message: "캥스터즈 영업 담당자 이름을 입력해주세요.",
      },
      { field: formData.receiver, message: "수령인을 입력해주세요." },
      {
        field: formData.receiverPhone,
        message: "수령인 연락처를 입력해주세요.",
      },
      { field: formData.address, message: "배송지 주소를 입력해주세요." },
      { field: formData.requestDate, message: "발주 요청일을 선택해주세요." },
      { field: formData.setupDate, message: "설치 기한을 선택해주세요." },
    ];

    for (const { field, message } of requiredFields) {
      if (!field?.trim()) {
        toast.error(message);
        return false;
      }
    }

    // 창고 선택 검증
    if (!formData.warehouseId) {
      toast.error("발주할 창고를 선택해주세요.");
      return false;
    }

    // 연락처 유효성 검사
    if (!validatePhoneNumber(formData.receiverPhone)) {
      toast.error("수령인 연락처를 입력해주세요.");
      return false;
    }

    // 날짜 유효성 검사
    const dateError = validateDates();
    if (dateError) {
      toast.error(dateError);
      return false;
    }

    // 재고 확인 - 수정 시에는 재고 부족해도 수정 가능하도록 제거
    // const stockValidation = validateStock();
    // if (!stockValidation.isValid) {
    //   const itemList = stockValidation.insufficientItems.join("\n• ");
    //   toast.error(
    //     `다음 품목의 재고가 부족합니다:\n\n• ${itemList}\n\n수량을 조정하거나 담당자에게 문의하세요.`
    //   );
    //   return false;
    // }

    return true;
  }, [
    user?.accessLevel,
    formData.supplierId,
    allOrderItems.length,
    formData.title,
    formData.requester,
    formData.receiver,
    formData.receiverPhone,
    formData.address,
    formData.requestDate,
    formData.setupDate,
    formData.warehouseId,
    validatePhoneNumber,
    validateDates,
    // validateStock, // 재고 검증 제거
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !orderRecord) {
      return;
    }

    // 수정 내용 확인 다이얼로그 개선
    const hasNewFiles = files.length > 0;
    const hasDeletedFiles = filesToDelete.length > 0;
    const hasFileChanges = hasNewFiles || hasDeletedFiles;

    let confirmMessage = "주문 정보를 수정하시겠습니까?";

    if (hasFileChanges) {
      confirmMessage += "\n\n파일 변경사항:";
      if (hasNewFiles) {
        confirmMessage += `\n• 새 파일 ${files.length}개 추가`;
      }
      if (hasDeletedFiles) {
        confirmMessage += `\n• 기존 파일 ${filesToDelete.length}개 삭제`;
      }
    }

    confirmMessage +=
      "\n\n※ 필요한 증빙서류(발주서, 견적서 등)가 모두 첨부되었는지 확인해주세요.";

    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      // UTC 기반 날짜 처리로 시간대 변환 오류 방지
      const toUTCISOString = (dateString: string) => {
        if (!dateString) return "";
        const serverDate = formatDateForServer(dateString);
        return serverDate ? `${serverDate}T00:00:00.000Z` : "";
      };

      // 총 판매가격 계산 (0원 포함)
      const calculatedTotalPrice = allOrderItems
        .filter((item) => item.quantity > 0 && item.sellingPrice !== undefined && item.sellingPrice !== "")
        .reduce((sum, item) => {
          const price = parseInt(item.sellingPrice || "0", 10);
          return sum + (price * item.quantity);
        }, 0);

      // 모든 품목이 0원인 경우 확인
      const itemsWithPrice = allOrderItems.filter(
        (item) => item.quantity > 0 && item.sellingPrice !== undefined && item.sellingPrice !== ""
      );
      if (itemsWithPrice.length > 0 && calculatedTotalPrice === 0) {
        const confirmZeroPrice = window.confirm(
          "총 거래금액이 0원입니다.\n\n무상 제공 또는 샘플 발주인 경우 '확인'을 눌러주세요."
        );
        if (!confirmZeroPrice) {
          setIsSubmitting(false);
          return;
        }
      }

      const orderData = {
        id: orderRecord.id.toString(),
        data: {
          title: formData.title || undefined,
          manager: formData.manager || undefined,
          supplierId: formData.supplierId ?? undefined,
          packageId: formData.packageId ?? undefined,
          warehouseId: formData.warehouseId ?? 0,
          requester: formData.requester,
          receiver: formData.receiver,
          receiverPhone: formData.receiverPhone,
          receiverAddress:
            `${formData.address} ${formData.detailAddress}`.trim(),
          purchaseDate: toUTCISOString(formData.requestDate),
          outboundDate: toUTCISOString(formData.requestDate),
          installationDate: toUTCISOString(formData.setupDate),
          status: formData.status,
          memo: formData.notes || undefined,
          totalPrice: calculatedTotalPrice >= 0 ? calculatedTotalPrice : undefined,
          orderItems: allOrderItems
            .filter((item) => item.quantity > 0)
            .map((item) => ({
              itemId: item.warehouseItemId,
              quantity: item.quantity,
              memo: item.memo || "",
              sellingPrice: item.sellingPrice !== undefined && item.sellingPrice !== ""
                ? parseInt(item.sellingPrice, 10)
                : undefined,
              vat: item.vat !== undefined && item.vat !== ""
                ? parseInt(item.vat, 10)
                : undefined,
            })),
        },
      };

      updateOrder(orderData, {
        onSuccess: async (response) => {
          if (response.success) {
            // 파일 처리
            try {
              // 삭제할 파일들 처리
              if (filesToDelete.length > 0) {
                setIsFileUploading(true);
                for (const fileId of filesToDelete) {
                  await deleteOrderFile(orderRecord.id, fileId);
                }
              }

              // 새로 업로드할 파일들 처리
              if (files.length > 0) {
                setIsFileUploading(true);
                const uploadResponse = await uploadMultipleOrderFileById(
                  orderRecord.id,
                  files
                );

                if (!uploadResponse.success) {
                  throw new Error(
                    uploadResponse.message || "파일 업로드에 실패했습니다."
                  );
                }
              }

              toast.success("주문이 성공적으로 수정되었습니다.");

              // 모든 주문 관련 쿼리 무효화
              await queryClient.invalidateQueries({
                queryKey: ["orders"],
                exact: false,
              });

              // 특정 주문 쿼리도 무효화
              await queryClient.invalidateQueries({
                queryKey: ["order", orderRecord.id.toString()],
              });

              onClose();
            } catch (fileError) {
              console.error("파일 처리 중 오류:", fileError);
              toast.error(
                "주문은 수정되었으나 파일 처리 중 오류가 발생했습니다. 다시 시도해주세요."
              );
            }
          } else {
            // 서버에서 상세한 에러 메시지를 보내는 경우 처리
            const errorMessage = response.message || "주문 수정에 실패했습니다.";
            console.error("주문 수정 실패:", response);

            // 사용자 친화적인 에러 팝업 표시
            const isConfirm = window.confirm(
              `❌ 주문 수정 실패\n\n${errorMessage}\n\n확인을 눌러 닫기`
            );

            toast.error(errorMessage, {
              duration: 5000,
            });

            setIsSubmitting(false);
            setIsFileUploading(false);
          }
        },
        onError: (error: any) => {
          console.error("주문 수정 오류:", error);

          // 서버 응답에서 에러 메시지 추출
          let errorMessage = "주문 수정 중 오류가 발생했습니다.";

          if (error?.response?.data?.message) {
            // Axios 에러 응답
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            // 일반 Error 객체
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          }

          // 사용자 친화적인 에러 팝업 표시
          window.alert(
            `❌ 주문 수정 오류\n\n${errorMessage}\n\n문제가 계속되면 관리자에게 문의해주세요.`
          );

          toast.error(errorMessage, {
            duration: 5000,
          });

          setIsSubmitting(false);
          setIsFileUploading(false);
        },
        onSettled: () => {
          setIsSubmitting(false);
          setIsFileUploading(false);
        },
      });
    } catch (error) {
      console.error("주문 수정 처리 중 오류:", error);
      toast.error("주문 수정 처리 중 오류가 발생했습니다.");
      setIsSubmitting(false);
      setIsFileUploading(false);
    }
  };

  // 권한 확인 - 개선된 버전
  const canEdit = () => {
    if (!orderRecord || !auth) return false;

    const isAdmin = auth.isAdmin;
    const isAuthor = orderRecord.userId === auth.id;

    // admin인 경우 상태에 상관없이 수정 가능
    if (isAdmin) return true;

    // 일반 사용자는 자신이 작성한 requested 상태의 발주만 수정 가능
    const isRequestedStatus = orderRecord.status === OrderStatus.requested;
    return isAuthor && isRequestedStatus;
  };

  // 권한 없음 메시지 개선
  const getPermissionMessage = () => {
    if (!orderRecord || !auth) return "수정 권한이 없습니다.";

    const isAdmin = auth.isAdmin;
    const isAuthor = orderRecord.userId === auth.id;

    if (isAdmin) return ""; // Admin은 메시지 표시 안함

    if (!isAuthor) {
      return "자신이 작성한 주문만 수정할 수 있습니다.";
    }

    if (orderRecord.status !== OrderStatus.requested) {
      return "요청 상태가 아닌 주문은 수정할 수 없습니다.";
    }

    return "수정 권한이 없습니다.";
  };

  if (!orderRecord) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">주문 수정</h2>
          {!canEdit() && (
            <div className="text-sm text-red-600">{getPermissionMessage()}</div>
          )}
        </div>

        {canEdit() ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isSubmitting || isFileUploading}>
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

            {/* 창고 선택 - 비즈니스 규칙: 창고 변경 금지 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                발주 창고 <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">(변경 불가)</span>
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId || 0}
                className="px-3 py-2 w-full bg-gray-100 rounded-md border"
                disabled={true} // 읽기 전용으로 변경
              >
                <option value="0">창고 선택</option>
                {warehousesList?.map((warehouse: Warehouse) => {
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
              <p className="text-xs text-gray-500">
                발주 건의 창고는 변경할 수 없습니다. 해당 창고 내의 물품으로만
                수정 가능합니다.
              </p>
            </div>

            {/* 패키지 선택 (패키지 발주인 경우에만 표시) */}
            {formData.packageId && packages && packages.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  패키지 선택
                </label>
                <div className="flex gap-2 items-center">
                  <select
                    name="packageId"
                    onChange={handlePackageSelect}
                    className="flex-1 px-3 py-2 rounded-md border"
                    value={formData.packageId || 0}
                    required={!!formData.packageId}
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
              </div>
            )}

            {/* 개별품목 선택 - ItemSelectionModal 사용 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                품목 선택
              </label>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(true)}
                disabled={!formData.warehouseId}
                className="px-4 py-2 w-full text-left bg-white rounded-md border transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-Primary-Main"
              >
                <span className="text-gray-500">클릭하여 품목 선택</span>
              </button>
              <p className="text-xs text-gray-500">
                패키지와 개별 품목을 함께 선택할 수 있습니다.
              </p>
            </div>

            {/* 선택된 품목 목록 */}
            {allOrderItems.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-medium">선택된 품목</h3>
                <div className="overflow-x-auto border border-gray-300 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          품목명
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          품목코드
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          수량
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                          판매가
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                          VAT
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          메모
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                          소계
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* 패키지 아이템들 */}
                      {packageItems.map((item, index) => {
                        const sellingPrice = item.sellingPrice ? parseInt(item.sellingPrice, 10) : 0;
                        const vat = item.vat ? parseInt(item.vat, 10) : 0;
                        const subtotal = (sellingPrice + vat) * item.quantity;
                        return (
                          <tr key={`package-${item.warehouseItemId}`} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.teamItem.itemName}
                                </span>
                                <span className="text-xs text-blue-600 font-semibold">(패키지)</span>
                                {formData.warehouseId && item.stockAvailable === false && (
                                  <div className="flex items-center text-xs text-red-500">
                                    <AlertCircle size={12} className="mr-1" />
                                    재고 부족
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {item.teamItem.itemCode}
                                {formData.warehouseId && item.stockQuantity !== undefined && (
                                  <div className="text-xs text-gray-500">(재고: {item.stockQuantity}개)</div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex gap-1 items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(index, false, true)}
                                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(index, true, true)}
                                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={item.sellingPrice || ""}
                                onChange={(e) => {
                                  const sanitized = e.target.value.replace(/[^0-9]/g, '');
                                  handleSellingPriceChange(index, sanitized, true);
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const pastedText = e.clipboardData.getData('text');
                                  const sanitized = pastedText.replace(/[^0-9]/g, '');
                                  handleSellingPriceChange(index, sanitized, true);
                                }}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-Primary-Main"
                              />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={item.vat || ""}
                                onChange={(e) => {
                                  const sanitized = e.target.value.replace(/[^0-9]/g, '');
                                  handleVatChange(index, sanitized, true);
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const pastedText = e.clipboardData.getData('text');
                                  const sanitized = pastedText.replace(/[^0-9]/g, '');
                                  handleVatChange(index, sanitized, true);
                                }}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-Primary-Main"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.memo || ""}
                                onChange={(e) => handleMemoChange(index, e.target.value, true)}
                                placeholder="메모 입력"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-Primary-Main"
                              />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <span className="text-sm font-semibold text-blue-600">
                                {subtotal > 0 ? subtotal.toLocaleString() : "-"}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(
                                    "패키지 품목을 삭제하시겠습니까?\n\n패키지에서 제외된 개별 품목으로 처리되며, 패키지 구성이 변경됩니다."
                                  )) {
                                    handleRemoveItem(item.warehouseItemId, true);
                                  }
                                }}
                                className="p-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
                                title="품목 제거"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* 개별 아이템들 */}
                      {individualItems.map((item, index) => {
                        const sellingPrice = item.sellingPrice ? parseInt(item.sellingPrice, 10) : 0;
                        const vat = item.vat ? parseInt(item.vat, 10) : 0;
                        const subtotal = (sellingPrice + vat) * item.quantity;
                        return (
                          <tr key={`individual-${item.warehouseItemId}`} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {item.teamItem.itemName}
                                </span>
                                {formData.warehouseId && item.stockAvailable === false && (
                                  <div className="flex items-center text-xs text-red-500">
                                    <AlertCircle size={12} className="mr-1" />
                                    재고 부족
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {item.teamItem.itemCode}
                                {formData.warehouseId && item.stockQuantity !== undefined && (
                                  <div className="text-xs text-gray-500">(재고: {item.stockQuantity}개)</div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex gap-1 items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(index, false, false)}
                                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(index, true, false)}
                                  className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={item.sellingPrice || ""}
                                onChange={(e) => {
                                  const sanitized = e.target.value.replace(/[^0-9]/g, '');
                                  handleSellingPriceChange(index, sanitized, false);
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const pastedText = e.clipboardData.getData('text');
                                  const sanitized = pastedText.replace(/[^0-9]/g, '');
                                  handleSellingPriceChange(index, sanitized, false);
                                }}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-Primary-Main"
                              />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={item.vat || ""}
                                onChange={(e) => {
                                  const sanitized = e.target.value.replace(/[^0-9]/g, '');
                                  handleVatChange(index, sanitized, false);
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const pastedText = e.clipboardData.getData('text');
                                  const sanitized = pastedText.replace(/[^0-9]/g, '');
                                  handleVatChange(index, sanitized, false);
                                }}
                                placeholder="0"
                                className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-Primary-Main"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.memo || ""}
                                onChange={(e) => handleMemoChange(index, e.target.value, false)}
                                placeholder="메모 입력"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-Primary-Main"
                              />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              <span className="text-sm font-semibold text-blue-600">
                                {subtotal > 0 ? subtotal.toLocaleString() : "-"}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.warehouseItemId, false)}
                                className="p-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* 총 거래금액 표시 */}
                {allOrderItems.some((item) => item.sellingPrice !== undefined && item.sellingPrice !== "") && (
                  <div className="mt-3 pt-3 border-t-2 border-gray-300">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">
                          총 거래금액
                        </span>
                        <span className="text-lg font-bold text-blue-700">
                          {allOrderItems
                            .filter((item) => item.quantity > 0 && item.sellingPrice !== undefined && item.sellingPrice !== "")
                            .reduce((sum, item) => {
                              const price = parseInt(item.sellingPrice || "0", 10);
                              return sum + price * item.quantity;
                            }, 0)
                            .toLocaleString()}
                          원
                        </span>
                      </div>
                      {allOrderItems.some((item) => item.quantity > 0 && (item.sellingPrice === undefined || item.sellingPrice === "")) && (
                        <p className="text-xs text-gray-500 text-right">
                          * 판매가 미입력 품목 {allOrderItems.filter((item) => item.quantity > 0 && (item.sellingPrice === undefined || item.sellingPrice === "")).length}개 제외
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 기타 요청 사항 */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium">
                기타 요청 사항
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="p-2 w-full rounded border"
                rows={3}
              />
            </div>

            {/* Admin 전용: 상태 변경 */}
            {auth?.isAdmin && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium">
                  발주 상태{" "}
                  <span className="text-xs text-gray-500">(Admin 전용)</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="p-2 w-full rounded border"
                >
                  <option value="requested">요청</option>
                  <option value="approved">승인</option>
                  <option value="rejected">반려</option>
                  <option value="confirmedByShipper">출고팀 확인</option>
                  <option value="shipmentCompleted">출고 완료</option>
                  <option value="rejectedByShipper">출고 보류</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  현재 상태: {orderRecord?.status}
                </p>
              </div>
            )}

            {/* 발주자 */}
            <div>
              <label htmlFor="requester" className="block text-sm font-medium">
                캥스터즈 영업 담당자 이름
              </label>
              <input
                type="text"
                id="requester"
                name="requester"
                value={formData.requester}
                onChange={handleChange}
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 담당자 */}
            <div>
              <label htmlFor="manager" className="block text-sm font-medium">
                업체 발주 담당자
              </label>
              <input
                type="text"
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 발주 요청일 */}
            <div>
              <label
                htmlFor="requestDate"
                className="block text-sm font-medium"
              >
                발주 요청일
              </label>
              <input
                type="date"
                id="requestDate"
                name="requestDate"
                value={formData.requestDate}
                onChange={(e) => handleDateChange(e, "requestDate")}
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 설치 기한 */}
            <div className="mb-8">
              <label htmlFor="setupDate" className="block text-sm font-medium">
                설치 기한
              </label>
              <input
                type="date"
                id="setupDate"
                name="setupDate"
                value={formData.setupDate}
                onChange={(e) => handleDateChange(e, "setupDate")}
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 레거시 데이터 안내 배너 (고객 미입력 + 수령인 정보 있음) */}
            {hasLegacyData && (
              <div className="mb-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-amber-900 mb-2">
                      ⚠️ 고객 정보가 등록되지 않았습니다
                    </h4>
                    <p className="text-sm text-amber-800 mb-3">
                      현재 입력된 수령인 정보를 기반으로 고객을 등록하시겠습니까?
                    </p>
                    <div className="p-3 mb-3 bg-white/60 rounded-lg border border-amber-200">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {formData.receiver && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-amber-900 min-w-[70px]">• 수령인:</span>
                            <span className="text-amber-800">{formData.receiver}</span>
                          </div>
                        )}
                        {formData.receiverPhone && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-amber-900 min-w-[70px]">• 연락처:</span>
                            <span className="text-amber-800">{formData.receiverPhone}</span>
                          </div>
                        )}
                        {formData.address && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-amber-900 min-w-[70px]">• 주소:</span>
                            <span className="text-amber-800">{formData.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleQuickAddSupplier}
                        className="px-4 py-2 font-medium text-white bg-amber-600 rounded-lg shadow-sm transition-all hover:bg-amber-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                      >
                        📝 이 정보로 고객 등록하기
                      </button>
                      <button
                        type="button"
                        onClick={() => toast("고객 정보 섹션에서 직접 선택하거나 추가할 수 있습니다", {
                          icon: "ℹ️",
                        })}
                        className="px-4 py-2 font-medium text-amber-700 bg-white rounded-lg border-2 border-amber-300 shadow-sm transition-all hover:bg-amber-50 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                      >
                        나중에 등록
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 고객 정보 섹션 (Material Design) */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">고객 정보</h3>
              </div>

              {/* 고객 선택 */}
              <div className="mb-4 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  고객 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSelectSupplierModalOpen(true)}
                    className="flex-1 px-4 py-3 text-left bg-white rounded-lg border-2 border-blue-300 shadow-sm transition-all hover:bg-blue-50 hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formData.supplierId ? (
                      <span className="font-medium text-gray-900">
                        {suppliers?.find((s: Supplier) => s.id === formData.supplierId)?.supplierName || "고객 선택"}
                      </span>
                    ) : (
                      <span className="text-gray-500">클릭하여 고객 선택</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddSupplierModalOpen(true)}
                    className="px-4 py-3 font-medium text-white bg-blue-600 rounded-lg shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="새 고객 추가"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-blue-700 bg-blue-100 px-3 py-1.5 rounded-md">
                  💡 고객을 선택하면 수령인, 연락처, 주소가 자동으로 채워집니다
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 수령인 */}
                <div>
                  <label htmlFor="receiver" className="block mb-1 text-sm font-semibold text-gray-700">
                    수령인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="receiver"
                    name="receiver"
                    value={formData.receiver}
                    onChange={handleChange}
                    className="px-4 py-3 w-full bg-white rounded-lg border-2 border-gray-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="수령인 이름"
                    required
                  />
                </div>

                {/* 수령인 연락처 */}
                <div>
                  <label htmlFor="phone" className="block mb-1 text-sm font-semibold text-gray-700">
                    수령인 연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="px-4 py-3 w-full bg-white rounded-lg border-2 border-gray-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 수령지 주소 */}
              <div className="mt-4 space-y-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                  수령지 주소 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-white rounded-lg border-2 border-gray-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="기본 주소"
                    required
                  />
                  <button
                    type="button"
                    className="px-4 py-3 font-medium text-blue-700 bg-white rounded-lg border-2 border-blue-300 shadow-sm transition-all hover:bg-blue-50 hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setIsAddressOpen(!isAddressOpen)}
                  >
                    주소 검색
                  </button>
                </div>
                {isAddressOpen && (
                  <SearchAddressModal
                    onCompletePost={handleAddressChange}
                    onClose={() => setIsAddressOpen(false)}
                  />
                )}
              </div>

              {/* 상세 주소 */}
              <div className="mt-2">
                <input
                  type="text"
                  id="detailAddress"
                  name="detailAddress"
                  value={formData.detailAddress}
                  onChange={handleChange}
                  className="px-4 py-3 w-full bg-white rounded-lg border-2 border-gray-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="상세 주소 (동/호수 등)"
                />
              </div>
            </div>

            {/* 파일 업로드 */}
            <div>
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium"
              >
                파일 업로드
              </label>
              <div className="mb-2 text-xs text-amber-600">
                * 파일 크기는 최대 50MB까지 업로드 가능합니다.
              </div>
              <div className="mb-2 text-xs text-red-600">
                * 발주서, 견적서 등 필요증빙 필수 첨부
              </div>
              <div
                onClick={() => selectedFiles.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col gap-2 items-center justify-center p-6 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                  isDragOver
                    ? "bg-blue-50 border-blue-500"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <Paperclip className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {isDragOver
                      ? "파일을 여기에 놓으세요"
                      : "클릭하여 파일 선택 또는 파일을 여기로 드래그"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, 이미지, 문서 파일 등
                  </p>
                </div>
              </div>
              <input
                ref={selectedFiles}
                type="file"
                hidden
                multiple={true}
                onChange={handleFileSelection}
              />

              {/* 업로드된 파일 목록 */}
              <div className="p-2 mt-2 rounded-md border">
                <div className="mb-2">업로드된 파일</div>
                <ul className="p-2 text-black rounded border">
                  {files.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      업로드 항목이 없습니다.
                    </div>
                  ) : (
                    files.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center py-1"
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
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* 기존 파일 목록 */}
            {existingFiles.length > 0 && (
              <div>
                <label className="block mb-2 text-sm font-medium">
                  기존 첨부 파일
                </label>
                <div className="p-3 bg-gray-50 rounded-md border">
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
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="p-1 text-blue-600 rounded hover:text-blue-800"
                            title="다운로드"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingFile(file.id)}
                            className="p-1 text-red-600 rounded hover:text-red-800"
                            title="삭제"
                          >
                            <X size={14} />
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
              <div>
                <label className="block mb-2 text-sm font-medium text-red-600">
                  삭제 예정 파일
                </label>
                <div className="p-3 bg-red-50 rounded-md border">
                  <ul className="space-y-2">
                    {filesToDelete.map((fileId) => {
                      const originalFile = orderRecord?.files?.find(
                        (file) => file.id === fileId
                      );
                      if (!originalFile) return null;

                      return (
                        <li
                          key={fileId}
                          className="flex justify-between items-center p-2 bg-white rounded border border-red-200"
                        >
                          <div className="flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-red-500"
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
                            <span className="text-sm text-red-700 line-through">
                              {originalFile.fileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCancelDeleteFile(fileId)}
                            className="p-1 text-green-600 rounded hover:text-green-800"
                            title="삭제 취소"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                              />
                            </svg>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            </fieldset>
            {/* 버튼 영역 */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isFileUploading}
                className={`bg-blue-500 text-white py-2 px-4 rounded flex items-center justify-center ${
                  isSubmitting || isFileUploading
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting || isFileUploading ? (
                  <>
                    <LoadingInline className="mr-2" />
                    {isFileUploading ? "파일 처리 중..." : "수정 중..."}
                  </>
                ) : (
                  "주문 수정"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center">
            <p className="mb-4 text-gray-600">이 주문을 수정할 수 없습니다.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        )}

        {/* ItemSelectionModal */}
        <ItemSelectionModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          onAddItem={handleItemSelect}
          currentWarehouseItems={currentWarehouseItems}
          orderItems={modalOrderItems}
          title="품목 추가"
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

        {/* 고객 추가 모달 */}
        <AddSupplierModal
          isOpen={isAddSupplierModalOpen}
          onClose={() => setIsAddSupplierModalOpen(false)}
          onSuccess={handleAddSupplierSuccess}
          initialData={{
            supplierName: formData.receiver || "",
            supplierPhone: formData.receiverPhone || "",
            address: formData.address || "",
            representativeName: formData.receiver || "",
          }}
        />
      </div>
    </Modal>
  );
};

export default OrderEditModal;
