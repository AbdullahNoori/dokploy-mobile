import useSWR from 'swr';

import type { MariadbOneResponse } from '@/types/mariadb';
import type {
  MariadbSaveEnvironmentRequest,
  MariadbSaveEnvironmentResponse,
} from '@/types/environment-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useMariadbOne(mariadbId: string | undefined) {
  return useSWR<MariadbOneResponse>(
    mariadbId ? ['mariadb/one', mariadbId] : null,
    () => getRequest('mariadb/one', { mariadbId })
  );
}

export function mariadbSaveEnvironment(payload: MariadbSaveEnvironmentRequest) {
  return postRequest<MariadbSaveEnvironmentResponse>('mariadb/saveEnvironment', payload);
}
