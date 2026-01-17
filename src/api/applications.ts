import { AxiosRequestConfig } from 'axios';
import { getRequest } from 'src/lib/http';
import { PAT_STORAGE_KEY, patStorage } from 'src/lib/pat-storage';

export type ApplicationDetail = {
  id?: string;
  applicationId?: string;
  name?: string;
  [key: string]: unknown;
};

export type ServiceType = 'postgres' | 'mysql' | 'mariadb' | 'mongo' | 'redis' | 'compose';

const withPatHeader = (config?: AxiosRequestConfig<any>): AxiosRequestConfig<any> | undefined => {
  const storedPat = patStorage.getString(PAT_STORAGE_KEY);

  if (!storedPat) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...(config?.headers ?? {}),
      'x-api-key': storedPat,
    },
  };
};

const serviceRequestConfig: Record<ServiceType, { endpoint: string; paramKey: string }> = {
  postgres: { endpoint: 'postgres.one', paramKey: 'postgresId' },
  mysql: { endpoint: 'mysql.one', paramKey: 'mysqlId' },
  mariadb: { endpoint: 'mariadb.one', paramKey: 'mariadbId' },
  mongo: { endpoint: 'mongo.one', paramKey: 'mongoId' },
  redis: { endpoint: 'redis.one', paramKey: 'redisId' },
  compose: { endpoint: 'compose.one', paramKey: 'composeId' },
};

export function fetchApplication(
  serviceType: ServiceType,
  serviceId: string,
  config?: AxiosRequestConfig<any>
) {
  const { endpoint, paramKey } = serviceRequestConfig[serviceType];

  return getRequest<ApplicationDetail>(endpoint, { [paramKey]: serviceId }, withPatHeader(config));
}
