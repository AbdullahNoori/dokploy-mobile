import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatRelativeTime, getServiceCount } from '@/lib/utils';
import type { ProjectAllResponseBody } from '@/types/projects';
import { Link } from 'expo-router';
import { LayoutGridIcon, MoreHorizontalIcon } from 'lucide-react-native';

type Props = {
  project: ProjectAllResponseBody;
};

export const ProjectsCard = memo(function ProjectsCard({ project }: Props) {
  const serviceCount = getServiceCount(project.environments);
  const serviceLabel = serviceCount === 1 ? '1 service' : `${serviceCount} services`;

  return (
    <Link href={`/${project.projectId}`} asChild>
      <Pressable className="bg-card border-border/80 rounded-2xl border px-4 py-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-2">
            <Icon as={LayoutGridIcon} className="text-muted-foreground size-4" />
            <Text className="font-semibold">{project.name}</Text>
          </View>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full">
            <Icon as={MoreHorizontalIcon} className="text-muted-foreground size-4" />
          </Pressable>
        </View>
        <View className="flex-row items-center justify-between">
          <Text variant="muted">{formatRelativeTime(project.createdAt)}</Text>
          <Text className="text-muted-foreground text-sm font-medium">
            {serviceLabel}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
});
