"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { authStore } from "@/store/authStore";
import { User } from "lucide-react";
import { IUserTeam } from "@/types/team";

// UI 컴포넌트 정의
const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;

const CardContent = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Avatar = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
  >
    {children}
  </div>
);

const AvatarImage = ({
  src,
  alt = "",
  className = "",
}: {
  src: string | null;
  alt?: string;
  className?: string;
}) =>
  src ? (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full ${className}`}
    />
  ) : null;

const AvatarFallback = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex h-full w-full items-center justify-center rounded-full bg-gray-800 text-gray-500 ${className}`}
  >
    {children}
  </div>
);

// 권한 레벨 타입 정의
type AccessLevel = "admin" | "user" | "supplier" | "moderator";

// 사용자 확장 타입 정의
interface ExtendedUser {
  id: number;
  email: string;
  name: string;
  accessLevel?: AccessLevel;
  isAdmin: boolean;
  createdAt?: string;
  teams?: IUserTeam[];
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [userTeams, setUserTeams] = useState<IUserTeam[]>([]);

  // 직접 authStore에서 사용자 정보 가져오기
  const user = authStore((state) => state.user) as ExtendedUser | null;

  const fetchUserTeams = useCallback(async () => {
    try {
      // 임시 데이터
      setUserTeams([
        {
          id: 1,
          teamName: "개발팀",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          teamName: "운영팀",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("팀 목록을 가져오는데 실패했습니다:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
      // 사용자의 팀 목록 가져오기
      if (user.id) {
        fetchUserTeams();
      }
    }
  }, [user, fetchUserTeams]);

  // 권한 레벨 한글화
  const getAccessLevelKorean = (level: AccessLevel): string => {
    const levelMap: Record<AccessLevel, string> = {
      admin: "관리자",
      user: "일반 사용자",
      supplier: "거래처",
      moderator: "1차승인권자",
    };
    return levelMap[level];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        로딩중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            내 계정
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            계정 정보와 소속 팀을 확인하고 관리하세요.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="p-6 bg-white border-b border-gray-100 sm:p-8">
              <CardTitle className="text-lg sm:text-xl">프로필 정보</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                  <AvatarImage src={null} />
                  <AvatarFallback className="bg-blue-600">
                    <User className="w-8 h-8 text-white sm:w-10 sm:h-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 truncate sm:text-2xl">
                    {user?.name || "이름 없음"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 truncate sm:text-base">
                    {user?.email || "이메일 정보 없음"}
                  </p>
                  {user?.accessLevel && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                        {getAccessLevelKorean(user.accessLevel)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 sm:gap-8">
            <Card className="overflow-hidden">
              <CardHeader className="p-6 bg-white border-b border-gray-100">
                <CardTitle className="text-lg">계정 설정</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      이메일
                    </h3>
                    <p className="px-3 py-2 text-sm text-gray-600 rounded-md bg-gray-50">
                      {user?.email || "이메일 정보 없음"}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      권한 레벨
                    </h3>
                    <div className="flex items-center space-x-2">
                      {user?.isAdmin && (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                          관리자
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="p-6 bg-white border-b border-gray-100">
                <CardTitle className="text-lg">소속 팀 목록</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {userTeams.length > 0 ? (
                  <div className="space-y-3">
                    {userTeams.map((team) => (
                      <div
                        key={team.id}
                        className="p-4 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {team.teamName}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              팀 ID: {team.id}
                            </p>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      소속된 팀이 없습니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
