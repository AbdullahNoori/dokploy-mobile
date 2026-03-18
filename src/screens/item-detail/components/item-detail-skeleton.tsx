import { View } from 'react-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';

export function ItemDetailSkeleton() {
  return (
    <SafeAreaView className="bg-background flex-1 px-4 pt-2">
      <View className="gap-3">
        <Skeleton className="h-7 w-40 rounded" />
        <Skeleton className="h-4 w-52 rounded" />
      </View>
      <View className="mt-5 gap-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </View>
    </SafeAreaView>
  );
}
