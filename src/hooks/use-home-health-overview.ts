import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { readDeploymentsByType } from '@/api/deployment';
import { useProjectAll } from '@/api/projects';
import { readSettingsStats } from '@/api/settings';
import {
  DEFAULT_REQUESTS_DATE_PRESET,
  formatCompactRelativeTime,
  formatRequestDuration,
  getRequestStatusFamily,
  getServiceCount,
  isErrorResponse,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import type {
  ProjectAllResponseBody,
  ProjectApplication,
  ProjectCompose,
  ProjectDatabase,
  ProjectItemType,
} from '@/types/projects';
import type { DeploymentResponseBody } from '@/types/deployment';
import type { SettingsRequestLogEntry } from '@/types/settings';

export type HomeHealthStatus = 'loading' | 'ready' | 'partial' | 'error';
export type HomePriorityLevel = 'danger' | 'warning' | 'ok';
export type HomePriorityKind = 'service-health' | 'request-health';

export type HomeRouteTarget =
  | {
      type: 'requests';
      filters: {
        datePreset: typeof DEFAULT_REQUESTS_DATE_PRESET;
        statuses: ['server'];
      };
    }
  | {
      type: 'project';
      projectId: string;
      projectName: string;
    };

export type HomePriorityItem = {
  id: string;
  kind: HomePriorityKind;
  level: HomePriorityLevel;
  title: string;
  subtitle: string;
  actionLabel: string;
  route: HomeRouteTarget | null;
  createdAt?: string;
};

export type HomeOpsBrief = {
  title: string;
  subtitle: string;
  facts: Array<{
    label: string;
    value: string;
  }>;
  level: HomePriorityLevel;
};

export type HomeRequestSignal = {
  total: number;
  successCount: number;
  clientErrorCount: number;
  serverErrorCount: number;
  successPercent: number | null;
  clientErrorPercent: number | null;
  serverErrorPercent: number | null;
  p95DurationLabel: string | null;
  label: string;
};

export type HomeServiceSummary = {
  runningServices: number;
  totalServices: number;
};

export type HomeSnapshot = {
  projectsCount: number;
  environmentsCount: number;
  servicesTotal: number;
  applicationsCount: number;
  composeCount: number;
  databaseCount: number;
  deploys7dCount: number | null;
  runningCount: number;
  erroredCount: number;
  idleCount: number;
};

export type HomeDeploymentPreview = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  logPath: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  serviceName: string;
  projectName: string;
  environmentName: string;
  level: HomePriorityLevel;
};

type HomeHealthOverview = {
  status: HomeHealthStatus;
  error: string | null;
  brief: HomeOpsBrief;
  priorityItems: HomePriorityItem[];
  requestSignal: HomeRequestSignal | null;
  serviceSummary: HomeServiceSummary;
  snapshot: HomeSnapshot;
  recentDeployments: HomeDeploymentPreview[];
  isDeploymentsLoading: boolean;
  hasDeploymentError: boolean;
  hasRequestError: boolean;
  refresh: () => Promise<void>;
};

type NormalizedService = {
  id: string;
  name: string;
  type: ProjectItemType;
  projectId: string;
  projectName: string;
  environmentName: string;
  status: string | null;
  createdAt: string;
};

type RequestSignalState = {
  signal: HomeRequestSignal | null;
  priorityItem: HomePriorityItem | null;
  isLoading: boolean;
  isError: boolean;
};

type DeploymentSignalState = {
  items: HomeDeploymentPreview[];
  isLoading: boolean;
  isError: boolean;
};

const HOME_DEPLOYMENT_LOOKUP_LIMIT = 6;
const HOME_RECENT_DEPLOYMENT_LIMIT = 3;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const EMPTY_BRIEF: HomeOpsBrief = {
  title: 'All services healthy',
  subtitle: 'Nothing needs attention right now.',
  level: 'ok',
  facts: [
    { label: 'Running', value: '0' },
    { label: 'Services', value: '0' },
  ],
};

const STATUS_PRIORITY: Record<HomePriorityLevel, number> = {
  danger: 0,
  warning: 1,
  ok: 2,
};

function getStatusLevel(status: string | null): HomePriorityLevel {
  const normalized = status?.trim().toLowerCase();

  if (!normalized) {
    return 'ok';
  }

  if (
    ['error', 'failed', 'failure', 'exited', 'dead', 'unhealthy', 'stopped'].some((item) =>
      normalized.includes(item)
    )
  ) {
    return 'danger';
  }

  if (
    ['deploying', 'running', 'starting', 'restarting', 'building', 'pending'].some((item) =>
      normalized.includes(item)
    )
  ) {
    return 'warning';
  }

  return 'ok';
}

function getServiceId(item: ProjectDatabase, type: ProjectItemType) {
  if (type === 'postgres') return item.postgresId;
  if (type === 'redis') return item.redisId;
  if (type === 'mysql') return item.mysqlId;
  if (type === 'mongo') return item.mongoId;
  if (type === 'mariadb') return item.mariadbId;
  return undefined;
}

function normalizeServices(projects: ProjectAllResponseBody[]): NormalizedService[] {
  return projects.flatMap((project) =>
    project.environments.flatMap((environment) => {
      const applications =
        environment.applications?.map((item: ProjectApplication): NormalizedService => {
          const id = item.applicationId;
          return {
            id,
            type: 'application',
            name: item.name || item.appName || 'Application',
            projectId: project.projectId,
            projectName: project.name,
            environmentName: environment.name,
            status: item.applicationStatus ?? null,
            createdAt: item.createdAt,
          };
        }) ?? [];

      const compose =
        environment.compose?.map(
          (item: ProjectCompose): NormalizedService => ({
            id: item.composeId,
            type: 'compose',
            name: item.name || 'Compose',
            projectId: project.projectId,
            projectName: project.name,
            environmentName: environment.name,
            status: item.composeStatus ?? null,
            createdAt: item.createdAt,
          })
        ) ?? [];

      const databases = (['postgres', 'redis', 'mysql', 'mongo', 'mariadb'] as const).flatMap(
        (type) =>
          (environment[type] ?? []).map(
            (item: ProjectDatabase, index): NormalizedService => ({
              id:
                getServiceId(item, type) ??
                `${project.projectId}-${environment.environmentId}-${type}-${index}`,
              type,
              name: item.name || type,
              projectId: project.projectId,
              projectName: project.name,
              environmentName: environment.name,
              status: item.applicationStatus ?? null,
              createdAt: item.createdAt,
            })
          )
      );

      return [...applications, ...compose, ...databases];
    })
  );
}

function buildServicePriorityItems(services: NormalizedService[]): HomePriorityItem[] {
  return services
    .map((service) => {
      const level = getStatusLevel(service.status);
      if (level === 'ok') {
        return null;
      }

      const isDanger = level === 'danger';
      return {
        id: `service-${service.type}-${service.id}`,
        kind: 'service-health' as const,
        level,
        title: isDanger ? `${service.name} needs attention` : `${service.name} is changing state`,
        subtitle: `${service.projectName} / ${service.environmentName}${
          service.status ? ` · ${service.status}` : ''
        }`,
        actionLabel: 'Open',
        route: {
          type: 'project' as const,
          projectId: service.projectId,
          projectName: service.projectName,
        },
        createdAt: service.createdAt,
      };
    })
    .filter(Boolean) as HomePriorityItem[];
}

function getTime(value: string | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortServicesForPreview(services: NormalizedService[]) {
  return services.slice().sort((a, b) => {
    const level =
      STATUS_PRIORITY[getStatusLevel(a.status)] - STATUS_PRIORITY[getStatusLevel(b.status)];
    if (level !== 0) return level;
    return getTime(b.createdAt) - getTime(a.createdAt);
  });
}

function mapDeployment(
  deployment: DeploymentResponseBody,
  service: NormalizedService
): HomeDeploymentPreview {
  return {
    id: deployment.deploymentId,
    title: deployment.title,
    description: deployment.description ?? null,
    status: deployment.status ?? null,
    logPath: deployment.logPath ?? null,
    createdAt: deployment.createdAt,
    startedAt: deployment.startedAt ?? null,
    finishedAt: deployment.finishedAt ?? null,
    errorMessage: deployment.errorMessage ?? null,
    serviceName: service.name,
    projectName: service.projectName,
    environmentName: service.environmentName,
    level: getStatusLevel(deployment.status),
  };
}

function sortDeployments(deployments: HomeDeploymentPreview[]) {
  return deployments.slice().sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
}

function getServiceSnapshotState(status: string | null): 'running' | 'errored' | 'idle' {
  const normalized = status?.trim().toLowerCase();
  if (!normalized) return 'idle';

  if (getStatusLevel(status) === 'danger') {
    return 'errored';
  }

  if (
    ['running', 'done', 'healthy', 'active', 'up'].some((item) => normalized.includes(item)) &&
    !['idle', 'stopped', 'pending'].some((item) => normalized.includes(item))
  ) {
    return 'running';
  }

  return 'idle';
}

function countDeploymentsInLastSevenDays(deployments: HomeDeploymentPreview[]) {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  return deployments.filter((deployment) => {
    const createdAt = getTime(deployment.createdAt);
    return createdAt >= cutoff;
  }).length;
}

function getPercent(count: number, total: number) {
  if (total <= 0) {
    return null;
  }

  return Math.round((count / total) * 100);
}

function getP95DurationLabel(items: SettingsRequestLogEntry[]) {
  const durations = items
    .map((item) => item.Duration)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    .sort((a, b) => a - b);

  if (durations.length === 0) {
    return null;
  }

  const index = Math.max(0, Math.ceil(durations.length * 0.95) - 1);
  return formatRequestDuration(durations[index]);
}

type RequestStatusCounts = {
  success: number;
  client: number;
  server: number;
};

function buildRequestSignal(items: SettingsRequestLogEntry[]): RequestSignalState {
  const counts = items.reduce<RequestStatusCounts>(
    (result, item) => {
      const family = getRequestStatusFamily(item.DownstreamStatus);
      if (family === 'success') result.success += 1;
      if (family === 'client') result.client += 1;
      if (family === 'server') result.server += 1;
      return result;
    },
    { success: 0, client: 0, server: 0 }
  );
  const total = items.length;
  const successPercent = getPercent(counts.success, total);
  const clientErrorPercent = getPercent(counts.client, total);
  const serverErrorPercent = getPercent(counts.server, total);
  const p95DurationLabel = getP95DurationLabel(items);

  const signal: HomeRequestSignal | null =
    total > 0
      ? {
          total,
          successCount: counts.success,
          clientErrorCount: counts.client,
          serverErrorCount: counts.server,
          successPercent,
          clientErrorPercent,
          serverErrorPercent,
          p95DurationLabel,
          label:
            counts.server > 0
              ? `${serverErrorPercent ?? 0}% server errors`
              : 'Requests look normal',
        }
      : null;

  const priorityItem: HomePriorityItem | null =
    total > 0 && counts.server > 0
      ? {
          id: 'request-health-server-errors',
          kind: 'request-health',
          level: 'warning',
          title: `5xx at ${serverErrorPercent ?? 0}%`,
          subtitle: `${total} recent requests sampled`,
          actionLabel: 'Requests',
          route: {
            type: 'requests',
            filters: {
              datePreset: DEFAULT_REQUESTS_DATE_PRESET,
              statuses: ['server'],
            },
          },
        }
      : null;

  return {
    signal,
    priorityItem,
    isLoading: false,
    isError: false,
  };
}

function sortPriorityItems(items: HomePriorityItem[]) {
  return items.slice().sort((a, b) => {
    const level = STATUS_PRIORITY[a.level] - STATUS_PRIORITY[b.level];
    if (level !== 0) return level;

    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

function buildBrief(
  priorityItems: HomePriorityItem[],
  serviceSummary: HomeServiceSummary
): HomeOpsBrief {
  const primary = priorityItems[0];
  if (!primary) {
    return {
      ...EMPTY_BRIEF,
      facts: [
        { label: 'Running', value: String(serviceSummary.runningServices) },
        { label: 'Services', value: String(serviceSummary.totalServices) },
      ],
    };
  }

  return {
    title:
      primary.kind === 'request-health'
        ? `${primary.title}. Inspect requests.`
        : `${primary.title}. Start here.`,
    subtitle:
      priorityItems.length === 1
        ? '1 item needs attention. Everything else is quiet enough.'
        : `${priorityItems.length} items need attention. Start with the first one.`,
    level: primary.level,
    facts: [
      { label: 'Priority', value: primary.level === 'danger' ? 'High' : 'Review' },
      { label: 'Action', value: primary.actionLabel },
      {
        label: 'Event',
        value: primary.createdAt ? formatCompactRelativeTime(primary.createdAt) : 'Now',
      },
    ],
  };
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }

  return 'Unable to load service health.';
}

export function useHomeHealthOverview(): HomeHealthOverview {
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const projectsRequest = useProjectAll();
  const [requestSignal, setRequestSignal] = useState<RequestSignalState>({
    signal: null,
    priorityItem: null,
    isLoading: true,
    isError: false,
  });
  const [deploymentSignal, setDeploymentSignal] = useState<DeploymentSignalState>({
    items: [],
    isLoading: false,
    isError: false,
  });
  const requestIdRef = useRef(0);
  const deploymentRequestIdRef = useRef(0);

  const loadRequestSignal = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setRequestSignal((current) => ({
      ...current,
      isLoading: true,
      isError: false,
    }));

    try {
      const response = await readSettingsStats({
        pageIndex: 0,
        pageSize: 25,
        status: [],
      });
      if (requestId !== requestIdRef.current) return;
      setRequestSignal(buildRequestSignal(response.items));
    } catch {
      if (requestId !== requestIdRef.current) return;
      setRequestSignal({
        signal: null,
        priorityItem: null,
        isLoading: false,
        isError: true,
      });
    }
  }, []);

  useEffect(() => {
    void loadRequestSignal();
  }, [activeOrganizationId, loadRequestSignal]);

  const projects = useMemo(() => {
    if (!projectsRequest.data || isErrorResponse(projectsRequest.data)) {
      return [];
    }

    return projectsRequest.data;
  }, [projectsRequest.data]);

  const services = useMemo(() => normalizeServices(projects), [projects]);
  const deploymentLookupServices = useMemo(
    () => sortServicesForPreview(services).slice(0, HOME_DEPLOYMENT_LOOKUP_LIMIT),
    [services]
  );
  const deploymentLookupKey = useMemo(
    () => deploymentLookupServices.map((service) => `${service.type}:${service.id}`).join('|'),
    [deploymentLookupServices]
  );
  const serviceItems = useMemo(() => buildServicePriorityItems(services), [services]);
  const runningServices = useMemo(
    () => services.filter((service) => getStatusLevel(service.status) === 'ok').length,
    [services]
  );
  const totalServices = useMemo(
    () => projects.reduce((total, project) => total + getServiceCount(project.environments), 0),
    [projects]
  );
  const snapshot = useMemo<HomeSnapshot>(() => {
    const counts = projects.reduce(
      (result, project) => {
        result.environments += project.environments.length;

        project.environments.forEach((environment) => {
          result.applications += environment.applications?.length ?? 0;
          result.compose += environment.compose?.length ?? 0;
          result.databases +=
            (environment.mariadb?.length ?? 0) +
            (environment.mongo?.length ?? 0) +
            (environment.mysql?.length ?? 0) +
            (environment.postgres?.length ?? 0) +
            (environment.redis?.length ?? 0);
        });

        return result;
      },
      {
        environments: 0,
        applications: 0,
        compose: 0,
        databases: 0,
      }
    );

    const statusCounts = services.reduce(
      (result, service) => {
        const state = getServiceSnapshotState(service.status);
        result[state] += 1;
        return result;
      },
      {
        running: 0,
        errored: 0,
        idle: 0,
      }
    );

    return {
      projectsCount: projects.length,
      environmentsCount: counts.environments,
      servicesTotal: totalServices,
      applicationsCount: counts.applications,
      composeCount: counts.compose,
      databaseCount: counts.databases,
      deploys7dCount: deploymentSignal.isError
        ? null
        : countDeploymentsInLastSevenDays(deploymentSignal.items),
      runningCount: statusCounts.running,
      erroredCount: statusCounts.errored,
      idleCount: statusCounts.idle,
    };
  }, [deploymentSignal.isError, deploymentSignal.items, projects, services, totalServices]);

  const priorityItems = useMemo(() => {
    const items = [...serviceItems];
    if (requestSignal.priorityItem) {
      items.push(requestSignal.priorityItem);
    }
    return sortPriorityItems(items).slice(0, 3);
  }, [requestSignal.priorityItem, serviceItems]);

  const serviceSummary = useMemo<HomeServiceSummary>(
    () => ({
      runningServices,
      totalServices,
    }),
    [runningServices, totalServices]
  );

  const brief = useMemo(
    () => buildBrief(priorityItems, serviceSummary),
    [priorityItems, serviceSummary]
  );

  const hasCoreError = Boolean(projectsRequest.error) || isErrorResponse(projectsRequest.data);
  const status: HomeHealthStatus = useMemo(() => {
    if (projectsRequest.isLoading) return 'loading';
    if (hasCoreError) return 'error';
    if (requestSignal.isError) return 'partial';
    return 'ready';
  }, [hasCoreError, projectsRequest.isLoading, requestSignal.isError]);

  const loadRecentDeployments = useCallback(async (lookupServices: NormalizedService[]) => {
    const requestId = ++deploymentRequestIdRef.current;

    if (!lookupServices.length) {
      setDeploymentSignal({
        items: [],
        isLoading: false,
        isError: false,
      });
      return;
    }

    setDeploymentSignal((current) => ({
      ...current,
      isLoading: true,
      isError: false,
    }));

    try {
      const responses = await Promise.all(
        lookupServices.map(async (service) => {
          const response = await readDeploymentsByType({
            id: service.id,
            type: service.type,
          });

          if (isErrorResponse(response)) {
            return [];
          }

          return response.map((deployment) => mapDeployment(deployment, service));
        })
      );

      if (requestId !== deploymentRequestIdRef.current) return;

      setDeploymentSignal({
        items: sortDeployments(responses.flat()).slice(0, HOME_RECENT_DEPLOYMENT_LIMIT),
        isLoading: false,
        isError: false,
      });
    } catch {
      if (requestId !== deploymentRequestIdRef.current) return;

      setDeploymentSignal({
        items: [],
        isLoading: false,
        isError: true,
      });
    }
  }, []);

  useEffect(() => {
    if (projectsRequest.isLoading || hasCoreError) {
      return;
    }

    void loadRecentDeployments(deploymentLookupServices);
  }, [
    deploymentLookupKey,
    deploymentLookupServices,
    hasCoreError,
    loadRecentDeployments,
    projectsRequest.isLoading,
  ]);

  const refresh = useCallback(async () => {
    await Promise.all([
      projectsRequest.mutate(),
      loadRequestSignal(),
      loadRecentDeployments(deploymentLookupServices),
    ]);
  }, [deploymentLookupServices, loadRecentDeployments, loadRequestSignal, projectsRequest]);

  return {
    status,
    error: hasCoreError ? getErrorMessage(projectsRequest.error ?? projectsRequest.data) : null,
    brief,
    priorityItems,
    requestSignal: requestSignal.signal,
    serviceSummary,
    snapshot,
    recentDeployments: deploymentSignal.items,
    isDeploymentsLoading: deploymentSignal.isLoading,
    hasDeploymentError: deploymentSignal.isError,
    hasRequestError: requestSignal.isError,
    refresh,
  };
}
