import useSWR from 'swr';

import type { MariadbOneResponse } from '@/types/mariadb';
import type {
  MariadbSaveEnvironmentRequest,
  MariadbSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStopResponse,
} from '@/types/application-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useMariadbOne(mariadbId: string | undefined) {
  return useSWR<MariadbOneResponse>(mariadbId ? ['mariadb/one', mariadbId] : null, () =>
    getRequest('mariadb/one', { mariadbId })
  );
}

export function mariadbSaveEnvironment(payload: MariadbSaveEnvironmentRequest) {
  return postRequest<MariadbSaveEnvironmentResponse>('mariadb/saveEnvironment', payload);
}

export function mariadbDeploy(payload: { mariadbId: string }) {
  return postRequest<ServiceDeployResponse>('mariadb/deploy', payload);
}

export function mariadbReload(payload: { mariadbId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('mariadb/reload', payload);
}

export function mariadbRebuild(payload: { mariadbId: string }) {
  return postRequest<ServiceRebuildResponse>('mariadb/rebuild', payload);
}

export function mariadbStop(payload: { mariadbId: string }) {
  return postRequest<ServiceStopResponse>('mariadb/stop', payload);
}
