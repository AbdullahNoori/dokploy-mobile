import { useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, View } from 'react-native';
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
import { setPendingRequestsFilters } from '@/lib/requests-filter-route';
import { THEME } from '@/lib/theme';

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

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { impact, notifyError, notifySuccess } = useHaptics();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const overview = useHomeHealthOverview();

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
            tintColor={THEME[resolvedTheme].primary}
            colors={[THEME[resolvedTheme].primary]}
          />
        }>
        <View className="gap-2">
          <HomeSectionLabel label="Snapshot" />
          <HomeSnapshotCards snapshot={overview.snapshot} />
        </View>

        <View className="gap-2">
          <HomeSectionLabel label="Requests" />
          <HomeRequestSignal
            signal={overview.requestSignal}
            hasError={overview.hasRequestError}
            onPress={openRequests}
          />
        </View>

        {overview.priorityItems.length > 0 ? (
          <View className="gap-2">
            <HomeSectionLabel label="Needs attention" />
            <HomePriorityRail items={overview.priorityItems} onPressItem={openPriorityItem} />
          </View>
        ) : null}

        <View className="gap-2">
          <HomeSectionLabel label="Recent deployments" />
          <HomeRecentDeployments
            deployments={overview.recentDeployments}
            isLoading={overview.isDeploymentsLoading}
            hasError={overview.hasDeploymentError}
            onPressDeployment={openDeployment}
          />
        </View>

        {overview.status === 'partial' ? (
          <Text variant="muted" className="px-1 text-xs">
            Some optional signals could not be loaded. Pull to refresh to try again.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
