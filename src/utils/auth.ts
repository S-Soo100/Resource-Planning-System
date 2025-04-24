import { create } from "zustand";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const useAuth = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  login: (user: User) => set({ isLoggedIn: true, user }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));

export { useAuth };
