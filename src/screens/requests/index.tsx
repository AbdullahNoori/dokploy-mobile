import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Stack } from 'expo-router';

import { useRequestsScreen } from '@/hooks/use-requests-screen';

import { RequestsActiveFilters } from './components/requests-active-filters';
import { RequestsEmptyState } from './components/requests-empty-state';
import { RequestsErrorState } from './components/requests-error-state';
import { RequestsFilterSheet } from './components/requests-filter-sheet';
import { RequestsHeader } from './components/requests-header';
import { RequestsList } from './components/requests-list';
import { RequestsSearchBar } from './components/requests-search-bar';
import { RequestsSkeleton } from './components/requests-skeleton';

export default function RequestsScreen() {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { search, filters, list } = useRequestsScreen();

  const listHeader = useMemo(
    () => (
      <View className="gap-4">
        <RequestsHeader totalCount={list.totalCount} />
        <RequestsSearchBar
          query={search.query}
          onChangeQuery={search.setQuery}
          onPressFilters={() => setIsFilterSheetOpen(true)}
          activeFilterCount={filters.count}
        />
        {filters.hasAny ? (
          <RequestsActiveFilters
            datePreset={filters.value.datePreset}
            statuses={filters.value.statuses}
            onRemoveDatePreset={filters.clearDatePreset}
            onRemoveStatus={filters.removeStatus}
          />
        ) : null}
      </View>
    ),
    [
      filters.clearDatePreset,
      filters.count,
      filters.hasAny,
      filters.removeStatus,
      filters.value.datePreset,
      filters.value.statuses,
      list.totalCount,
      search.query,
      search.setQuery,
    ]
  );

  if (list.status === 'initial-loading') {
    return <RequestsSkeleton />;
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Requests', headerShown: true, headerTransparent: true }} />
      <RequestsList
        data={list.items}
        header={listHeader}
        isRefreshing={list.isRefreshing}
        isLoadingMore={list.isLoadingMore}
        onRefresh={() => {
          void list.refresh();
        }}
        onEndReached={() => {
          void list.loadMore();
        }}
        emptyState={
          list.status === 'error' ? (
            <RequestsErrorState
              message={list.error ?? 'Unable to load requests.'}
              onRetry={() => {
                void list.retry();
              }}
            />
          ) : (
            <RequestsEmptyState hasFilters={filters.hasAny} query={search.query} />
          )
        }
      />

      <RequestsFilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        datePreset={filters.value.datePreset}
        statuses={filters.value.statuses}
        onApply={filters.apply}
      />
    </SafeAreaView>
  );
}
