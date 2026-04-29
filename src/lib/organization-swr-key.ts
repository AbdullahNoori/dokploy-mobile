import { useMemo } from 'react';

import { getActiveOrganizationId } from '@/lib/http-config';
import { useAuthStore } from '@/store/auth-store';

type OrganizationSWRKeyPart = unknown;

export type OrganizationSWRKey = readonly ['org', string, ...OrganizationSWRKeyPart[]];

export function getOrganizationSWRKey(
  organizationId: string | null,
  parts: readonly OrganizationSWRKeyPart[] | null | false | undefined
): OrganizationSWRKey | null {
  if (!organizationId || !parts) {
    return null;
  }

  return ['org', organizationId, ...parts];
}

export function getActiveOrganizationSWRKey(
  parts: readonly OrganizationSWRKeyPart[] | null | false | undefined
): OrganizationSWRKey | null {
  return getOrganizationSWRKey(getActiveOrganizationId(), parts);
}

export function getRequiredActiveOrganizationSWRKey(
  parts: readonly OrganizationSWRKeyPart[]
): OrganizationSWRKey {
  const key = getActiveOrganizationSWRKey(parts);

  if (!key) {
    throw new Error('Missing active organization.');
  }

  return key;
}

export function useActiveOrganizationSWRKey(
  parts: readonly OrganizationSWRKeyPart[] | null | false | undefined
): OrganizationSWRKey | null {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);

  return useMemo(
    () => getOrganizationSWRKey(activeOrganizationId, parts),
    [activeOrganizationId, parts]
  );
}
