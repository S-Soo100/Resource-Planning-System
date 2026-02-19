import React from "react";
import { LoadingInline } from "@/components/ui/Loading";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isProcessing: boolean;
  buttonText?: string;
  processingText?: string;
  completingText?: string;
  color?: "blue" | "purple";
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  isProcessing,
  buttonText = "발주 요청하기",
  processingText = "발주 처리 중...",
  completingText = "완료 처리 중...",
  color = "blue",
}) => {
  const colorClasses =
    color === "purple"
      ? "bg-Primary-Main hover:brightness-90"
      : "bg-Primary-Main hover:brightness-90";

  return (
    <div className="flex justify-center pt-4">
      <button
        type="submit"
        disabled={isSubmitting || isProcessing}
        className={`w-full max-w-md text-white py-2.5 px-6 rounded-full font-medium shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${colorClasses} ${
          isSubmitting || isProcessing
            ? "opacity-70 cursor-not-allowed hover:scale-100"
            : ""
        }`}
      >
        {isSubmitting ? (
          <>
            <LoadingInline size="md" className="mr-2" />
            {processingText}
          </>
        ) : isProcessing ? (
          <>
            <LoadingInline size="md" className="mr-2" />
            {completingText}
          </>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
