import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@/api/team-api";
import { userApi } from "@/api/user-api";
import { Team } from "@/types/team";
import { IMappingUser } from "@/types/mappingUser";
import { CreateUserDto } from "@/types/(auth)/user";
import toast from "react-hot-toast";

/**
 * 팀 사용자 관리를 위한 커스텀 훅
 */
export const useTeamAdmin = (teamId: number) => {
  const queryClient = useQueryClient();

  // 팀 정보 및 팀 사용자 목록 조회
  const {
    data: teamData,
    isLoading: isTeamLoading,
    error: teamError,
  } = useQuery<Team>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      console.log("API 호출: 팀 정보 조회", { teamId });
      const response = await teamApi.getTeam(Number(teamId));
      console.log("API 응답: 팀 정보 조회", {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || "팀 정보를 가져오는데 실패했습니다.");
      }
      return response.data;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 신선한 상태로 유지
    gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 방지
    refetchOnMount: false, // 컴포넌트 마운트 시 자동 refetch 방지
    refetchOnReconnect: false, // 네트워크 재연결 시 자동 refetch 방지
  });

  // 새 사용자 생성
  const createUser = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      console.log("API 호출: 사용자 생성", { email: userData.email });
      const response = await userApi.createUser(userData);
      console.log("API 응답: 사용자 생성", {
        success: response.success,
        hasData: !!response.data,
        error: response.error,
      });

      let userId = extractUserId(response.data);
      let tryCount = 0;
      while ((!userId || typeof userId !== "number") && tryCount < 4) {
        await new Promise((res) => setTimeout(res, 500));
        userId = extractUserId(response.data);
        tryCount++;
        console.log(`유저 id 재확인 시도 ${tryCount}회:`, userId);
      }

      if (!userId || typeof userId !== "number") {
        throw new Error("생성된 유저의 id를 확인할 수 없습니다.");
      }

      // 사용자 생성 성공 후 바로 팀에 추가
      console.log("API 호출: 팀에 사용자 추가", {
        teamId,
        userId,
      });
      const addResult = await teamApi.addUserToTeam(teamId, userId);
      console.log("API 응답: 팀에 사용자 추가", {
        success: addResult.success,
        error: addResult.error,
      });
      if (!addResult.success) {
        throw new Error(addResult.error || "팀에 사용자 추가에 실패했습니다.");
      }

      return response.data;
    },
    onSuccess: () => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      toast.success("사용자가 생성되고 팀에 추가되었습니다.");
    },
    onError: (error) => {
      toast.error(error.message || "사용자 생성 중 오류가 발생했습니다.");
    },
  });

  // 팀에 유저 추가
  const addUserToTeam = useMutation({
    mutationFn: async (userId: number) => {
      console.log("API 호출: 기존 사용자 팀 추가", { teamId, userId });
      const response = await teamApi.addUserToTeam(teamId, userId);
      console.log("API 응답: 기존 사용자 팀 추가", {
        success: response.success,
        error: response.error,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
    },
  });

  // 팀에서 유저 제거
  const removeUser = useMutation({
    mutationFn: async (userId: number) => {
      console.log("API 호출: 팀에서 사용자 제거", { teamId, userId });
      const response = await teamApi.removeUserFromTeam(teamId, userId);
      console.log("API 응답: 팀에서 사용자 제거", {
        success: response.success,
        error: response.error,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
    },
  });

  // 사용자 정보 업데이트
  const updateUser = useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: number;
      userData: any;
    }) => {
      console.log("API 호출: 사용자 정보 업데이트", { userId, userData });
      const response = await userApi.updateUser(userId.toString(), userData);
      console.log("API 응답: 사용자 정보 업데이트", {
        success: response.success,
        error: response.error,
      });
      return response;
    },
    onSuccess: (response, variables) => {
      // 팀 캐시와 개별 사용자 캐시 모두 무효화
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      toast.success("사용자 정보가 성공적으로 수정되었습니다.");
    },
    onError: (error) => {
      console.error("[useTeamAdmin] 사용자 정보 업데이트 오류:", error);
      toast.error("사용자 정보 수정 중 오류가 발생했습니다.");
    },
  });

  // 추가 디버깅 정보 출력
  // console.log("useTeamAdmin 상태:", {
  //   현재팀ID: teamId,
  //   팀데이터있음: !!teamData,
  //   사용자수: teamData?.teamUserMap?.length || 0,
  // });

  // 팀 사용자 목록
  const teamUsers: IMappingUser[] = teamData?.teamUserMap || [];

  return {
    // 팀 유저 목록
    teamUsers,

    // 팀 유저 목록 로딩 상태
    isLoading: isTeamLoading,

    // 팀 유저 목록 로딩 에러
    error: teamError,

    // 유저 생성 함수
    createUser: createUser.mutate,

    // 유저 생성 중 상태
    isCreatingUser: createUser.isPending,

    // 유저 생성 에러
    createUserError: createUser.error,

    // 팀에 기존 유저 추가 함수
    addUser: addUserToTeam.mutate,

    // 유저 추가 중 상태
    isAddingUser: addUserToTeam.isPending,

    // 유저 제거 함수
    removeUser: removeUser.mutate,

    // 유저 제거 중 상태
    isRemovingUser: removeUser.isPending,

    // 사용자 정보 업데이트 함수
    updateUser: updateUser.mutate,

    // 사용자 정보 업데이트 중 상태
    isUpdatingUser: updateUser.isPending,
  };
};

// id 추출 타입 가드 함수
function extractUserId(data: unknown): number | undefined {
  if (data && typeof data === "object") {
    if ("id" in data && typeof (data as { id?: unknown }).id === "number") {
      return (data as { id: number }).id;
    }
    if (
      "data" in data &&
      typeof (data as { data?: unknown }).data === "object" &&
      (data as { data?: unknown }).data !== null
    ) {
      const inner = (data as { data: unknown }).data;
      if (
        inner &&
        typeof inner === "object" &&
        "id" in inner &&
        typeof (inner as { id?: unknown }).id === "number"
      ) {
        return (inner as { id: number }).id;
      }
    }
  }
  return undefined;
}
