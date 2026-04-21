import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useUniwind } from 'uniwind';

import { useNotificationAll } from '@/api/notifications';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import type { NotificationAllResponseBody } from '@/types/notifications';
import { THEME } from '@/lib/theme';
import { cn, isErrorResponse } from '@/lib/utils';
import { Stack, useRouter } from 'expo-router';
import { HttpError } from '@/lib/http-error';
import { BriefcaseMedicalIcon, Plus, PlusIcon } from 'lucide-react-native';

import { NotificationsCard } from './components/notifications-card';
import { NotificationsEmptyState } from './components/notifications-empty-state';
import { NotificationsErrorState } from './components/notifications-error-state';
import { NotificationsListHeader } from './components/notifications-list-header';
import { NotificationsSkeleton } from './components/notifications-skeleton';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { data, error, isLoading, mutate } = useNotificationAll();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const openCreateSheet = useCallback(() => {
    router.push('/(app)/modals/notification-new');
  }, [router]);

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

  const handleRetry = useCallback(() => {
    void mutate();
  }, [mutate]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      await mutate();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, mutate]);

  const listHeader = useMemo(
    () => <NotificationsListHeader count={notifications.length} />,
    [notifications.length]
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationAllResponseBody }) => <NotificationsCard notification={item} />,
    []
  );

  const keyExtractor = useCallback((item: NotificationAllResponseBody) => item.notificationId, []);

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'top', 'right']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () => (
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-10 w-10 rounded-full shadow-none')}
              onPress={openCreateSheet}>
              <Icon as={Plus} className="size-6" />
            </Button>
          ),
        }}
      />

      <View className="flex-1 px-4 pt-2">
        {error || dataError ? (
          <NotificationsErrorState message={errorMessage} onRetry={handleRetry} />
        ) : notifications.length === 0 ? (
          <View className="flex-1">
            <View className="pt-4">
              <NotificationsListHeader count={0} />
            </View>
            <NotificationsEmptyState onPressAdd={openCreateSheet} />
          </View>
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
                tintColor={THEME[resolvedTheme].primary}
                colors={[THEME[resolvedTheme].primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
