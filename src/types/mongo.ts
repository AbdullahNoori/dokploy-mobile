import type { models } from '@/types/error';

export type MongoOneResponseBody = {
  mongoId: string;
  applicationId?: string | null;
  composeId?: string | null;
  name: string;
  appName: string;
  applicationStatus: string;
  dockerImage: string;
  externalPort: number | null;
  replicas: number;
  memoryLimit: string | null;
  cpuLimit: string | null;
  env: string | null;
  createdAt: string;
  serverId: string | null;
  environment: {
    name: string;
    project?: {
      name: string;
    };
  };
  server: {
    name: string;
  } | null;
};

export type MongoOneResponse = MongoOneResponseBody | models.ErrorT;
