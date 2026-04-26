import { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useUniwind } from 'uniwind';

import { useDomainsByApplicationId, useDomainsByComposeId } from '@/api/domain';
import { useDockerContainersByAppNameMatch } from '@/api/docker';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { useItemDetailScreen } from '@/hooks/use-item-detail-screen';
import type { ProjectItemType } from '@/types/projects';
import type { ApplicationOneResponseBody } from '@/types/application';
import type { ComposeOneResponseBody } from '@/types/compose';
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
  const { itemId, itemName, itemStatus, itemType } = useLocalSearchParams<{
    itemId: string;
    itemName?: string;
    itemStatus?: string;
    itemType?: ProjectItemType;
  }>();

  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const headerHeight = useHeaderHeight();
  const { impact, notifyError, notifySuccess } = useHaptics();

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
  } = useItemDetailScreen(normalizedType, itemId, itemStatus || undefined);

  const dockerContainers = useDockerContainersByAppNameMatch({
    appName: logsLookupName ?? '',
    appType: logsLookupAppType,
    serverId: logsLookupServerId,
    enabled: activeTab === 'logs' && Boolean(logsLookupName),
  });

  const application = isApplication ? (data as ApplicationOneResponseBody | null) : null;
  const compose = normalizedType === 'compose' ? (data as ComposeOneResponseBody | null) : null;
  const dataRecord = data as {
    applicationId?: string | null;
    composeId?: string | null;
    domains?: ApplicationOneResponseBody['domains'];
  } | null;
  const actionAppName = isApplication
    ? application?.appName
    : ((data as any)?.appName as string | undefined);
  const domainApplicationId =
    application?.applicationId ??
    (dataRecord?.applicationId ? dataRecord.applicationId : undefined);
  const domainComposeId =
    compose?.composeId ?? (dataRecord?.composeId ? dataRecord.composeId : undefined);
  const domainType =
    domainComposeId && normalizedType !== 'application' ? 'compose' : 'application';
  const composeDomains = useDomainsByComposeId(
    domainComposeId,
    activeTab === 'domain' && !isApplication && Boolean(domainComposeId)
  );
  const applicationDomains = useDomainsByApplicationId(
    domainApplicationId,
    activeTab === 'domain' && !isApplication && !domainComposeId && Boolean(domainApplicationId)
  );
  const fetchedDomains = domainComposeId ? composeDomains.data : applicationDomains.data;
  const domains =
    application?.domains ??
    dataRecord?.domains ??
    (Array.isArray(fetchedDomains) && !isErrorResponse(fetchedDomains) ? fetchedDomains : []);
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
      if (activeTab === 'domain') {
        if (domainComposeId) {
          await composeDomains.mutate();
        } else if (domainApplicationId && !isApplication) {
          await applicationDomains.mutate();
        }
      }
      await notifySuccess();
    } catch {
      await notifyError();
    } finally {
      setIsRefreshing(false);
    }
  }, [
    activeTab,
    dockerContainers,
    composeDomains,
    applicationDomains,
    domainApplicationId,
    domainComposeId,
    isRefreshing,
    isApplication,
    logsLookupName,
    notifyError,
    notifySuccess,
    retry,
  ]);

  const handleRetry = useCallback(async () => {
    await impact();
    try {
      await retry();
      await notifySuccess();
    } catch {
      await notifyError();
    }
  }, [impact, notifyError, notifySuccess, retry]);

  const handleRetryLookup = useCallback(async () => {
    await impact();
    try {
      await dockerContainers.mutate();
      await notifySuccess();
    } catch {
      await notifyError();
    }
  }, [dockerContainers, impact, notifyError, notifySuccess]);
  const handleDomainRefresh = useCallback(async () => {
    await retry();
    if (domainComposeId) {
      await composeDomains.mutate();
    } else if (domainApplicationId && !isApplication) {
      await applicationDomains.mutate();
    }
  }, [
    applicationDomains,
    composeDomains,
    domainApplicationId,
    domainComposeId,
    isApplication,
    retry,
  ]);
  const isDeploymentRunning = isApplication
    ? deployments.some((deployment) => (deployment.status ?? '').toLowerCase() === 'running')
    : false;
  const title = summary?.title ?? itemName ?? 'Service';

  if (!itemId || !normalizedType) {
    return (
      <SafeAreaView className="bg-background flex-1 px-4">
        <Stack.Screen options={{ title, headerBackButtonDisplayMode: 'minimal' }} />
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
    return <ItemDetailSkeleton title={title} />;
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={{ title, headerBackButtonDisplayMode: 'minimal' }} />
        <ItemDetailErrorState
          onRetry={() => {
            void handleRetry();
          }}
        />
      </>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1 px-4 pt-2" edges={['left', 'right']}>
      <Stack.Screen options={{ title, headerBackButtonDisplayMode: 'minimal' }} />
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
            itemType={normalizedType}
            itemId={itemId}
            appName={actionAppName}
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
                void handleRetryLookup();
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
              applicationId={domainType === 'application' ? domainApplicationId : undefined}
              composeId={domainType === 'compose' ? domainComposeId : undefined}
              domainType={domainType}
              canManageDomains={Boolean(domainApplicationId || domainComposeId)}
              itemId={itemId}
              itemType={normalizedType ?? 'application'}
              onRefresh={handleDomainRefresh}
            />
          ) : null}

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
