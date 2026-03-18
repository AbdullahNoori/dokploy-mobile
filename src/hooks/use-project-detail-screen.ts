import { useCallback, useMemo } from 'react';

import { useProjectOne } from '@/api/projects';
import { isErrorResponse } from '@/lib/utils';
import type {
  ProjectAllResponseBody,
  ProjectApplication,
  ProjectCompose,
  ProjectDatabase,
  ProjectItem,
  ProjectItemType,
} from '@/types/projects';

type ProjectDetailState = {
  project: ProjectAllResponseBody | null;
  items: ProjectItem[];
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
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

  const project = useMemo(() => {
    if (!data || isErrorResponse(data)) {
      return null;
    }
    return data;
  }, [data]);

  const items = useMemo(() => {
    if (!project) return [];

    const environments = project.environments ?? [];
    const defaultEnv =
      environments.find((env) => env.isDefault) ?? environments[0];

    if (!defaultEnv) return [];

    const merged: ProjectItem[] = [];

    addItems<ProjectApplication>(
      merged,
      defaultEnv.applications,
      'application',
      (item) => item.applicationId,
      (item) => item.applicationStatus
    );

    addItems<ProjectCompose>(
      merged,
      defaultEnv.compose,
      'compose',
      (item) => item.composeId,
      (item) => item.composeStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      defaultEnv.postgres,
      'postgres',
      (item) => getDatabaseId(item, 'postgresId', 'postgres'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      defaultEnv.redis,
      'redis',
      (item) => getDatabaseId(item, 'redisId', 'redis'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      defaultEnv.mysql,
      'mysql',
      (item) => getDatabaseId(item, 'mysqlId', 'mysql'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      defaultEnv.mongo,
      'mongo',
      (item) => getDatabaseId(item, 'mongoId', 'mongo'),
      (item) => item.applicationStatus ?? null
    );

    addItems<ProjectDatabase>(
      merged,
      defaultEnv.mariadb,
      'mariadb',
      (item) => getDatabaseId(item, 'mariadbId', 'mariadb'),
      (item) => item.applicationStatus ?? null
    );

    return merged.slice().sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [project]);

  const retry = useCallback(() => {
    void mutate();
  }, [mutate]);

  const hasError = Boolean(error) || isErrorResponse(data);

  return {
    project,
    items,
    isLoading,
    isError: hasError,
    retry,
  };
}
