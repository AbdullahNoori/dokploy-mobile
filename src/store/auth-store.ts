import { create } from 'zustand';

import { ProjectAllResponse } from '@/types/projects';
import { getRequest } from '@/lib/http';
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

type LoginPayload = {
  serverUrl: string;
  pat: string;
};

type AuthStore = {
  status: AuthStatus;
  isHandlingUnauthorized: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  handleUnauthorized: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: 'booting',
  isHandlingUnauthorized: false,

  bootstrap: async () => {
    try {
      await initHttpConfig();
      const hasCredentials = Boolean(getServerUrl() && getPat());
      set({ status: hasCredentials ? 'signedIn' : 'signedOut' });
    } catch {
      set({ status: 'signedOut' });
    }
  },

  login: async ({ serverUrl, pat }) => {
    await getRequest<ProjectAllResponse>('project/all', undefined, {
      baseURL: serverUrl,
      headers: {
        'x-api-key': pat,
      },
    });

    setServerUrl(serverUrl);
    await setPat(pat);
    set({ status: 'signedIn' });
  },

  logout: async () => {
    await clearCredentials();
    clearStoredPushNotificationState();
    set({ status: 'signedOut' });
  },

  handleUnauthorized: async () => {
    if (get().isHandlingUnauthorized) {
      return;
    }

    set({ isHandlingUnauthorized: true });

    try {
      await clearCredentials();
      clearStoredPushNotificationState();
      set({ status: 'signedOut' });
    } finally {
      set({ isHandlingUnauthorized: false });
    }
  },
}));
