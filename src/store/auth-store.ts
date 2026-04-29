import { create } from 'zustand';

import { hasOwnerRole, requestUserGet, verifyApiKeyOwnerAccess } from '@/api/user';
import {
  addStoredOrganization,
  clearCredentials,
  getActiveOrganization,
  getActiveOrganizationId,
  getOrganizations,
  getPat,
  getServerUrl,
  initHttpConfig,
  removeStoredOrganization,
  setActiveOrganization,
  setServerUrl,
  updateStoredOrganization,
  type StoredOrganization,
} from '@/lib/http-config';
import { clearStoredPushNotificationState } from '@/lib/push-notification-storage';
import { clearOrganizationSWRCache } from '@/lib/swr-cache';

export type AuthStatus = 'booting' | 'signedOut' | 'signedIn';
export type OwnerAccessStatus = 'unknown' | 'checking' | 'allowed' | 'denied' | 'error';

type LoginPayload = {
  serverUrl: string;
  pat: string;
};

type AddOrganizationPayload = {
  name: string;
  pat: string;
};

type AuthStore = {
  status: AuthStatus;
  ownerAccessStatus: OwnerAccessStatus;
  hasOwnerAccess: boolean;
  organizations: StoredOrganization[];
  activeOrganizationId: string | null;
  activeOrganization: StoredOrganization | null;
  isHandlingUnauthorized: boolean;
  shouldShowPushOnboarding: boolean;
  bootstrap: () => Promise<void>;
  addOrganization: (payload: AddOrganizationPayload) => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  removeOrganization: (organizationId: string) => Promise<void>;
  renameOrganization: (organizationId: string, name: string) => void;
  consumePushOnboarding: () => void;
  refreshOwnerAccess: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  handleUnauthorized: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: 'booting',
  ownerAccessStatus: 'unknown',
  hasOwnerAccess: false,
  organizations: [],
  activeOrganizationId: null,
  activeOrganization: null,
  isHandlingUnauthorized: false,
  shouldShowPushOnboarding: false,

  bootstrap: async () => {
    try {
      await initHttpConfig();
      const hasCredentials = Boolean(getServerUrl() && getActiveOrganization() && getPat());

      set({
        status: hasCredentials ? 'signedIn' : 'signedOut',
        ...getOwnerAccessState(getActiveOrganization()),
        ...getOrganizationStateSnapshot(),
        shouldShowPushOnboarding: false,
      });

      if (hasCredentials) {
        await get().refreshOwnerAccess();
      } else {
        set({ ownerAccessStatus: 'unknown', hasOwnerAccess: false });
      }
    } catch {
      set({
        status: 'signedOut',
        ownerAccessStatus: 'unknown',
        hasOwnerAccess: false,
        ...getOrganizationStateSnapshot(),
        shouldShowPushOnboarding: false,
      });
    }
  },

  addOrganization: async ({ name, pat }) => {
    const serverUrl = getServerUrl();
    const trimmedName = name.trim();
    const trimmedPat = pat.trim();

    if (!serverUrl) {
      throw new Error('Sign in with a Dokploy server URL before adding another organization.');
    }

    if (!trimmedName) {
      throw new Error('Enter an organization name.');
    }

    if (!trimmedPat) {
      throw new Error('Enter a personal access token.');
    }

    const { hasOwnerAccess, role } = await verifyApiKeyOwnerAccess({
      baseURL: serverUrl,
      apiKey: trimmedPat,
    });

    await addStoredOrganization({
      name: trimmedName,
      pat: trimmedPat,
      hasOwnerAccess,
      role,
    });
    clearStoredPushNotificationState();

    set({
      status: 'signedIn',
      ownerAccessStatus: hasOwnerAccess ? 'allowed' : 'denied',
      hasOwnerAccess,
      ...getOrganizationStateSnapshot(),
      shouldShowPushOnboarding: hasOwnerAccess,
    });
  },

  switchOrganization: async (organizationId) => {
    const organization = await setActiveOrganization(organizationId);
    clearStoredPushNotificationState();

    set({
      ...getOwnerAccessState(organization),
      ...getOrganizationStateSnapshot(),
      shouldShowPushOnboarding: false,
    });

    await get().refreshOwnerAccess();
  },

  removeOrganization: async (organizationId) => {
    const { nextActiveOrganization } = await removeStoredOrganization(organizationId);
    clearOrganizationSWRCache(organizationId);
    clearStoredPushNotificationState();

    if (!nextActiveOrganization || !getServerUrl() || !getPat()) {
      set({
        status: 'signedOut',
        ownerAccessStatus: 'unknown',
        hasOwnerAccess: false,
        ...getOrganizationStateSnapshot(),
        shouldShowPushOnboarding: false,
      });
      return;
    }

    set({
      status: 'signedIn',
      ...getOwnerAccessState(nextActiveOrganization),
      ...getOrganizationStateSnapshot(),
      shouldShowPushOnboarding: false,
    });

    await get().refreshOwnerAccess();
  },

  renameOrganization: (organizationId, name) => {
    updateStoredOrganization({ id: organizationId, name });
    set(getOrganizationStateSnapshot());
  },

  consumePushOnboarding: () => {
    set({ shouldShowPushOnboarding: false });
  },

  refreshOwnerAccess: async () => {
    const activeOrganizationId = getActiveOrganizationId();

    if (!getServerUrl() || !getPat() || !activeOrganizationId) {
      set({ ownerAccessStatus: 'unknown', hasOwnerAccess: false });
      return;
    }

    set({ ownerAccessStatus: 'checking', hasOwnerAccess: false });

    try {
      const user = await requestUserGet({ skipUnauthorizedHandler: true });
      const hasOwnerAccess = hasOwnerRole(user);
      updateStoredOrganization({
        id: activeOrganizationId,
        hasOwnerAccess,
        role: user.role ?? null,
      });
      set({
        ownerAccessStatus: hasOwnerAccess ? 'allowed' : 'denied',
        hasOwnerAccess,
        ...getOrganizationStateSnapshot(),
      });
    } catch {
      set({ ownerAccessStatus: 'error', hasOwnerAccess: false });
    }
  },

  login: async ({ serverUrl, pat }) => {
    const { hasOwnerAccess, role } = await verifyApiKeyOwnerAccess({
      baseURL: serverUrl,
      apiKey: pat,
    });

    setServerUrl(serverUrl);
    await addStoredOrganization({
      name: 'Primary Organization',
      pat,
      hasOwnerAccess,
      role,
    });
    set({
      status: 'signedIn',
      ownerAccessStatus: hasOwnerAccess ? 'allowed' : 'denied',
      hasOwnerAccess,
      ...getOrganizationStateSnapshot(),
      shouldShowPushOnboarding: hasOwnerAccess,
    });
  },

  logout: async () => {
    const organizationIds = getOrganizations().map((organization) => organization.id);
    await clearCredentials();
    organizationIds.forEach(clearOrganizationSWRCache);
    clearStoredPushNotificationState();
    set({
      status: 'signedOut',
      ownerAccessStatus: 'unknown',
      hasOwnerAccess: false,
      ...getOrganizationStateSnapshot(),
      shouldShowPushOnboarding: false,
    });
  },

  handleUnauthorized: async () => {
    if (get().isHandlingUnauthorized) {
      return;
    }

    set({ isHandlingUnauthorized: true });

    try {
      const activeOrganizationId = getActiveOrganizationId();

      if (activeOrganizationId) {
        await removeStoredOrganization(activeOrganizationId);
        clearOrganizationSWRCache(activeOrganizationId);
      } else {
        await clearCredentials();
      }

      clearStoredPushNotificationState();

      if (getActiveOrganization() && getPat()) {
        const activeOrganization = getActiveOrganization();
        set({
          status: 'signedIn',
          ...getOwnerAccessState(activeOrganization),
          ...getOrganizationStateSnapshot(),
          shouldShowPushOnboarding: false,
        });
        await get().refreshOwnerAccess();
      } else {
        set({
          status: 'signedOut',
          ownerAccessStatus: 'unknown',
          hasOwnerAccess: false,
          ...getOrganizationStateSnapshot(),
          shouldShowPushOnboarding: false,
        });
      }
    } finally {
      set({ isHandlingUnauthorized: false });
    }
  },
}));

function getOrganizationStateSnapshot() {
  return {
    organizations: getOrganizations(),
    activeOrganizationId: getActiveOrganizationId(),
    activeOrganization: getActiveOrganization(),
  };
}

function getOwnerAccessState(organization: StoredOrganization | null) {
  const hasOwnerAccess = Boolean(organization?.hasOwnerAccess);

  return {
    ownerAccessStatus: hasOwnerAccess ? 'allowed' : 'denied',
    hasOwnerAccess,
  } satisfies Pick<AuthStore, 'ownerAccessStatus' | 'hasOwnerAccess'>;
}
