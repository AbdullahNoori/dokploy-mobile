import { ScrollView } from 'react-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetailSkeleton() {
  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 pt-2 gap-3"
        showsVerticalScrollIndicator={false}>
        <Skeleton className="h-6 w-40 rounded" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={`application-skeleton-${index}`} className="h-20 rounded-2xl" />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
