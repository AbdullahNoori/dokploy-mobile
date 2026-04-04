import type { models } from '@/types/error';

export type ApplicationOneDeployment = {
  deploymentId: string;
  title: string;
  description?: string | null;
  status: string | null;
  logPath?: string | null;
  pid?: string | null;
  applicationId?: string | null;
  composeId?: string | null;
  serverId?: string | null;
  isPreviewDeployment?: boolean | null;
  previewDeploymentId?: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage?: string | null;
  scheduleId?: string | null;
  backupId?: string | null;
  rollbackId?: string | null;
  volumeBackupId?: string | null;
  buildServerId?: string | null;
};

export type ApplicationOnePort = {
  applicationId: string;
  portId: string;
  protocol: 'tcp' | 'udp';
  publishMode: 'ingress' | 'host';
  publishedPort: number;
  targetPort: number;
};

export type ApplicationOneDomain = {
  applicationId: string | null;
  certificateType: 'letsencrypt' | 'none' | 'custom';
  composeId: string | null;
  createdAt: string;
  customCertResolver: string | null;
  domainId: string;
  domainType: 'compose' | 'application' | 'preview' | null;
  host: string;
  https: boolean;
  internalPath: string | null;
  path: string | null;
  port: number | null;
  previewDeploymentId: string | null;
  serviceName: string | null;
  stripPath: boolean;
  uniqueConfigKey: number;
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
  ports?: Array<ApplicationOnePort>;
  domains?: Array<ApplicationOneDomain>;
  deployments: Array<ApplicationOneDeployment>;
};

export type ApplicationOneResponse = ApplicationOneResponseBody | models.ErrorT;
