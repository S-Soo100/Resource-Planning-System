import React from "react";
import { Loader2 } from "lucide-react";

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
      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700";

  return (
    <div className="flex justify-center pt-4">
      <button
        type="submit"
        disabled={isSubmitting || isProcessing}
        className={`w-full max-w-md text-white py-3 px-6 rounded-lg font-medium shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${colorClasses} ${
          isSubmitting || isProcessing
            ? "opacity-70 cursor-not-allowed hover:scale-100"
            : ""
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
            {processingText}
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
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
