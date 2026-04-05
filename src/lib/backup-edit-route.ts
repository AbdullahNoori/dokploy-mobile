import type { WebServerBackup } from '@/types/web-servers';

export type WebServerBackupEditRouteParams = {
  appName: string;
  backupId: string;
  database: string;
  databaseType: string;
  destinationId: string;
  destinationName: string;
  enabled: string;
  keepLatestCount: string;
  metadata: string;
  prefix: string;
  schedule: string;
  serviceName: string;
};

type RouteParamValue = string | string[] | undefined;

function serializeMetadata(value: unknown) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return 'null';
  }
}

export function buildWebServerBackupEditParams(
  backup: WebServerBackup
): WebServerBackupEditRouteParams {
  return {
    appName: backup.appName,
    backupId: backup.backupId,
    database: backup.database,
    databaseType: backup.databaseType,
    destinationId: backup.destinationId,
    destinationName: backup.destinationName,
    enabled: String(backup.enabled !== false),
    keepLatestCount:
      typeof backup.keepLatestCount === 'number' ? String(backup.keepLatestCount) : '',
    metadata: serializeMetadata(backup.metadata ?? null),
    prefix: backup.prefix,
    schedule: backup.schedule,
    serviceName: backup.serviceName ?? '',
  };
}

function parseMetadata(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function getRouteParamValue(value: RouteParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseWebServerBackupEditParams(
  params: Partial<Record<keyof WebServerBackupEditRouteParams, RouteParamValue>>
) {
  const appName = getRouteParamValue(params.appName);
  const backupId = getRouteParamValue(params.backupId);
  const database = getRouteParamValue(params.database);
  const databaseType = getRouteParamValue(params.databaseType);
  const destinationId = getRouteParamValue(params.destinationId);
  const destinationName = getRouteParamValue(params.destinationName);
  const enabled = getRouteParamValue(params.enabled);
  const keepLatestCount = getRouteParamValue(params.keepLatestCount);
  const metadata = getRouteParamValue(params.metadata);
  const prefix = getRouteParamValue(params.prefix);
  const schedule = getRouteParamValue(params.schedule);
  const serviceName = getRouteParamValue(params.serviceName);

  return {
    appName: appName ?? '',
    backupId: backupId ?? '',
    database: database ?? 'dokploy',
    databaseType: databaseType ?? 'web-server',
    destinationId: destinationId ?? '',
    destinationName: destinationName ?? 'Unknown destination',
    enabled: enabled !== 'false',
    keepLatestCount: keepLatestCount ?? '',
    metadata: parseMetadata(metadata),
    prefix: prefix ?? '/',
    schedule: schedule ?? '',
    serviceName: serviceName?.trim() ? serviceName : null,
  };
}
