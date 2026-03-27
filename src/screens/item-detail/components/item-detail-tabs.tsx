import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type TabKey = 'general' | 'logs' | 'deployments' | 'environment' | 'domain';

type Props = {
  value: TabKey;
  onChange: (value: TabKey) => void;
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'general', label: 'General' },
  { key: 'logs', label: 'Logs' },
  { key: 'deployments', label: 'Deployments' },
  { key: 'environment', label: 'Environment' },
  { key: 'domain', label: 'Domain' },
];

export function ItemDetailTabs({ value, onChange }: Props) {
  return (
    <View className="bg-card border-border/80 mt-5 overflow-hidden rounded-xl border">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          padding: 4,
          paddingRight: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {TABS.map((tab) => {
          const isActive = value === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              className={cn(
                'mr-2 min-w-27.5 flex-none items-center rounded-lg px-3 py-2',
                isActive ? 'bg-background' : 'opacity-60'
              )}>
              <Text
                numberOfLines={1}
                className={cn('text-sm font-semibold', isActive ? '' : 'text-muted-foreground')}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export type { TabKey };
