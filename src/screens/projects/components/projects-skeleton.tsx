import { ScrollView, View } from 'react-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectsSkeleton() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="flex-1 px-4 pt-2 gap-3"
        showsVerticalScrollIndicator={false}>
        <View className="border-border/60 flex-row items-center justify-between border-b pb-3">
          <View className="flex-row items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-28" />
          </View>
        </View>
        <Skeleton className="h-4 w-52" />
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </View>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={`project-skeleton-${index}`} className="h-24 rounded-2xl" />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
