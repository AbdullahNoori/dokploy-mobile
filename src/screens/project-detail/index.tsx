import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useProjectDetailScreen } from '@/hooks/use-project-detail-screen';
import type { ProjectApplication } from '@/types/projects';

import { ApplicationsCard } from './components/applications-card';
import { ProjectDetailEmptyState } from './components/project-detail-empty';
import { ProjectDetailErrorState } from './components/project-detail-error';
import { ProjectDetailSkeleton } from './components/project-detail-skeleton';

const CARD_HEIGHT = 92;

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { project, applications, isLoading, isError, retry } = useProjectDetailScreen(
    projectId ?? ''
  );

  const renderItem = useCallback(
    ({ item }: { item: ProjectApplication }) => <ApplicationsCard application={item} />,
    []
  );

  const keyExtractor = useCallback((item: ProjectApplication) => item.applicationId, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<ProjectApplication> | null | undefined, index: number) => ({
      length: CARD_HEIGHT + 12,
      offset: (CARD_HEIGHT + 12) * index,
      index,
    }),
    []
  );

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (isError) {
    return <ProjectDetailErrorState onRetry={retry} />;
  }

  if (!applications.length) {
    return <ProjectDetailEmptyState />;
  }

  return (
    <SafeAreaView className="bg-background flex-1 px-4">
      <Stack.Screen options={{ title: project?.name ?? 'Project' }} />
      <View className="flex-1 pt-2">
        <FlatList
          data={applications}
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
