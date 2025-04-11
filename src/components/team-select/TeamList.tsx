import React, { useMemo, useState } from "react";
import { IUser } from "@/types/(auth)/user";
import { IUserTeam } from "@/types/team";

// 확장된 사용자 타입 정의
interface ExtendedUser extends IUser {
  Teams?: IUserTeam[];
}

interface TeamListDisplayProps {
  user: ExtendedUser;
  onLoadingChange: (isLoading: boolean) => void;
  onTeamSelect: (teamId: number) => Promise<void>;
}

export const TeamList: React.FC<TeamListDisplayProps> = ({
  user,
  onLoadingChange,
  onTeamSelect,
}) => {
  // const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 팀 목록을 메모이제이션하여 불필요한 재계산 방지
  const userTeams = useMemo(() => {
    if (!user) return [];
    return user.teams || user.Teams || [];
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">유저가 없습니다.</p>
      </div>
    );
  }

  if (!userTeams || !Array.isArray(userTeams) || userTeams.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">
          소속된 팀이 없습니다. 관리자에게 문의하세요.
        </p>
      </div>
    );
  }

  // 팀 선택 핸들러
  const handleTeamSelect = async (teamId: number) => {
    try {
      setIsLoading(true);
      onLoadingChange(true);
      await onTeamSelect(teamId);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">소속 팀 목록</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userTeams.map((team, index) => (
          <button
            key={index}
            className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 text-left ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => handleTeamSelect(team.id)}
            disabled={isLoading}
          >
            <h3 className="text-lg font-medium text-gray-900">
              {team.teamName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">팀 ID: {team.id}</p>
            {/* <p className="text-sm text-gray-500 mt-1">
              생성일: {team.createdAt.split("T")[0]}
            </p> */}
          </button>
        ))}
      </div>
    </div>
  );
};
