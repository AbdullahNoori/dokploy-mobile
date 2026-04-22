import { useFocusEffect } from '@react-navigation/native';
import { startTransition, useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner-native';

import {
  deleteWebServerBackup,
  readWebServerBackups,
  readWebServerSettings,
  runWebServerBackup,
  saveWebServerSettings,
  updateWebServerBackup,
} from '@/api/web-servers';
import { useHaptics } from '@/hooks/use-haptics';
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
  const { impact, notifyError, notifySuccess } = useHaptics();
  const settingsRequestIdRef = useRef(0);
  const backupsRequestIdRef = useRef(0);

  const [settingsStatus, setSettingsStatus] = useState<SectionStatus>('loading');
  const [settingsError, setSettingsError] = useState<ErrorState | null>(null);
  const [initialSettings, setInitialSettings] = useState<WebServerSettings>(
    DEFAULT_WEB_SERVER_SETTINGS
  );
  const [draftSettings, setDraftSettings] = useState<WebServerSettings>(
    DEFAULT_WEB_SERVER_SETTINGS
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [backupsStatus, setBackupsStatus] = useState<SectionStatus>('loading');
  const [backupsError, setBackupsError] = useState<ErrorState | null>(null);
  const [backups, setBackups] = useState<WebServerBackup[]>([]);
  const [runningBackupId, setRunningBackupId] = useState<string | null>(null);
  const [updatingBackupId, setUpdatingBackupId] = useState<string | null>(null);
  const [deletingBackupId, setDeletingBackupId] = useState<string | null>(null);

  const loadSettings = useCallback(async (showLoadingState = true) => {
    const requestId = ++settingsRequestIdRef.current;
    if (showLoadingState) {
      startTransition(() => {
        setSettingsStatus('loading');
        setSettingsError(null);
      });
    }

    try {
      const response = await readWebServerSettings();
      if (requestId !== settingsRequestIdRef.current) {
        return false;
      }

      setInitialSettings(response);
      setDraftSettings(response);
      setSettingsStatus('ready');
      setSettingsError(null);
      return true;
    } catch (error) {
      if (requestId !== settingsRequestIdRef.current) {
        return false;
      }

      const resolved = resolveErrorState(error, 'Unable to load web server settings.');
      setSettingsError(resolved);
      setSettingsStatus(resolved.kind === 'unauthorized' ? 'unauthorized' : 'error');
      return false;
    }
  }, []);

  const loadBackups = useCallback(async (showLoadingState = true) => {
    const requestId = ++backupsRequestIdRef.current;
    if (showLoadingState) {
      startTransition(() => {
        setBackupsStatus('loading');
        setBackupsError(null);
      });
    }

    try {
      const response = await readWebServerBackups();
      if (requestId !== backupsRequestIdRef.current) {
        return false;
      }

      setBackups(response);
      setBackupsStatus('ready');
      setBackupsError(null);
      return true;
    } catch (error) {
      if (requestId !== backupsRequestIdRef.current) {
        return false;
      }

      const resolved = resolveErrorState(error, 'Unable to load backups.');
      setBackups([]);
      setBackupsError(resolved);
      setBackupsStatus(resolved.kind === 'unauthorized' ? 'unauthorized' : 'error');
      return false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSettings(settingsRequestIdRef.current === 0);
      void loadBackups(backupsRequestIdRef.current === 0);
    }, [loadBackups, loadSettings])
  );

  const setHost = useCallback((host: string) => {
    setDraftSettings((current) => ({ ...current, host }));
  }, []);

  const setLetsEncryptEmail = useCallback((letsEncryptEmail: string) => {
    setDraftSettings((current) => ({ ...current, letsEncryptEmail }));
  }, []);

  const setHttps = useCallback((https: boolean) => {
    setDraftSettings((current) => {
      const nextCertificateType =
        https && current.certificateType === 'none' ? 'letsencrypt' : current.certificateType;

      return {
        ...current,
        https,
        certificateType: https ? nextCertificateType : 'none',
      };
    });
  }, []);

  const setCertificateType = useCallback((certificateType: WebServerCertificateType) => {
    setDraftSettings((current) => ({
      ...current,
      certificateType,
      https: certificateType === 'none' ? false : current.https || true,
    }));
  }, []);

  const settingsValidationMessage = useMemo(() => {
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
  }, [draftSettings]);

  const canSaveSettings = useMemo(
    () =>
      settingsStatus === 'ready' &&
      !isSavingSettings &&
      !settingsValidationMessage &&
      !areSettingsEqual(draftSettings, initialSettings),
    [draftSettings, initialSettings, isSavingSettings, settingsStatus, settingsValidationMessage]
  );

  const saveSettings = useCallback(async () => {
    await impact();

    if (!canSaveSettings) {
      if (settingsValidationMessage) {
        await notifyError();
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
      await notifySuccess();
      toast.success('Web server settings saved.');
    } catch (error) {
      await notifyError();
      toast.error(resolveErrorState(error, 'Unable to save web server settings.').message);
    } finally {
      setIsSavingSettings(false);
    }
  }, [
    canSaveSettings,
    draftSettings,
    impact,
    notifyError,
    notifySuccess,
    settingsValidationMessage,
  ]);

  const runBackup = useCallback(
    async (backupId: string) => {
      if (runningBackupId || updatingBackupId || deletingBackupId) {
        return;
      }

      await impact();
      setRunningBackupId(backupId);

      try {
        await runWebServerBackup({ backupId });
        await notifySuccess();
        toast.success('Backup run started.');
      } catch (error) {
        await notifyError();
        toast.error(resolveErrorState(error, 'Unable to run backup.').message);
      } finally {
        setRunningBackupId(null);
      }
    },
    [deletingBackupId, impact, notifyError, notifySuccess, runningBackupId, updatingBackupId]
  );

  const primaryBackupId = useMemo(() => getPrimaryBackup(backups)?.backupId ?? null, [backups]);

  const runPrimaryBackup = useCallback(async () => {
    if (!primaryBackupId) {
      await notifyError();
      toast.error('No web server backup is available yet.');
      return;
    }

    await runBackup(primaryBackupId);
  }, [notifyError, primaryBackupId, runBackup]);

  const saveBackup = useCallback(
    async (payload: WebServerBackupUpdateRequest) => {
      if (runningBackupId || updatingBackupId || deletingBackupId) {
        return false;
      }

      await impact();
      setUpdatingBackupId(payload.backupId);

      try {
        await updateWebServerBackup(payload);
        await notifySuccess();
        toast.success('Backup updated.');
        await loadBackups();
        return true;
      } catch (error) {
        await notifyError();
        toast.error(resolveErrorState(error, 'Unable to update backup.').message);
        return false;
      } finally {
        setUpdatingBackupId(null);
      }
    },
    [
      deletingBackupId,
      impact,
      loadBackups,
      notifyError,
      notifySuccess,
      runningBackupId,
      updatingBackupId,
    ]
  );

  const removeBackup = useCallback(
    async (backupId: string) => {
      if (runningBackupId || updatingBackupId || deletingBackupId) {
        return false;
      }

      await impact();
      setDeletingBackupId(backupId);

      try {
        await deleteWebServerBackup({ backupId });
        setBackups((current) => current.filter((backup) => backup.backupId !== backupId));
        await notifySuccess();
        toast.success('Backup deleted.');
        return true;
      } catch (error) {
        await notifyError();
        toast.error(resolveErrorState(error, 'Unable to delete backup.').message);
        return false;
      } finally {
        setDeletingBackupId(null);
      }
    },
    [deletingBackupId, impact, notifyError, notifySuccess, runningBackupId, updatingBackupId]
  );

  const isInitialLoading = useMemo(
    () =>
      settingsStatus === 'loading' &&
      backupsStatus === 'loading' &&
      backups.length === 0 &&
      areSettingsEqual(initialSettings, DEFAULT_WEB_SERVER_SETTINGS),
    [backups.length, backupsStatus, initialSettings, settingsStatus]
  );

  const settings = useMemo(
    () => ({
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
    }),
    [
      canSaveSettings,
      draftSettings,
      isSavingSettings,
      loadSettings,
      saveSettings,
      setCertificateType,
      setHost,
      setHttps,
      setLetsEncryptEmail,
      settingsError,
      settingsStatus,
      settingsValidationMessage,
    ]
  );

  const backupsState = useMemo(
    () => ({
      status: backupsStatus,
      error: backupsError,
      items: backups,
      primaryBackupId,
      runningBackupId,
      updatingBackupId,
      deletingBackupId,
      runPrimary: runPrimaryBackup,
      run: runBackup,
      save: saveBackup,
      remove: removeBackup,
      retry: loadBackups,
    }),
    [
      backups,
      backupsError,
      backupsStatus,
      deletingBackupId,
      loadBackups,
      primaryBackupId,
      removeBackup,
      runBackup,
      runPrimaryBackup,
      runningBackupId,
      saveBackup,
      updatingBackupId,
    ]
  );

  return useMemo(
    () => ({
      isInitialLoading,
      settings,
      backups: backupsState,
    }),
    [backupsState, isInitialLoading, settings]
  );
}
