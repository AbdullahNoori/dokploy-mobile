import { create } from 'zustand';

import { PAT_STORAGE_KEY, patStorage } from '@/lib/pat-storage';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';
export type AuthResponse = { token: string };

type AuthState = {
  status: AuthStatus;
  pat: string | null;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  setAuthFromResponse: (response: AuthResponse) => Promise<void>;
};

const persistPat = (pat: string | null) => {
  if (!pat) {
    patStorage.remove(PAT_STORAGE_KEY);
    return;
  }
  patStorage.set(PAT_STORAGE_KEY, pat);
};

const clearStoredAuth = async () => {
  persistPat(null);
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'checking',
  pat: null,

  initialize: async () => {
    try {
      const storedPat = patStorage.getString(PAT_STORAGE_KEY);

      if (!storedPat) {
        set({ status: 'unauthenticated', pat: null });
        return;
      }

      set({ status: 'authenticated', pat: storedPat });
    } catch (error) {
      console.warn('Failed to restore auth state', error);
      await clearStoredAuth();
      set({ status: 'unauthenticated', pat: null });
    }
  },

  logout: async () => {
    await clearStoredAuth();
    set({ status: 'unauthenticated', pat: null });
  },

  setAuthFromResponse: async (response) => {
    const { token } = response;

    persistPat(token);

    set((state) => ({
      ...state,
      status: 'authenticated',
      pat: token,
    }));
  },
}));
