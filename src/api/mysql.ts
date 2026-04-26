import useSWR from 'swr';

import type { MysqlOneResponse } from '@/types/mysql';
import type {
  MysqlSaveEnvironmentRequest,
  MysqlSaveEnvironmentResponse,
} from '@/types/environment-actions';
import type {
  ServiceDeployResponse,
  ServiceRebuildResponse,
  ServiceReloadResponse,
  ServiceStopResponse,
} from '@/types/application-actions';
import { getRequest, postRequest } from '@/lib/http';

export function useMysqlOne(mysqlId: string | undefined) {
  return useSWR<MysqlOneResponse>(mysqlId ? ['mysql/one', mysqlId] : null, () =>
    getRequest('mysql/one', { mysqlId })
  );
}

export function mysqlSaveEnvironment(payload: MysqlSaveEnvironmentRequest) {
  return postRequest<MysqlSaveEnvironmentResponse>('mysql/saveEnvironment', payload);
}

export function mysqlDeploy(payload: { mysqlId: string }) {
  return postRequest<ServiceDeployResponse>('mysql/deploy', payload);
}

export function mysqlReload(payload: { mysqlId: string; appName: string }) {
  return postRequest<ServiceReloadResponse>('mysql/reload', payload);
}

export function mysqlRebuild(payload: { mysqlId: string }) {
  return postRequest<ServiceRebuildResponse>('mysql/rebuild', payload);
}

export function mysqlStop(payload: { mysqlId: string }) {
  return postRequest<ServiceStopResponse>('mysql/stop', payload);
}
