import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatRelativeTime } from '@/lib/utils';

type DeploymentRow = {
  id: string;
  title: string;
  status: string | null;
  createdAt: string;
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

export function ItemDetailDeployments({ deployments }: Props) {
  return (
    <View className="mt-4 gap-3">
      {deployments.map((deployment) => (
        <View
          key={deployment.id}
          className="bg-card border-border/80 rounded-2xl border px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold">{deployment.title}</Text>
            <View
              className={`h-3 w-3 rounded-full ${
                STATUS_CLASS[deployment.status ?? ''] ?? 'bg-muted-foreground/40'
              }`}
            />
          </View>
          <Text variant="muted" className="mt-2">
            {formatRelativeTime(deployment.createdAt)}
          </Text>
        </View>
      ))}
    </View>
  );
}
