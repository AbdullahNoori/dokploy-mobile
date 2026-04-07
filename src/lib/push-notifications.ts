import type { EventSubscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  clearStoredPushNotificationState,
  clearStoredPushTokenRecord,
  getStoredPushTokenRecord,
  setStoredPushPermissionStatus,
  setStoredPushTokenRecord,
} from '@/lib/push-notification-storage';
import { reactotron } from '@/lib/reactotron';
import type { PushPermissionStatus, PushTokenRecord } from '@/types/push-notifications';

const DEFAULT_ANDROID_CHANNEL_ID = 'default';

let notificationResponseSubscription: EventSubscription | null = null;
let lastHandledNotificationResponseKey: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function isNativeMobilePlatform(
  platform: typeof Platform.OS
): platform is PushTokenRecord['platform'] {
  return platform === 'android' || platform === 'ios';
}

function normalizePermissionStatus(status: Notifications.PermissionStatus): PushPermissionStatus {
  if (status === Notifications.PermissionStatus.GRANTED) {
    return 'granted';
  }

  if (status === Notifications.PermissionStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

function getTokenTypeForPlatform(platform: PushTokenRecord['platform']): PushTokenRecord['tokenType'] {
  return platform === 'android' ? 'fcm' : 'apns';
}

function getNotificationResponseKey(response: Notifications.NotificationResponse): string {
  return `${response.notification.request.identifier}:${response.actionIdentifier}`;
}

function logPushLifecycleEvent(name: string, value: unknown): void {
  if (!__DEV__) {
    return;
  }

  if (reactotron) {
    reactotron.display({
      name,
      preview: typeof value === 'string' ? value : undefined,
      value,
    });
    return;
  }

  console.info(`[push] ${name}`, value);
}

async function ensureAndroidNotificationChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(DEFAULT_ANDROID_CHANNEL_ID, {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3b82f6',
  });
}

function storePushTokenRecord(record: PushTokenRecord): void {
  const previousRecord = getStoredPushTokenRecord();

  if (
    previousRecord?.token === record.token &&
    previousRecord.platform === record.platform &&
    previousRecord.tokenType === record.tokenType &&
    previousRecord.permissionStatus === record.permissionStatus
  ) {
    setStoredPushTokenRecord({
      ...previousRecord,
      updatedAt: record.updatedAt,
    });
    return;
  }

  setStoredPushTokenRecord(record);
}

function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  source: 'initial' | 'listener'
): void {
  const responseKey = getNotificationResponseKey(response);

  if (lastHandledNotificationResponseKey === responseKey) {
    return;
  }

  lastHandledNotificationResponseKey = responseKey;

  logPushLifecycleEvent('Notification Response', {
    source,
    actionIdentifier: response.actionIdentifier,
    notificationId: response.notification.request.identifier,
    data: response.notification.request.content.data,
  });

  Notifications.clearLastNotificationResponse();
}

function consumeInitialNotificationResponse(): void {
  const response = Notifications.getLastNotificationResponse();

  if (!response) {
    return;
  }

  handleNotificationResponse(response, 'initial');
}

export async function initializePushNotificationsForSignedInUser(): Promise<void> {
  if (!isNativeMobilePlatform(Platform.OS)) {
    return;
  }

  try {
    await ensureAndroidNotificationChannelAsync();

    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.status;

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      const requestedPermissions = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermissions.status;
    }

    const permissionStatus = normalizePermissionStatus(finalStatus);
    setStoredPushPermissionStatus(permissionStatus);

    if (permissionStatus !== 'granted') {
      clearStoredPushTokenRecord();
      logPushLifecycleEvent('Push Permissions', permissionStatus);
      return;
    }

    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    const record: PushTokenRecord = {
      token: String(devicePushToken.data),
      platform: Platform.OS,
      tokenType: getTokenTypeForPlatform(Platform.OS),
      permissionStatus,
      updatedAt: new Date().toISOString(),
    };

    storePushTokenRecord(record);
    logPushLifecycleEvent('Push Token Stored', {
      platform: record.platform,
      tokenType: record.tokenType,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    clearStoredPushTokenRecord();
    logPushLifecycleEvent('Push Initialization Error', error);
  }
}

export function subscribeToNotificationResponses(): () => void {
  if (!isNativeMobilePlatform(Platform.OS)) {
    return () => undefined;
  }

  notificationResponseSubscription?.remove();
  notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      handleNotificationResponse(response, 'listener');
    }
  );

  consumeInitialNotificationResponse();

  return () => {
    notificationResponseSubscription?.remove();
    notificationResponseSubscription = null;
  };
}

export { clearStoredPushNotificationState };
