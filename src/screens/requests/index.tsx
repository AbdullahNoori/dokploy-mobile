import { useCallback, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { EaseView, type AnimateProps, type Transition } from 'react-native-ease/uniwind';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Stack, useRouter } from 'expo-router';

import { useHaptics } from '@/hooks/use-haptics';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useRequestsScreen } from '@/hooks/use-requests-screen';
import { buildRequestsFilterRouteParams } from '@/lib/requests-filter-route';

import { RequestsActiveFilters } from './components/requests-active-filters';
import { RequestsEmptyState } from './components/requests-empty';
import { RequestsErrorState } from './components/requests-error';
import { RequestsHeader } from './components/requests-header';
import { RequestsList } from './components/requests-list';
import { RequestsSearchBar } from './components/requests-search-bar';
import { RequestsSkeleton } from './components/requests-skeleton';

const REQUESTS_ENTER_ANIMATION: AnimateProps = { opacity: 1, translateY: 0 };
const REQUESTS_HEADER_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 8 };
const REQUESTS_FILTERS_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 4 };
const REQUESTS_EMPTY_INITIAL_ANIMATION: AnimateProps = { opacity: 0 };
const REQUESTS_ENTER_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getRequestsTransition(delay: number, isReducedMotionEnabled: boolean): Transition {
  if (isReducedMotionEnabled) {
    return { type: 'none' };
  }

  return {
    type: 'timing',
    duration: 220,
    easing: REQUESTS_ENTER_EASING,
    delay,
  };
}

export default function RequestsScreen() {
  const router = useRouter();
  const { search, filters, list } = useRequestsScreen();
  const { impact, notifyError, notifySuccess } = useHaptics();
  const isReducedMotionEnabled = useReducedMotion();

  const openFilters = useCallback(async () => {
    await impact();
    router.push({
      pathname: '/(app)/modals/requests-filters',
      params: buildRequestsFilterRouteParams(filters.value),
    });
  }, [filters.value, impact, router]);

  const handleRefresh = useCallback(async () => {
    const didRefresh = await list.refresh();
    if (didRefresh) {
      await notifySuccess();
    } else {
      await notifyError();
    }
  }, [list, notifyError, notifySuccess]);

  const handleRetry = useCallback(async () => {
    await impact();
    const didRetry = await list.retry();
    if (didRetry) {
      await notifySuccess();
    } else {
      await notifyError();
    }
  }, [impact, list, notifyError, notifySuccess]);

  const listHeader = useMemo(
    () => (
      <EaseView
        initialAnimate={
          isReducedMotionEnabled ? REQUESTS_ENTER_ANIMATION : REQUESTS_HEADER_INITIAL_ANIMATION
        }
        animate={REQUESTS_ENTER_ANIMATION}
        transition={getRequestsTransition(0, isReducedMotionEnabled)}>
        <View className="gap-4">
          <RequestsHeader totalCount={list.totalCount} />
          <RequestsSearchBar
            query={search.query}
            onChangeQuery={search.setQuery}
            onPressFilters={openFilters}
            activeFilterCount={filters.count}
          />
          {filters.hasAny ? (
            <EaseView
              initialAnimate={
                isReducedMotionEnabled
                  ? REQUESTS_ENTER_ANIMATION
                  : REQUESTS_FILTERS_INITIAL_ANIMATION
              }
              animate={REQUESTS_ENTER_ANIMATION}
              transition={getRequestsTransition(60, isReducedMotionEnabled)}>
              <RequestsActiveFilters
                datePreset={filters.value.datePreset}
                statuses={filters.value.statuses}
                onRemoveDatePreset={filters.clearDatePreset}
                onRemoveStatus={filters.removeStatus}
              />
            </EaseView>
          ) : null}
        </View>
      </EaseView>
    ),
    [
      filters.clearDatePreset,
      filters.count,
      filters.hasAny,
      filters.removeStatus,
      filters.value.datePreset,
      filters.value.statuses,
      isReducedMotionEnabled,
      list.totalCount,
      openFilters,
      search.query,
      search.setQuery,
    ]
  );

  const listEmpty = useMemo(() => {
    const emptyContent =
      list.status === 'error' ? (
        <RequestsErrorState
          message={list.error ?? 'Unable to load requests.'}
          onRetry={() => {
            void handleRetry();
          }}
        />
      ) : (
        <RequestsEmptyState hasFilters={filters.hasAny} query={search.query} />
      );

    return (
      <EaseView
        initialAnimate={
          isReducedMotionEnabled ? REQUESTS_ENTER_ANIMATION : REQUESTS_EMPTY_INITIAL_ANIMATION
        }
        animate={REQUESTS_ENTER_ANIMATION}
        transition={getRequestsTransition(0, isReducedMotionEnabled)}>
        {emptyContent}
      </EaseView>
    );
  }, [filters.hasAny, handleRetry, isReducedMotionEnabled, list.error, list.status, search.query]);

  if (list.status === 'initial-loading') {
    return <RequestsSkeleton />;
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Requests',
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerStyle: Platform.select({
            ios: { backgroundColor: 'transparent' },
            default: undefined,
          }),
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <RequestsList
        data={list.items}
        header={listHeader}
        isRefreshing={list.isRefreshing}
        isLoadingMore={list.isLoadingMore}
        isReducedMotionEnabled={isReducedMotionEnabled}
        onRefresh={() => {
          void handleRefresh();
        }}
        onEndReached={() => {
          void list.loadMore();
        }}
        emptyState={listEmpty}
      />
    </SafeAreaView>
  );
}
