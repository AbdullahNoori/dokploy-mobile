import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import {
  clearStoredPushNotificationState,
  initializePushNotificationsForSignedInUser,
  subscribeToNotificationResponses,
  subscribeToPushTokenRefresh,
} from '@/lib/push-notifications';
import {
  getStoredPushOnboardingSeen,
  setStoredPushOnboardingSeen,
} from '@/lib/push-notification-storage';
import { useAuthStore } from '@/store/auth-store';

export function usePushNotificationsBootstrap() {
  const router = useRouter();
  const hasRootAccess = useAuthStore((state) => state.hasRootAccess);

  useEffect(() => {
    if (!hasRootAccess) {
      clearStoredPushNotificationState();
      return;
    }

    const unsubscribeNotificationResponses = subscribeToNotificationResponses();
    const unsubscribeTokenRefresh = subscribeToPushTokenRefresh();

    void initializePushNotificationsForSignedInUser().finally(() => {
      const { consumePushOnboarding, shouldShowPushOnboarding } = useAuthStore.getState();

      if (!shouldShowPushOnboarding) {
        return;
      }

      consumePushOnboarding();

      if (getStoredPushOnboardingSeen()) {
        return;
      }

      setStoredPushOnboardingSeen();
      requestAnimationFrame(() => {
        router.push('/(app)/modals/push-notifications-help');
      });
    });

    return () => {
      unsubscribeNotificationResponses();
      unsubscribeTokenRefresh();
      clearStoredPushNotificationState();
    };
  }, [hasRootAccess, router]);
}
