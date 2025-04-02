import { create } from "zustand";
import { IUser } from "@/types/user";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (user: IUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const authStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      error: null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
    }),
}));
