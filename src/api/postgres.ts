import useSWR from 'swr';

import type { PostgresOneResponse } from '@/types/postgres';
import type {
  PostgresSaveEnvironmentRequest,
  PostgresSaveEnvironmentResponse,
} from '@/types/environment-actions';
import { getRequest, postRequest } from '@/lib/http';

export function usePostgresOne(postgresId: string | undefined) {
  return useSWR<PostgresOneResponse>(
    postgresId ? ['postgres/one', postgresId] : null,
    () => getRequest('postgres/one', { postgresId })
  );
}

export function postgresSaveEnvironment(payload: PostgresSaveEnvironmentRequest) {
  return postRequest<PostgresSaveEnvironmentResponse>('postgres/saveEnvironment', payload);
}
