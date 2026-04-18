import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

async function runSafely(task: () => Promise<void>) {
  try {
    await task();
  } catch {
    // Ignore haptics failures so UI actions still complete normally.
  }
}

export function useHaptics() {
  const impact = useCallback(async (style = Haptics.ImpactFeedbackStyle.Light) => {
    await runSafely(() => Haptics.impactAsync(style));
  }, []);

  const notification = useCallback(
    async (type = Haptics.NotificationFeedbackType.Success) => {
      await runSafely(() => Haptics.notificationAsync(type));
    },
    []
  );

  const selection = useCallback(async () => {
    await runSafely(() => Haptics.selectionAsync());
  }, []);

  const notifySuccess = useCallback(async () => {
    await notification();
  }, [notification]);

  const notifyError = useCallback(async () => {
    await notification(Haptics.NotificationFeedbackType.Error);
  }, [notification]);

  const notifyWarning = useCallback(async () => {
    await notification(Haptics.NotificationFeedbackType.Warning);
  }, [notification]);

  return {
    impact,
    notification,
    selection,
    notifySuccess,
    notifyError,
    notifyWarning,
  };
}
