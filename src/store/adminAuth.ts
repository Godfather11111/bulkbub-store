import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminAuthState {
  isAuthenticated: boolean;
  password: string;
  login: (password: string) => boolean;
  logout: () => void;
  setPassword: (oldPassword: string, newPassword: string) => boolean;
}

// Default admin password - user can change after first login
const DEFAULT_PASSWORD = "bulkhub2025";

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      password: DEFAULT_PASSWORD,
      login: (password: string) => {
        if (password === get().password) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
      setPassword: (oldPassword: string, newPassword: string) => {
        if (oldPassword === get().password && newPassword.length >= 6) {
          set({ password: newPassword });
          return true;
        }
        return false;
      },
    }),
    {
      name: "bulkhub-admin-auth",
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, password: state.password }),
    }
  )
);
