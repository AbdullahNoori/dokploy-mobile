import type { models } from '@/types/error';
import type { ProjectItemType } from '@/types/projects';

export type DeploymentAllByTypeRequest = {
  id: string;
  type: ProjectItemType | 'server' | 'schedule' | 'previewDeployment' | 'backup' | 'volumeBackup';
};

export type DeploymentResponseBody = {
  applicationId: string | null;
  backupId: string | null;
  buildServerId?: string | null;
  composeId: string | null;
  createdAt: string;
  deploymentId: string;
  description: string | null;
  errorMessage: string | null;
  finishedAt: string | null;
  isPreviewDeployment: boolean | null;
  logPath: string | null;
  pid: string | null;
  previewDeploymentId: string | null;
  rollbackId: string | null;
  scheduleId: string | null;
  serverId: string | null;
  startedAt: string | null;
  status: string | null;
  title: string;
  volumeBackupId: string | null;
};

export type DeploymentAllByTypeResponse = models.ErrorT | Array<DeploymentResponseBody>;
