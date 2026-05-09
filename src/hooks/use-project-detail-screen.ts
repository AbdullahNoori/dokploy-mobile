import { useCallback, useEffect, useMemo, useState } from 'react';

import { useProjectOne } from '@/api/projects';
import { isErrorResponse } from '@/lib/utils';
import type {
  ProjectAllEnvironment,
  ProjectAllResponseBody,
  ProjectApplication,
  ProjectCompose,
  ProjectDatabase,
  ProjectItem,
  ProjectItemType,
} from '@/types/projects';

type ProjectDetailState = {
  project: ProjectAllResponseBody | null;
  environments: ProjectAllEnvironment[];
  activeEnvironment: ProjectAllEnvironment | null;
  activeEnvironmentId: string | null;
  items: ProjectItem[];
  isLoading: boolean;
  isError: boolean;
  selectEnvironment: (environmentId: string) => void;
  retry: () => Promise<void>;
};

const getDatabaseId = (
  item: ProjectDatabase,
  key: keyof ProjectDatabase,
  type: ProjectItemType
) => {
  const value = item[key];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return `${type}-${item.name}-${item.createdAt}`;
};

const addItems = <T extends { name: string; createdAt: string }>(
  items: ProjectItem[],
  list: T[] | undefined,
  type: ProjectItemType,
  getId: (item: T) => string,
  getStatus: (item: T) => string | null | undefined
) => {
  if (!list?.length) return;
  list.forEach((item) => {
    items.push({
      id: getId(item),
      name: item.name,
      createdAt: item.createdAt,
      status: getStatus(item),
      type,
    });
  });
};

export function useProjectDetailScreen(projectId: string): ProjectDetailState {
  const { data, error, isLoading, mutate } = useProjectOne(projectId);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedEnvironmentId(null);
  }, [projectId]);

  const project = useMemo(() => {
    if (!data || isErrorResponse(data)) {
      return null;
    }
    return data;
  }, [data]);

  const environments = useMemo(() => project?.environments ?? [], [project]);

  const activeEnvironment = useMemo(() => {
    if (!environments.length) return null;

    return (
      environments.find((environment) => environment.environmentId === selectedEnvironmentId) ??
      environments[0]
    );
  }, [environments, selectedEnvironmentId]);

  const activeEnvironmentId = activeEnvironment?.environmentId ?? null;

  const selectEnvironment = useCallback(
    (environmentId: string) => {
      if (environmentId === activeEnvironmentId) return;

      const exists = environments.some(
        (environment) => environment.environmentId === environmentId
      );
      if (!exists) return;

      setSelectedEnvironmentId(environmentId);
    },
    [activeEnvironmentId, environments]
  );

  const items = useMemo(() => {
    if (!activeEnvironment) return [];

    const merged: ProjectItem[] = [];

    addItems<ProjectApplication>(
      merged,
      activeEnvironment.applications,
      'application',
      (item) => item.applicationId,
      (item) => item.applicationStatus
    );

    addItems<ProjectCompose>(
      merged,
      activeEnvironment.compose,
      'compose',
      (item) => item.composeId,
      (item) => item.composeStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      activeEnvironment.postgres,
      'postgres',
      (item) => getDatabaseId(item, 'postgresId', 'postgres'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      activeEnvironment.redis,
      'redis',
      (item) => getDatabaseId(item, 'redisId', 'redis'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      activeEnvironment.mysql,
      'mysql',
      (item) => getDatabaseId(item, 'mysqlId', 'mysql'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      activeEnvironment.mongo,
      'mongo',
      (item) => getDatabaseId(item, 'mongoId', 'mongo'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      activeEnvironment.mariadb,
      'mariadb',
      (item) => getDatabaseId(item, 'mariadbId', 'mariadb'),
      (item) => item.applicationStatus ?? null
    );

    return merged.slice().sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [activeEnvironment]);

  const retry = useCallback(() => {
    return mutate().then(() => undefined);
  }, [mutate]);

  const hasError = Boolean(error) || isErrorResponse(data);

  return {
    project,
    environments,
    activeEnvironment,
    activeEnvironmentId,
    items,
    isLoading,
    isError: hasError,
    selectEnvironment,
    retry,
  };
}
