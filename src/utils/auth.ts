import create from "zustand";

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

const useAuth = create<AuthState>()();
// ... Zustand 설정

export { useAuth };
