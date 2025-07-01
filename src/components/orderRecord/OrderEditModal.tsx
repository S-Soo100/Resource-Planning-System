"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import { Paperclip, Plus, Minus, X, AlertCircle, Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";
import { useSuppliers } from "@/hooks/useSupplier";
import { toast } from "react-hot-toast";
import { OrderStatus } from "@/types/(order)/order";
import { Supplier } from "@/types/supplier";
import { IOrderRecord } from "@/types/(order)/orderRecord";
import { usePackages } from "@/hooks/usePackages";
import { PackageApi } from "@/types/(item)/package";
import { authStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { hasWarehouseAccess } from "@/utils/warehousePermissions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Modal } from "@/components/ui";
import { useWarehouseWithItems } from "@/hooks/useWarehouseWithItems";
import { Item } from "@/types/(item)/item";
import { Warehouse } from "@/types/warehouse";
import { ApiResponse } from "@/types/common";
import { uploadMultipleOrderFileById, deleteOrderFile } from "@/api/order-api";
import { OrderFile } from "@/types/(order)/order";

interface OrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderRecord: IOrderRecord | null;
}

// 타입 안전성 개선: any 타입 제거
interface TeamItem {
  id: number;
  itemCode: string;
  itemName: string;
  // 기타 필요한 필드들
}

interface OrderItemWithDetails {
  teamItem: TeamItem; // any 대신 구체적인 타입 사용
  quantity: number;
  stockAvailable: boolean;
  stockQuantity: number;
  warehouseItemId: number;
  memo?: string;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({
  isOpen,
  onClose,
  orderRecord,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [setupDate, setSetupDate] = useState("");
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

  const [formData, setFormData] = useState({
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
  });

  // 훅 호출
  const { useGetPackages } = usePackages();
  const { packages } = useGetPackages();
  const { useUpdateOrder } = useOrder();
  const { mutate: updateOrder } = useUpdateOrder();
  const { useGetSuppliers } = useSuppliers();
  const { suppliers } = useGetSuppliers();
  const { warehousesList, warehouseItems, handleWarehouseChange } =
    useWarehouseWithItems();

  // 현재 창고의 아이템들
  const currentWarehouseItems = useMemo(() => {
    if (!formData.warehouseId || !warehouseItems) return [];
    return warehouseItems[formData.warehouseId.toString()] || [];
  }, [formData.warehouseId, warehouseItems]);

  // 패키지 선택 여부 확인
  const isPackageSelected = formData.packageId !== null;

  // 모든 주문 아이템 (패키지 + 개별)
  const allOrderItems = useMemo(() => {
    return [...packageItems, ...individualItems];
  }, [packageItems, individualItems]);

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

      if (selectedPackage) {
        console.log(
          "창고 아이템 로드 완료, 패키지 아이템 자동 설정:",
          selectedPackage
        );

        const itemCodes = selectedPackage.itemlist.split(", ");
        const newPackageItems = itemCodes
          .map((itemCode) => {
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
              teamItem: warehouseItem.teamItem as TeamItem,
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
      console.log("주문 기록 데이터:", orderRecord);
      console.log("기존 requester:", orderRecord.requester);
      console.log("현재 사용자 이름:", auth?.name);

      // 주소 분리 (기존 주소에서 상세주소 분리)
      const addressParts = orderRecord.receiverAddress?.split(" ") || [];
      const detailAddress =
        addressParts.length > 1 ? addressParts.pop() || "" : "";
      const baseAddress = addressParts.join(" ");

      const newFormData = {
        manager: orderRecord.manager || "",
        requester: orderRecord.requester || "", // 기존 데이터 유지
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
      };

      console.log("설정할 폼 데이터:", newFormData);
      setFormData(newFormData);

      // formData 상태 변경 추적
      console.log("formData 상태 설정 완료");

      setRequestDate(
        orderRecord.purchaseDate ? orderRecord.purchaseDate.split("T")[0] : ""
      );
      setSetupDate(
        orderRecord.installationDate
          ? orderRecord.installationDate.split("T")[0]
          : ""
      );

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
  }, [orderRecord, warehouseItems]); // warehouseItems 의존성 추가

  // 창고 아이템 수동 로드 - orderRecord의 창고 ID로 아이템 로드
  useEffect(() => {
    if (
      orderRecord?.warehouseId &&
      !warehouseItems?.[orderRecord.warehouseId.toString()]
    ) {
      console.log("창고 아이템 수동 로드 시작:", orderRecord.warehouseId);

      // handleWarehouseChange를 사용해서 창고 아이템 로드
      handleWarehouseChange(orderRecord.warehouseId).then(
        (response: ApiResponse) => {
          if (response.success) {
            console.log("창고 아이템 로드 완료:", response.data);
          } else {
            console.error("창고 아이템 로드 실패:", response.message);
          }
        }
      );
    }
  }, [orderRecord?.warehouseId, warehouseItems, handleWarehouseChange]);

  // 창고 변경은 비즈니스 규칙에 따라 금지됨
  // const handleWarehouseChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   toast.error("발주 건의 창고는 변경할 수 없습니다.");
  //   return;
  // };

  // 거래처 변경 핸들러
  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const supplierId = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      supplierId: supplierId || null,
    }));
  };

  // 패키지 수량 변경 핸들러 - 패키지 아이템만 업데이트
  const handlePackageQuantityChange = (increment: boolean) => {
    setPackageQuantity((prev) => {
      const newQuantity = increment ? prev + 1 : Math.max(1, prev - 1);

      // 패키지 아이템들의 수량만 업데이트 (개별 아이템은 유지)
      if (formData.packageId && packages) {
        const selectedPackage = packages.find(
          (pkg: PackageApi) => pkg.id === formData.packageId
        );
        if (selectedPackage) {
          const itemCodes = selectedPackage.itemlist.split(", ");
          const updatedPackageItems = itemCodes
            .map((itemCode) => {
              const warehouseItem = currentWarehouseItems.find(
                (item: Item) => item.teamItem.itemCode === itemCode
              );
              if (!warehouseItem) return null;

              return {
                teamItem: warehouseItem.teamItem as TeamItem,
                quantity: newQuantity,
                stockAvailable: warehouseItem.itemQuantity >= newQuantity,
                stockQuantity: warehouseItem.itemQuantity,
                warehouseItemId: warehouseItem.id,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          setPackageItems(updatedPackageItems); // 개별 아이템은 유지
        }
      }

      return newQuantity;
    });
  };

  // 패키지 선택 핸들러 - 단순화
  const handlePackageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const packageId = parseInt(e.target.value);

    if (packageId === 0) {
      setPackageItems([]);
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

    // 패키지 아이템 설정은 useEffect에서 자동으로 처리됨
    console.log("패키지 선택됨:", packageId);
  };

  // 아이템 선택 핸들러 - 패키지 선택 시 비활성화
  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isPackageSelected) {
      toast.error("패키지가 선택된 경우 개별 품목을 추가할 수 없습니다.");
      return;
    }

    const itemId = parseInt(e.target.value);
    if (itemId === 0) {
      return;
    }

    const selected = currentWarehouseItems.find(
      (item: Item) => item.id === itemId
    );
    if (!selected) {
      return;
    }

    const isItemExists = individualItems.some(
      (item) => item.teamItem.itemCode === selected.teamItem.itemCode
    );

    if (isItemExists) {
      toast.error("이미 추가된 아이템입니다");
      return;
    }

    setTimeout(() => {
      setIndividualItems((prev) => [
        ...prev,
        {
          teamItem: selected.teamItem as TeamItem,
          quantity: 1,
          stockAvailable: selected.itemQuantity >= 1,
          stockQuantity: selected.itemQuantity,
          warehouseItemId: selected.id,
        },
      ]);
    }, 0);

    e.target.value = "0";
  };

  // 아이템 제거 핸들러 - 패키지 아이템은 제거 불가
  const handleRemoveItem = (itemId: number, isPackageItem: boolean = false) => {
    if (isPackageItem) {
      toast.error(
        "패키지 내 개별 품목은 제거할 수 없습니다. 패키지 전체를 변경하거나 수량을 조정하세요."
      );
      return;
    }

    setTimeout(() => {
      setIndividualItems((prev) =>
        prev.filter((item) => item.warehouseItemId !== itemId)
      );
    }, 0);
  };

  // 아이템 수량 변경 핸들러
  const handleQuantityChange = (
    index: number,
    increment: boolean,
    isPackageItem: boolean = false
  ) => {
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

  // 파일 관련 핸들러들
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  // 기존 파일 삭제 처리
  const handleDeleteExistingFile = (fileId: number) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // 파일 삭제 취소
  const handleCancelDeleteFile = (fileId: number) => {
    setFilesToDelete((prev) => prev.filter((id) => id !== fileId));
    // 원래 파일 목록에서 복원
    if (orderRecord?.files) {
      const originalFile = orderRecord.files.find((file) => file.id === fileId);
      if (originalFile) {
        setExistingFiles((prev) => [...prev, originalFile]);
      }
    }
  };

  // 파일명 안전화 함수
  const sanitizeFileName = (fileName: string): string => {
    // 한글 파일명을 안전한 영문 파일명으로 변환
    const timestamp = new Date().getTime();
    const extension = fileName.split(".").pop() || "";
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));

    // 한글 파일명을 영문으로 변환 (간단한 매핑)
    const koreanToEnglish: { [key: string]: string } = {
      가: "ga",
      나: "na",
      다: "da",
      라: "ra",
      마: "ma",
      바: "ba",
      사: "sa",
      아: "a",
      자: "ja",
      차: "cha",
      카: "ka",
      타: "ta",
      파: "pa",
      하: "ha",
      거: "geo",
      너: "neo",
      더: "deo",
      러: "reo",
      머: "meo",
      버: "beo",
      서: "seo",
      어: "eo",
      저: "jeo",
      처: "cheo",
      커: "keo",
      터: "teo",
      퍼: "peo",
      허: "heo",
      고: "go",
      노: "no",
      도: "do",
      로: "ro",
      모: "mo",
      보: "bo",
      소: "so",
      오: "o",
      조: "jo",
      초: "cho",
      코: "ko",
      토: "to",
      포: "po",
      호: "ho",
      구: "gu",
      누: "nu",
      두: "du",
      루: "ru",
      무: "mu",
      부: "bu",
      수: "su",
      우: "u",
      주: "ju",
      추: "chu",
      쿠: "ku",
      투: "tu",
      푸: "pu",
      후: "hu",
      기: "gi",
      니: "ni",
      디: "di",
      리: "ri",
      미: "mi",
      비: "bi",
      시: "si",
      이: "i",
      지: "ji",
      치: "chi",
      키: "ki",
      티: "ti",
      피: "pi",
      히: "hi",
      개: "gae",
      내: "nae",
      대: "dae",
      래: "rae",
      매: "mae",
      배: "bae",
      새: "sae",
      애: "ae",
      재: "jae",
      채: "chae",
      캐: "kae",
      태: "tae",
      패: "pae",
      해: "hae",
      게: "ge",
      네: "ne",
      데: "de",
      레: "re",
      메: "me",
      베: "be",
      세: "se",
      에: "e",
      제: "je",
      체: "che",
      케: "ke",
      테: "te",
      페: "pe",
      헤: "he",
      교: "gyo",
      뇨: "nyo",
      됴: "dyo",
      료: "ryo",
      묘: "myo",
      뵤: "byo",
      쇼: "syo",
      요: "yo",
      죠: "jyo",
      쵸: "chyo",
      쿄: "kyo",
      툐: "tyo",
      푸: "pyo",
      효: "hyo",
      구: "gu",
      누: "nu",
      두: "du",
      루: "ru",
      무: "mu",
      부: "bu",
      수: "su",
      우: "u",
      주: "ju",
      추: "chu",
      쿠: "ku",
      투: "tu",
      푸: "pu",
      후: "hu",
      글: "geul",
      늘: "neul",
      들: "deul",
      를: "reul",
      물: "mul",
      불: "bul",
      슬: "seul",
      을: "eul",
      즐: "jeul",
      츨: "cheul",
      클: "keul",
      틀: "teul",
      플: "peul",
      흘: "heul",
      금: "geum",
      늠: "neum",
      듬: "deum",
      름: "reum",
      믐: "meum",
      븜: "beum",
      슴: "seum",
      음: "eum",
      즘: "jeum",
      츰: "cheum",
      큼: "keum",
      틈: "teum",
      품: "peum",
      흠: "heum",
      급: "geup",
      늡: "neup",
      듭: "deup",
      릅: "reup",
      믑: "meup",
      븝: "beup",
      습: "seup",
      읍: "eup",
      즙: "jeup",
      츱: "cheup",
      큽: "keup",
      튭: "teup",
      픕: "peup",
      흡: "heup",
      긔: "geui",
      늬: "neui",
      듸: "deui",
      릐: "reui",
      미: "mi",
      비: "bi",
      시: "si",
      의: "ui",
      지: "ji",
      치: "chi",
      키: "ki",
      티: "ti",
      피: "pi",
      히: "hi",
      긴: "gin",
      닌: "nin",
      딘: "din",
      린: "rin",
      민: "min",
      빈: "bin",
      신: "sin",
      인: "in",
      진: "jin",
      친: "chin",
      킨: "kin",
      틴: "tin",
      핀: "pin",
      힌: "hin",
      길: "gil",
      닐: "nil",
      딜: "dil",
      릴: "ril",
      밀: "mil",
      빌: "bil",
      실: "sil",
      일: "il",
      질: "jil",
      칠: "chil",
      킬: "kil",
      틸: "til",
      필: "pil",
      힐: "hil",
      김: "gim",
      님: "nim",
      딤: "dim",
      림: "rim",
      밈: "mim",
      빔: "bim",
      심: "sim",
      임: "im",
      짐: "jim",
      침: "chim",
      킴: "kim",
      팀: "tim",
      핌: "pim",
      힘: "him",
      깁: "gip",
      닙: "nip",
      딥: "dip",
      립: "rip",
      밉: "mip",
      빕: "bip",
      십: "sip",
      입: "ip",
      집: "jip",
      칩: "chip",
      킵: "kip",
      팁: "tip",
      핍: "pip",
      힙: "hip",
      깃: "git",
      닛: "nit",
      딧: "dit",
      릿: "rit",
      밋: "mit",
      빗: "bit",
      싯: "sit",
      잇: "it",
      짓: "jit",
      칫: "chit",
      킷: "kit",
      팃: "tit",
      핏: "pit",
      힛: "hit",
      발: "bal",
      찰: "chal",
      갈: "gal",
      날: "nal",
      달: "dal",
      랄: "ral",
      말: "mal",
      발: "bal",
      살: "sal",
      알: "al",
      잘: "jal",
      찰: "chal",
      칼: "kal",
      탈: "tal",
      팔: "pal",
      할: "hal",
      밤: "bam",
      참: "cham",
      감: "gam",
      남: "nam",
      담: "dam",
      람: "ram",
      맘: "mam",
      밤: "bam",
      삼: "sam",
      암: "am",
      잠: "jam",
      참: "cham",
      캄: "kam",
      탐: "tam",
      팜: "pam",
      함: "ham",
      밥: "bap",
      찹: "chap",
      갑: "gap",
      납: "nap",
      답: "dap",
      랍: "rap",
      맙: "map",
      밥: "bap",
      삽: "sap",
      압: "ap",
      잡: "jap",
      찹: "chap",
      캅: "kap",
      탑: "tap",
      팝: "pap",
      합: "hap",
      받: "bat",
      찯: "chat",
      갇: "gat",
      낟: "nat",
      닫: "dat",
      랃: "rat",
      맏: "mat",
      받: "bat",
      삿: "sat",
      앗: "at",
      잗: "jat",
      찯: "chat",
      캇: "kat",
      탇: "tat",
      팟: "pat",
      핫: "hat",
      발: "bal",
      찰: "chal",
      갈: "gal",
      날: "nal",
      달: "dal",
      랄: "ral",
      말: "mal",
      발: "bal",
      살: "sal",
      알: "al",
      잘: "jal",
      찰: "chal",
      칼: "kal",
      탈: "tal",
      팔: "pal",
      할: "hal",
      밤: "bam",
      참: "cham",
      감: "gam",
      남: "nam",
      담: "dam",
      람: "ram",
      맘: "mam",
      밤: "bam",
      삼: "sam",
      암: "am",
      잠: "jam",
      참: "cham",
      캄: "kam",
      탐: "tam",
      팜: "pam",
      함: "ham",
      밥: "bap",
      찹: "chap",
      갑: "gap",
      납: "nap",
      답: "dap",
      랍: "rap",
      맙: "map",
      밥: "bap",
      삽: "sap",
      압: "ap",
      잡: "jap",
      찹: "chap",
      캅: "kap",
      탑: "tap",
      팝: "pap",
      합: "hap",
      받: "bat",
      찯: "chat",
      갇: "gat",
      낟: "nat",
      닫: "dat",
      랃: "rat",
      맏: "mat",
      받: "bat",
      삿: "sat",
      앗: "at",
      잗: "jat",
      찯: "chat",
      캇: "kat",
      탇: "tat",
      팟: "pat",
      핫: "hat",
    };

    let convertedName = nameWithoutExt;
    for (const [korean, english] of Object.entries(koreanToEnglish)) {
      convertedName = convertedName.replace(new RegExp(korean, "g"), english);
    }

    // 특수문자 제거 및 공백을 언더스코어로 변경
    const sanitized = convertedName
      .replace(/[^a-zA-Z0-9가-힣\s]/g, "") // 한글, 영문, 숫자, 공백만 허용
      .replace(/\s+/g, "_") // 공백을 언더스코어로 변경
      .substring(0, 50); // 최대 50자로 제한

    return `${sanitized}_${timestamp}.${extension}`;
  };

  // 파일 다운로드
  const handleDownloadFile = (file: OrderFile) => {
    const link = document.createElement("a");
    link.href = file.fileUrl;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 재고 확인 로직 추가
  const validateStockAvailability = (): {
    isValid: boolean;
    insufficientItems: string[];
  } => {
    const insufficientItems: string[] = [];

    allOrderItems.forEach((item) => {
      if (!item.stockAvailable) {
        insufficientItems.push(
          `${item.teamItem.itemName} (요청: ${item.quantity}개, 재고: ${item.stockQuantity}개)`
        );
      }
    });

    return {
      isValid: insufficientItems.length === 0,
      insufficientItems,
    };
  };

  const validateForm = (): boolean => {
    if (allOrderItems.length === 0) {
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
      toast.error("발주할 창고를 선택해주세요");
      return false;
    }

    // 재고 확인
    const stockValidation = validateStockAvailability();
    if (!stockValidation.isValid) {
      toast.error(
        `재고가 부족한 품목이 있습니다:\n${stockValidation.insufficientItems.join(
          "\n"
        )}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !orderRecord) {
      return;
    }

    const isConfirmed = window.confirm(
      "발주서, 견적서 등 필요한 증빙을 모두 업로드 하셨나요?"
    );

    if (!isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    // 날짜 형식을 ISO-8601 DateTime으로 변환
    const formatDateToISO = (dateString: string): string => {
      if (!dateString) return "";
      return new Date(dateString + "T00:00:00.000Z").toISOString();
    };

    const orderData = {
      id: orderRecord.id.toString(),
      data: {
        userId: auth?.id ?? 0,
        manager: formData.manager,
        supplierId: formData.supplierId ?? null,
        packageId: formData.packageId ?? null,
        warehouseId: formData.warehouseId ?? 0,
        requester: formData.requester,
        receiver: formData.receiver,
        receiverPhone: formData.receiverPhone,
        receiverAddress: `${formData.address} ${formData.detailAddress}`.trim(),
        purchaseDate: formatDateToISO(formData.requestDate),
        outboundDate: formatDateToISO(formData.requestDate),
        installationDate: formatDateToISO(formData.setupDate),
        status: OrderStatus.requested,
        memo: formData.notes,
        orderItems: allOrderItems
          .filter((item) => item.quantity > 0)
          .map((item) => ({
            itemId: item.warehouseItemId,
            quantity: item.quantity,
            memo: item.memo || formData.notes,
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
              for (const fileId of filesToDelete) {
                await deleteOrderFile(orderRecord!.id, fileId);
              }
            }

            // 새로 업로드할 파일들 처리
            if (files.length > 0) {
              setIsFileUploading(true);

              // 파일명을 안전하게 처리 (한글 인코딩 문제 해결)
              const sanitizedFiles = files.map((file) => {
                const timestamp = new Date().getTime();
                const extension = file.name.split(".").pop() || "";
                const sanitizedFileName = `file_${timestamp}.${extension}`;
                return new File([file], sanitizedFileName, { type: file.type });
              });

              const uploadResponse = await uploadMultipleOrderFileById(
                orderRecord!.id,
                sanitizedFiles
              );
              setIsFileUploading(false);

              if (!uploadResponse.success) {
                toast.error("파일 업로드에 실패했습니다.");
                return;
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
              "주문은 수정되었으나 파일 처리 중 오류가 발생했습니다."
            );
          }
        } else {
          toast.error(response.message || "주문 수정에 실패했습니다.");
        }
      },
      onError: (error) => {
        console.error("주문 수정 오류:", error);
        toast.error("주문 수정 중 오류가 발생했습니다.");
      },
      onSettled: () => {
        setIsSubmitting(false);
        setIsFileUploading(false);
      },
    });
  };

  // 권한 확인
  const canEdit = () => {
    if (!orderRecord || !auth) return false;

    // admin이거나 작성자인 경우만 수정 가능
    const isAdmin = auth.isAdmin;
    const isAuthor = orderRecord.userId === auth.id;

    // 상태가 '요청'인 경우만 수정 가능
    const isRequestedStatus = orderRecord.status === OrderStatus.requested;

    return (isAdmin || isAuthor) && isRequestedStatus;
  };

  if (!orderRecord) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">주문 수정</h2>
          {!canEdit() && (
            <div className="text-sm text-red-600">
              {orderRecord.status !== OrderStatus.requested
                ? "요청 상태가 아닌 주문은 수정할 수 없습니다."
                : "수정 권한이 없습니다."}
            </div>
          )}
        </div>

        {canEdit() ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 창고 선택 - 비즈니스 규칙: 창고 변경 금지 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                발주 창고 <span className="text-red-500">*</span>
                <span className="ml-2 text-xs text-gray-500">(변경 불가)</span>
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId || 0}
                className="px-3 py-2 w-full rounded-md border bg-gray-100"
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

            {/* 패키지 선택 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                패키지 선택
              </label>
              <div className="flex gap-2 items-center">
                <select
                  name="packageId"
                  onChange={handlePackageSelect}
                  className="flex-1 px-3 py-2 rounded-md border"
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

            {/* 개별품목 선택 - 패키지 선택 시 비활성화 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                품목 선택
                {isPackageSelected && (
                  <span className="ml-2 text-xs text-red-500">
                    (패키지 선택 시 불가)
                  </span>
                )}
              </label>
              <select
                name="item"
                onChange={handleItemSelect}
                className={`px-3 py-2 w-full rounded-md border ${
                  isPackageSelected ? "bg-gray-100" : ""
                }`}
                disabled={!formData.warehouseId || isPackageSelected}
              >
                <option value="0">품목 선택</option>
                {!isPackageSelected &&
                  currentWarehouseItems.map((item: Item) => (
                    <option key={item.id} value={item.id}>
                      {item.teamItem.itemName} ({item.teamItem.itemCode}) -
                      재고: {item.itemQuantity}개
                    </option>
                  ))}
              </select>
              {isPackageSelected && (
                <p className="text-xs text-gray-500">
                  패키지가 선택된 경우 개별 품목을 추가로 선택할 수 없습니다.
                </p>
              )}
            </div>

            {/* 선택된 품목 목록 */}
            {allOrderItems.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 font-medium">선택된 품목</h3>
                <div className="p-3 rounded-md border">
                  {/* 패키지 아이템들 */}
                  {packageItems.map((item, index) => (
                    <div
                      key={`package-${item.warehouseItemId}`}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex gap-2 items-center">
                          <p className="font-medium">
                            {item.teamItem.itemName}{" "}
                            <span className="text-xs text-blue-600">
                              (패키지)
                            </span>
                          </p>
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
                          onClick={() =>
                            handleQuantityChange(index, false, true)
                          }
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(index, true, true)
                          }
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveItem(item.warehouseItemId, true)
                          }
                          className="p-1 text-gray-400 bg-gray-100 rounded cursor-not-allowed"
                          title="패키지 내 개별 품목은 제거할 수 없습니다"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 개별 아이템들 */}
                  {individualItems.map((item, index) => (
                    <div
                      key={`individual-${item.warehouseItemId}`}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex gap-2 items-center">
                          <p className="font-medium">
                            {item.teamItem.itemName}
                          </p>
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
                          onClick={() =>
                            handleQuantityChange(index, false, false)
                          }
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(index, true, false)
                          }
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveItem(item.warehouseItemId, false)
                          }
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
                value={requestDate}
                onChange={(e) => handleDateChange(e, "requestDate")}
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 설치 기한 */}
            <div>
              <label htmlFor="setupDate" className="block text-sm font-medium">
                설치 기한
              </label>
              <input
                type="date"
                id="setupDate"
                name="setupDate"
                value={setupDate}
                onChange={(e) => handleDateChange(e, "setupDate")}
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 거래처 선택 */}
            <div className="space-y-2">
              <label className="flex flex-row gap-3 text-sm font-medium text-gray-700">
                거래처 선택
                <p className="text-xs text-red-500">
                  *등록 업체일 경우에만 선택, 이외에는 모두 별도 기재
                </p>
              </label>
              <select
                name="supplier"
                onChange={handleSupplierChange}
                className="px-3 py-2 w-full rounded-md border"
              >
                <option value="0">거래처 선택</option>
                {Array.isArray(suppliers) && suppliers?.length > 0 ? (
                  suppliers.map((supplier: Supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    거래처 목록을 불러올 수 없습니다
                  </option>
                )}
              </select>
            </div>

            {/* 수령인 */}
            <div>
              <label htmlFor="receiver" className="block text-sm font-medium">
                수령인
              </label>
              <input
                type="text"
                id="receiver"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 수령인 연락처 */}
            <div>
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
                className="p-2 w-full rounded border"
                required
              />
            </div>

            {/* 수령지 주소 */}
            <div>
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
                  className="flex-1 p-2 rounded border"
                  placeholder="주소를 입력하세요"
                  required
                />
                <button
                  type="button"
                  className="p-2 ml-3 text-black rounded border transition-colors duration-200 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            <div>
              <input
                type="text"
                id="detailAddress"
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleChange}
                className="p-2 w-full rounded border"
                placeholder="상세 주소"
              />
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
                        <span className="text-sm">{file.name}</span>
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
                <label className="block text-sm font-medium mb-2">
                  기존 첨부 파일
                </label>
                <div className="p-3 rounded-md border bg-gray-50">
                  <ul className="space-y-2">
                    {existingFiles.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-white rounded border"
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
                            {file.fileName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="p-1 text-blue-600 hover:text-blue-800 rounded"
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
                            className="p-1 text-red-600 hover:text-red-800 rounded"
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
                <label className="block text-sm font-medium mb-2 text-red-600">
                  삭제 예정 파일
                </label>
                <div className="p-3 rounded-md border bg-red-50">
                  <ul className="space-y-2">
                    {filesToDelete.map((fileId) => {
                      const originalFile = orderRecord?.files?.find(
                        (file) => file.id === fileId
                      );
                      if (!originalFile) return null;

                      return (
                        <li
                          key={fileId}
                          className="flex items-center justify-between p-2 bg-white rounded border border-red-200"
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
                            className="p-1 text-green-600 hover:text-green-800 rounded"
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
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
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
      </div>
    </Modal>
  );
};

export default OrderEditModal;
