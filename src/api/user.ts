import useSWR from 'swr';

import { getRequest, type DokployRequestConfig } from '@/lib/http';

export type UserOrganizationRole = 'owner' | 'member' | (string & {});

type UserProfile = {
  allowImpersonation?: boolean;
  email?: string;
  firstName?: string | null;
  id: string;
  image?: string | null;
  lastName?: string | null;
  role?: string;
};

export type UserGetResponse = {
  accessedEnvironments?: string[];
  accessedProjects?: string[];
  accessedServices?: string[];
  canAccessToAPI?: boolean;
  canAccessToDocker?: boolean;
  canAccessToGitProviders?: boolean;
  canAccessToSSHKeys?: boolean;
  canAccessToTraefikFiles?: boolean;
  canCreateEnvironments?: boolean;
  canCreateProjects?: boolean;
  canCreateServices?: boolean;
  canDeleteEnvironments?: boolean;
  canDeleteProjects?: boolean;
  canDeleteServices?: boolean;
  id: string;
  organizationId?: string | null;
  role?: UserOrganizationRole;
  teamId?: string | null;
  user?: UserProfile;
  userId?: string;
};

type VerifyApiKeyOwnerAccessPayload = {
  baseURL: string;
  apiKey: string;
};

export function useUserGet() {
  return useSWR<UserGetResponse>('user/get', () => requestUserGet());
}

export async function requestUserGet(config?: DokployRequestConfig): Promise<UserGetResponse> {
  return getRequest<UserGetResponse>('user/get', undefined, config);
}

export function hasOwnerRole(user: UserGetResponse | undefined): boolean {
  return user?.role === 'owner';
}

export async function verifyApiKeyOwnerAccess(
  payload: VerifyApiKeyOwnerAccessPayload
): Promise<{ hasOwnerAccess: boolean; role: UserOrganizationRole | null }> {
  const user = await requestUserGet({
    ...buildApiKeyConfig(payload),
    skipUnauthorizedHandler: true,
  });
  const role = user.role ?? null;

  return { hasOwnerAccess: hasOwnerRole(user), role };
}

function buildApiKeyConfig(payload: VerifyApiKeyOwnerAccessPayload): DokployRequestConfig {
  return {
    baseURL: payload.baseURL,
    headers: {
      'x-api-key': payload.apiKey,
    },
  };
}
