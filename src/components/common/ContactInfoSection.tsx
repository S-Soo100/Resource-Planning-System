import React from "react";

interface ContactInfoSectionProps {
  requester: string;
  manager: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRequesterChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focusRingColor?: string;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  requester,
  manager,
  onChange,
  onRequesterChange,
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
          htmlFor="requester"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          캥스터즈 영업 담당자 이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="requester"
          name="requester"
          value={requester}
          onChange={onRequesterChange || onChange}
          className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
          required
        />
      </div>

      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <label
          htmlFor="manager"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          업체 발주 담당자 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="manager"
          name="manager"
          value={manager}
          onChange={onChange}
          className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
          required
        />
      </div>
    </div>
  );
};

export default ContactInfoSection;
