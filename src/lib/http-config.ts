import * as SecureStore from 'expo-secure-store';
import { createMMKV } from 'react-native-mmkv';

import type { UserOrganizationRole } from '@/api/user';

const storage = createMMKV({
  id: 'dokploy',
});

const SERVER_URL_KEY = 'dokploy_server_url';
const PAT_KEY = 'dokploy_pat';
const ORGANIZATIONS_KEY = 'dokploy_organizations';
const ACTIVE_ORGANIZATION_ID_KEY = 'dokploy_active_organization_id';
const ORGANIZATION_PAT_KEY_PREFIX = 'dokploy_org_pat_';

export type StoredOrganization = {
  id: string;
  name: string;
  hasOwnerAccess: boolean;
  role: UserOrganizationRole | null;
  createdAt: string;
  lastUsedAt: string;
};

// Non-sensitive endpoint config in MMKV, sensitive token in secure storage.
let serverUrlCache: string | null | undefined;
let patCache: string | null = null;
let organizationsCache: StoredOrganization[] = [];
let activeOrganizationIdCache: string | null = null;

export function normalizeServerUrl(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
  const withScheme = hasScheme ? trimmed : `https://${trimmed}`;
  const withoutTrailingSlashes = withScheme.replace(/\/+$/, '');

  if (withoutTrailingSlashes.endsWith('/api')) {
    return withoutTrailingSlashes;
  }

  return `${withoutTrailingSlashes}/api`;
}

export async function initHttpConfig(): Promise<void> {
  const storedUrl = storage.getString(SERVER_URL_KEY);
  serverUrlCache = normalizeServerUrl(storedUrl);
  organizationsCache = readStoredOrganizations();
  activeOrganizationIdCache = readStoredActiveOrganizationId(organizationsCache);

  try {
    const legacyPat = await SecureStore.getItemAsync(PAT_KEY);

    if (serverUrlCache && legacyPat && organizationsCache.length === 0) {
      const now = new Date().toISOString();
      const migratedOrganization: StoredOrganization = {
        id: createOrganizationId(),
        name: 'Primary Organization',
        hasOwnerAccess: false,
        role: null,
        createdAt: now,
        lastUsedAt: now,
      };

      organizationsCache = [migratedOrganization];
      activeOrganizationIdCache = migratedOrganization.id;
      writeStoredOrganizations(organizationsCache);
      writeStoredActiveOrganizationId(activeOrganizationIdCache);

      await SecureStore.setItemAsync(getOrganizationPatKey(migratedOrganization.id), legacyPat, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      await SecureStore.deleteItemAsync(PAT_KEY);
    }

    patCache = activeOrganizationIdCache
      ? await SecureStore.getItemAsync(getOrganizationPatKey(activeOrganizationIdCache))
      : null;
  } catch {
    patCache = null;
  }
}

export function getServerUrl(): string | null {
  if (serverUrlCache === undefined) {
    const storedUrl = storage.getString(SERVER_URL_KEY);
    serverUrlCache = normalizeServerUrl(storedUrl);
  }

  return serverUrlCache ?? null;
}

export function getWebSocketBaseUrl(): string | null {
  const serverUrl = getServerUrl();

  if (!serverUrl) {
    return null;
  }

  const withoutApiSuffix = serverUrl.replace(/\/api$/, '');

  if (withoutApiSuffix.startsWith('https://')) {
    return `wss://${withoutApiSuffix.slice('https://'.length)}`;
  }

  if (withoutApiSuffix.startsWith('http://')) {
    return `ws://${withoutApiSuffix.slice('http://'.length)}`;
  }

  return null;
}

export function setServerUrl(url: string): string {
  const normalized = normalizeServerUrl(url);
  if (!normalized) {
    throw new Error('Server URL is not configured.');
  }

  serverUrlCache = normalized;
  storage.set(SERVER_URL_KEY, normalized);
  return normalized;
}

export function clearServerUrl(): void {
  serverUrlCache = null;
  storage.set(SERVER_URL_KEY, '');
}

export function getPat(): string | null {
  return patCache ?? null;
}

export function getOrganizations(): StoredOrganization[] {
  return organizationsCache;
}

export function getActiveOrganizationId(): string | null {
  return activeOrganizationIdCache;
}

export function getActiveOrganization(): StoredOrganization | null {
  return (
    organizationsCache.find((organization) => organization.id === activeOrganizationIdCache) ?? null
  );
}

export async function setPat(pat: string | null): Promise<void> {
  patCache = pat ?? null;

  if (activeOrganizationIdCache) {
    await setOrganizationPat(activeOrganizationIdCache, pat);
  }
}

export async function setActiveOrganization(organizationId: string): Promise<StoredOrganization> {
  const organization = organizationsCache.find((item) => item.id === organizationId);

  if (!organization) {
    throw new Error('Organization is not saved on this device.');
  }

  const updatedOrganization = { ...organization, lastUsedAt: new Date().toISOString() };
  organizationsCache = organizationsCache.map((item) =>
    item.id === organizationId ? updatedOrganization : item
  );
  activeOrganizationIdCache = organizationId;
  patCache = await SecureStore.getItemAsync(getOrganizationPatKey(organizationId));
  writeStoredOrganizations(organizationsCache);
  writeStoredActiveOrganizationId(organizationId);

  return updatedOrganization;
}

export async function addStoredOrganization(input: {
  name: string;
  pat: string;
  hasOwnerAccess: boolean;
  role: UserOrganizationRole | null;
}): Promise<StoredOrganization> {
  const now = new Date().toISOString();
  const organization: StoredOrganization = {
    id: createOrganizationId(),
    name: input.name.trim(),
    hasOwnerAccess: input.hasOwnerAccess,
    role: input.role,
    createdAt: now,
    lastUsedAt: now,
  };

  await SecureStore.setItemAsync(getOrganizationPatKey(organization.id), input.pat, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });

  organizationsCache = [organization, ...organizationsCache];
  activeOrganizationIdCache = organization.id;
  patCache = input.pat;
  writeStoredOrganizations(organizationsCache);
  writeStoredActiveOrganizationId(organization.id);

  return organization;
}

export function updateStoredOrganization(input: {
  id: string;
  name?: string;
  hasOwnerAccess?: boolean;
  role?: UserOrganizationRole | null;
}): StoredOrganization {
  const organization = organizationsCache.find((item) => item.id === input.id);

  if (!organization) {
    throw new Error('Organization is not saved on this device.');
  }

  const updatedOrganization: StoredOrganization = {
    ...organization,
    name: input.name?.trim() || organization.name,
    hasOwnerAccess: input.hasOwnerAccess ?? organization.hasOwnerAccess,
    role: input.role ?? organization.role,
  };

  organizationsCache = organizationsCache.map((item) =>
    item.id === input.id ? updatedOrganization : item
  );
  writeStoredOrganizations(organizationsCache);

  return updatedOrganization;
}

export async function removeStoredOrganization(organizationId: string): Promise<{
  removedActiveOrganization: boolean;
  nextActiveOrganization: StoredOrganization | null;
}> {
  const removedActiveOrganization = activeOrganizationIdCache === organizationId;
  organizationsCache = organizationsCache.filter(
    (organization) => organization.id !== organizationId
  );
  await deleteOrganizationPat(organizationId);

  const nextActiveOrganization = removedActiveOrganization
    ? getMostRecentlyUsedOrganization(organizationsCache)
    : getActiveOrganization();

  activeOrganizationIdCache = nextActiveOrganization?.id ?? null;
  patCache = activeOrganizationIdCache
    ? await SecureStore.getItemAsync(getOrganizationPatKey(activeOrganizationIdCache))
    : null;

  writeStoredOrganizations(organizationsCache);
  writeStoredActiveOrganizationId(activeOrganizationIdCache);

  return { removedActiveOrganization, nextActiveOrganization };
}

export async function clearCredentials(): Promise<void> {
  const organizationsToClear = organizationsCache;

  clearServerUrl();
  organizationsCache = [];
  activeOrganizationIdCache = null;
  patCache = null;
  writeStoredOrganizations([]);
  writeStoredActiveOrganizationId(null);

  await Promise.all([
    ...organizationsToClear.map((organization) => deleteOrganizationPat(organization.id)),
    SecureStore.deleteItemAsync(PAT_KEY).catch(() => undefined),
  ]);
}

async function setOrganizationPat(organizationId: string, pat: string | null): Promise<void> {
  if (pat && pat.length > 0) {
    await SecureStore.setItemAsync(getOrganizationPatKey(organizationId), pat, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    return;
  }

  await deleteOrganizationPat(organizationId);
}

async function deleteOrganizationPat(organizationId: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(getOrganizationPatKey(organizationId));
  } catch {
    // No-op: treat missing key as cleared.
  }
}

function getOrganizationPatKey(organizationId: string): string {
  return `${ORGANIZATION_PAT_KEY_PREFIX}${organizationId}`;
}

function createOrganizationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredOrganizations(): StoredOrganization[] {
  const value = storage.getString(ORGANIZATIONS_KEY);

  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.map(readStoredOrganization).filter((organization) => organization !== null)
      : [];
  } catch {
    return [];
  }
}

function readStoredOrganization(value: unknown): StoredOrganization | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, name, createdAt, lastUsedAt } = value;

  if (
    typeof id !== 'string' ||
    typeof name !== 'string' ||
    typeof createdAt !== 'string' ||
    typeof lastUsedAt !== 'string'
  ) {
    return null;
  }

  const role = typeof value.role === 'string' ? value.role : null;
  const hasOwnerAccess =
    typeof value.hasOwnerAccess === 'boolean'
      ? value.hasOwnerAccess
      : role === 'owner';

  return {
    id,
    name,
    hasOwnerAccess,
    role,
    createdAt,
    lastUsedAt,
  };
}

function writeStoredOrganizations(organizations: StoredOrganization[]): void {
  storage.set(ORGANIZATIONS_KEY, JSON.stringify(organizations));
}

function readStoredActiveOrganizationId(organizations: StoredOrganization[]): string | null {
  const storedActiveOrganizationId = storage.getString(ACTIVE_ORGANIZATION_ID_KEY);

  if (
    storedActiveOrganizationId &&
    organizations.some((item) => item.id === storedActiveOrganizationId)
  ) {
    return storedActiveOrganizationId;
  }

  return getMostRecentlyUsedOrganization(organizations)?.id ?? null;
}

function writeStoredActiveOrganizationId(organizationId: string | null): void {
  if (organizationId) {
    storage.set(ACTIVE_ORGANIZATION_ID_KEY, organizationId);
    return;
  }

  storage.remove(ACTIVE_ORGANIZATION_ID_KEY);
}

function getMostRecentlyUsedOrganization(
  organizations: StoredOrganization[]
): StoredOrganization | null {
  return [...organizations].sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt))[0] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
