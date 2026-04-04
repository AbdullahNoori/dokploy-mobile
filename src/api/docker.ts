import useSWR from 'swr';

import { getRequest } from '@/lib/http';
import { isErrorResponse } from '@/lib/utils';
import type {
  DockerContainersByAppNameMatchParams,
  DockerContainersByAppNameMatchResponse,
  DockerContainersByAppNameMatchResult,
} from '@/types/docker';

type UseDockerContainersByAppNameMatchOptions = DockerContainersByAppNameMatchParams & {
  enabled?: boolean;
};

function extractContainerIds(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractContainerIds(item));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const directId = record.containerId;

    if (typeof directId === 'string' && directId.length > 0) {
      return [directId];
    }

    return Object.values(record).flatMap((item) => extractContainerIds(item));
  }

  return [];
}

function normalizeDockerContainersResponse(value: unknown): DockerContainersByAppNameMatchResponse {
  if (isErrorResponse(value)) {
    return value;
  }

  const uniqueContainerIds = Array.from(new Set(extractContainerIds(value)));

  return {
    containerIds: uniqueContainerIds,
  };
}

export function useDockerContainersByAppNameMatch({
  appName,
  appType,
  serverId,
  enabled = true,
}: UseDockerContainersByAppNameMatchOptions) {
  return useSWR<DockerContainersByAppNameMatchResponse>(
    enabled && appName
      ? ['docker/getContainersByAppNameMatch', appName, appType ?? null, serverId ?? null]
      : null,
    async () => {
      const response = await getRequest<unknown>('docker/getContainersByAppNameMatch', {
        appName,
        appType,
        serverId,
      });

      return normalizeDockerContainersResponse(response);
    }
  );
}

export function isDockerContainersByAppNameMatchResult(
  value: DockerContainersByAppNameMatchResponse | undefined
): value is DockerContainersByAppNameMatchResult {
  return Boolean(value && !isErrorResponse(value));
}
