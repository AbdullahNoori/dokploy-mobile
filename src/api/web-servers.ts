import { getRequest, postRequest } from '@/lib/http';
import type {
  WebServerBackup,
  WebServerBackupDeleteRequest,
  WebServerBackupRunRequest,
  WebServerBackupUpdateRequest,
  WebServerCertificateType,
  WebServerSettings,
  WebServerSettingsSaveRequest,
  WebServersSdkError,
} from '@/types/web-servers';

const DEFAULT_WEB_SERVER_SETTINGS: WebServerSettings = {
  host: '',
  letsEncryptEmail: '',
  https: false,
  certificateType: 'none',
};

const WEB_SERVER_DATABASE_TYPE = 'web-server';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isSdkError(value: unknown): value is WebServersSdkError {
  return isRecord(value) && typeof value.code === 'string' && typeof value.message === 'string';
}

function toApiError(payload: WebServersSdkError): Error {
  const error = new Error(payload.message);
  (error as Error & { code?: string }).code = payload.code;
  return error;
}

function unwrapPayload<T = unknown>(value: unknown): T {
  if (!isRecord(value)) {
    return value as T;
  }

  const result = value.result;
  if (isRecord(result)) {
    const data = result.data;
    if (isRecord(data) && 'json' in data) {
      return data.json as T;
    }
  }

  if ('data' in value) {
    return value.data as T;
  }

  return value as T;
}

function getString(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string') {
      return value;
    }
  }

  return null;
}

function getBoolean(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return null;
}

function getNumber(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function getNestedRecord(record: UnknownRecord, key: string) {
  const value = record[key];
  return isRecord(value) ? value : null;
}

function toCertificateType(value: string | null): WebServerCertificateType {
  if (value === 'letsencrypt' || value === 'custom' || value === 'none') {
    return value;
  }

  return 'none';
}

function normalizeWebServerSettings(payload: unknown): WebServerSettings {
  const unwrapped = unwrapPayload(payload);
  if (isSdkError(unwrapped)) {
    throw toApiError(unwrapped);
  }

  const source = isRecord(unwrapped)
    ? getNestedRecord(unwrapped, 'settings') ?? getNestedRecord(unwrapped, 'data') ?? unwrapped
    : null;

  if (!source) {
    return DEFAULT_WEB_SERVER_SETTINGS;
  }

  return {
    host:
      getString(source, ['host', 'domain', 'serverDomain', 'hostname']) ??
      DEFAULT_WEB_SERVER_SETTINGS.host,
    letsEncryptEmail:
      getString(source, ['letsEncryptEmail', 'email', 'sslEmail']) ??
      DEFAULT_WEB_SERVER_SETTINGS.letsEncryptEmail,
    https: getBoolean(source, ['https', 'enableHttps']) ?? DEFAULT_WEB_SERVER_SETTINGS.https,
    certificateType: toCertificateType(
      getString(source, ['certificateType', 'provider', 'certProvider'])
    ),
  };
}

function getCollection(payload: unknown): unknown[] {
  const unwrapped = unwrapPayload(payload);
  if (isSdkError(unwrapped)) {
    throw toApiError(unwrapped);
  }

  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  if (!isRecord(unwrapped)) {
    return [];
  }

  if (Array.isArray(unwrapped.items)) {
    return unwrapped.items;
  }

  if (Array.isArray(unwrapped.data)) {
    return unwrapped.data;
  }

  if (Array.isArray(unwrapped.backups)) {
    return unwrapped.backups;
  }

  return [];
}

function normalizeWebServerBackup(entry: unknown): WebServerBackup | null {
  if (!isRecord(entry)) {
    return null;
  }

  const destination = getNestedRecord(entry, 'destination');
  const databaseType = getString(entry, ['databaseType', 'type']) ?? WEB_SERVER_DATABASE_TYPE;
  if (databaseType !== WEB_SERVER_DATABASE_TYPE) {
    return null;
  }

  const backupId = getString(entry, ['backupId', 'id']);
  if (!backupId) {
    return null;
  }

  const destinationName =
    getString(entry, ['destinationName']) ??
    (destination ? getString(destination, ['name']) : null) ??
    getString(entry, ['destinationId']) ??
    'Unknown destination';

  return {
    backupId,
    appName: getString(entry, ['appName']) ?? getString(entry, ['database']) ?? 'Web Server',
    backupType: getString(entry, ['backupType']),
    database: getString(entry, ['database']) ?? 'dokploy',
    databaseType,
    destinationId: getString(entry, ['destinationId']) ?? '',
    destinationName,
    enabled: getBoolean(entry, ['enabled']),
    keepLatestCount: getNumber(entry, ['keepLatestCount']),
    metadata: entry.metadata,
    prefix: getString(entry, ['prefix']) ?? '/',
    schedule: getString(entry, ['schedule']) ?? '',
    serviceName: getString(entry, ['serviceName']),
    userId: getString(entry, ['userId']),
  };
}

function resolveActionResult(payload: unknown) {
  const unwrapped = unwrapPayload(payload);
  if (isSdkError(unwrapped)) {
    throw toApiError(unwrapped);
  }

  return unwrapped as WebServersSdkError | undefined;
}

export async function readWebServerSettings() {
  const payload = await getRequest<unknown>('settings/getWebServerSettings');
  return normalizeWebServerSettings(payload);
}

export async function readWebServerBackups() {
  const payload = await getRequest<unknown>('user/getBackups');
  return getCollection(payload).map(normalizeWebServerBackup).filter(Boolean) as WebServerBackup[];
}

export async function saveWebServerSettings(payload: WebServerSettingsSaveRequest) {
  const response = await postRequest<unknown>('settings/assignDomainServer', payload);
  return resolveActionResult(response);
}

export async function runWebServerBackup(payload: WebServerBackupRunRequest) {
  const response = await postRequest<unknown>('backup/manualBackupWebServer', payload);
  return resolveActionResult(response);
}

export async function updateWebServerBackup(payload: WebServerBackupUpdateRequest) {
  const response = await postRequest<unknown>('backup/update', payload);
  return resolveActionResult(response);
}

export async function deleteWebServerBackup(payload: WebServerBackupDeleteRequest) {
  const response = await postRequest<unknown>('backup/remove', payload);
  return resolveActionResult(response);
}
