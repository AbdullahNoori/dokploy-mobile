import useSWR from 'swr';

import type { PostgresOneResponse } from '@/types/postgres';
import type {
  PostgresSaveEnvironmentRequest,
  PostgresSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStopResponse,
} from '@/types/application-actions';
import { getRequest, postRequest } from '@/lib/http';

export function usePostgresOne(postgresId: string | undefined) {
  return useSWR<PostgresOneResponse>(postgresId ? ['postgres/one', postgresId] : null, () =>
    getRequest('postgres/one', { postgresId })
  );
}

export function postgresSaveEnvironment(payload: PostgresSaveEnvironmentRequest) {
  return postRequest<PostgresSaveEnvironmentResponse>('postgres/saveEnvironment', payload);
}

export function postgresDeploy(payload: { postgresId: string }) {
  return postRequest<ServiceDeployResponse>('postgres/deploy', payload);
}

export function postgresReload(payload: { postgresId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('postgres/reload', payload);
}

export function postgresRebuild(payload: { postgresId: string }) {
  return postRequest<ServiceRebuildResponse>('postgres/rebuild', payload);
}

export function postgresStop(payload: { postgresId: string }) {
  return postRequest<ServiceStopResponse>('postgres/stop', payload);
}
