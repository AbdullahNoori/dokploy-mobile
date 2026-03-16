import { models } from '@/types/error';

export type ProjectAllEnvironment = {
  applications?: Array<ProjectApplication> | undefined;
  compose?: Array<any> | undefined;
  createdAt: string;
  description: string | null;
  env: string;
  environmentId: string;
  isDefault?: boolean;
  mariadb?: Array<any> | undefined;
  mongo?: Array<any> | undefined;
  mysql?: Array<any> | undefined;
  name: string;
  postgres?: Array<any> | undefined;
  projectId: string;
  redis?: Array<any> | undefined;
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
