import { useCallback, useMemo } from 'react';

import { useProjectOne } from '@/api/projects';
import { isErrorResponse } from '@/lib/utils';
import type {
  ProjectAllResponseBody,
  ProjectApplication,
} from '@/types/projects';

type ProjectDetailState = {
  project: ProjectAllResponseBody | null;
  applications: ProjectApplication[];
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
};

export function useProjectDetailScreen(projectId: string): ProjectDetailState {
  const { data, error, isLoading, mutate } = useProjectOne(projectId);

  const project = useMemo(() => {
    if (!data || isErrorResponse(data)) {
      return null;
    }
    return data;
  }, [data]);

  const applications = useMemo(() => {
    if (!project) return [];

    const environments = project.environments ?? [];
    const defaultEnv =
      environments.find((env) => env.isDefault) ?? environments[0];

    const apps = defaultEnv?.applications ?? [];
    return apps.slice().sort((a, b) => {
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
    applications,
    isLoading,
    isError: hasError,
    retry,
  };
}
