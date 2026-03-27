import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useUniwind } from 'uniwind';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useItemDetailScreen } from '@/hooks/use-item-detail-screen';
import type { ProjectItemType } from '@/types/projects';
import type { ApplicationOneResponseBody } from '@/types/application';
import { THEME } from '@/lib/theme';

import { ItemDetailActions } from './components/item-detail-actions';
import { ItemDetailDeployments } from './components/item-detail-deployments';
import { ItemDetailDomains } from './components/item-detail-domains';
import { ItemDetailEmptyState } from './components/item-detail-empty';
import { ItemDetailErrorState } from './components/item-detail-error';
import { ItemDetailGeneral } from './components/item-detail-general';
import { ItemDetailSkeleton } from './components/item-detail-skeleton';
import { ItemDetailTabs, type TabKey } from './components/item-detail-tabs';

export default function ItemDetailScreen() {
  const { itemId, itemType } = useLocalSearchParams<{
    itemId: string;
    itemType?: ProjectItemType;
  }>();

  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';

  const normalizedType = useMemo(() => {
    if (!itemType) return undefined;
    return itemType as ProjectItemType;
  }, [itemType]);

  const { data, summary, details, deployments, isApplication, isLoading, isError, retry } =
    useItemDetailScreen(normalizedType, itemId);

  const application = isApplication ? (data as ApplicationOneResponseBody | null) : null;
  const domains = application?.domains ?? [];
  const ports = application?.ports ?? [];

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await retry();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, retry]);
  const isDeploymentRunning = isApplication
    ? deployments.some((deployment) => (deployment.status ?? '').toLowerCase() === 'running')
    : false;

  if (!itemId || !normalizedType) {
    return (
      <SafeAreaView className="bg-background flex-1 px-4">
        <View className="flex-1 items-center justify-center">
          <Text variant="h4">Missing item information</Text>
          <Text variant="muted" className="mt-2 text-center">
            Please return to the project list and select an item again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return <ItemDetailSkeleton />;
  }

  if (isError) {
    return <ItemDetailErrorState onRetry={retry} />;
  }

  return (
    <SafeAreaView className="bg-background flex-1 px-4 pt-2" edges={['left', 'right']}>
      <Stack.Screen options={{ title: summary?.title ?? 'Service' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={THEME[resolvedTheme].primary}
            colors={[THEME[resolvedTheme].primary]}
          />
        }>
        <ItemDetailActions
          isApplication={isApplication}
          applicationId={application?.applicationId}
          appName={application?.appName}
          isDeploymentRunning={isDeploymentRunning}
          onRefresh={retry}
        />
        <ItemDetailTabs value={activeTab} onChange={setActiveTab} />

        {activeTab === 'general' ? <ItemDetailGeneral summary={summary} details={details} /> : null}

        {activeTab === 'logs' ? (
          <ItemDetailEmptyState
            title="Logs"
            description="Logs will appear here once they are available."
          />
        ) : null}

        {activeTab === 'deployments' ? (
          isApplication ? (
            <ItemDetailDeployments deployments={deployments} />
          ) : (
            <ItemDetailEmptyState
              title="Deployments"
              description="No deployments available for this service."
            />
          )
        ) : null}

        {activeTab === 'environment' ? (
          <ItemDetailEmptyState
            title="Environment"
            description="Environment details will appear here once they are available."
          />
        ) : null}

        {activeTab === 'domain' ? (
          <ItemDetailDomains
            domains={domains}
            ports={ports}
            isApplication={isApplication}
            applicationId={application?.applicationId}
            itemId={itemId}
            itemType={normalizedType ?? 'application'}
            onRefresh={retry}
          />
        ) : null}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
