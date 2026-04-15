import { useCallback, useMemo } from 'react';
import { View } from 'react-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Stack, useRouter } from 'expo-router';

import { useRequestsScreen } from '@/hooks/use-requests-screen';
import { buildRequestsFilterRouteParams } from '@/lib/requests-filter-route';

import { RequestsActiveFilters } from './components/requests-active-filters';
import { RequestsEmptyState } from './components/requests-empty';
import { RequestsErrorState } from './components/requests-error';
import { RequestsHeader } from './components/requests-header';
import { RequestsList } from './components/requests-list';
import { RequestsSearchBar } from './components/requests-search-bar';
import { RequestsSkeleton } from './components/requests-skeleton';

export default function RequestsScreen() {
  const router = useRouter();
  const { search, filters, list } = useRequestsScreen();

  const openFilters = useCallback(() => {
    router.push({
      pathname: '/(app)/requests-filters',
      params: buildRequestsFilterRouteParams(filters.value),
    });
  }, [filters.value, router]);

  const listHeader = useMemo(
    () => (
      <View className="gap-4">
        <RequestsHeader totalCount={list.totalCount} />
        <RequestsSearchBar
          query={search.query}
          onChangeQuery={search.setQuery}
          onPressFilters={openFilters}
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
      openFilters,
      search.query,
      search.setQuery,
    ]
  );

  if (list.status === 'initial-loading') {
    return <RequestsSkeleton />;
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Requests',
          headerShown: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
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
    </SafeAreaView>
  );
}
