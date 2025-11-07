"use client";

import { useEffect, useState, ReactNode, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  User,
  Edit,
  Lock,
  Shield,
  Users,
  Truck,
  UserCheck,
} from "lucide-react";
import { IUserTeam } from "@/types/team";
import { useRouter } from "next/navigation";
import { teamApi } from "@/api/team-api";

// UI 컴포넌트 정의
const Card = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}
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
    className={`flex overflow-hidden relative w-10 h-10 rounded-full shrink-0 ${className}`}
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
      className={`w-full h-full aspect-square ${className}`}
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
    className={`flex justify-center items-center w-full h-full text-gray-500 bg-gray-800 rounded-full ${className}`}
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
  const [userTeams, setUserTeams] = useState<IUserTeam[]>([]);
  const router = useRouter();

  // useCurrentUser 훅을 사용하여 사용자 정보 가져오기 (React Query와 동기화)
  const { user: currentUser, isLoading } = useCurrentUser();
  const user = currentUser as ExtendedUser | null;

  const fetchUserTeams = useCallback(async () => {
    if (!user?.id) return;

    try {
      // 모든 팀 조회
      const response = await teamApi.getAllTeams();

      if (response.success && response.data) {
        // 현재 사용자가 소속된 팀만 필터링
        const userTeams = response.data
          .filter((team) =>
            team.teamUserMap?.some((mapping) => mapping.userId === user.id)
          )
          .map((team) => ({
            id: team.id,
            teamName: team.teamName,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
          }));

        setUserTeams(userTeams);
      } else {
        console.error("팀 목록 조회 실패:", response.error);
        setUserTeams([]);
      }
    } catch (error) {
      console.error("팀 목록을 가져오는데 실패했습니다:", error);
      setUserTeams([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && !isLoading) {
      // 사용자의 팀 목록 가져오기
      fetchUserTeams();
    }
  }, [user?.id, isLoading, fetchUserTeams]);

  // 권한 레벨별 아이콘 및 색상
  const getAccessLevelDisplay = (level: AccessLevel) => {
    const displays = {
      admin: {
        icon: Shield,
        label: "관리자",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        iconColor: "text-red-600",
      },
      moderator: {
        icon: UserCheck,
        label: "1차승인권자",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        iconColor: "text-yellow-600",
      },
      user: {
        icon: Users,
        label: "일반 사용자",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        iconColor: "text-blue-600",
      },
      supplier: {
        icon: Truck,
        label: "외부업체",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        iconColor: "text-green-600",
      },
    };
    return displays[level];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-3xl sm:px-6 lg:px-8 sm:py-12">
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
                      {(() => {
                        const display = getAccessLevelDisplay(user.accessLevel);
                        const IconComponent = display.icon;
                        return (
                          <span
                            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${display.bgColor} ${display.textColor}`}
                          >
                            <IconComponent
                              className={`mr-2 w-4 h-4 ${display.iconColor}`}
                            />
                            {display.label}
                          </span>
                        );
                      })()}
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
                    <p className="px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-md">
                      {user?.email || "이메일 정보 없음"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      이메일은 변경할 수 없습니다.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      이름
                    </h3>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600">
                        {user?.name || "이름 없음"}
                      </span>
                      <button
                        onClick={() => router.push("/account/edit-profile")}
                        className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-white rounded-lg border border-blue-200 transition-colors hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="mr-1 w-4 h-4" />
                        변경
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      비밀번호
                    </h3>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600">••••••••</span>
                      <button
                        onClick={() => router.push("/account/change-password")}
                        className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-white rounded-lg border border-blue-200 transition-colors hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Lock className="mr-1 w-4 h-4" />
                        변경
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      권한 레벨
                    </h3>
                    <div className="p-3 bg-gray-50 rounded-md">
                      {user?.accessLevel ? (
                        (() => {
                          const display = getAccessLevelDisplay(
                            user.accessLevel
                          );
                          const IconComponent = display.icon;
                          return (
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full ${display.bgColor} ${display.textColor}`}
                              >
                                <IconComponent
                                  className={`mr-2 w-4 h-4 ${display.iconColor}`}
                                />
                                {display.label}
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-gray-500">
                          권한 정보 없음
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      권한 레벨은 관리자만 변경할 수 있습니다.
                    </p>
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
                        className="p-4 rounded-lg border border-gray-200 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-center">
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
                    <div className="flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full">
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
