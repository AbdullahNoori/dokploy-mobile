import type { EventSubscription } from 'expo-modules-core';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid, Platform } from 'react-native';

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
let tokenRefreshUnsubscribe: (() => void) | null = null;
let lastHandledNotificationResponseKey: string | null = null;
const firebaseMessaging = getMessaging();

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

  tokenRefreshUnsubscribe?.();
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
    tokenRefreshUnsubscribe?.();
    tokenRefreshUnsubscribe = null;
  };
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
