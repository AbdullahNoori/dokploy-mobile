import { createMMKV } from 'react-native-mmkv';

import type { PushPermissionStatus, PushTokenRecord } from '@/types/push-notifications';

const storage = createMMKV({
  id: 'dokploy',
});

const PUSH_TOKEN_RECORD_KEY = 'dokploy_push_token_record';
const PUSH_PERMISSION_STATUS_KEY = 'dokploy_push_permission_status';

function parsePushTokenRecord(value: string | undefined): PushTokenRecord | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PushTokenRecord;
  } catch {
    return null;
  }
}

export function getStoredPushTokenRecord(): PushTokenRecord | null {
  return parsePushTokenRecord(storage.getString(PUSH_TOKEN_RECORD_KEY));
}

export function setStoredPushTokenRecord(record: PushTokenRecord): void {
  storage.set(PUSH_TOKEN_RECORD_KEY, JSON.stringify(record));
}

export function clearStoredPushTokenRecord(): void {
  storage.remove(PUSH_TOKEN_RECORD_KEY);
}

export function getStoredPushPermissionStatus(): PushPermissionStatus {
  const value = storage.getString(PUSH_PERMISSION_STATUS_KEY);

  if (value === 'granted' || value === 'denied' || value === 'undetermined') {
    return value;
  }

  return 'undetermined';
}

export function setStoredPushPermissionStatus(status: PushPermissionStatus): void {
  storage.set(PUSH_PERMISSION_STATUS_KEY, status);
}

export function clearStoredPushNotificationState(): void {
  clearStoredPushTokenRecord();
  storage.remove(PUSH_PERMISSION_STATUS_KEY);
}
