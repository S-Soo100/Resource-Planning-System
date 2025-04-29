import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@/api/team-api";
import { userApi } from "@/api/user-api";
import { Team } from "@/types/team";
import { IMappingUser } from "@/types/mappingUser";
import { CreateUserDto } from "@/types/(auth)/user";

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
      const response = await teamApi.getTeam(Number(teamId));
      if (!response.success || !response.data) {
        throw new Error(response.error || "팀 정보를 가져오는데 실패했습니다.");
      }
      return response.data;
    },
    enabled: !!teamId,
  });

  // 새 사용자 생성
  const createUser = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      console.log("사용자 생성 데이터:", userData);
      const response = await userApi.createUser(userData);
      console.log("사용자 생성 응답:", response);
      if (!response.success || !response.data) {
        throw new Error(response.error || "사용자 생성에 실패했습니다.");
      }
      return response.data;
    },
  });

  // 팀에 유저 추가
  const addUserToTeam = useMutation({
    mutationFn: async (userId: number) => {
      return await teamApi.addUserToTeam(teamId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamUsers", teamId] });
    },
  });

  // 팀에서 유저 제거
  const removeUser = useMutation({
    mutationFn: async (userId: number) => {
      return await teamApi.removeUserFromTeam(teamId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamUsers", teamId] });
    },
  });

  // 새 사용자 생성 후 팀에 추가하는 함수
  const addUserWithCreation = async (userData: CreateUserDto) => {
    try {
      console.log("사용자 생성 및 팀 추가 시작");

      // 1. 먼저 새 사용자 생성
      const newUser = await createUser.mutateAsync(userData);
      console.log("생성된 사용자:", newUser);

      // 2. 생성된 사용자를 팀에 추가
      if (newUser) {
        // ID 추출 및 검증
        if (!newUser.id) {
          console.error("생성된 사용자에 ID가 없습니다:", newUser);
          return {
            success: false,
            error: "생성된 사용자 ID가 유효하지 않습니다.",
          };
        }

        // 팀에 사용자 추가 시도
        try {
          // 짧은 지연 추가 (API 서버 상태 반영 시간 확보)
          await new Promise((resolve) => setTimeout(resolve, 500));

          const addResult = await addUserToTeam.mutateAsync(newUser.id);
          console.log("팀에 사용자 추가 결과:", addResult);

          return { success: true, data: newUser };
        } catch (addError) {
          console.error("팀에 사용자 추가 중 오류:", addError);
          return {
            success: false,
            error:
              addError instanceof Error
                ? addError.message
                : "팀에 사용자 추가 중 오류가 발생했습니다.",
          };
        }
      }

      console.error("사용자 생성 후 유효한 응답이 없습니다");
      return {
        success: false,
        error: "사용자 생성 후 팀 추가에 실패했습니다.",
      };
    } catch (error) {
      console.error("사용자 생성 및 팀 추가 중 오류:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "사용자 생성 및 팀 추가 중 오류가 발생했습니다.",
      };
    }
  };

  // 추가 디버깅 정보 출력
  console.log("useTeamAdmin 상태:", {
    현재팀ID: teamId,
    팀데이터있음: !!teamData,
    사용자수: teamData?.teamUserMap?.length || 0,
  });

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

    // 팀에 기존 유저 추가 함수
    addUser: addUserToTeam.mutate,

    // 유저 추가 중 상태
    isAddingUser: addUserToTeam.isPending,

    // 새 유저 생성 후 팀에 추가 (통합 함수)
    addUserWithCreation,

    // 통합 함수 처리 중 확인
    isProcessingUser: createUser.isPending || addUserToTeam.isPending,

    // 유저 제거 함수
    removeUser: removeUser.mutate,

    // 유저 제거 중 상태
    isRemovingUser: removeUser.isPending,
  };
};
