import React from "react";
import { OrderRequestFormData } from "@/types/(order)/orderRequestFormData";

interface NotesSectionProps {
  formData: OrderRequestFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ formData, onChange }) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        비고
      </label>
      <textarea
        name="notes"
        value={formData.notes}
        onChange={onChange}
        rows={3}
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="추가 요청사항이나 특이사항을 입력하세요"
      />
    </div>
  );
};

export default NotesSection;
