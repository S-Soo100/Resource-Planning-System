import React, { useMemo, useState } from "react";
import { IUser } from "@/types/(auth)/user";
import { IUserTeam } from "@/types/team";
import { Users, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { LoadingCentered } from "@/components/ui/Loading";

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
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  // 그라데이션 색상 배열 (팀별로 다른 색상 적용)
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {userTeams.map((team, index) => {
        const gradient = gradients[index % gradients.length];
        const isHovered = hoveredIndex === index;

        return (
          <button
            key={team.id}
            className={`group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 text-left ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:border-transparent"
            }`}
            onClick={() => handleTeamSelect(team.id)}
            disabled={isLoading}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
            }}
          >
            {/* 그라데이션 배경 (hover 시 표시) */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* 상단 그라데이션 바 */}
            <div className={`h-2 bg-gradient-to-r ${gradient}`} />

            {/* 컨텐츠 영역 */}
            <div className="relative p-6">
              {/* 아이콘과 타이틀 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform transition-transform duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                      {team.teamName}
                    </h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Sparkles className="w-3 h-3" />
                      <span>팀 ID: {team.id}</span>
                    </div>
                  </div>
                </div>

                {/* 화살표 아이콘 */}
                <div className={`transform transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                </div>
              </div>

              {/* 생성일 정보 */}
              {team.createdAt && (
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {new Date(team.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} 생성
                  </span>
                </div>
              )}

              {/* 호버 시 나타나는 "선택하기" 텍스트 */}
              <div className={`mt-4 text-sm font-semibold text-blue-600 transform transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                클릭하여 선택 →
              </div>
            </div>

            {/* 로딩 오버레이 */}
            {isLoading && (
              <div className="flex absolute inset-0 justify-center items-center bg-white/80 backdrop-blur-sm">
                <LoadingCentered size="sm" />
              </div>
            )}
          </button>
        );
      })}

      {/* 애니메이션 keyframes를 위한 style 태그 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
