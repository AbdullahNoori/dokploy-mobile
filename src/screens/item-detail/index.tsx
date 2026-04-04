import { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useUniwind } from 'uniwind';

import { useDockerContainersByAppNameMatch } from '@/api/docker';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useItemDetailScreen } from '@/hooks/use-item-detail-screen';
import type { ProjectItemType } from '@/types/projects';
import type { ApplicationOneResponseBody } from '@/types/application';
import { isErrorResponse } from '@/lib/utils';
import { THEME } from '@/lib/theme';

import { ItemDetailActions } from './components/item-detail-actions';
import { ItemDetailDeployments } from './components/item-detail-deployments';
import { ItemDetailDomains } from './components/item-detail-domains';
import { ItemDetailEnvironment } from './components/item-detail-environment';
import { ItemDetailEmptyState } from './components/item-detail-empty';
import { ItemDetailErrorState } from './components/item-detail-error';
import { ItemDetailGeneral } from './components/item-detail-general';
import { ItemDetailLogs } from './components/item-detail-logs';
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
  const headerHeight = useHeaderHeight();

  const normalizedType = useMemo(() => {
    if (!itemType) return undefined;
    return itemType as ProjectItemType;
  }, [itemType]);

  const {
    data,
    summary,
    details,
    deployments,
    logsLookupName,
    logsLookupAppType,
    logsLookupServerId,
    isApplication,
    isLoading,
    isError,
    retry,
  } = useItemDetailScreen(normalizedType, itemId);

  const dockerContainers = useDockerContainersByAppNameMatch({
    appName: logsLookupName ?? '',
    appType: logsLookupAppType,
    serverId: logsLookupServerId,
    enabled: activeTab === 'logs' && Boolean(logsLookupName),
  });

  const application = isApplication ? (data as ApplicationOneResponseBody | null) : null;
  const domains = application?.domains ?? [];
  const ports = application?.ports ?? [];
  const dockerContainerData =
    dockerContainers.data && !isErrorResponse(dockerContainers.data) ? dockerContainers.data : null;
  const dockerContainerError = dockerContainers.error
    ? dockerContainers.error.message
    : dockerContainers.data && isErrorResponse(dockerContainers.data)
      ? (dockerContainers.data.message ?? dockerContainers.data.error)
      : null;

  const onRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await retry();
      if (activeTab === 'logs' && logsLookupName) {
        await dockerContainers.mutate();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTab, dockerContainers, isRefreshing, logsLookupName, retry]);
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
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

          {activeTab === 'general' ? (
            <ItemDetailGeneral summary={summary} details={details} />
          ) : null}

          {activeTab === 'logs' ? (
            <ItemDetailLogs
              hasLookupName={Boolean(logsLookupName)}
              selectedContainerId={dockerContainerData?.containerIds?.[0]}
              isLookupLoading={Boolean(dockerContainers.isLoading)}
              lookupError={dockerContainerError}
              onRetryLookup={() => {
                void dockerContainers.mutate();
              }}
            />
          ) : null}

          {activeTab === 'deployments' ? (
            isApplication ? (
              <ItemDetailDeployments deployments={deployments} itemId={itemId} />
            ) : (
              <ItemDetailEmptyState
                title="Deployments"
                description="No deployments available for this service."
              />
            )
          ) : null}

          {activeTab === 'environment' ? (
            <ItemDetailEnvironment
              itemType={normalizedType ?? 'application'}
              data={data}
              onRefresh={retry}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
