import type { EventSubscription } from 'expo-modules-core';
import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid, Platform } from 'react-native';

import { notificationAll, notificationRemove } from '@/api/notifications';
import {
  clearStoredPushNotificationState,
  clearStoredPushTokenRecord,
  getStoredPushTokenRecord,
  setStoredPushPermissionStatus,
  setStoredPushTokenRecord,
} from '@/lib/push-notification-storage';
import { reactotron } from '@/lib/reactotron';
import { isErrorResponse } from '@/lib/utils';
import type { NotificationAllResponseBody } from '@/types/notifications';
import type { PushPermissionStatus, PushTokenRecord } from '@/types/push-notifications';

const DEFAULT_ANDROID_CHANNEL_ID = 'default';

let notificationResponseSubscription: EventSubscription | null = null;
let tokenRefreshUnsubscribe: (() => void) | null = null;
let lastHandledNotificationResponseKey: string | null = null;
const firebaseMessaging = getMessaging();

export type PushTokenRetirementReason =
  | 'logout'
  | 'unauthorized'
  | 'owner-access-lost'
  | 'session-change';

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

function normalizeMessagingPermissionStatus(status: number): PushPermissionStatus {
  if (status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL) {
    return 'granted';
  }

  if (status === AuthorizationStatus.DENIED) {
    return 'denied';
  }

  return 'undetermined';
}

async function requestPushPermissionAsync(): Promise<PushPermissionStatus> {
  if (Platform.OS === 'ios') {
    const status = await requestPermission(firebaseMessaging);
    return normalizeMessagingPermissionStatus(status);
  }

  if (Platform.OS === 'android') {
    const platformVersion = typeof Platform.Version === 'number' ? Platform.Version : 0;

    if (platformVersion < 33) {
      return 'granted';
    }

    const existingPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (existingPermission) {
      return 'granted';
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    }

    return result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ? 'denied' : 'undetermined';
  }

  return 'undetermined';
}

async function getFcmTokenAsync(): Promise<string> {
  return getToken(firebaseMessaging);
}

function createPushTokenRecord(
  token: string,
  platform: PushTokenRecord['platform'],
  permissionStatus: PushPermissionStatus
): PushTokenRecord {
  return {
    token,
    platform,
    tokenType: 'fcm',
    permissionStatus,
    updatedAt: new Date().toISOString(),
  };
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

function unsubscribeFromPushTokenRefresh(): void {
  tokenRefreshUnsubscribe?.();
  tokenRefreshUnsubscribe = null;
}

function isMobileCustomNotification(
  notification: NotificationAllResponseBody,
  endpoint: string,
  token: string
): boolean {
  return (
    notification.notificationType === 'custom' &&
    notification.custom?.endpoint === endpoint &&
    notification.custom.headers?.FCM_TOKEN === token
  );
}

async function removeMobileCustomNotificationProvidersAsync(
  tokenRecord: PushTokenRecord | null,
  reason: PushTokenRetirementReason
): Promise<void> {
  const token = tokenRecord?.token.trim();

  if (!token) {
    return;
  }

  const endpoint = process.env.EXPO_PUBLIC_NOTIFICATION_URL?.trim();

  if (!endpoint) {
    logPushLifecycleEvent('Push Provider Cleanup Skipped', {
      reason,
      cause: 'missing-endpoint',
    });
    return;
  }

  try {
    const notifications = await notificationAll();

    if (isErrorResponse(notifications) || !Array.isArray(notifications)) {
      logPushLifecycleEvent('Push Provider Cleanup Skipped', {
        reason,
        response: notifications,
      });
      return;
    }

    const mobileNotifications = notifications.filter((notification) =>
      isMobileCustomNotification(notification, endpoint, token)
    );

    await Promise.allSettled(
      mobileNotifications.map((notification) =>
        notificationRemove({ notificationId: notification.notificationId })
      )
    );

    logPushLifecycleEvent('Push Providers Removed', {
      reason,
      count: mobileNotifications.length,
    });
  } catch (error) {
    logPushLifecycleEvent('Push Provider Cleanup Error', {
      reason,
      error,
    });
  }
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
    const permissionStatus = await requestPushPermissionAsync();
    setStoredPushPermissionStatus(permissionStatus);

    if (permissionStatus !== 'granted') {
      clearStoredPushTokenRecord();
      logPushLifecycleEvent('Push Permissions', permissionStatus);
      return;
    }

    const token = await getFcmTokenAsync();
    const record = createPushTokenRecord(token, Platform.OS, permissionStatus);

    storePushTokenRecord(record);
    logPushLifecycleEvent('Push Token Stored', {
      token: record.token,
      platform: record.platform,
      tokenType: record.tokenType,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    clearStoredPushTokenRecord();
    logPushLifecycleEvent('Push Initialization Error', error);
  }
}

export function subscribeToPushTokenRefresh(): () => void {
  if (!isNativeMobilePlatform(Platform.OS)) {
    return () => undefined;
  }

  const nativePlatform = Platform.OS;

  unsubscribeFromPushTokenRefresh();
  tokenRefreshUnsubscribe = onTokenRefresh(firebaseMessaging, (token) => {
    const record = createPushTokenRecord(token, nativePlatform, 'granted');
    storePushTokenRecord(record);
    setStoredPushPermissionStatus('granted');
    logPushLifecycleEvent('Push Token Refreshed', {
      platform: record.platform,
      tokenType: record.tokenType,
      updatedAt: record.updatedAt,
    });
  });

  return () => {
    unsubscribeFromPushTokenRefresh();
  };
}

export async function retirePushNotificationTokenAsync(
  reason: PushTokenRetirementReason
): Promise<void> {
  unsubscribeFromPushTokenRefresh();
  const tokenRecord = getStoredPushTokenRecord();

  try {
    await removeMobileCustomNotificationProvidersAsync(tokenRecord, reason);

    if (!isNativeMobilePlatform(Platform.OS)) {
      logPushLifecycleEvent('Push Token Retirement Skipped', {
        reason,
        platform: Platform.OS,
      });
      return;
    }

    await deleteToken(firebaseMessaging);
    logPushLifecycleEvent('Push Token Retired', {
      reason,
      platform: Platform.OS,
      tokenType: 'fcm',
    });
  } catch (error) {
    logPushLifecycleEvent('Push Token Retirement Error', {
      reason,
      error,
    });
  } finally {
    clearStoredPushNotificationState();
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
