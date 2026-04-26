import type { DockerContainersByAppNameMatchResponse } from '@/types/docker';
import type { models } from '@/types/error';

function isErrorResponse(value: unknown): value is models.ErrorT {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'error' in value &&
    typeof (value as { error?: unknown }).error === 'string'
  );
}

function extractContainerIds(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return value.length > 0 ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractContainerIds(item));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const directId = record.containerId ?? record.containerID ?? record.id ?? record.Id;

    if (typeof directId === 'string' && directId.length > 0) {
      return [directId];
    }

    return Object.values(record).flatMap((item) => extractContainerIds(item));
  }

  return [];
}

export function normalizeDockerContainersResponse(
  value: unknown
): DockerContainersByAppNameMatchResponse {
  if (isErrorResponse(value)) {
    return value;
  }

  const uniqueContainerIds = Array.from(new Set(extractContainerIds(value)));

  return {
    containerIds: uniqueContainerIds,
  };
}
