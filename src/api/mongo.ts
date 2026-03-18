import useSWR from 'swr';

import type { MongoOneResponse } from '@/types/mongo';
import { getRequest } from '@/lib/http';

export function useMongoOne(mongoId: string | undefined) {
  return useSWR<MongoOneResponse>(
    mongoId ? ['mongo/one', mongoId] : null,
    () => getRequest('mongo/one', { mongoId })
  );
}
