import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, View } from 'react-native';
import { EaseView, type AnimateProps, type Transition } from 'react-native-ease/uniwind';
import { Stack, useRouter } from 'expo-router';
import { useUniwind } from 'uniwind';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import {
  type HomeDeploymentPreview,
  type HomePriorityItem,
  useHomeHealthOverview,
} from '@/hooks/use-home-health-overview';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { getRefreshControlColors } from '@/lib/refresh-control';
import { setPendingRequestsFilters } from '@/lib/requests-filter-route';

import { HomeErrorState } from './components/home-error-state';
import { HomePriorityRail } from './components/home-priority-rail';
import { HomeRecentDeployments } from './components/home-recent-deployments';
import { HomeRequestSignal } from './components/home-request-signal';
import { HomeSectionLabel } from './components/home-section-label';
import { HomeSkeleton } from './components/home-skeleton';
import { HomeSnapshotCards } from './components/home-snapshot-cards';

const SCREEN_EDGES = Platform.select({
  android: ['left', 'right'] as const,
  default: ['left', 'top', 'right'] as const,
});

const SCREEN_OPTIONS = {
  title: 'Home',
  headerShown: true,
};
const HOME_SECTION_ANIMATION: AnimateProps = { opacity: 1, translateY: 0 };
const HOME_SECTION_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 10 };
const HOME_PARTIAL_INITIAL_ANIMATION: AnimateProps = { opacity: 0 };
const HOME_ENTER_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HOME_SECTION_DELAY = 55;

function getHomeSectionTransition(index: number, isReducedMotionEnabled: boolean): Transition {
  if (isReducedMotionEnabled) {
    return { type: 'none' };
  }

  return {
    type: 'timing',
    duration: 240,
    easing: HOME_ENTER_EASING,
    delay: index * HOME_SECTION_DELAY,
  };
}

function HomeAnimatedSection({
  index,
  isReducedMotionEnabled,
  children,
}: {
  index: number;
  isReducedMotionEnabled: boolean;
  children: ReactNode;
}) {
  return (
    <EaseView
      initialAnimate={
        isReducedMotionEnabled ? HOME_SECTION_ANIMATION : HOME_SECTION_INITIAL_ANIMATION
      }
      animate={HOME_SECTION_ANIMATION}
      transition={getHomeSectionTransition(index, isReducedMotionEnabled)}>
      {children}
    </EaseView>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { impact, notifyError, notifySuccess } = useHaptics();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isReducedMotionEnabled = useReducedMotion();
  const overview = useHomeHealthOverview();
  const hasPriorityItems = overview.priorityItems.length > 0;
  const recentDeploymentsSectionIndex = hasPriorityItems ? 3 : 2;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await overview.refresh();
      await notifySuccess();
    } catch {
      await notifyError();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, notifyError, notifySuccess, overview]);

  const handleRetry = useCallback(() => {
    void impact();
    void handleRefresh();
  }, [handleRefresh, impact]);

  const openPriorityItem = useCallback(
    async (item: HomePriorityItem) => {
      if (!item.route) return;

      await impact();

      if (item.route.type === 'requests') {
        setPendingRequestsFilters(item.route.filters);
        router.push('/(app)/requests');
        return;
      }

      if (item.route.type === 'project') {
        router.push({
          pathname: '/(app)/(tabs)/(projects)/[projectId]',
          params: {
            projectId: item.route.projectId,
            projectName: item.route.projectName,
          },
        });
      }
    },
    [impact, router]
  );

  const openRequests = useCallback(async () => {
    await impact();
    setPendingRequestsFilters({
      datePreset: '3d',
      statuses: ['server'],
    });
    router.push('/(app)/requests');
  }, [impact, router]);

  const openDeployment = useCallback(
    async (deployment: HomeDeploymentPreview) => {
      await impact();
      router.push({
        pathname: '/(app)/modals/deployment-detail',
        params: {
          deploymentId: deployment.id,
          title: deployment.title,
          logPath: deployment.logPath ?? '',
        },
      });
    },
    [impact, router]
  );

  if (overview.status === 'loading') {
    return <HomeSkeleton />;
  }

  if (overview.status === 'error') {
    return (
      <>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <HomeErrorState message={overview.error} onRetry={handleRetry} />
      </>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={SCREEN_EDGES}>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-4 pb-8 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            {...getRefreshControlColors(resolvedTheme)}
          />
        }>
        <HomeAnimatedSection index={0} isReducedMotionEnabled={isReducedMotionEnabled}>
          <View className="gap-2">
            <HomeSectionLabel label="Snapshot" />
            <HomeSnapshotCards snapshot={overview.snapshot} />
          </View>
        </HomeAnimatedSection>

        <HomeAnimatedSection index={1} isReducedMotionEnabled={isReducedMotionEnabled}>
          <View className="gap-2">
            <HomeSectionLabel label="Requests" />
            <HomeRequestSignal
              signal={overview.requestSignal}
              hasError={overview.hasRequestError}
              onPress={openRequests}
            />
          </View>
        </HomeAnimatedSection>

        {hasPriorityItems ? (
          <HomeAnimatedSection index={2} isReducedMotionEnabled={isReducedMotionEnabled}>
            <View className="gap-2">
              <HomeSectionLabel label="Needs attention" />
              <HomePriorityRail items={overview.priorityItems} onPressItem={openPriorityItem} />
            </View>
          </HomeAnimatedSection>
        ) : null}

        <HomeAnimatedSection
          index={recentDeploymentsSectionIndex}
          isReducedMotionEnabled={isReducedMotionEnabled}>
          <View className="gap-2">
            <HomeSectionLabel label="Recent deployments" />
            <HomeRecentDeployments
              deployments={overview.recentDeployments}
              isLoading={overview.isDeploymentsLoading}
              hasError={overview.hasDeploymentError}
              onPressDeployment={openDeployment}
            />
          </View>
        </HomeAnimatedSection>

        {overview.status === 'partial' ? (
          <EaseView
            initialAnimate={
              isReducedMotionEnabled ? HOME_SECTION_ANIMATION : HOME_PARTIAL_INITIAL_ANIMATION
            }
            animate={HOME_SECTION_ANIMATION}
            transition={getHomeSectionTransition(
              recentDeploymentsSectionIndex + 1,
              isReducedMotionEnabled
            )}>
            <Text variant="muted" className="px-1 text-xs">
              Some optional signals could not be loaded. Pull to refresh to try again.
            </Text>
          </EaseView>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
