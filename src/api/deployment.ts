import useSWR from 'swr';

import { HttpError } from '@/lib/http-error';
import { getRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { DeploymentAllByTypeRequest, DeploymentAllByTypeResponse } from '@/types/deployment';

async function getDeploymentsByType(request: DeploymentAllByTypeRequest) {
  try {
    return await getRequest<DeploymentAllByTypeResponse>('deployment/allByType', request);
  } catch (error) {
    if (error instanceof HttpError && error.response?.status === 404) {
      return getRequest<DeploymentAllByTypeResponse>('deployment.allByType', request);
    }

    throw error;
  }
}

export function useDeploymentsByType(request: DeploymentAllByTypeRequest | null) {
  const key = useActiveOrganizationSWRKey(
    request ? ['deployment/allByType', request.id, request.type] : null
  );

  return useSWR<DeploymentAllByTypeResponse>(key, () => getDeploymentsByType(request!));
}
