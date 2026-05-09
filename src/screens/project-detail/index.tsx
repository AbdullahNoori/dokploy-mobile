import { useCallback, useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { useProjectDetailScreen } from '@/hooks/use-project-detail-screen';
import type { ProjectItem } from '@/types/projects';

import { ApplicationsCard } from './components/applications-card';
import { ProjectEnvironmentMenu } from './components/project-environment-menu';
import { ProjectDetailEmptyState } from './components/project-detail-empty';
import { ProjectDetailErrorState } from './components/project-detail-error';
import { ProjectDetailSkeleton } from './components/project-detail-skeleton';

const CARD_HEIGHT = 92;

export default function ProjectDetailScreen() {
  const { projectId, projectName } = useLocalSearchParams<{
    projectId: string;
    projectName?: string;
  }>();
  const {
    project,
    environments,
    activeEnvironment,
    activeEnvironmentId,
    items,
    isLoading,
    isError,
    selectEnvironment,
    retry,
  } = useProjectDetailScreen(projectId ?? '');
  const { impact, notifyError, notifySuccess } = useHaptics();
  const title = project?.name ?? projectName ?? 'Project';
  const screenOptions = useMemo(
    () => ({
      title,
      headerBackButtonDisplayMode: 'minimal' as const,
    }),
    [title]
  );

  const handleRetry = useCallback(async () => {
    await impact();
    try {
      await retry();
      await notifySuccess();
    } catch {
      await notifyError();
    }
  }, [impact, notifyError, notifySuccess, retry]);

  const renderItem = useCallback(
    ({ item }: { item: ProjectItem }) => (
      <ApplicationsCard application={item} projectId={projectId ?? ''} />
    ),
    [projectId]
  );

  const keyExtractor = useCallback((item: ProjectItem) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<ProjectItem> | null | undefined, index: number) => ({
      length: CARD_HEIGHT + 12,
      offset: (CARD_HEIGHT + 12) * index,
      index,
    }),
    []
  );

  if (isLoading) {
    return <ProjectDetailSkeleton title={title} />;
  }

  if (isError) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        {environmentMenu}
        <ProjectDetailErrorState
          onRetry={() => {
            void handleRetry();
          }}
        />
      </>
    );
  }

  if (!items.length) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        {environmentMenu}
        <ProjectDetailEmptyState environmentName={activeEnvironment?.name} />
      </>
    );
  }

  return (
    <SafeAreaView className="bg-background flex-1 px-4">
      <Stack.Screen options={screenOptions} />
      <ProjectEnvironmentMenu
        environments={environments}
        activeEnvironmentId={activeEnvironmentId}
        activeEnvironmentName={activeEnvironment?.name}
        onSelectEnvironment={selectEnvironment}
      />
      <View className="flex-1 pt-2">
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-3 py-4"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
