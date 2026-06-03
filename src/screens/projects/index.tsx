import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, RefreshControl, View } from 'react-native';
import { EaseView, type AnimateProps, type Transition } from 'react-native-ease/uniwind';
import { useUniwind } from 'uniwind';

import { useUserGet } from '@/api/user';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { useProjectsScreen } from '@/hooks/use-projects-screen';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { getRefreshControlColors } from '@/lib/refresh-control';
import type { ProjectAllResponseBody } from '@/types/projects';
import { Stack } from 'expo-router';

import { ProjectsCard } from './components/projects-card';
import { ProjectsEmptyState } from './components/projects-empty';
import { ProjectsErrorState } from './components/projects-error';
import { ProjectsFilters } from './components/projects-filters';
import { ProjectsOrganizationMenu } from './components/projects-organization-menu';
import { ProjectsSkeleton } from './components/projects-skeleton';

const CARD_HEIGHT = 96;
const CARD_ENTER_ANIMATION: AnimateProps = { opacity: 1, translateY: 0 };
const CARD_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 8 };
const CARD_ENTER_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SCREEN_EDGES = Platform.select({
  android: ['left'] as const,
  default: ['left', 'top'] as const,
});

export default function ProjectsScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);
  const isSwitchingOrganization = switchingOrganizationId !== null;
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { impact, notifyError, notifySuccess } = useHaptics();
  const isReducedMotionEnabled = useReducedMotion();
  const { data: userGetResponse, error: userGetError, isLoading: isUserGetLoading } = useUserGet();
  const screenOptions = useMemo(
    () => ({
      title: 'Projects',
      headerShown: true,
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
      // console.log('[user/get] error response', userGetError);
      return;
    }

    // console.log('[user/get] response', userGetResponse);
  }, [isUserGetLoading, userGetError, userGetResponse]);

  const renderItem = useCallback(
    ({ item, index }: { item: ProjectAllResponseBody; index: number }) => {
      const transition: Transition = isReducedMotionEnabled
        ? { type: 'none' }
        : {
            type: 'timing',
            duration: 220,
            easing: CARD_ENTER_EASING,
            delay: Math.min(index, 6) * 28,
          };

      return (
        <EaseView
          initialAnimate={isReducedMotionEnabled ? CARD_ENTER_ANIMATION : CARD_INITIAL_ANIMATION}
          animate={CARD_ENTER_ANIMATION}
          transition={transition}>
          <ProjectsCard project={item} />
        </EaseView>
      );
    },
    [isReducedMotionEnabled]
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
  const listEmpty = useCallback(() => <ProjectsEmptyState compact />, []);
  const organizationMenu = (
    <ProjectsOrganizationMenu
      switchingOrganizationId={switchingOrganizationId}
      onSwitchingOrganizationIdChange={setSwitchingOrganizationId}
    />
  );

  if (isLoading || isSwitchingOrganization) {
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
        {organizationMenu}
        <ProjectsErrorState onRetry={handleRetry} />
      </>
    );
  }

  if (isEmpty) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        {organizationMenu}
        <ProjectsEmptyState />
      </>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={SCREEN_EDGES}>
      <Stack.Screen options={screenOptions} />
      {organizationMenu}
      <View className="flex-1 px-4 pt-2">
        <FlatList
          data={filteredProjects}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-3 py-4"
          showsVerticalScrollIndicator={false}
          fadingEdgeLength={2.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              {...getRefreshControlColors(resolvedTheme)}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}
