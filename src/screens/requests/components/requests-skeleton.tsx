import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';

export function RequestsSkeleton() {
  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Requests', headerShown: true, headerTransparent: true }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-4 py-4"
        showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <Skeleton className="h-7 w-28 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </View>
        <View className="flex-row gap-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </View>
        <View className="flex-row gap-2">
          <Skeleton className="h-8 w-14 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </View>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`request-skeleton-${index}`} className="h-28 rounded-2xl" />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
