import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { HomeSnapshot } from '@/hooks/use-home-health-overview';

type Props = {
  snapshot: HomeSnapshot;
};

function formatMetricValue(value: number | null) {
  if (value === null) return '—';
  if (value >= 1_000_000) return `${Math.floor(value / 1_000_000)}M`;
  if (value >= 10_000) return `${Math.floor(value / 1_000)}K`;
  return String(value);
}

function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${formatMetricValue(value)} ${value === 1 ? singular : plural}`;
}

function MetricCell({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View className="min-w-0 flex-1">
      <Text variant="muted" className="text-xs font-medium uppercase" numberOfLines={1}>
        {label}
      </Text>
      <Text className="mt-2 text-2xl leading-7 font-semibold" numberOfLines={1}>
        {value}
      </Text>
      <Text variant="muted" className="mt-1 text-xs leading-4" numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

function StatusPill({
  dotClassName,
  value,
  label,
}: {
  dotClassName: string;
  value: number;
  label: string;
}) {
  return (
    <View className="bg-muted/45 min-w-0 flex-1 flex-row items-center gap-2 rounded-md px-2 py-2">
      <View className={`size-2 rounded-full ${dotClassName}`} />
      <Text className="text-sm font-semibold" numberOfLines={1}>
        {formatMetricValue(value)}
      </Text>
      <Text variant="muted" className="min-w-0 flex-1 text-xs" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function HomeSnapshotCards({ snapshot }: Props) {
  const deployDetail =
    snapshot.deploys7dCount === null
      ? 'deploy data unavailable'
      : snapshot.deploys7dCount > 0
        ? 'recent activity'
        : 'no prior data';

  return (
    <View className="bg-card border-border/80 gap-4 rounded-2xl border p-4">
      <View className="flex-row gap-4">
        <MetricCell
          label="Projects"
          value={formatMetricValue(snapshot.projectsCount)}
          detail={formatCount(snapshot.environmentsCount, 'environment')}
        />
        <MetricCell
          label="Services"
          value={formatMetricValue(snapshot.servicesTotal)}
          detail={`${formatMetricValue(snapshot.applicationsCount)} apps · ${formatMetricValue(
            snapshot.composeCount
          )} compose · ${formatMetricValue(snapshot.databaseCount)} db`}
        />
        <MetricCell
          label="Deploys / 7d"
          value={formatMetricValue(snapshot.deploys7dCount)}
          detail={deployDetail}
        />
      </View>

      <View className="border-border/70 gap-2 border-t pt-4">
        <Text variant="muted" className="text-xs font-medium uppercase" numberOfLines={1}>
          Status
        </Text>
        <View className="flex-row gap-2">
          <StatusPill dotClassName="bg-emerald-500" value={snapshot.runningCount} label="running" />
          <StatusPill dotClassName="bg-rose-500" value={snapshot.erroredCount} label="errored" />
          <StatusPill
            dotClassName="bg-muted-foreground/50"
            value={snapshot.idleCount}
            label="idle"
          />
        </View>
      </View>
    </View>
  );
}
