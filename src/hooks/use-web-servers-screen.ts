import { startTransition, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner-native';

import {
  deleteWebServerBackup,
  readWebServerBackups,
  readWebServerSettings,
  runWebServerBackup,
  saveWebServerSettings,
  updateWebServerBackup,
} from '@/api/web-servers';
import { HttpError } from '@/lib/http-error';
import type {
  WebServerBackup,
  WebServerBackupUpdateRequest,
  WebServerCertificateType,
  WebServerSettings,
} from '@/types/web-servers';

type SectionStatus = 'loading' | 'ready' | 'error' | 'unauthorized';

type ErrorState = {
  kind: 'error' | 'unauthorized';
  message: string;
};

const DEFAULT_WEB_SERVER_SETTINGS: WebServerSettings = {
  host: '',
  letsEncryptEmail: '',
  https: false,
  certificateType: 'none',
};

function resolveErrorState(error: unknown, fallback: string): ErrorState {
  let message = fallback;
  let code: string | undefined;
  let status: number | undefined;

  if (error instanceof HttpError) {
    message = error.message ?? fallback;
    status = error.response?.status;
    code = error.code;
  } else if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    }
    if ('code' in error && typeof error.code === 'string') {
      code = error.code;
    }
    if ('status' in error && typeof error.status === 'number') {
      status = error.status;
    }
  }

  const normalized = `${code ?? ''} ${message}`.toLowerCase();
  const unauthorized =
    status === 401 ||
    status === 403 ||
    normalized.includes('unauthorized') ||
    normalized.includes('forbidden') ||
    normalized.includes('not allowed') ||
    normalized.includes('access required');

  if (unauthorized) {
    return {
      kind: 'unauthorized',
      message: 'Your session expired or this account cannot manage web server settings.',
    };
  }

  return {
    kind: 'error',
    message,
  };
}

function isValidHost(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.includes('.') && !trimmed.includes(' ');
}

function isValidEmail(value: string) {
  const trimmed = value.trim();
  return trimmed.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function areSettingsEqual(left: WebServerSettings, right: WebServerSettings) {
  return (
    left.host === right.host &&
    left.letsEncryptEmail === right.letsEncryptEmail &&
    left.https === right.https &&
    left.certificateType === right.certificateType
  );
}

function getPrimaryBackup(backups: WebServerBackup[]) {
  return backups.find((backup) => backup.enabled !== false) ?? backups[0] ?? null;
}

export function useWebServersScreen() {
  const settingsRequestIdRef = useRef(0);
  const backupsRequestIdRef = useRef(0);

  const [settingsStatus, setSettingsStatus] = useState<SectionStatus>('loading');
  const [settingsError, setSettingsError] = useState<ErrorState | null>(null);
  const [initialSettings, setInitialSettings] = useState<WebServerSettings>(DEFAULT_WEB_SERVER_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<WebServerSettings>(DEFAULT_WEB_SERVER_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [backupsStatus, setBackupsStatus] = useState<SectionStatus>('loading');
  const [backupsError, setBackupsError] = useState<ErrorState | null>(null);
  const [backups, setBackups] = useState<WebServerBackup[]>([]);
  const [runningBackupId, setRunningBackupId] = useState<string | null>(null);
  const [updatingBackupId, setUpdatingBackupId] = useState<string | null>(null);
  const [deletingBackupId, setDeletingBackupId] = useState<string | null>(null);

  async function loadSettings() {
    const requestId = ++settingsRequestIdRef.current;
    startTransition(() => {
      setSettingsStatus('loading');
      setSettingsError(null);
    });

    try {
      const response = await readWebServerSettings();
      if (requestId !== settingsRequestIdRef.current) {
        return;
      }

      setInitialSettings(response);
      setDraftSettings(response);
      setSettingsStatus('ready');
      setSettingsError(null);
    } catch (error) {
      if (requestId !== settingsRequestIdRef.current) {
        return;
      }

      const resolved = resolveErrorState(error, 'Unable to load web server settings.');
      setSettingsError(resolved);
      setSettingsStatus(resolved.kind === 'unauthorized' ? 'unauthorized' : 'error');
    }
  }

  async function loadBackups() {
    const requestId = ++backupsRequestIdRef.current;
    startTransition(() => {
      setBackupsStatus('loading');
      setBackupsError(null);
    });

    try {
      const response = await readWebServerBackups();
      if (requestId !== backupsRequestIdRef.current) {
        return;
      }

      setBackups(response);
      setBackupsStatus('ready');
      setBackupsError(null);
    } catch (error) {
      if (requestId !== backupsRequestIdRef.current) {
        return;
      }

      const resolved = resolveErrorState(error, 'Unable to load backups.');
      setBackups([]);
      setBackupsError(resolved);
      setBackupsStatus(resolved.kind === 'unauthorized' ? 'unauthorized' : 'error');
    }
  }

  useEffect(() => {
    void loadSettings();
    void loadBackups();
  }, []);

  const setHost = (host: string) => {
    setDraftSettings((current) => ({ ...current, host }));
  };

  const setLetsEncryptEmail = (letsEncryptEmail: string) => {
    setDraftSettings((current) => ({ ...current, letsEncryptEmail }));
  };

  const setHttps = (https: boolean) => {
    setDraftSettings((current) => {
      const nextCertificateType =
        https && current.certificateType === 'none' ? 'letsencrypt' : current.certificateType;

      return {
        ...current,
        https,
        certificateType: https ? nextCertificateType : 'none',
      };
    });
  };

  const setCertificateType = (certificateType: WebServerCertificateType) => {
    setDraftSettings((current) => ({
      ...current,
      certificateType,
      https: certificateType === 'none' ? false : current.https || true,
    }));
  };

  const settingsValidationMessage = (() => {
    if (!isValidHost(draftSettings.host)) {
      return 'Enter a valid domain.';
    }

    if (!isValidEmail(draftSettings.letsEncryptEmail)) {
      return 'Enter a valid email address.';
    }

    if (
      draftSettings.https &&
      draftSettings.certificateType === 'letsencrypt' &&
      draftSettings.letsEncryptEmail.trim().length === 0
    ) {
      return 'Let’s Encrypt email is required when HTTPS uses Let’s Encrypt.';
    }

    return null;
  })();

  const canSaveSettings =
    settingsStatus === 'ready' &&
    !isSavingSettings &&
    !settingsValidationMessage &&
    !areSettingsEqual(draftSettings, initialSettings);

  async function saveSettings() {
    if (!canSaveSettings) {
      if (settingsValidationMessage) {
        toast.error(settingsValidationMessage);
      }
      return;
    }

    setIsSavingSettings(true);

    try {
      await saveWebServerSettings({
        host: draftSettings.host.trim() || null,
        letsEncryptEmail: draftSettings.letsEncryptEmail.trim() || null,
        https: draftSettings.https,
        certificateType: draftSettings.https ? draftSettings.certificateType : 'none',
      });

      const normalized = {
        ...draftSettings,
        host: draftSettings.host.trim(),
        letsEncryptEmail: draftSettings.letsEncryptEmail.trim(),
        certificateType: draftSettings.https ? draftSettings.certificateType : 'none',
      };

      setInitialSettings(normalized);
      setDraftSettings(normalized);
      toast.success('Web server settings saved.');
    } catch (error) {
      toast.error(resolveErrorState(error, 'Unable to save web server settings.').message);
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function runBackup(backupId: string) {
    if (runningBackupId || updatingBackupId || deletingBackupId) {
      return;
    }

    setRunningBackupId(backupId);

    try {
      await runWebServerBackup({ backupId });
      toast.success('Backup run started.');
    } catch (error) {
      toast.error(resolveErrorState(error, 'Unable to run backup.').message);
    } finally {
      setRunningBackupId(null);
    }
  }

  async function runPrimaryBackup() {
    const primaryBackup = getPrimaryBackup(backups);
    if (!primaryBackup) {
      toast.error('No web server backup is available yet.');
      return;
    }

    await runBackup(primaryBackup.backupId);
  }

  async function saveBackup(payload: WebServerBackupUpdateRequest) {
    if (runningBackupId || updatingBackupId || deletingBackupId) {
      return false;
    }

    setUpdatingBackupId(payload.backupId);

    try {
      await updateWebServerBackup(payload);
      toast.success('Backup updated.');
      await loadBackups();
      return true;
    } catch (error) {
      toast.error(resolveErrorState(error, 'Unable to update backup.').message);
      return false;
    } finally {
      setUpdatingBackupId(null);
    }
  }

  async function removeBackup(backupId: string) {
    if (runningBackupId || updatingBackupId || deletingBackupId) {
      return false;
    }

    setDeletingBackupId(backupId);

    try {
      await deleteWebServerBackup({ backupId });
      setBackups((current) => current.filter((backup) => backup.backupId !== backupId));
      toast.success('Backup deleted.');
      return true;
    } catch (error) {
      toast.error(resolveErrorState(error, 'Unable to delete backup.').message);
      return false;
    } finally {
      setDeletingBackupId(null);
    }
  }

  const isInitialLoading =
    settingsStatus === 'loading' &&
    backupsStatus === 'loading' &&
    backups.length === 0 &&
    areSettingsEqual(initialSettings, DEFAULT_WEB_SERVER_SETTINGS);

  return {
    isInitialLoading,
    settings: {
      status: settingsStatus,
      error: settingsError,
      value: draftSettings,
      isSaving: isSavingSettings,
      validationMessage: settingsValidationMessage,
      canSave: canSaveSettings,
      setHost,
      setLetsEncryptEmail,
      setHttps,
      setCertificateType,
      save: saveSettings,
      retry: loadSettings,
    },
    backups: {
      status: backupsStatus,
      error: backupsError,
      items: backups,
      primaryBackupId: getPrimaryBackup(backups)?.backupId ?? null,
      runningBackupId,
      updatingBackupId,
      deletingBackupId,
      runPrimary: runPrimaryBackup,
      run: runBackup,
      save: saveBackup,
      remove: removeBackup,
      retry: loadBackups,
    },
  };
}
