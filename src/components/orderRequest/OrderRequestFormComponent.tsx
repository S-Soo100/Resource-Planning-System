// components/orderRequest/OrderRequestForm.tsx
"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import SearchAddressModal from "./SearchAddressModal";
import { Address } from "react-daum-postcode";
import { Paperclip } from "lucide-react";

type FormData = {
  package: string;
  quantity: number;
  notes: string;
  requester: string;
  phone: string;
  address: string;
  detailAddress: string;
};

type OrderRequestFormProps = {
  onSubmit: (formData: FormData) => void;
};
const OrderRequestFormComponent = ({ onSubmit }: OrderRequestFormProps) => {
  const [requestDate, setRequestDate] = useState("");
  const [setDate, setSetDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const selectedFiles = useRef<HTMLInputElement>(null);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    package: "",
    quantity: 1,
    notes: "",
    requester: "",
    phone: "",
    address: "",
    detailAddress: "",
  });

  const handleFileSelection = () => {
    if (selectedFiles.current && selectedFiles.current.files) {
      const fileList = Array.from(selectedFiles.current.files); // FileList를 배열로 변환
      setFiles(fileList); // state 업데이트
    }
  };

  useEffect(() => {
    // 현재 날짜를 ISO 형식(YYYY-MM-DD)으로 변환
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];
    setRequestDate(formattedDate);
    setSetDate(formattedDate);
  }, []);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    // 선택된 파일들을 콘솔에 출력
    console.log("첨부된 파일들:", files);
    onSubmit(formData);

    // 서버로 파일 업로드 로직 추가 가능
  };

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
  //   if (event.target.files) {
  //     // FileList를 배열로 변환하여 상태에 저장
  //     const selectedFiles = Array.from(event.target.files);
  //     setFiles(selectedFiles);
  //   }
  // };

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
          value={formData.package}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">선택하세요</option>
          <option value="package1">휠리엑스 데이터</option>
          <option value="package2">휠리엑스 플레이 베이직</option>
          <option value="package3">휠리엑스 플레이 프리미엄</option>
          <option value="package4">휠리엑스 플레이 해외용 등등</option>
        </select>

        <label htmlFor="quantity" className="block text-sm font-medium">
          패키지 갯수
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          className="p-2 border rounded"
        />

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
        />

        <label htmlFor="requester" className="block text-sm font-medium">
          출고 요청일
        </label>
        <input
          type="date"
          id="requestDate"
          name="requestDate"
          data-placeholder="날짜 선택"
          value={requestDate}
          // value={formData.requester}
          onChange={(e) => setRequestDate(e.target.value)}
          className="p-2 border rounded"
        />

        <label htmlFor="requester" className="block text-sm font-medium">
          설치 기한
        </label>
        <input
          type="date"
          id="setupDate"
          name="setupDate"
          data-placeholder="날짜 선택"
          value={setDate}
          // value={formData.requester}
          // onChange={handleChange}
          onChange={(e) => setSetDate(e.target.value)}
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
          onClick={() => selectedFiles.current?.click()} //input에 접근하기 위한 useRef
          className="flex flex-row items-center gap-2 p-2 border rounded hover:bg-blue-100"
        >
          <Paperclip className="w-4 h-4" />
          파일 업로드
        </div>
        {/* 파일 업로드 input 태그, 숨겨짐 */}
        <input
          ref={selectedFiles} //ref 연결
          type={"file"}
          hidden
          multiple={true} //파일 여러개 선택 가능하도록
          onChange={handleFileSelection} // 파일 선택 시 이벤트 실행
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
          className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        >
          발주 요청하기
        </button>
      </form>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
      <div className="h-32 mb-12 flex flex-col text-white"> - </div>
    </div>
  );
};

export default OrderRequestFormComponent;
