import React from "react";

interface RecipientInfoSectionProps {
  receiver: string;
  receiverPhone: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusRingColor?: string;
}

const RecipientInfoSection: React.FC<RecipientInfoSectionProps> = ({
  receiver,
  receiverPhone,
  onChange,
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
          htmlFor="receiver"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          수령인 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="receiver"
          name="receiver"
          value={receiver}
          onChange={onChange}
          className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
          required
        />
      </div>

      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <label
          htmlFor="receiverPhone"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          수령인 연락처 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="receiverPhone"
          name="receiverPhone"
          value={receiverPhone}
          onChange={onChange}
          placeholder="xxx-xxxx-xxxx"
          className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
          required
        />
      </div>
    </div>
  );
};

export default RecipientInfoSection;
