import useSWR from 'swr';

import type { RedisOneResponse } from '@/types/redis';
import type {
  RedisSaveEnvironmentRequest,
  RedisSaveEnvironmentResponse,
} from '@/types/environment-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useRedisOne(redisId: string | undefined) {
  return useSWR<RedisOneResponse>(
    redisId ? ['redis/one', redisId] : null,
    () => getRequest('redis/one', { redisId })
  );
}

export function redisSaveEnvironment(payload: RedisSaveEnvironmentRequest) {
  return postRequest<RedisSaveEnvironmentResponse>('redis/saveEnvironment', payload);
}
