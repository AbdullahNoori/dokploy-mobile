import { memo, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { EaseView, type AnimateProps, type Transition } from 'react-native-ease/uniwind';

import { getRequestLogKey } from '@/lib/utils';
import type { SettingsRequestLogEntry } from '@/types/settings';
import { RequestLogCard } from './request-log-card';

type Props = {
  data: SettingsRequestLogEntry[];
  header: React.ReactElement;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isReducedMotionEnabled: boolean;
  onRefresh: () => void;
  onEndReached: () => void;
  emptyState: React.ReactElement;
};

const REQUEST_ROW_ANIMATION: AnimateProps = { opacity: 1, translateY: 0 };
const REQUEST_ROW_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 6 };
const REQUEST_ROW_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getRequestRowTransition(index: number, isReducedMotionEnabled: boolean): Transition {
  if (isReducedMotionEnabled) {
    return { type: 'none' };
  }

  return {
    type: 'timing',
    duration: 220,
    easing: REQUEST_ROW_EASING,
    delay: Math.min(index, 8) * 24,
  };
}

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
  isReducedMotionEnabled,
  onRefresh,
  onEndReached,
  emptyState,
}: Props) {
  const renderItem = useCallback(
    ({ item, index }: { item: SettingsRequestLogEntry; index: number }) => (
      <EaseView
        initialAnimate={
          isReducedMotionEnabled ? REQUEST_ROW_ANIMATION : REQUEST_ROW_INITIAL_ANIMATION
        }
        animate={REQUEST_ROW_ANIMATION}
        transition={getRequestRowTransition(index, isReducedMotionEnabled)}>
        <RequestLogCard request={item} />
      </EaseView>
    ),
    [isReducedMotionEnabled]
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
