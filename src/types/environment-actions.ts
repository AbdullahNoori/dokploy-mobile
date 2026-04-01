import type { models } from '@/types/error';

export type ApplicationSaveEnvironmentRequest = {
  applicationId: string;
  buildArgs?: string | null;
  env?: string | null;
  buildSecrets?: string | null;
  createEnvFile?: boolean | null;
};


export type ApplicationSaveEnvironmentResponse = models.ErrorT | boolean;

export type RedisSaveEnvironmentRequest = {
  redisId: string;
  env?: string | null;
};

export type RedisSaveEnvironmentResponse = models.ErrorT | boolean;

export type PostgresSaveEnvironmentRequest = {
  postgresId: string;
  env?: string | null;
};

export type PostgresSaveEnvironmentResponse = models.ErrorT | boolean;

export type MysqlSaveEnvironmentRequest = {
  mysqlId: string;
  env?: string | null;
};

export type MysqlSaveEnvironmentResponse = models.ErrorT | boolean;

export type MongoSaveEnvironmentRequest = {
  mongoId: string;
  env?: string | null;
};

export type MongoSaveEnvironmentResponse = models.ErrorT | boolean;

export type MariadbSaveEnvironmentRequest = {
  mariadbId: string;
  env?: string | null;
};

export type MariadbSaveEnvironmentResponse = models.ErrorT | boolean;
