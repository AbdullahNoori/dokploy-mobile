import { Platform, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack } from 'expo-router';

const SCREEN_EDGES = Platform.select({
  android: ['left', 'right'] as const,
  default: ['left', 'top', 'right'] as const,
});

export function NotificationsSkeleton() {
  const skeletonItems = ['alpha', 'beta', 'gamma', 'delta'];
  const headerHeight = useHeaderHeight();

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
        }}
      />
      <View
        className="flex-1 px-4"
        style={{ paddingTop: Platform.OS === 'android' ? 8 : headerHeight + 8 }}>
        <View className="gap-4 py-4">
          <View className="gap-2">
            <Skeleton className="h-4 w-64 rounded" />
            <Skeleton className="h-4 w-52 rounded" />
          </View>

          <Skeleton className="h-7 w-32 rounded-full" />

          <View className="gap-3">
            {skeletonItems.map((itemKey) => (
              <View
                key={`notification-skeleton-${itemKey}`}
                className="bg-card border-border/80 flex-row items-center gap-3 rounded-2xl border px-4 py-4">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <View className="flex-1 gap-2">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </View>
                <Skeleton className="h-4 w-4 rounded-full" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
