import React from "react";

interface NotesSectionProps {
  notes: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  focusRingColor?: string;
}

const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onChange,
  focusRingColor = "blue",
}) => {
  const focusRingClass =
    focusRingColor === "purple"
      ? "focus:ring-purple-500"
      : "focus:ring-blue-500";

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <label
        htmlFor="notes"
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        기타 요청 사항
      </label>
      <textarea
        id="notes"
        name="notes"
        value={notes}
        onChange={onChange}
        className={`px-3 py-2 w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent`}
        rows={3}
        placeholder="특별한 요청 사항이 있으시면 입력해주세요..."
      />
    </div>
  );
};

export default NotesSection;
