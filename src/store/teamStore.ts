import { Team } from "@/types/team";
import { persist } from "zustand/middleware";
import { create } from "zustand";

interface TeamState {
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  setCurrentTeam: (team: Team) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const teamStore = create<TeamState>()(
  persist(
    (set) => ({
      // Initial state
      currentTeam: null,
      isLoading: false,
      error: null,
      // Actions
      setCurrentTeam: (team) => set({ currentTeam: team }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "team-storage",
    }
  )
);
