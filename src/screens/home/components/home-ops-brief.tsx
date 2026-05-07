import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { HomeOpsBrief } from '@/hooks/use-home-health-overview';

import { HomeStatusDot } from './home-status-dot';

type Props = {
  brief: HomeOpsBrief;
};

export function HomeOpsBrief({ brief }: Props) {
  return (
    <View className="bg-card border-border/80 gap-4 rounded-2xl border p-4">
      <View className="flex-row items-start gap-3">
        <HomeStatusDot level={brief.level} className="mt-1.5" />
        <View className="min-w-0 flex-1">
          <Text className="text-lg leading-6 font-semibold" numberOfLines={2}>
            {brief.title}
          </Text>
          <Text variant="muted" className="mt-1 leading-5" numberOfLines={2}>
            {brief.subtitle}
          </Text>
        </View>
      </View>

      <View className="border-border/70 flex-row gap-6 border-t pt-4">
        {brief.facts.slice(0, 3).map((fact) => (
          <View key={fact.label} className="min-w-0">
            <Text className="text-base font-semibold" numberOfLines={1}>
              {fact.value}
            </Text>
            <Text variant="muted" className="mt-0.5 text-xs" numberOfLines={1}>
              {fact.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
