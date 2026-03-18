import useSWR from 'swr';

import type { RedisOneResponse } from '@/types/redis';
import { getRequest } from '@/lib/http';

export function useRedisOne(redisId: string | undefined) {
  return useSWR<RedisOneResponse>(
    redisId ? ['redis/one', redisId] : null,
    () => getRequest('redis/one', { redisId })
  );
}
