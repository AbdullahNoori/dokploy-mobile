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
import type { ComposeOneResponse } from '@/types/compose';
import type { MariadbOneResponse } from '@/types/mariadb';
import type { MongoOneResponse } from '@/types/mongo';
import type { MysqlOneResponse } from '@/types/mysql';
import type { PostgresOneResponse } from '@/types/postgres';
import type { RedisOneResponse } from '@/types/redis';
import type { ProjectItemType } from '@/types/projects';

type DetailRow = {
  label: string;
  value: string;
};

type DeploymentRow = {
  id: string;
  title: string;
  status: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
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
  | ComposeOneResponse
  | MariadbOneResponse
  | MongoOneResponse
  | MysqlOneResponse
  | PostgresOneResponse
  | RedisOneResponse;

type ItemDetailState = {
  data: ItemDetailData | null;
  summary: DetailSummary | null;
  details: DetailRow[];
  deployments: DeploymentRow[];
  isApplication: boolean;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
};

const toDetailValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
  return String(value);
};

export function useItemDetailScreen(
  itemType: ProjectItemType | undefined,
  itemId: string | undefined
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
      status: (detailData as any).applicationStatus ?? null,
      createdAt: (detailData as any).createdAt,
      serverName: (detailData as any).server?.name ?? null,
    };
  }, [detailData]);

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

    return [
      { label: 'Docker Image', value: toDetailValue((detailData as any).dockerImage) },
      { label: 'External Port', value: toDetailValue((detailData as any).externalPort) },
      { label: 'Replicas', value: toDetailValue((detailData as any).replicas) },
      { label: 'Memory Limit', value: toDetailValue((detailData as any).memoryLimit) },
      { label: 'CPU Limit', value: toDetailValue((detailData as any).cpuLimit) },
      { label: 'Environment', value: toDetailValue((detailData as any).env) },
    ];
  }, [detailData, itemType]);

  const deployments = useMemo<DeploymentRow[]>(() => {
    if (!detailData || itemType !== 'application') return [];
    const app = detailData as ApplicationOneResponseBody;
    return (app.deployments ?? [])
      .map((deployment) => ({
        id: deployment.deploymentId,
        title: deployment.title,
        status: deployment.status ?? null,
        createdAt: deployment.createdAt,
        startedAt: deployment.startedAt ?? null,
        finishedAt: deployment.finishedAt ?? null,
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

  const retry = useCallback(() => {
    if (mutate) {
      void mutate();
    }
  }, [mutate]);

  const hasError = Boolean(error) || isErrorResponse(data);

  return {
    data: detailData,
    summary,
    details,
    deployments,
    isApplication: itemType === 'application',
    isLoading,
    isError: hasError,
    retry,
  };
}
