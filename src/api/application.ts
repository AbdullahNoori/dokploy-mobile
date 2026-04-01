import useSWR from 'swr';

import type { ApplicationOneResponse } from '@/types/application';
import type {
  ApplicationReloadRequest,
  ApplicationReloadResponse,
  ApplicationRedeployRequest,
  ApplicationRedeployResponse,
  ApplicationStopRequest,
  ApplicationStopResponse,
} from '@/types/application-actions';
import type {
  ApplicationSaveEnvironmentRequest,
  ApplicationSaveEnvironmentResponse,
} from '@/types/environment-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useApplicationOne(applicationId: string | undefined) {
  return useSWR<ApplicationOneResponse>(
    applicationId ? ['application/one', applicationId] : null,
    () => getRequest('application/one', { applicationId })
  );
}

export function applicationReload(payload: ApplicationReloadRequest) {
  return postRequest<ApplicationReloadResponse>('application/reload', payload);
}

export function applicationRedeploy(payload: ApplicationRedeployRequest) {
  return postRequest<ApplicationRedeployResponse>('application/redeploy', payload);
}

export function applicationStop(payload: ApplicationStopRequest) {
  return postRequest<ApplicationStopResponse>('application/stop', payload);
}

export function applicationSaveEnvironment(payload: ApplicationSaveEnvironmentRequest) {
  return postRequest<ApplicationSaveEnvironmentResponse>('application/saveEnvironment', payload);
}
