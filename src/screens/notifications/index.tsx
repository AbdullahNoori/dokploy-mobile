import { useCallback, useMemo, useState } from 'react';
import { FlatList, Platform, RefreshControl, View } from 'react-native';
import { EaseView, type AnimateProps, type Transition } from 'react-native-ease/uniwind';
import { useUniwind } from 'uniwind';

import { useNotificationAll } from '@/api/notifications';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { getRefreshControlColors } from '@/lib/refresh-control';
import type { NotificationAllResponseBody } from '@/types/notifications';
import { cn, isErrorResponse } from '@/lib/utils';
import { Stack, useRouter } from 'expo-router';
import { HttpError } from '@/lib/http-error';
import { Plus } from 'lucide-react-native';

import { NotificationsCard } from './components/notifications-card';
import { NotificationsEmptyState } from './components/notifications-empty-state';
import { NotificationsErrorState } from './components/notifications-error-state';
import { NotificationsListHeader } from './components/notifications-list-header';
import { NotificationsSkeleton } from './components/notifications-skeleton';

const SCREEN_EDGES = Platform.select({
  android: ['left', 'right'] as const,
  default: ['left', 'top', 'right'] as const,
});
const NOTIFICATIONS_ENTER_ANIMATION: AnimateProps = { opacity: 1, translateY: 0 };
const NOTIFICATIONS_HEADER_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 8 };
const NOTIFICATIONS_CARD_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 8 };
const NOTIFICATIONS_STATE_INITIAL_ANIMATION: AnimateProps = { opacity: 0 };
const NOTIFICATIONS_ENTER_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getNotificationsTransition(delay: number, isReducedMotionEnabled: boolean): Transition {
  if (isReducedMotionEnabled) {
    return { type: 'none' };
  }

  return {
    type: 'timing',
    duration: 220,
    easing: NOTIFICATIONS_ENTER_EASING,
    delay,
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { data, error, isLoading, mutate } = useNotificationAll();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { impact, notifyError, notifySuccess } = useHaptics();
  const isReducedMotionEnabled = useReducedMotion();

  const openCreateSheet = useCallback(async () => {
    await impact();
    router.push('/(app)/modals/notification-new');
  }, [impact, router]);

  const notifications = useMemo<Array<NotificationAllResponseBody>>(() => {
    if (!data || isErrorResponse(data) || !Array.isArray(data)) {
      return [];
    }
    return data;
  }, [data]);

  const dataError = isErrorResponse(data) ? (data.message ?? data.error) : null;
  const errorMessage =
    (dataError ??
      (error instanceof HttpError
        ? error.message
        : error && typeof error === 'object' && 'message' in error
          ? ((error as { message?: string }).message ?? 'Unable to load notifications.')
          : 'Unable to load notifications.')) ||
    'Unable to load notifications.';

  const handleRetry = useCallback(async () => {
    await impact();
    try {
      await mutate();
      await notifySuccess();
    } catch {
      await notifyError();
    }
  }, [impact, mutate, notifyError, notifySuccess]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      await mutate();
      await notifySuccess();
    } catch {
      await notifyError();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, mutate, notifyError, notifySuccess]);

  const listHeader = useMemo(
    () => (
      <EaseView
        initialAnimate={
          isReducedMotionEnabled
            ? NOTIFICATIONS_ENTER_ANIMATION
            : NOTIFICATIONS_HEADER_INITIAL_ANIMATION
        }
        animate={NOTIFICATIONS_ENTER_ANIMATION}
        transition={getNotificationsTransition(0, isReducedMotionEnabled)}>
        <NotificationsListHeader count={notifications.length} />
      </EaseView>
    ),
    [isReducedMotionEnabled, notifications.length]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: NotificationAllResponseBody; index: number }) => (
      <EaseView
        initialAnimate={
          isReducedMotionEnabled
            ? NOTIFICATIONS_ENTER_ANIMATION
            : NOTIFICATIONS_CARD_INITIAL_ANIMATION
        }
        animate={NOTIFICATIONS_ENTER_ANIMATION}
        transition={getNotificationsTransition(Math.min(index, 6) * 28, isReducedMotionEnabled)}>
        <NotificationsCard notification={item} />
      </EaseView>
    ),
    [isReducedMotionEnabled]
  );

  const keyExtractor = useCallback((item: NotificationAllResponseBody) => item.notificationId, []);

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={SCREEN_EDGES}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerShadowVisible: false,
          headerStyle: Platform.select({
            ios: { backgroundColor: 'transparent' },
            default: undefined,
          }),
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-10 w-10 rounded-full shadow-none')}
              onPress={() => {
                void openCreateSheet();
              }}>
              <Icon as={Plus} className="size-6" />
            </Button>
          ),
        }}
      />

      <View className="flex-1 px-4 pt-2">
        {error || dataError ? (
          <EaseView
            initialAnimate={
              isReducedMotionEnabled
                ? NOTIFICATIONS_ENTER_ANIMATION
                : NOTIFICATIONS_STATE_INITIAL_ANIMATION
            }
            animate={NOTIFICATIONS_ENTER_ANIMATION}
            transition={getNotificationsTransition(0, isReducedMotionEnabled)}
            className="flex-1">
            <NotificationsErrorState message={errorMessage} onRetry={handleRetry} />
          </EaseView>
        ) : notifications.length === 0 ? (
          <EaseView
            initialAnimate={
              isReducedMotionEnabled
                ? NOTIFICATIONS_ENTER_ANIMATION
                : NOTIFICATIONS_STATE_INITIAL_ANIMATION
            }
            animate={NOTIFICATIONS_ENTER_ANIMATION}
            transition={getNotificationsTransition(0, isReducedMotionEnabled)}
            className="flex-1">
            <View className="pt-4">
              <NotificationsListHeader count={0} />
            </View>
            <NotificationsEmptyState
              onPressAdd={() => {
                void openCreateSheet();
              }}
            />
          </EaseView>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerClassName="gap-3 py-4"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                {...getRefreshControlColors(resolvedTheme)}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
