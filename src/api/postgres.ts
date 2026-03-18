import useSWR from 'swr';

import type { PostgresOneResponse } from '@/types/postgres';
import { getRequest } from '@/lib/http';

export function usePostgresOne(postgresId: string | undefined) {
  return useSWR<PostgresOneResponse>(
    postgresId ? ['postgres/one', postgresId] : null,
    () => getRequest('postgres/one', { postgresId })
  );
}
