import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatRelativeTime } from '@/lib/utils';

type Summary = {
  status?: string | null;
  createdAt?: string;
};

type DetailRow = {
  label: string;
  value: string;
};

type Props = {
  summary: Summary | null;
  details: DetailRow[];
};

const STATUS_CLASS: Record<string, string> = {
  done: 'bg-emerald-500',
  running: 'bg-amber-500',
  error: 'bg-rose-500',
  failed: 'bg-rose-500',
  idle: 'bg-slate-400',
};

export function ItemDetailGeneral({ summary, details }: Props) {
  return (
    <View className="mt-4 gap-4">
      <View className="bg-card border-border/80 rounded-2xl border p-4">
        <Text className="text-base font-semibold">Summary</Text>
        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className={`h-3 w-3 rounded-full ${
                STATUS_CLASS[summary?.status ?? ''] ?? 'bg-muted-foreground/40'
              }`}
            />
            <Text className="text-sm font-semibold">{summary?.status ?? 'Unknown'}</Text>
          </View>
          {summary?.createdAt ? (
            <Text variant="muted">{formatRelativeTime(summary.createdAt)}</Text>
          ) : null}
        </View>
      </View>

      <View className="bg-card border-border/80 rounded-2xl border p-4">
        <Text className="text-base font-semibold">Details</Text>
        <View className="mt-3 gap-3">
          {details.map((row) => (
            <View key={row.label} className="flex-row items-start justify-between gap-4">
              <Text className="text-muted-foreground shrink-0 text-sm">{row.label}</Text>
              <Text className="flex-1 text-right text-sm font-semibold" numberOfLines={2}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
