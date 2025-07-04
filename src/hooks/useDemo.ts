import { useDemosByTeam, useSingleDemo } from "./(useDemo)/useDemoQueries";

import {
  useCreateDemo,
  useUpdateDemoStatus,
} from "./(useDemo)/useDemoMutations";

export const useDemo = () => {
  return {
    // 조회 관련 훅
    useDemosByTeam,
    useSingleDemo,

    // 변경 관련 훅
    useCreateDemo,
    useUpdateDemoStatus,
  };
};
