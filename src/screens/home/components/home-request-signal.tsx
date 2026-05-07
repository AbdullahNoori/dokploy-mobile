import { Pressable, View } from 'react-native';
import { ChevronRightIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { HomeRequestSignal } from '@/hooks/use-home-health-overview';

type Props = {
  signal: HomeRequestSignal | null;
  hasError: boolean;
  onPress: () => void;
};

export function HomeRequestSignal({ signal, hasError, onPress }: Props) {
  if (hasError) {
    return (
      <View className="bg-card border-border/80 rounded-2xl border px-4 py-3">
        <Text className="font-semibold">Requests unavailable</Text>
        <Text variant="muted" className="mt-0.5">
          Home is showing service health without recent requests.
        </Text>
      </View>
    );
  }

  if (!signal) {
    return (
      <View className="bg-card border-border/80 rounded-2xl border px-4 py-3">
        <Text className="font-semibold">No recent request sample</Text>
        <Text variant="muted" className="mt-0.5">
          Requests will appear here after traffic is available.
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-card border-border/80 gap-3 rounded-2xl border px-4 py-3 active:opacity-80">
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="font-semibold" numberOfLines={1}>
            {signal.label}
          </Text>
          <Text variant="muted" className="mt-0.5" numberOfLines={1}>
            {signal.total} recent requests · {signal.successPercent ?? 0}% success
          </Text>
        </View>
        <Icon as={ChevronRightIcon} className="text-muted-foreground/70 size-4" />
      </View>

      <View className="border-border/70 flex-row gap-5 border-t pt-3">
        <View className="min-w-0">
          <Text className="text-sm font-semibold">{signal.clientErrorPercent ?? 0}%</Text>
          <Text variant="muted" className="mt-0.5 text-xs">
            4xx
          </Text>
        </View>
        <View className="min-w-0">
          <Text className="text-sm font-semibold">{signal.serverErrorPercent ?? 0}%</Text>
          <Text variant="muted" className="mt-0.5 text-xs">
            5xx
          </Text>
        </View>
        <View className="min-w-0">
          <Text className="text-sm font-semibold">{signal.p95DurationLabel ?? 'Unknown'}</Text>
          <Text variant="muted" className="mt-0.5 text-xs">
            p95
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
