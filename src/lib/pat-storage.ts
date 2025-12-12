import { createMMKV } from "react-native-mmkv";

export const PAT_STORAGE_KEY = "@dokploy/pat";
export const SERVER_URL_STORAGE_KEY = "@dokploy/server-url";

export const patStorage = createMMKV();
let cachedServerUrl: string | null | undefined;

// Basic normalizers to keep URLs consistent across reads/writes.
const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, "");
const ensureProtocol = (value: string) =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export const normalizeServerUrl = (
  value: string | null | undefined
): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return stripTrailingSlashes(ensureProtocol(trimmed));
};

export const getServerUrl = (): string | null => {
  // Use in-memory cache to avoid MMKV reads on every request.
  if (cachedServerUrl !== undefined) {
    return cachedServerUrl;
  }

  const stored = patStorage.getString(SERVER_URL_STORAGE_KEY);
  const candidate = stored ?? null;

  cachedServerUrl = normalizeServerUrl(candidate);
  return cachedServerUrl;
};

export const persistServerUrl = (value: string | null): string | null => {
  // Normalize before persisting and keep the cache in sync.
  const normalized = normalizeServerUrl(value);

  if (!normalized) {
    cachedServerUrl = null;
    patStorage.remove(SERVER_URL_STORAGE_KEY);
    return null;
  }

  cachedServerUrl = normalized;
  patStorage.set(SERVER_URL_STORAGE_KEY, normalized);
  return normalized;
};

export const getServerHost = (value?: string | null): string | null => {
  const normalized = normalizeServerUrl(value ?? getServerUrl());
  if (!normalized) return null;

  return normalized.replace(/^https?:\/\//i, "");
};

export const getApiBaseUrl = (value?: string | null): string | null => {
  const normalized = normalizeServerUrl(value ?? getServerUrl());
  if (!normalized) return null;

  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};
