import { useEffect } from 'react';

import {
  clearStoredPushNotificationState,
  initializePushNotificationsForSignedInUser,
  subscribeToNotificationResponses,
} from '@/lib/push-notifications';

export function usePushNotificationsBootstrap() {
  useEffect(() => {
    const unsubscribe = subscribeToNotificationResponses();

    void initializePushNotificationsForSignedInUser();

    return () => {
      unsubscribe();
      clearStoredPushNotificationState();
    };
  }, []);
}
