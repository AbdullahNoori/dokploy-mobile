import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useUniwind } from 'uniwind';

import { useUserGet } from '@/api/user';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { useProjectsScreen } from '@/hooks/use-projects-screen';
import type { ProjectAllResponseBody } from '@/types/projects';
import { THEME } from '@/lib/theme';
import { Stack } from 'expo-router';

import { ProjectsCard } from './components/projects-card';
import { ProjectsEmptyState } from './components/projects-empty';
import { ProjectsErrorState } from './components/projects-error';
import { ProjectsFilters } from './components/projects-filters';
import { ProjectsOrganizationMenu } from './components/projects-organization-menu';
import { ProjectsSkeleton } from './components/projects-skeleton';

const CARD_HEIGHT = 96;

export default function ProjectsScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { impact, notifyError, notifySuccess } = useHaptics();
  const {
    data: userGetResponse,
    error: userGetError,
    isLoading: isUserGetLoading,
  } = useUserGet();
  const screenOptions = useMemo(
    () => ({
      title: 'Projects',
      headerShown: true,
      headerLeft: () => <ProjectsOrganizationMenu />,
    }),
    []
  );
  const {
    query,
    setQuery,
    sortOrder,
    toggleSort,
    filteredProjects,
    isLoading,
    isError,
    isEmpty,
    retry,
  } = useProjectsScreen();

  useEffect(() => {
    if (isUserGetLoading) {
      return;
    }

    if (userGetError) {
      console.log('[user/get] error response', userGetError);
      return;
    }

    console.log('[user/get] response', userGetResponse);
  }, [isUserGetLoading, userGetError, userGetResponse]);

  const renderItem = useCallback(
    ({ item }: { item: ProjectAllResponseBody }) => <ProjectsCard project={item} />,
    []
  );

  const keyExtractor = useCallback((item: ProjectAllResponseBody) => item.projectId, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<ProjectAllResponseBody> | null | undefined, index: number) => ({
      length: CARD_HEIGHT + 12,
      offset: (CARD_HEIGHT + 12) * index,
      index,
    }),
    []
  );

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await retry();
      await notifySuccess();
    } catch {
      await notifyError();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, notifyError, notifySuccess, retry]);

  const handleRetry = useCallback(async () => {
    await impact();
    try {
      await retry();
      await notifySuccess();
    } catch {
      await notifyError();
    }
  }, [impact, notifyError, notifySuccess, retry]);

  const listHeader = useMemo(
    () => (
      <View>
        <ProjectsFilters
          query={query}
          onChangeQuery={setQuery}
          sortOrder={sortOrder}
          onToggleSort={toggleSort}
        />
      </View>
    ),
    [query, setQuery, sortOrder, toggleSort]
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <ProjectsSkeleton />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <ProjectsErrorState onRetry={handleRetry} />
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <ProjectsEmptyState />
      </>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'top']}>
      <Stack.Screen options={screenOptions} />
      <View className="flex-1 px-4 pt-2">
        <FlatList
          data={filteredProjects}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListHeaderComponent={listHeader}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-3 py-4"
          showsVerticalScrollIndicator={false}
          fadingEdgeLength={2.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={THEME[resolvedTheme].primary}
              colors={[THEME[resolvedTheme].primary]}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}
