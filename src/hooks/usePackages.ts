import { useState, useEffect } from "react";
import { packageApi } from "@/api/package-api";
import {
  PackageApi,
  CreateIPackageDto,
  UpdatePackageDto,
} from "@/types/package";
import { authStore } from "@/store/authStore";

interface UsePackagesResult {
  packages: PackageApi[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addPackage: (packageData: CreateIPackageDto) => Promise<boolean>;
  updatePackage: (
    id: string,
    packageData: UpdatePackageDto
  ) => Promise<boolean>;
  deletePackage: (id: string) => Promise<boolean>;
}

export const usePackages = (): UsePackagesResult => {
  const [packages, setPackages] = useState<PackageApi[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const selectedTeamId = authStore((state) => state.selectedTeam?.id);

  const fetchPackages = async () => {
    if (!selectedTeamId) {
      setError("선택된 팀이 없습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await packageApi.getPackage(selectedTeamId);
      if (response.success && response.data) {
        setPackages(response.data);
      } else {
        setError(response.message || "알 수 없는 오류가 발생했습니다.");
      }
    } catch {
      setError("패키지를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const addPackage = async (
    packageData: CreateIPackageDto
  ): Promise<boolean> => {
    try {
      const response = await packageApi.createPackage(packageData);
      if (response.success) {
        await fetchPackages(); // 패키지 추가 후 목록 새로고침
        return true;
      } else {
        setError(response.message || "패키지 추가에 실패했습니다.");
        return false;
      }
    } catch {
      setError("패키지 추가 중 오류가 발생했습니다.");
      return false;
    }
  };

  const updatePackage = async (
    id: string,
    packageData: UpdatePackageDto
  ): Promise<boolean> => {
    try {
      const response = await packageApi.updatePackage(id, packageData);
      if (response.success) {
        await fetchPackages(); // 패키지 수정 후 목록 새로고침
        return true;
      } else {
        setError(response.message || "패키지 수정에 실패했습니다.");
        return false;
      }
    } catch {
      setError("패키지 수정 중 오류가 발생했습니다.");
      return false;
    }
  };

  const deletePackage = async (id: string): Promise<boolean> => {
    try {
      const response = await packageApi.deletePackage(id);
      if (response.success) {
        await fetchPackages(); // 패키지 삭제 후 목록 새로고침
        return true;
      } else {
        setError(response.message || "패키지 삭제에 실패했습니다.");
        return false;
      }
    } catch {
      setError("패키지 삭제 중 오류가 발생했습니다.");
      return false;
    }
  };

  useEffect(() => {
    if (selectedTeamId) {
      fetchPackages();
    }
  }, [selectedTeamId]);

  return {
    packages,
    isLoading,
    error,
    refetch: fetchPackages,
    addPackage,
    updatePackage,
    deletePackage,
  };
};
