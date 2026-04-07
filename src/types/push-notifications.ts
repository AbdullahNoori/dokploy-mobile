export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type PushTokenRecord = {
  token: string;
  platform: 'android' | 'ios';
  tokenType: 'native' | 'fcm' | 'apns';
  permissionStatus: PushPermissionStatus;
  updatedAt: string;
};
