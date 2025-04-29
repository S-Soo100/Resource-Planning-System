import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { packageApi } from "@/api/package-api";
import { CreateIPackageDto, UpdatePackageDto } from "@/types/package";
import { authStore } from "@/store/authStore";
import toast from "react-hot-toast";

export function usePackages() {
  const queryClient = useQueryClient();
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  // 패키지 목록 조회
  const useGetPackages = () => {
    const query = useQuery({
      queryKey: ["packages", selectedTeamId],
      queryFn: async () => {
        if (!selectedTeamId) {
          throw new Error("선택된 팀이 없습니다.");
        }

        const response = await packageApi.getPackage(String(selectedTeamId));
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || "패키지 목록 조회에 실패했습니다");
      },
      enabled: !!selectedTeamId,
      staleTime: 5 * 60 * 1000, // 5분
    });

    return {
      packages: query.data,
      ...query,
    };
  };

  // 패키지 생성 뮤테이션
  const useCreatePackage = () => {
    const mutation = useMutation({
      mutationFn: (packageData: CreateIPackageDto) =>
        packageApi.createPackage(packageData),
      onSuccess: (response) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["packages", selectedTeamId],
          });
          toast.success("패키지가 생성되었습니다.");
        } else {
          toast.error(response.message || "패키지 생성에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("패키지 생성 중 오류가 발생했습니다.");
      },
    });

    return {
      createPackage: mutation.mutate,
      createPackageAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  // 패키지 수정 뮤테이션
  const useUpdatePackage = () => {
    const mutation = useMutation({
      mutationFn: ({
        id,
        packageData,
      }: {
        id: string;
        packageData: UpdatePackageDto;
      }) => packageApi.updatePackage(id, packageData),
      onSuccess: (response) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["packages", selectedTeamId],
          });
          toast.success("패키지가 수정되었습니다.");
        } else {
          toast.error(response.message || "패키지 수정에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("패키지 수정 중 오류가 발생했습니다.");
      },
    });

    return {
      updatePackage: mutation.mutate,
      updatePackageAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  // 패키지 삭제 뮤테이션
  const useDeletePackage = () => {
    const mutation = useMutation({
      mutationFn: (id: string) => packageApi.deletePackage(id),
      onSuccess: (response) => {
        if (response.success) {
          // 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["packages", selectedTeamId],
          });
          toast.success("패키지가 삭제되었습니다.");
        } else {
          toast.error(response.message || "패키지 삭제에 실패했습니다.");
        }
      },
      onError: () => {
        toast.error("패키지 삭제 중 오류가 발생했습니다.");
      },
    });

    return {
      deletePackage: mutation.mutate,
      deletePackageAsync: mutation.mutateAsync,
      ...mutation,
    };
  };

  return {
    useGetPackages,
    useCreatePackage,
    useUpdatePackage,
    useDeletePackage,
  };
}
