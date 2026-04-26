import useSWR from 'swr';

import type { ComposeOneResponse } from '@/types/compose';
import type { ServiceDeployResponse, ServiceStopResponse } from '@/types/application-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useComposeOne(composeId: string | undefined) {
  return useSWR<ComposeOneResponse>(composeId ? ['compose/one', composeId] : null, () =>
    getRequest('compose/one', { composeId })
  );
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
