import { useEffect } from 'react';

import {
  clearStoredPushNotificationState,
  initializePushNotificationsForSignedInUser,
  subscribeToNotificationResponses,
  subscribeToPushTokenRefresh,
} from '@/lib/push-notifications';
import { useAuthStore } from '@/store/auth-store';

export function usePushNotificationsBootstrap() {
  const hasRootAccess = useAuthStore((state) => state.hasRootAccess);

  useEffect(() => {
    if (!hasRootAccess) {
      clearStoredPushNotificationState();
      return;
    }

    const unsubscribeNotificationResponses = subscribeToNotificationResponses();
    const unsubscribeTokenRefresh = subscribeToPushTokenRefresh();

    void initializePushNotificationsForSignedInUser();

    return () => {
      unsubscribeNotificationResponses();
      unsubscribeTokenRefresh();
      clearStoredPushNotificationState();
    };
  }, [hasRootAccess]);
}
