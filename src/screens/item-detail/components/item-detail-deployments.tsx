import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRightIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatDuration, formatRelativeTime, formatStatusLabel } from '@/lib/utils';
import type { DeploymentRow } from '@/hooks/use-item-detail-screen';

type Props = {
  deployments: DeploymentRow[];
  itemId: string;
};

const STATUS_CLASS: Record<string, string> = {
  done: 'bg-emerald-500',
  running: 'bg-amber-500',
  error: 'bg-rose-500',
  failed: 'bg-rose-500',
  idle: 'bg-slate-400',
};

export function ItemDetailDeployments({ deployments, itemId }: Props) {
  const router = useRouter();

  return (
    <View className="mt-4 gap-3">
      {deployments.map((deployment, index) => {
        const statusLabel = formatStatusLabel(deployment.status);
        const dotClass = STATUS_CLASS[deployment.status ?? ''] ?? 'bg-muted-foreground/40';
        const duration = formatDuration(deployment.startedAt, deployment.finishedAt);
        const metaText = formatRelativeTime(deployment.createdAt);
        const subtitle =
          deployment.errorMessage?.trim() || deployment.description?.trim() || deployment.title;

        return (
          <Pressable
            key={deployment.id}
            className="bg-card border-border/80 rounded-2xl border px-4 py-3 active:opacity-90"
            onPress={() =>
              router.push({
                pathname: '/item/[itemId]/deployment/[deploymentId]',
                params: {
                  itemId,
                  deploymentId: deployment.id,
                  title: deployment.title,
                  status: deployment.status ?? '',
                  description: deployment.description ?? '',
                  logPath: deployment.logPath ?? '',
                  pid: deployment.pid ?? '',
                  applicationId: deployment.applicationId ?? '',
                  composeId: deployment.composeId ?? '',
                  serverId: deployment.serverId ?? '',
                  isPreviewDeployment: String(deployment.isPreviewDeployment),
                  previewDeploymentId: deployment.previewDeploymentId ?? '',
                  createdAt: deployment.createdAt,
                  startedAt: deployment.startedAt ?? '',
                  finishedAt: deployment.finishedAt ?? '',
                  errorMessage: deployment.errorMessage ?? '',
                  scheduleId: deployment.scheduleId ?? '',
                  backupId: deployment.backupId ?? '',
                  rollbackId: deployment.rollbackId ?? '',
                  volumeBackupId: deployment.volumeBackupId ?? '',
                  buildServerId: deployment.buildServerId ?? '',
                },
              })
            }>
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="text-foreground font-semibold" numberOfLines={1}>
                  {index + 1}. {statusLabel}
                </Text>
                <View className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
              </View>
              <Icon as={ChevronRightIcon} className="text-muted-foreground size-4" />
            </View>
            <Text className="text-foreground/80 mt-2" numberOfLines={1}>
              {subtitle}
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              <Text variant="muted" className="flex-1" numberOfLines={1}>
                {metaText}
              </Text>
              {duration ? (
                <View className="bg-muted rounded-full px-2 py-0.5">
                  <Text className="text-foreground/80 text-xs font-medium">{duration}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
