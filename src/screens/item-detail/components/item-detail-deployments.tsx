import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatRelativeTime } from '@/lib/utils';

type DeploymentRow = {
  id: string;
  title: string;
  status: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

type Props = {
  deployments: DeploymentRow[];
};

const STATUS_CLASS: Record<string, string> = {
  done: 'bg-emerald-500',
  running: 'bg-amber-500',
  error: 'bg-rose-500',
  failed: 'bg-rose-500',
  idle: 'bg-slate-400',
};

const formatStatusLabel = (status: string | null) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDuration = (startedAt: string | null, finishedAt: string | null) => {
  if (!startedAt || !finishedAt) return null;
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  const totalSeconds = Math.round((end - start) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export function ItemDetailDeployments({ deployments }: Props) {
  return (
    <View className="mt-4 gap-3">
      {deployments.map((deployment, index) => {
        const statusLabel = formatStatusLabel(deployment.status);
        const dotClass =
          STATUS_CLASS[deployment.status ?? ''] ?? 'bg-muted-foreground/40';
        const duration = formatDuration(deployment.startedAt, deployment.finishedAt);
        const metaText = formatRelativeTime(deployment.createdAt);

        return (
        <View
          key={deployment.id}
          className="bg-card border-border/80 rounded-2xl border px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-foreground font-semibold" numberOfLines={1}>
                {index + 1}. {statusLabel}
              </Text>
              <View className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
            </View>
          </View>
          <Text className="text-foreground/80 mt-2" numberOfLines={1}>
            {deployment.title}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Text variant="muted" className="flex-1" numberOfLines={1}>
              {metaText}
            </Text>
            {duration ? (
              <View className="bg-muted rounded-full px-2 py-0.5">
                <Text className="text-xs font-medium text-foreground/80">{duration}</Text>
              </View>
            ) : null}
          </View>
        </View>
        );
      })}
    </View>
  );
}
