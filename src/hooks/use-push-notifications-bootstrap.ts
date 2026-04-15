import { useEffect } from 'react';

import {
  clearStoredPushNotificationState,
  initializePushNotificationsForSignedInUser,
  subscribeToNotificationResponses,
  subscribeToPushTokenRefresh,
} from '@/lib/push-notifications';

export function usePushNotificationsBootstrap() {
  useEffect(() => {
    const unsubscribeNotificationResponses = subscribeToNotificationResponses();
    const unsubscribeTokenRefresh = subscribeToPushTokenRefresh();

    void initializePushNotificationsForSignedInUser();

    return () => {
      unsubscribeNotificationResponses();
      unsubscribeTokenRefresh();
      clearStoredPushNotificationState();
    };
  }, []);
}
