import type { ErrorT as DokploySdkError } from 'dokploy-sdk/models';
import type {
  BackupManualBackupWebServerRequest,
  BackupRemoveRequest,
  BackupUpdateRequest,
  SettingsAssignDomainServerCertificateType,
  SettingsAssignDomainServerRequest,
} from 'dokploy-sdk/models/operations';

export type WebServersSdkError = DokploySdkError;

export type WebServerSettingsSaveRequest = SettingsAssignDomainServerRequest;
export type WebServerCertificateType = SettingsAssignDomainServerCertificateType;
export type WebServerBackupUpdateRequest = BackupUpdateRequest;
export type WebServerBackupRunRequest = BackupManualBackupWebServerRequest;
export type WebServerBackupDeleteRequest = BackupRemoveRequest;

export type WebServerSettings = {
  host: string;
  letsEncryptEmail: string;
  https: boolean;
  certificateType: WebServerCertificateType;
};

export type WebServerBackup = {
  backupId: string;
  appName: string;
  backupType: string | null;
  database: string;
  databaseType: string;
  destinationId: string;
  destinationName: string;
  enabled: boolean | null;
  keepLatestCount: number | null;
  metadata?: unknown;
  prefix: string;
  schedule: string;
  serviceName: string | null;
  userId: string | null;
};
