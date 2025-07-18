import React from "react";
import { OrderRequestFormData } from "@/types/(order)/orderRequestFormData";

interface DateSectionProps {
  formData: OrderRequestFormData;
  onDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "requestDate" | "setupDate"
  ) => void;
}

const DateSection: React.FC<DateSectionProps> = ({
  formData,
  onDateChange,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          요청일
        </label>
        <input
          type="date"
          value={formData.requestDate}
          onChange={(e) => onDateChange(e, "requestDate")}
          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          설치일
        </label>
        <input
          type="date"
          value={formData.setupDate}
          onChange={(e) => onDateChange(e, "setupDate")}
          className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default DateSection;
