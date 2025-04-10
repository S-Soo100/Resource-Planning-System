import React from "react";

interface AdminMenuCardProps {
  title: string;
  icon: React.ReactNode;
  id: string;
  description: string;
  activeTab: string;
  onTabChange: (id: string) => void;
}

const AdminMenuCard: React.FC<AdminMenuCardProps> = ({
  title,
  icon,
  id,
  description,
  activeTab,
  onTabChange,
}) => {
  return (
    <div
      className={`cursor-pointer p-5 rounded-lg border transition-all duration-200 ${
        activeTab === id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
      }`}
      onClick={() => onTabChange(id)}
    >
      <div className="flex items-center mb-2">
        <div className="mr-3 text-blue-600 text-2xl">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default AdminMenuCard;
