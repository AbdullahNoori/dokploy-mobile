import type { models } from '@/types/error';

export type ComposeOneResponseBody = {
  composeId: string;
  name: string;
  appName?: string | null;
  applicationId?: string | null;
  composeStatus?: string | null;
  description?: string | null;
  createdAt: string;
  env?: string | null;
  serverId?: string | null;
  composeFile?: string | null;
  sourceType?: string | null;
  repository?: string | null;
  branch?: string | null;
  environment?: {
    name: string;
    project?: {
      name: string;
    };
  };
  server?: {
    name: string;
  } | null;
};

export type ComposeOneResponse = ComposeOneResponseBody | models.ErrorT;
