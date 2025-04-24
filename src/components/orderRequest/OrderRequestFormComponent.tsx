// components/orderRequest/OrderRequestForm.tsx
"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import SearchAddressModal from "../SearchAddressModal";
import { Address } from "react-daum-postcode";
import { Paperclip, Plus, Minus } from "lucide-react";
import { useOrder } from "@/hooks/useOrder";
import { usePackages } from "@/hooks/usePackages";
import { useTeamItems } from "@/hooks/useTeamItems";
import { toast } from "react-hot-toast";
import { CreateOrderDto, CreateOrderItemRequest } from "@/types/(order)/order";
import { PackageApi } from "@/types/package";
import { TeamItem } from "@/types/team-item";

type FormData = {
  requester: string;
  phone: string;
  receiver: string;
  manager: string;
  address: string;
  detailAddress: string;
  requestDate: string;
  setupDate: string;
  notes: string;
};

type OrderItemWithDetails = {
  teamItem: TeamItem;
  quantity: number;
};

const OrderRequestFormComponent = () => {
  const [requestDate, setRequestDate] = useState("");
  const [setupDate, setSetupDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const selectedFiles = useRef<HTMLInputElement>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 선택한 패키지 및 아이템 관련 상태
  const [selectedPackage, setSelectedPackage] = useState<PackageApi | null>(
    null
  );
  const [orderItems, setOrderItems] = useState<OrderItemWithDetails[]>([]);

  const [formData, setFormData] = useState<FormData>({
    requester: "",
    phone: "",
    receiver: "",
    manager: "",
    address: "",
    detailAddress: "",
    requestDate: "",
    setupDate: "",
    notes: "",
  });

  // 훅 호출
  const { useCreateOrder } = useOrder();
  const { mutate: createOrder } = useCreateOrder();

  // 패키지 목록 가져오기
  const packageHooks = usePackages();
  const { packages, isLoading: isPackagesLoading } =
    packageHooks.useGetPackages();

  // 팀 아이템 목록 가져오기
  const { teamItems, isLoading: isTeamItemsLoading } =
    useTeamItems().useGetTeamItems();

  const handleFileSelection = () => {
    if (selectedFiles.current && selectedFiles.current.files) {
      const fileList = Array.from(selectedFiles.current.files);
      setFiles(fileList);
    }
  };

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

  // 패키지 선택 시 아이템 목록 업데이트
  const handlePackageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const packageId = parseInt(e.target.value);

    if (packageId === 0) {
      setSelectedPackage(null);
      setOrderItems([]);
      return;
    }

    const selectedPkg = packages?.find((pkg) => pkg.id === packageId) || null;
    setSelectedPackage(selectedPkg);

    if (selectedPkg && selectedPkg.itemlist) {
      // 패키지의 아이템 목록 파싱 (쉼표로 구분된 문자열)
      const itemCodes = selectedPkg.itemlist.split(", ");

      // 각 아이템 코드에 해당하는 팀 아이템 찾기
      const items: OrderItemWithDetails[] = [];

      itemCodes.forEach((code) => {
        const matchingItem = teamItems?.find((item) => item.itemCode === code);
        if (matchingItem) {
          items.push({
            teamItem: matchingItem,
            quantity: 1,
          });
        }
      });

      setOrderItems(items);
    } else {
      setOrderItems([]);
    }
  };

  // 아이템 수량 변경 핸들러
  const handleQuantityChange = (index: number, increment: boolean) => {
    setOrderItems((prev) => {
      // 배열의 얕은 복사를 수행합니다
      const updated = prev.map((item, idx) => {
        // 해당 인덱스의 아이템만 수정합니다
        if (idx === index) {
          return {
            ...item,
            quantity: increment
              ? item.quantity + 1
              : item.quantity > 0
              ? item.quantity - 1
              : item.quantity,
          };
        }
        // 다른 아이템은 그대로 유지합니다
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

  const validateForm = (): boolean => {
    if (!selectedPackage) {
      toast.error("패키지를 선택해주세요");
      return false;
    }
    if (orderItems.length === 0) {
      toast.error("패키지에 아이템이 없습니다");
      return false;
    }
    if (!formData.requester) {
      toast.error("요청자 정보를 입력해주세요");
      return false;
    }
    if (!formData.phone) {
      toast.error("전화번호를 입력해주세요");
      return false;
    }
    if (!formData.address) {
      toast.error("주소를 입력해주세요");
      return false;
    }
    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // CreateOrderDto 형식에 맞게 데이터 변환
    const orderItemRequests: CreateOrderItemRequest[] = orderItems.map(
      (item) => ({
        itemId: item.teamItem.id,
        quantity: item.quantity,
        memo: formData.notes,
      })
    );

    // 발주 요청 데이터 준비
    const orderData: CreateOrderDto = {
      userId: 1, // 현재 로그인한 사용자 ID (실제로는 인증 시스템에서 가져와야 함)
      supplierId: 1, // 공급업체 ID (실제로는 선택된 패키지에 따라 결정될 수 있음)
      requester: formData.requester,
      receiver: formData.receiver,
      receiverPhone: formData.phone,
      receiverAddress: `${formData.address} ${formData.detailAddress}`.trim(),
      purchaseDate: formData.requestDate,
      manager: formData.manager,
      status: "요청", // 기본 상태
      orderItems: orderItemRequests,
    };

    try {
      // useCreateOrder 훅의 mutate 함수 호출
      createOrder(orderData, {
        onSuccess: () => {
          toast.success("발주 요청이 성공적으로 등록되었습니다");
          // 폼 초기화
          resetForm();
        },
        onError: (error) => {
          console.error("발주 요청 오류:", error);
          toast.error("발주 요청 중 오류가 발생했습니다");
        },
        onSettled: () => {
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("발주 요청 처리 중 오류:", error);
      toast.error("발주 요청 처리 중 오류가 발생했습니다");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    // 현재 날짜 가져오기
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];

    // 폼 데이터 초기화
    setFormData({
      requester: "",
      phone: "",
      receiver: "",
      manager: "",
      address: "",
      detailAddress: "",
      requestDate: formattedDate,
      setupDate: formattedDate,
      notes: "",
    });

    // 패키지 및 아이템 상태 초기화
    setSelectedPackage(null);
    setOrderItems([]);

    // 날짜 상태 초기화
    setRequestDate(formattedDate);
    setSetupDate(formattedDate);

    // 파일 상태 초기화
    setFiles([]);
  };

  // 페이지가 로딩 중이면 로딩 표시
  if (isPackagesLoading || isTeamItemsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">발주 요청</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <label htmlFor="package" className="block text-sm font-medium">
          패키지 선택
        </label>
        <select
          id="package"
          name="package"
          value={selectedPackage?.id || ""}
          onChange={handlePackageSelect}
          className="p-2 border rounded"
          required
        >
          <option value="">선택하세요</option>
          {packages?.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.packageName}
            </option>
          ))}
        </select>

        {orderItems.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">패키지 포함 아이템</h3>
            <div className="border rounded-md p-3">
              {orderItems.map((item, index) => (
                <div
                  key={item.teamItem.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.teamItem.itemName}</p>
                    <p className="text-xs text-gray-500">
                      코드: {item.teamItem.itemCode}
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

        <label htmlFor="phone" className="block text-sm font-medium">
          전화번호
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="xxx-xxxx-xxxx"
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

        <label htmlFor="receiver" className="block text-sm font-medium">
          받는사람
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
        />

        <label htmlFor="address" className="block text-sm font-medium">
          주소
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
          disabled={isLoading}
          className={`${
            isLoading ? "bg-blue-300" : "bg-blue-500"
          } text-white py-2 px-4 rounded mt-4`}
        >
          {isLoading ? "처리 중..." : "발주 요청하기"}
        </button>
      </form>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
    </div>
  );
};

export default OrderRequestFormComponent;
