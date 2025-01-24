"use client";
import dynamic from "next/dynamic";
import { Address } from "react-daum-postcode";

const DaumPostcode = dynamic(() => import("react-daum-postcode"), {
  ssr: false,
});

interface SearchAddressModalProps {
  onCompletePost: (data: Address) => void;
}

const SearchAddressModal: React.FC<SearchAddressModalProps> = ({
  onCompletePost,
}) => {
  return (
    <div className="border">
      <DaumPostcode onComplete={onCompletePost} />
    </div>
  );
};

export default SearchAddressModal;
