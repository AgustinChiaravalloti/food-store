import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Usuario } from "../features/auth/types/usuario";
import { axiosInstance } from "../shared/api/axiosInstance";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        const body = new URLSearchParams({ username, password });
        await axiosInstance.post("/auth/token", body);
        const { data } = await axiosInstance.get<Usuario>("/auth/me");
        set({ usuario: data });
      },
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
        } finally {
          set({ usuario: null });
        }
      },
      checkSession: async () => {
        set({ cargando: true });
        try {
          const { data } = await axiosInstance.get<Usuario>("/auth/me");
          set({ usuario: data });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);