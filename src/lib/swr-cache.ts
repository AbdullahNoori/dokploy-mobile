import type { Cache, State } from 'swr';

import { getActiveOrganizationId } from '@/lib/http-config';

const SIGNED_OUT_CACHE_KEY = 'signed-out';
const swrCachesByOrganization = new Map<string, Map<string, State<any, any>>>();

const organizationSWRCache: Cache = {
  get: (key) => getActiveOrganizationSWRCache().get(key),
  set: (key, value) => {
    getActiveOrganizationSWRCache().set(key, value);
  },
  delete: (key) => getActiveOrganizationSWRCache().delete(key),
  keys: () => getActiveOrganizationSWRCache().keys(),
};

export function getOrganizationSWRCache(): Cache {
  return organizationSWRCache;
}

function getActiveOrganizationSWRCache(): Map<string, State<any, any>> {
  return getOrganizationSWRCacheMap(getActiveOrganizationId());
}

function getOrganizationSWRCacheMap(organizationId: string | null): Map<string, State<any, any>> {
  const cacheKey = organizationId ?? SIGNED_OUT_CACHE_KEY;
  const cached = swrCachesByOrganization.get(cacheKey);

  if (cached) {
    return cached;
  }

  const cache = new Map<string, State<any, any>>();
  swrCachesByOrganization.set(cacheKey, cache);
  return cache;
}

export function clearOrganizationSWRCache(organizationId: string | null): void {
  if (!organizationId) {
    return;
  }

  swrCachesByOrganization.delete(organizationId);
}
