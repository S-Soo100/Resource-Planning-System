import React from "react";

const TeamManagement: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">팀 관리</h2>
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
