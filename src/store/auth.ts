import { HttpStatusCode } from "axios";
import { create } from "zustand";

import {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  login,
  signup,
} from "@/src/api/auth";
import { fetchProjects } from "@/src/api/dashboard";
import { fetchProfile } from "@/src/api/profile";
import { HttpError } from "@/src/lib/http-error";
import {
  PAT_STORAGE_KEY,
  getServerUrl,
  normalizeServerUrl,
  patStorage,
  persistServerUrl,
} from "@/src/lib/pat-storage";

const USER_KEY = "@dokploy/user";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  pat: string | null;
  user: AuthResponse["user"] | null;
  initialize: () => Promise<void>;
  authenticateWithPat: (
    pat: string,
    serverUrl?: string | null
  ) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setAuthFromResponse: (response: AuthResponse) => Promise<void>;
};

const persistPat = (pat: string | null) => {
  if (!pat) {
    patStorage.remove(PAT_STORAGE_KEY);
    return;
  }
  patStorage.set(PAT_STORAGE_KEY, pat);
};

const persistUser = async (user: AuthResponse["user"] | null) => {
  if (!user) {
    patStorage.remove(USER_KEY);
    return;
  }
  patStorage.set(USER_KEY, JSON.stringify(user));
};

const clearStoredAuth = async () => {
  persistPat(null);
  patStorage.remove(USER_KEY);
};

const validatePatAndServer = async (pat: string, serverUrl: string) => {
  try {
    await fetchProjects({
      baseURL: serverUrl,
      headers: { Authorization: `Bearer ${pat}` },
    });
  } catch (error: any) {
    const normalizedError =
      error instanceof HttpError ? error : new HttpError(error);
    const status = normalizedError.response?.status;

    if (status === HttpStatusCode.Unauthorized) {
      throw new HttpError("Invalid personal access token.");
    }

    if (status === HttpStatusCode.NotFound) {
      throw new HttpError(
        "Invalid Dokploy server URL. The /api endpoint was not found."
      );
    }

    if (!normalizedError.response) {
      throw new HttpError("Unable to connect to server.");
    }

    throw normalizedError;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "checking",
  pat: null,
  user: null,

  initialize: async () => {
    try {
      const storedPat = patStorage.getString(PAT_STORAGE_KEY);
      const userRaw = patStorage.getString(USER_KEY);
      const user = userRaw
        ? (JSON.parse(userRaw) as AuthResponse["user"])
        : null;

      if (!storedPat) {
        set({ status: "unauthenticated", pat: null, user: null });
        return;
      }

      set({ status: "authenticated", pat: storedPat, user });

      if (!user) {
        await get().loadProfile();
      }
    } catch (error) {
      console.warn("Failed to restore auth state", error);
      await clearStoredAuth();
      set({ status: "unauthenticated", pat: null, user: null });
    }
  },

  authenticateWithPat: async (rawPat: string, serverUrl?: string | null) => {
    const pat = rawPat.trim();
    const normalizedServer =
      normalizeServerUrl(serverUrl ?? getServerUrl()) ?? null;

    if (!pat) {
      throw new Error("Personal access token is required.");
    }

    if (!normalizedServer) {
      throw new Error("Dokploy server URL is not configured.");
    }

    try {
      await validatePatAndServer(pat, normalizedServer);
      persistServerUrl(normalizedServer);

      persistPat(pat);

      set((state) => ({
        ...state,
        status: "authenticated",
        pat,
      }));

      await get().loadProfile();
    } catch (error: any) {
      await clearStoredAuth();
      throw error instanceof HttpError ? error : new HttpError(error);
    }
  },

  login: async (payload) => {
    const response = await login(payload);
    await get().setAuthFromResponse(response);
  },

  signup: async (payload) => {
    const response = await signup(payload);
    await get().setAuthFromResponse(response);
  },

  logout: async () => {
    await clearStoredAuth();
    set({ status: "unauthenticated", pat: null, user: null });
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

  setAuthFromResponse: async (response) => {
    const { token, user } = response;

    persistPat(token);

    if (user) {
      await persistUser(user);
    }

    set((state) => ({
      ...state,
      status: "authenticated",
      pat: token,
      user: user ?? state.user,
    }));

    if (!user) {
      await get().loadProfile();
    }
  },
}));
