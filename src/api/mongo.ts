import useSWR from 'swr';

import type { MongoOneResponse } from '@/types/mongo';
import type {
  MongoSaveEnvironmentRequest,
  MongoSaveEnvironmentResponse,
} from '@/types/environment-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useMongoOne(mongoId: string | undefined) {
  return useSWR<MongoOneResponse>(
    mongoId ? ['mongo/one', mongoId] : null,
    () => getRequest('mongo/one', { mongoId })
  );
}

export function mongoSaveEnvironment(payload: MongoSaveEnvironmentRequest) {
  return postRequest<MongoSaveEnvironmentResponse>('mongo/saveEnvironment', payload);
}
