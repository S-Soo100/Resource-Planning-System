import { teamApi } from "@/api/team-api";
import { authStore } from "@/store/authStore";
import { UserTeamMapping } from "@/types/team";

export const adminTeamService = {
  createNewTeam: async ({
    teamName,
  }: {
    teamName: string;
  }): Promise<UserTeamMapping | undefined> => {
    const newTeam = await teamApi.createTeam({ teamName });
    const user = authStore.getState().user;

    if (newTeam.data?.id && user?.id) {
      const response = await teamApi.addUserToTeam(
        newTeam.data.id,
        String(user.id)
      );
      return response.data;
    }

    return undefined;
  },
};
