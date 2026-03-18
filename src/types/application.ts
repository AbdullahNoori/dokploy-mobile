import type { models } from '@/types/error';

export type ApplicationOneDeployment = {
  deploymentId: string;
  title: string;
  status: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type ApplicationOneResponseBody = {
  applicationId?: string | undefined;
  name: string;
  appName?: string | undefined;
  applicationStatus?: string | undefined;
  autoDeploy?: boolean | null | undefined;
  cleanCache?: boolean | null | undefined;
  buildType?: string | undefined;
  dockerImage?: string | null | undefined;
  branch?: string | null | undefined;
  createdAt?: string | undefined;
  env?: string | null | undefined;
  environment: {
    name: string;
    project?: {
      name: string;
    };
  };
  server?: {
    name: string;
  } | null;
  ports?: Array<unknown>;
  domains?: Array<unknown>;
  deployments: Array<ApplicationOneDeployment>;
};

export type ApplicationOneResponse = ApplicationOneResponseBody | models.ErrorT;
