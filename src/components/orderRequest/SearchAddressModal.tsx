"use client";
import DaumPostcode, { Address } from "react-daum-postcode";

interface SearchAddressModalProps {
  onCompletePost: (data: Address) => void;
}

const SearchAddressModal: React.FC<SearchAddressModalProps> = ({
  onCompletePost,
}) => {
  return (
    <div className="border">
      <DaumPostcode onComplete={onCompletePost}></DaumPostcode>
    </div>
  );
};

export default SearchAddressModal;
