import * as SecureStore from 'expo-secure-store';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({
  id: 'dokploy',
});

const SERVER_URL_KEY = 'dokploy_server_url';
const PAT_KEY = 'dokploy_pat';

let serverUrlCache: string | null | undefined;
let patCache: string | null = null;

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

  return withScheme.replace(/\/+$/, '');
}

export async function initHttpConfig(): Promise<void> {
  const storedUrl = storage.getString(SERVER_URL_KEY);
  serverUrlCache = normalizeServerUrl(storedUrl);

  try {
    patCache = await SecureStore.getItemAsync(PAT_KEY);
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

export function setServerUrl(url: string): string {
  const normalized = normalizeServerUrl(url);
  if (!normalized) {
    throw new Error('Server URL is not configured.');
  }

  serverUrlCache = normalized;
  storage.set(SERVER_URL_KEY, normalized);
  return normalized;
}

export function getPat(): string | null {
  return patCache ?? null;
}

export async function setPat(pat: string | null): Promise<void> {
  patCache = pat ?? null;

  if (pat && pat.length > 0) {
    await SecureStore.setItemAsync(PAT_KEY, pat, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    return;
  }

  try {
    await SecureStore.deleteItemAsync(PAT_KEY);
  } catch {
    // No-op: treat missing key as cleared.
  }
}
