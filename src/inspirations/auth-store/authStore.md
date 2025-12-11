import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  AuthResponse,
  AuthUser,
  LoginPayload,
  SignupPayload,
  UpdateProfilePayload,
  fetchProfile,
  login as loginRequest,
  signup as signupRequest,
  updateProfile as updateProfileRequest,
} from "@/src/api/auth";
import { PAT_STORAGE_KEY, patStorage } from "@/src/lib/pat-storage";

const USER_KEY = "@tarkeeb/user";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  pat: string | null;
  initialize: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  setAuthFromResponse: (response: AuthResponse) => Promise<void>;
}

const persistPat = (pat: string | null) => {
  if (!pat) {
    patStorage.delete(PAT_STORAGE_KEY);
    return;
  }
  patStorage.set(PAT_STORAGE_KEY, pat);
};

const persistUser = async (user: AuthUser | null) => {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearStoredAuth = async () => {
  persistPat(null);
  await AsyncStorage.removeItem(USER_KEY);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "checking",
  user: null,
  pat: null,

  initialize: async () => {
    try {
      const storedPat = patStorage.getString(PAT_STORAGE_KEY);
      const userRaw = await AsyncStorage.getItem(USER_KEY);
      const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;

      if (!storedPat) {
        set({ pat: null, user: null, status: "unauthenticated" });
        return;
      }

      set({ pat: storedPat, user, status: "authenticated" });

      if (!user) {
        await get().loadProfile();
      }
    } catch (error) {
      console.warn("Failed to restore auth state", error);
      await clearStoredAuth();
      set({ pat: null, user: null, status: "unauthenticated" });
    }
  },

  login: async (payload) => {
    const response = await loginRequest(payload);
    await get().setAuthFromResponse(response);
  },

  signup: async (payload) => {
    const response = await signupRequest(payload);
    await get().setAuthFromResponse(response);
  },

  logout: async () => {
    await clearStoredAuth();
    set({ pat: null, user: null, status: "unauthenticated" });
  },

  loadProfile: async () => {
    try {
      const profile = await fetchProfile();
      await persistUser(profile);
      set((state) => ({ ...state, user: profile }));
    } catch (error) {
      console.warn("Failed to load profile", error);
    }
  },

  updateProfile: async (payload) => {
    const profile = await updateProfileRequest(payload);
    await persistUser(profile);
    set((state) => ({ ...state, user: profile }));
  },

  setAuthFromResponse: async (response) => {
    const { token, user } = response;

    persistPat(token);
    if (user) {
      await persistUser(user);
    }
    set((state) => ({
      ...state,
      pat: token,
      user: user ?? state.user,
      status: "authenticated",
    }));

    if (!user) {
      await get().loadProfile();
    }
  },
}));
