import useSWR from 'swr';

import { getRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import { isErrorResponse } from '@/lib/utils';
import { normalizeDockerContainersResponse } from '@/lib/docker-container-normalize';
import type {
  DockerContainersByAppNameMatchParams,
  DockerContainersByAppNameMatchResponse,
  DockerContainersByAppNameMatchResult,
} from '@/types/docker';

type UseDockerContainersByAppNameMatchOptions = DockerContainersByAppNameMatchParams & {
  enabled?: boolean;
};

export function useDockerContainersByAppNameMatch({
  appName,
  appType,
  serverId,
  enabled = true,
}: UseDockerContainersByAppNameMatchOptions) {
  const key = useActiveOrganizationSWRKey(
    enabled && appName
      ? ['docker/getContainersByAppNameMatch', appName, appType ?? null, serverId ?? null]
      : null
  );

  return useSWR<DockerContainersByAppNameMatchResponse>(key, async () => {
    const response = await getRequest<unknown>('docker/getContainersByAppNameMatch', {
      appName,
      appType,
      serverId,
    });

    return normalizeDockerContainersResponse(response);
  });
}

export function isDockerContainersByAppNameMatchResult(
  value: DockerContainersByAppNameMatchResponse | undefined
): value is DockerContainersByAppNameMatchResult {
  return Boolean(value && !isErrorResponse(value));
}
