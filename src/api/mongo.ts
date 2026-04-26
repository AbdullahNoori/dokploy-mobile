import useSWR from 'swr';

import type { MongoOneResponse } from '@/types/mongo';
import type {
  MongoSaveEnvironmentRequest,
  MongoSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStopResponse,
} from '@/types/application-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useMongoOne(mongoId: string | undefined) {
  return useSWR<MongoOneResponse>(mongoId ? ['mongo/one', mongoId] : null, () =>
    getRequest('mongo/one', { mongoId })
  );
}

export function mongoSaveEnvironment(payload: MongoSaveEnvironmentRequest) {
  return postRequest<MongoSaveEnvironmentResponse>('mongo/saveEnvironment', payload);
}

export function mongoDeploy(payload: { mongoId: string }) {
  return postRequest<ServiceDeployResponse>('mongo/deploy', payload);
}

export function mongoReload(payload: { mongoId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('mongo/reload', payload);
}

export function mongoRebuild(payload: { mongoId: string }) {
  return postRequest<ServiceRebuildResponse>('mongo/rebuild', payload);
}

export function mongoStop(payload: { mongoId: string }) {
  return postRequest<ServiceStopResponse>('mongo/stop', payload);
}
