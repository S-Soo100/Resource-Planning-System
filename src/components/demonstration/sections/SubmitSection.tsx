import React from "react";
import { LoadingInline } from "@/components/ui/Loading";

interface SubmitSectionProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  isSubmitting,
  onCancel,
}) => {
  return (
    <div className="flex gap-4 justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
      >
        취소
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex gap-2 items-center px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="⚠️ API 미개발 상태 - 데모용으로만 동작합니다"
      >
        {isSubmitting && <LoadingInline />}
        {isSubmitting ? "처리 중..." : "시연 요청 (API 미개발)"}
      </button>
    </div>
  );
};

export default SubmitSection;
