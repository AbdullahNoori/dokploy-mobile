import useSWR from 'swr';

import { getRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { DeploymentAllByTypeRequest, DeploymentAllByTypeResponse } from '@/types/deployment';

export async function readDeploymentsByType(request: DeploymentAllByTypeRequest) {
  return getRequest<DeploymentAllByTypeResponse>('deployment.allByType', request);
}

export function useDeploymentsByType(request: DeploymentAllByTypeRequest | null) {
  const key = useActiveOrganizationSWRKey(
    request ? ['deployment.allByType', request.id, request.type] : null
  );

  return useSWR<DeploymentAllByTypeResponse>(key, () => readDeploymentsByType(request!));
}
