import { create } from 'zustand';

type AuthState = {
  token: string | null;
  //   status: string | null; TO BE IMPLEMENTED
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  
  token: null,
  hydrated: true,
  setToken: (token) => set({ token }),
  setHydrated: () => set({ hydrated: true }),
}));
