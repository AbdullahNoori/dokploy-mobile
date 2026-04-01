import useSWR from 'swr';

import type { MysqlOneResponse } from '@/types/mysql';
import type {
  MysqlSaveEnvironmentRequest,
  MysqlSaveEnvironmentResponse,
} from '@/types/environment-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useMysqlOne(mysqlId: string | undefined) {
  return useSWR<MysqlOneResponse>(
    mysqlId ? ['mysql/one', mysqlId] : null,
    () => getRequest('mysql/one', { mysqlId })
  );
}

export function mysqlSaveEnvironment(payload: MysqlSaveEnvironmentRequest) {
  return postRequest<MysqlSaveEnvironmentResponse>('mysql/saveEnvironment', payload);
}
