import useSWR from 'swr';

import type { MariadbOneResponse } from '@/types/mariadb';
import { getRequest } from '@/lib/http';

export function useMariadbOne(mariadbId: string | undefined) {
  return useSWR<MariadbOneResponse>(
    mariadbId ? ['mariadb/one', mariadbId] : null,
    () => getRequest('mariadb/one', { mariadbId })
  );
}
