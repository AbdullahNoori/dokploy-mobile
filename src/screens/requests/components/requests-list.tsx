import { memo, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { getRequestLogKey } from '@/lib/utils';
import type { SettingsRequestLogEntry } from '@/types/settings';
import { RequestLogCard } from './request-log-card';

type Props = {
  data: SettingsRequestLogEntry[];
  header: React.ReactElement;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  emptyState: React.ReactElement;
};

const Separator = memo(function Separator() {
  return <View className="h-3" />;
});

const Footer = memo(function Footer({ visible }: { visible: boolean }) {
  if (!visible) {
    return <View className="h-8" />;
  }

  return (
    <View className="items-center py-4">
      <ActivityIndicator size="small" />
    </View>
  );
});

export function RequestsList({
  data,
  header,
  isRefreshing,
  isLoadingMore,
  onRefresh,
  onEndReached,
  emptyState,
}: Props) {
  const renderItem = useCallback(
    ({ item }: { item: SettingsRequestLogEntry }) => <RequestLogCard request={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: SettingsRequestLogEntry, index: number) => getRequestLogKey(item, index),
    []
  );

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={{ paddingBottom: 16 }}
      ItemSeparatorComponent={Separator}
      ListEmptyComponent={emptyState}
      ListFooterComponent={<Footer visible={isLoadingMore} />}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
    />
  );
}
