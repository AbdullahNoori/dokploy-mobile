import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';

export function ItemDetailSkeleton() {
  return (
    <SafeAreaView className="bg-background flex-1 px-4" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Loading...' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        <View className="pt-2 gap-3">
          <Skeleton className="h-7 w-40 rounded" />
          <Skeleton className="h-4 w-52 rounded" />
        </View>
        <View className="mt-5 gap-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
