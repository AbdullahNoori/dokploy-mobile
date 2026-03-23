import type { models } from '@/types/error';

export type ApplicationReloadRequest = {
  appName: string;
  applicationId: string;
};

export type ApplicationReloadResponse = models.ErrorT | boolean;

export type ApplicationRedeployRequest = {
  applicationId: string;
  title?: string;
  description?: string;
};

export type ApplicationRedeployResponse = models.ErrorT | undefined;

export type ApplicationStopRequest = {
  applicationId: string;
};

// Full SDK response is a large application payload; treat it as opaque here.
export type ApplicationStopResponseBody = Record<string, unknown>;

export type ApplicationStopResponse = models.ErrorT | ApplicationStopResponseBody;
