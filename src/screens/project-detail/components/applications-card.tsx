import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Link } from 'expo-router';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatRelativeTime } from '@/lib/utils';
import type { ProjectItem } from '@/types/projects';
import { GlobeIcon } from 'lucide-react-native';

type Props = {
  application: ProjectItem;
  projectId: string;
};

const STATUS_CLASS: Record<string, string> = {
  done: 'bg-emerald-500',
  error: 'bg-rose-500',
  failed: 'bg-rose-500',
  running: 'bg-amber-500',
  pending: 'bg-amber-500',
};

export const ApplicationsCard = memo(function ApplicationsCard({ application, projectId }: Props) {
  const statusClass = STATUS_CLASS[application.status ?? ''] ?? 'bg-muted-foreground/40';

  return (
    <Link
      href={{
        pathname: '/item/[itemId]',
        params: {
          itemId: application.id,
          itemType: application.type,
          projectId,
        },
      }}
      asChild>
      <Pressable className="bg-card border-border/80 rounded-2xl border px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold">{application.name}</Text>
          <View className="flex-row items-center gap-3">
            <Icon as={GlobeIcon} className="text-muted-foreground size-5" />
            <View className={`h-3 w-3 rounded-full ${statusClass}`} />
          </View>
        </View>
        <Text variant="muted" className="mt-2">
          {formatRelativeTime(application.createdAt)}
        </Text>
      </Pressable>
    </Link>
  );
});
