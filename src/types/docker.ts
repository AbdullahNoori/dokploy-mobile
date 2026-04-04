import type { models } from '@/types/error';

export type DockerAppType = 'docker-compose';

export type DockerContainersByAppNameMatchParams = {
  appName: string;
  appType?: DockerAppType;
  serverId?: string;
};

export type DockerContainersByAppNameMatchResult = {
  containerIds: string[];
};

export type DockerContainersByAppNameMatchResponse =
  | DockerContainersByAppNameMatchResult
  | models.ErrorT;
