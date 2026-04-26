import { create } from 'zustand';

import { readHaveRootAccess, verifyApiKeyAccess } from '@/api/user';
import {
  clearCredentials,
  getPat,
  getServerUrl,
  initHttpConfig,
  setPat,
  setServerUrl,
} from '@/lib/http-config';
import { clearStoredPushNotificationState } from '@/lib/push-notification-storage';

export type AuthStatus = 'booting' | 'signedOut' | 'signedIn';
export type RootAccessStatus = 'unknown' | 'checking' | 'allowed' | 'denied' | 'error';

type LoginPayload = {
  serverUrl: string;
  pat: string;
};

type AuthStore = {
  status: AuthStatus;
  rootAccessStatus: RootAccessStatus;
  hasRootAccess: boolean;
  isHandlingUnauthorized: boolean;
  shouldShowPushOnboarding: boolean;
  bootstrap: () => Promise<void>;
  consumePushOnboarding: () => void;
  refreshRootAccess: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  handleUnauthorized: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: 'booting',
  rootAccessStatus: 'unknown',
  hasRootAccess: false,
  isHandlingUnauthorized: false,
  shouldShowPushOnboarding: false,

  bootstrap: async () => {
    try {
      await initHttpConfig();
      const hasCredentials = Boolean(getServerUrl() && getPat());
      set({
        status: hasCredentials ? 'signedIn' : 'signedOut',
        shouldShowPushOnboarding: false,
      });

      if (hasCredentials) {
        await get().refreshRootAccess();
      } else {
        set({ rootAccessStatus: 'unknown', hasRootAccess: false });
      }
    } catch {
      set({
        status: 'signedOut',
        rootAccessStatus: 'unknown',
        hasRootAccess: false,
        shouldShowPushOnboarding: false,
      });
    }
  },

  consumePushOnboarding: () => {
    set({ shouldShowPushOnboarding: false });
  },

  refreshRootAccess: async () => {
    if (!getServerUrl() || !getPat()) {
      set({ rootAccessStatus: 'unknown', hasRootAccess: false });
      return;
    }

    set({ rootAccessStatus: 'checking', hasRootAccess: false });

    try {
      const hasRootAccess = await readHaveRootAccess();
      set({
        rootAccessStatus: hasRootAccess ? 'allowed' : 'denied',
        hasRootAccess,
      });
    } catch {
      set({ rootAccessStatus: 'error', hasRootAccess: false });
    }
  },

  login: async ({ serverUrl, pat }) => {
    const { hasRootAccess } = await verifyApiKeyAccess({
      baseURL: serverUrl,
      apiKey: pat,
    });

    setServerUrl(serverUrl);
    await setPat(pat);
    set({
      status: 'signedIn',
      rootAccessStatus: hasRootAccess ? 'allowed' : 'denied',
      hasRootAccess,
      shouldShowPushOnboarding: true,
    });
  },

  logout: async () => {
    await clearCredentials();
    clearStoredPushNotificationState();
    set({
      status: 'signedOut',
      rootAccessStatus: 'unknown',
      hasRootAccess: false,
      shouldShowPushOnboarding: false,
    });
  },

  handleUnauthorized: async () => {
    if (get().isHandlingUnauthorized) {
      return;
    }

    set({ isHandlingUnauthorized: true });

    try {
      await clearCredentials();
      clearStoredPushNotificationState();
      set({
        status: 'signedOut',
        rootAccessStatus: 'unknown',
        hasRootAccess: false,
        shouldShowPushOnboarding: false,
      });
    } finally {
      set({ isHandlingUnauthorized: false });
    }
  },
}));
