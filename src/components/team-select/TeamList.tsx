import React from "react";
import { IUserTeam } from "@/types/team";

interface TeamListProps {
  teams: IUserTeam[];
}

export const TeamList: React.FC<TeamListProps> = ({ teams }) => {
  if (teams.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">
          소속된 팀이 없습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">소속 팀 목록</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team, index) => (
          <button
            key={index}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-left"
            onClick={() => {
              // TODO: 팀 선택 처리 로직 추가
              console.log(`Selected team: ${team.teamName}`);
            }}
          >
            <h3 className="text-lg font-medium text-gray-900">
              {team.teamName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">팀 ID: {team.id}</p>
            <p className="text-sm text-gray-500 mt-1">
              생성일: {team.createdAt.split("T")[0]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
