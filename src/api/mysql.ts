import useSWR from 'swr';

import type { MysqlOneResponse } from '@/types/mysql';
import { getRequest } from '@/lib/http';

export function useMysqlOne(mysqlId: string | undefined) {
  return useSWR<MysqlOneResponse>(
    mysqlId ? ['mysql/one', mysqlId] : null,
    () => getRequest('mysql/one', { mysqlId })
  );
}
