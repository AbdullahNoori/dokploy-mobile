import { models } from '@/types/error';

export type ProjectAllEnvironment = {
  applications?: Array<ProjectApplication> | undefined;
  compose?: Array<ProjectCompose> | undefined;
  createdAt: string;
  description: string | null;
  env: string;
  environmentId: string;
  isDefault?: boolean;
  mariadb?: Array<ProjectDatabase> | undefined;
  mongo?: Array<ProjectDatabase> | undefined;
  mysql?: Array<ProjectDatabase> | undefined;
  name: string;
  postgres?: Array<ProjectDatabase> | undefined;
  projectId: string;
  redis?: Array<ProjectDatabase> | undefined;
};

export type ProjectApplication = {
  applicationId: string;
  name: string;
  appName: string;
  description: string | null;
  applicationStatus: string;
  createdAt: string;
  environmentId: string;
};

export type ProjectCompose = {
  composeId: string;
  name: string;
  createdAt: string;
  composeStatus?: string | null;
};

export type ProjectDatabase = {
  name: string;
  createdAt: string;
  applicationStatus?: string | null;
  postgresId?: string;
  redisId?: string;
  mysqlId?: string;
  mongoId?: string;
  mariadbId?: string;
};

export type ProjectItemType =
  | 'application'
  | 'compose'
  | 'postgres'
  | 'redis'
  | 'mysql'
  | 'mongo'
  | 'mariadb';

export type ProjectItem = {
  id: string;
  name: string;
  createdAt: string;
  status?: string | null;
  type: ProjectItemType;
};

export type ProjectAllResponseBody = {
  createdAt: string;
  description: string | null;
  env: string;
  environments: Array<ProjectAllEnvironment>;
  name: string;
  organizationId: string;
  projectId: string;
};

export type ProjectAllResponse = models.ErrorT | Array<ProjectAllResponseBody>;

export type ProjectOneResponse = models.ErrorT | ProjectAllResponseBody;
