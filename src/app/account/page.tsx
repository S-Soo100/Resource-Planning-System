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
      supplier: "공급자",
      moderator: "1차승인권자",
    };
    return levelMap[level];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        로딩중...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">내 계정</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={null} />
                <AvatarFallback className="bg-gray-800">
                  <User className="h-10 w-10 text-white" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {user?.name || "이름 없음"}
                </h2>
                <p className="text-gray-500">
                  {user?.email || "이메일 정보 없음"}
                </p>
                {user?.accessLevel && (
                  <p className="text-sm mt-1 inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {getAccessLevelKorean(user.accessLevel)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>계정 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">이메일</h3>
                <p className="text-gray-500">
                  {user?.email || "이메일 정보 없음"}
                </p>
              </div>
              <div>
                <h3 className="font-medium">계정 생성일</h3>
                <p className="text-gray-500">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("ko-KR")
                    : "알 수 없음"}
                </p>
              </div>
              <div>
                <h3 className="font-medium">권한 레벨</h3>
                <p className="text-gray-500">
                  {user?.accessLevel
                    ? getAccessLevelKorean(user.accessLevel)
                    : "권한 정보 없음"}
                </p>
                {user?.isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    관리자
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>소속 팀 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {userTeams.length > 0 ? (
              <div className="space-y-3">
                {userTeams.map((team) => (
                  <div
                    key={team.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div>
                        <h4 className="font-medium">{team.teamName}</h4>
                        <p className="text-sm text-gray-500">
                          팀 ID: {team.id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">소속된 팀이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
