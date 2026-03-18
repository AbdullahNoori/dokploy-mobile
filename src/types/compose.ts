import type { models } from '@/types/error';

export type ComposeOneResponseBody = {
  composeId: string;
  name: string;
  createdAt: string;
  env?: string | null;
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
