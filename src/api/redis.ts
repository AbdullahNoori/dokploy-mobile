import useSWR from 'swr';

import { getRequest, postRequest } from '@/lib/http';
import { useActiveOrganizationSWRKey } from '@/lib/organization-swr-key';
import type { RedisOneResponse } from '@/types/redis';
import type {
  RedisSaveEnvironmentRequest,
  RedisSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStopResponse,
} from '@/types/application-actions';

export function useRedisOne(redisId: string | undefined) {
  const key = useActiveOrganizationSWRKey(redisId ? ['redis/one', redisId] : null);

  return useSWR<RedisOneResponse>(key, () => getRequest('redis/one', { redisId }));
}

export function redisSaveEnvironment(payload: RedisSaveEnvironmentRequest) {
  return postRequest<RedisSaveEnvironmentResponse>('redis/saveEnvironment', payload);
}

export function redisDeploy(payload: { redisId: string }) {
  return postRequest<ServiceDeployResponse>('redis/deploy', payload);
}

export function redisReload(payload: { redisId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('redis/reload', payload);
}

export function redisRebuild(payload: { redisId: string }) {
  return postRequest<ServiceRebuildResponse>('redis/rebuild', payload);
}

export function redisStop(payload: { redisId: string }) {
  return postRequest<ServiceStopResponse>('redis/stop', payload);
}
