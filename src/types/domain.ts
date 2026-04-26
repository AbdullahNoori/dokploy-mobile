import type { models } from '@/types/error';
import type { ApplicationOneDomain } from '@/types/application';

export type DomainCreateRequest = {
  applicationId?: string | null;
  certificateType?: 'letsencrypt' | 'none' | 'custom';
  composeId?: string | null;
  customCertResolver?: string | null;
  domainType?: 'compose' | 'application' | 'preview' | null;
  host: string;
  https?: boolean;
  internalPath?: string | null;
  path?: string | null;
  port?: number | null;
  previewDeploymentId?: string | null;
  serviceName?: string | null;
  stripPath?: boolean;
};

export type DomainCreateResponse = ApplicationOneDomain | models.ErrorT;

export type DomainByApplicationIdRequest = {
  applicationId: string;
};

export type DomainByComposeIdRequest = {
  composeId: string;
};

export type DomainListResponse = ApplicationOneDomain[] | models.ErrorT;

export type DomainUpdateRequest = {
  domainId: string;
  host: string;
  path?: string | null;
  internalPath?: string | null;
  stripPath?: boolean;
  port?: number | null;
  https?: boolean;
  certificateType?: 'letsencrypt' | 'none' | 'custom';
  domainType?: 'compose' | 'application' | 'preview' | null;
  customCertResolver?: string | null;
  serviceName?: string | null;
};

export type DomainUpdateResponse = ApplicationOneDomain | models.ErrorT;

export type DomainDeleteRequest = {
  domainId: string;
};

export type DomainDeleteResponse = ApplicationOneDomain | models.ErrorT;

export type DomainValidateRequest = {
  domain: string;
  serverIp?: string;
};

export type DomainValidateResponse = models.ErrorT | undefined;
