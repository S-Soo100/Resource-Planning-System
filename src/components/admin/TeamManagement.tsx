import React from "react";

interface TeamManagementProps {
  isReadOnly?: boolean;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  isReadOnly = false,
}) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">팀 관리</h2>
        {isReadOnly && (
          <div className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            읽기 전용 모드
          </div>
        )}
      </div>
      <div className="border-b pb-4 mb-4">
        <p className="text-gray-600">
          팀 생성, 설정 변경 및 권한 구조를 관리할 수 있습니다.
        </p>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-center text-gray-500">팀 관리 기능 구현 예정</p>
      </div>
    </div>
  );
};

export default TeamManagement;
