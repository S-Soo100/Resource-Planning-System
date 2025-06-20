"use client";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";
import { X } from "lucide-react";

const DaumPostcode = dynamic(() => import("react-daum-postcode"), {
  ssr: false,
});

interface SearchAddressModalProps {
  onCompletePost: (data: Address) => void;
  onClose?: () => void;
}

const SearchAddressModal: React.FC<SearchAddressModalProps> = ({
  onCompletePost,
  onClose,
}) => {
  const handleComplete = (data: Address) => {
    onCompletePost(data);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 모달 창 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">주소 검색</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 주소 검색 컴포넌트 */}
        <div className="p-4">
          <DaumPostcode onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

export default SearchAddressModal;
