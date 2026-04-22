import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSWRConfig } from 'swr';
import { toast } from 'sonner-native';

import { notificationCreateCustom } from '@/api/notifications';
import { useHaptics } from '@/hooks/use-haptics';
import { getStoredPushTokenRecord } from '@/lib/push-notification-storage';
import { HttpError } from '@/lib/http-error';
import { isErrorResponse } from '@/lib/utils';

import { useNotificationsScreen } from './use-notifications-screen';

const CUSTOM_NOTIFICATION_ENDPOINT = 'https://push-notif-ashen.vercel.app/send';

function resolveErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    return error.message ?? fallback;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return fallback;
}

export function useNotificationCreateScreen() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { name, setName, sections, toggles, toggleItem } = useNotificationsScreen();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const { impact, notifyError, notifySuccess } = useHaptics();

  const pushTokenRecord = getStoredPushTokenRecord();
  const pushToken = pushTokenRecord?.token?.trim() ?? '';
  const hasPushToken = Boolean(pushToken);
  const canSubmit = !isSubmitting;

  const handleNameChange = useCallback(
    (nextName: string) => {
      setName(nextName);

      if (nameError && nextName.trim()) {
        setNameError(null);
      }

      if (errorMessage) {
        setErrorMessage(null);
      }
    },
    [errorMessage, nameError, setName]
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    await impact();

    const trimmedName = name.trim();

    if (!trimmedName) {
      const message = 'Enter a notification name.';
      setNameError(message);
      setErrorMessage(message);
      await notifyError();
      toast.error(message);
      return;
    }

    setNameError(null);

    if (!pushToken) {
      const message = 'Push notifications are not ready yet. Enable notifications and try again.';
      setErrorMessage(message);
      await notifyError();
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await notificationCreateCustom({
        appBuildError: toggles['build-error'],
        appDeploy: toggles['app-deploy'],
        databaseBackup: toggles['db-backup'],
        dockerCleanup: toggles['docker-cleanup'],
        dokployRestart: toggles['dokploy-restart'],
        endpoint: CUSTOM_NOTIFICATION_ENDPOINT,
        headers: {
          FCM_TOKEN: pushToken,
        },
        name: trimmedName,
        notificationId: '',
        customId: '',
        serverThreshold: false,
        volumeBackup: toggles['volume-backup'],
      });

      if (isErrorResponse(result)) {
        const message = result.message ?? result.error ?? 'Unable to create notification.';
        setErrorMessage(message);
        await notifyError();
        toast.error(message);
        return;
      }

      await notifySuccess();
      toast.success('Notification created.');
      await mutate('notification/all');
      router.back();
    } catch (error) {
      const message = resolveErrorMessage(error, 'Unable to create notification.');
      setErrorMessage(message);
      await notifyError();
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [impact, isSubmitting, mutate, name, notifyError, notifySuccess, pushToken, router, toggles]);

  return {
    canSubmit,
    errorMessage,
    handleNameChange,
    handleSubmit,
    hasPushToken,
    isSubmitting,
    name,
    nameError,
    sections,
    toggleItem,
    toggles,
  };
}
