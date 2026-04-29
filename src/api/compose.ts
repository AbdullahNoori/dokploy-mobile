import useSWR from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { ComposeOneResponse } from '@/types/compose';
import type { ServiceDeployResponse, ServiceStopResponse } from '@/types/application-actions';

export function useComposeOne(composeId: string | undefined) {
  const key = useActiveOrganizationSWRKey(composeId ? ['compose/one', composeId] : null);

  return useSWR<ComposeOneResponse>(key, () => getRequest('compose/one', { composeId }));
}

export function composeRedeploy(payload: {
  composeId: string;
  title?: string;
  description?: string;
}) {
  return postRequest<ServiceDeployResponse>('compose/redeploy', payload);
}

export function composeStart(payload: { composeId: string }) {
  return postRequest<ServiceStopResponse>('compose/start', payload);
}

export function composeStop(payload: { composeId: string }) {
  return postRequest<ServiceStopResponse>('compose/stop', payload);
}
