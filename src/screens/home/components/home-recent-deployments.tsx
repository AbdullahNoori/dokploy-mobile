import { Pressable, View } from 'react-native';
import { ChevronRightIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { HomeDeploymentPreview } from '@/hooks/use-home-health-overview';
import { formatCompactRelativeTime, formatDuration, formatStatusLabel } from '@/lib/utils';

import { HomeStatusDot } from './home-status-dot';

type Props = {
  deployments: HomeDeploymentPreview[];
  isLoading: boolean;
  hasError: boolean;
  onPressDeployment: (deployment: HomeDeploymentPreview) => void;
};

export function HomeRecentDeployments({
  deployments,
  isLoading,
  hasError,
  onPressDeployment,
}: Props) {
  if (hasError) {
    return (
      <View className="bg-card border-border/80 rounded-2xl border px-4 py-3">
        <Text className="font-semibold">Deployments unavailable</Text>
        <Text variant="muted" className="mt-0.5">
          Home is still showing service health and request signals.
        </Text>
      </View>
    );
  }

  if (isLoading && !deployments.length) {
    return (
      <View className="bg-card border-border/80 rounded-2xl border px-4 py-3">
        <Text className="font-semibold">Loading recent deployments</Text>
        <Text variant="muted" className="mt-0.5">
          Checking the most active services.
        </Text>
      </View>
    );
  }

  if (!deployments.length) {
    return (
      <View className="bg-card border-border/80 rounded-2xl border px-4 py-3">
        <Text className="font-semibold">No recent deployments</Text>
        <Text variant="muted" className="mt-0.5">
          Recent deploy activity will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-card border-border/80 overflow-hidden rounded-2xl border">
      {deployments.map((deployment, index) => {
        const duration = formatDuration(deployment.startedAt, deployment.finishedAt);
        const timeLabel = duration ?? formatCompactRelativeTime(deployment.createdAt);
        const statusLabel = formatStatusLabel(deployment.status);
        const subtitle =
          deployment.errorMessage?.trim() ||
          deployment.description?.trim() ||
          `${deployment.projectName} / ${deployment.environmentName}`;

        return (
          <Pressable
            key={deployment.id}
            onPress={() => onPressDeployment(deployment)}
            className={[
              'min-h-20 flex-row items-center gap-3 px-4 py-3 active:opacity-80',
              index < deployments.length - 1 ? 'border-border/70 border-b' : '',
            ].join(' ')}>
            <View className="min-w-0 flex-1 flex-row items-start gap-3">
              <HomeStatusDot level={deployment.level} />
              <View className="min-w-0 flex-1">
                <Text className="font-semibold" numberOfLines={1}>
                  -----
                </Text>
                <Text variant="muted" className="mt-0.5" numberOfLines={1}>
                  ----{' '}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <View className="bg-muted rounded-md px-2 py-0.5">
                    <Text className="text-foreground/80 text-xs font-medium" numberOfLines={1}>
                      {statusLabel}
                    </Text>
                  </View>
                  <Text variant="muted" className="min-w-0 flex-1 text-xs" numberOfLines={1}>
                    {timeLabel}
                  </Text>
                </View>
              </View>
            </View>

            <Icon as={ChevronRightIcon} className="text-muted-foreground/70 size-4" />
          </Pressable>
        );
      })}
    </View>
  );
}
