import React from "react";

interface DateInfoSectionProps {
  requestDate: string;
  setupDate: string;
  onDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "requestDate" | "setupDate"
  ) => void;
  focusRingColor?: string;
}

const DateInfoSection: React.FC<DateInfoSectionProps> = ({
  requestDate,
  setupDate,
  onDateChange,
  focusRingColor = "blue",
}) => {
  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <label
          htmlFor="requestDate"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          발주 요청일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="requestDate"
          name="requestDate"
          value={requestDate}
          onChange={(e) => onDateChange(e, "requestDate")}
          className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
          required
        />
      </div>

      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <label
          htmlFor="setupDate"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          설치 기한 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="setupDate"
          name="setupDate"
          value={setupDate}
          onChange={(e) => onDateChange(e, "setupDate")}
          className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
          required
        />
      </div>
    </div>
  );
};

export default DateInfoSection;
