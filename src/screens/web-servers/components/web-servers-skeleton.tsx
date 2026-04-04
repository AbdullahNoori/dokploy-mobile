import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';

export function WebServersSkeleton() {
  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Web Servers',
          headerShown: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-4 py-4"
        showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </View>

        <View className="bg-card border-border/80 gap-4 rounded-3xl border p-4">
          <View className="gap-2">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-60 rounded" />
          </View>
          <View className="gap-3">
            <Skeleton className="h-14 rounded-2xl" />
            <Skeleton className="h-14 rounded-2xl" />
          </View>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <View className="items-end">
            <Skeleton className="h-12 w-24 rounded-2xl" />
          </View>
        </View>

        <View className="bg-card border-border/80 gap-4 rounded-3xl border p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="gap-2">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </View>
            <Skeleton className="h-10 w-32 rounded-2xl" />
          </View>
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`web-server-backup-skeleton-${index}`}
              className="border-border/60 gap-3 rounded-2xl border p-4">
              <Skeleton className="h-4 w-20 rounded" />
              <View className="flex-row flex-wrap gap-3">
                <Skeleton className="h-12 w-[48%] rounded-xl" />
                <Skeleton className="h-12 w-[48%] rounded-xl" />
                <Skeleton className="h-12 w-[48%] rounded-xl" />
                <Skeleton className="h-12 w-[48%] rounded-xl" />
              </View>
              <View className="flex-row gap-2">
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
