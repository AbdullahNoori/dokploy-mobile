import { useCallback, useMemo } from 'react';

import { useApplicationOne } from '@/api/application';
import { useComposeOne } from '@/api/compose';
import { useMariadbOne } from '@/api/mariadb';
import { useMongoOne } from '@/api/mongo';
import { useMysqlOne } from '@/api/mysql';
import { usePostgresOne } from '@/api/postgres';
import { useRedisOne } from '@/api/redis';
import { isErrorResponse } from '@/lib/utils';
import type { ApplicationOneResponseBody } from '@/types/application';
import type { ComposeOneResponseBody } from '@/types/compose';
import type { MariadbOneResponseBody } from '@/types/mariadb';
import type { MongoOneResponseBody } from '@/types/mongo';
import type { MysqlOneResponseBody } from '@/types/mysql';
import type { PostgresOneResponseBody } from '@/types/postgres';
import type { RedisOneResponseBody } from '@/types/redis';
import type { ProjectItemType } from '@/types/projects';
import type { DockerAppType } from '@/types/docker';

type DetailRow = {
  label: string;
  value: string;
};

export type DeploymentRow = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  logPath: string | null;
  pid: string | null;
  applicationId: string | null;
  composeId: string | null;
  serverId: string | null;
  isPreviewDeployment: boolean;
  previewDeploymentId: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  scheduleId: string | null;
  backupId: string | null;
  rollbackId: string | null;
  volumeBackupId: string | null;
  buildServerId: string | null;
};

type DetailSummary = {
  title: string;
  subtitle?: string;
  status?: string | null;
  createdAt?: string;
  serverName?: string | null;
};

type ItemDetailData =
  | ApplicationOneResponseBody
  | ComposeOneResponseBody
  | MariadbOneResponseBody
  | MongoOneResponseBody
  | MysqlOneResponseBody
  | PostgresOneResponseBody
  | RedisOneResponseBody;

type ItemDetailState = {
  data: ItemDetailData | null;
  summary: DetailSummary | null;
  details: DetailRow[];
  deployments: DeploymentRow[];
  logsLookupName: string | null;
  logsLookupAppType: DockerAppType | undefined;
  logsLookupServerId: string | undefined;
  isApplication: boolean;
  isLoading: boolean;
  isError: boolean;
  retry: () => Promise<void>;
};

const toDetailValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
  return String(value);
};

const toOptionalString = (value: unknown) =>
  typeof value === 'string' && value ? value : undefined;

export function useItemDetailScreen(
  itemType: ProjectItemType | undefined,
  itemId: string | undefined,
  initialStatus?: string
): ItemDetailState {
  const application = useApplicationOne(itemType === 'application' ? itemId : undefined);
  const redis = useRedisOne(itemType === 'redis' ? itemId : undefined);
  const postgres = usePostgresOne(itemType === 'postgres' ? itemId : undefined);
  const mysql = useMysqlOne(itemType === 'mysql' ? itemId : undefined);
  const mongo = useMongoOne(itemType === 'mongo' ? itemId : undefined);
  const mariadb = useMariadbOne(itemType === 'mariadb' ? itemId : undefined);
  const compose = useComposeOne(itemType === 'compose' ? itemId : undefined);

  const active = (() => {
    switch (itemType) {
      case 'application':
        return application;
      case 'redis':
        return redis;
      case 'postgres':
        return postgres;
      case 'mysql':
        return mysql;
      case 'mongo':
        return mongo;
      case 'mariadb':
        return mariadb;
      case 'compose':
        return compose;
      default:
        return undefined;
    }
  })();

  const data = active?.data;
  const error = active?.error;
  const isLoading = Boolean(active?.isLoading);
  const mutate = active?.mutate;

  const detailData = useMemo(() => {
    if (!data || isErrorResponse(data)) {
      return null;
    }
    return data;
  }, [data]);

  const summary = useMemo<DetailSummary | null>(() => {
    if (!detailData) return null;
    const environment = (detailData as any).environment;
    return {
      title: detailData.name,
      subtitle: environment?.project?.name ?? environment?.name ?? undefined,
      status:
        (detailData as any).applicationStatus ??
        (detailData as any).composeStatus ??
        initialStatus ??
        null,
      createdAt: (detailData as any).createdAt,
      serverName: (detailData as any).server?.name ?? null,
    };
  }, [detailData, initialStatus]);

  const details = useMemo<DetailRow[]>(() => {
    if (!detailData || !itemType) return [];

    if (itemType === 'application') {
      const app = detailData as ApplicationOneResponseBody;
      return [
        { label: 'App Name', value: toDetailValue(app.appName) },
        { label: 'Branch', value: toDetailValue(app.branch) },
        { label: 'Build Type', value: toDetailValue(app.buildType) },
        { label: 'Docker Image', value: toDetailValue(app.dockerImage) },
        { label: 'Autodeploy', value: toDetailValue(app.autoDeploy) },
        { label: 'Clean Cache', value: toDetailValue(app.cleanCache) },
        { label: 'Ports', value: toDetailValue(app.ports?.length ?? 0) },
        { label: 'Domains', value: toDetailValue(app.domains?.length ?? 0) },
      ];
    }

    if (itemType === 'compose') {
      const compose = detailData as ComposeOneResponseBody;
      const projectName = compose.environment?.project?.name;
      const environmentName = compose.environment?.name;
      const baseRows = [
        { label: 'Compose ID', value: toDetailValue(compose.composeId) },
        { label: 'Project', value: toDetailValue(projectName) },
        { label: 'Environment', value: toDetailValue(environmentName) },
        { label: 'Server', value: toDetailValue(compose.server?.name) },
      ];
      const optionalRows = [
        { label: 'Source Type', value: toDetailValue(compose.sourceType) },
        { label: 'Repository', value: toDetailValue(compose.repository) },
        { label: 'Branch', value: toDetailValue(compose.branch) },
      ].filter((row) => row.value !== '—');

      return [...baseRows, ...optionalRows];
    }

    return [
      { label: 'App Name', value: toDetailValue((detailData as any).appName) },
      { label: 'Docker Image', value: toDetailValue((detailData as any).dockerImage) },
      { label: 'External Port', value: toDetailValue((detailData as any).externalPort) },
      { label: 'Replicas', value: toDetailValue((detailData as any).replicas) },
      { label: 'Memory Limit', value: toDetailValue((detailData as any).memoryLimit) },
      { label: 'CPU Limit', value: toDetailValue((detailData as any).cpuLimit) },
    ];
  }, [detailData, itemType]);

  const deployments = useMemo<DeploymentRow[]>(() => {
    if (!detailData || itemType !== 'application') return [];
    const app = detailData as ApplicationOneResponseBody;
    return (app.deployments ?? [])
      .map((deployment) => ({
        id: deployment.deploymentId,
        title: deployment.title,
        description: deployment.description ?? null,
        status: deployment.status ?? null,
        logPath: deployment.logPath ?? null,
        pid: deployment.pid ?? null,
        applicationId: deployment.applicationId ?? null,
        composeId: deployment.composeId ?? null,
        serverId: deployment.serverId ?? null,
        isPreviewDeployment: deployment.isPreviewDeployment ?? false,
        previewDeploymentId: deployment.previewDeploymentId ?? null,
        createdAt: deployment.createdAt,
        startedAt: deployment.startedAt ?? null,
        finishedAt: deployment.finishedAt ?? null,
        errorMessage: deployment.errorMessage ?? null,
        scheduleId: deployment.scheduleId ?? null,
        backupId: deployment.backupId ?? null,
        rollbackId: deployment.rollbackId ?? null,
        volumeBackupId: deployment.volumeBackupId ?? null,
        buildServerId: deployment.buildServerId ?? null,
      }))
      .sort((a, b) => {
        const statusA = a.status ?? '';
        const statusB = b.status ?? '';
        const isRunningA = statusA.toLowerCase() === 'running';
        const isRunningB = statusB.toLowerCase() === 'running';
        if (isRunningA !== isRunningB) return isRunningA ? -1 : 1;
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
          return timeB - timeA;
        }
        return 0;
      });
  }, [detailData, itemType]);

  const logsLookup = useMemo(() => {
    if (!detailData || !itemType) {
      return {
        name: null,
        appType: undefined,
        serverId: undefined,
      };
    }

    if (itemType === 'compose') {
      const appName = toOptionalString((detailData as ComposeOneResponseBody).appName);
      return {
        name: appName ?? detailData.name ?? null,
        appType: 'docker-compose' as const,
        serverId: toOptionalString((detailData as ComposeOneResponseBody).serverId),
      };
    }

    return {
      name: toOptionalString((detailData as any).appName) ?? detailData.name ?? null,
      appType: undefined,
      serverId: toOptionalString((detailData as any).serverId),
    };
  }, [detailData, itemType]);

  const retry = useCallback(async () => {
    if (mutate) {
      await mutate();
    }
  }, [mutate]);

  const hasError = Boolean(error) || isErrorResponse(data);

  return {
    data: detailData,
    summary,
    details,
    deployments,
    logsLookupName: logsLookup.name,
    logsLookupAppType: logsLookup.appType,
    logsLookupServerId: logsLookup.serverId,
    isApplication: itemType === 'application',
    isLoading,
    isError: hasError,
    retry,
  };
}
