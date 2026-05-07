import { Platform, ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';

const SCREEN_EDGES = Platform.select({
  android: ['left', 'right'] as const,
  default: ['left', 'top', 'right'] as const,
});

export function HomeSkeleton() {
  return (
    <SafeAreaView className="bg-background flex-1" edges={SCREEN_EDGES}>
      <Stack.Screen options={{ title: 'Home', headerShown: true }} />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pb-8 pt-4">
        <View className="gap-2">
          <Skeleton className="h-3 w-20 rounded" />
          <View className="bg-card border-border/80 gap-4 rounded-2xl border p-4">
            <View className="flex-row gap-4">
              <Skeleton className="h-16 flex-1 rounded-md" />
              <Skeleton className="h-16 flex-1 rounded-md" />
              <Skeleton className="h-16 flex-1 rounded-md" />
            </View>
            <Skeleton className="h-12 rounded-md" />
          </View>
        </View>

        <View className="gap-2">
          <Skeleton className="h-3 w-20 rounded" />
          <View className="bg-card border-border/80 gap-3 rounded-2xl border p-4">
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-2 rounded-full" />
            <Skeleton className="h-3 w-full rounded" />
          </View>
        </View>

        <View className="gap-2">
          <Skeleton className="h-3 w-24 rounded" />
          <View className="bg-card border-border/80 gap-3 rounded-2xl border p-4">
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-10 rounded" />
          </View>
        </View>

        <View className="gap-2">
          <Skeleton className="h-3 w-28 rounded" />
          <View className="bg-card border-border/80 gap-3 rounded-2xl border p-4">
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-10 rounded" />
            <Skeleton className="h-10 rounded" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
