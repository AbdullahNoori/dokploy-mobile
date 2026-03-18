import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type TabKey = 'general' | 'logs' | 'deployments';

type Props = {
  value: TabKey;
  onChange: (value: TabKey) => void;
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'general', label: 'General' },
  { key: 'logs', label: 'Logs' },
  { key: 'deployments', label: 'Deployments' },
];

export function ItemDetailTabs({ value, onChange }: Props) {
  return (
    <View className="bg-card border-border/80 mt-5 flex-row rounded-xl border p-1">
      {TABS.map((tab) => {
        const isActive = value === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={cn(
              'flex-1 items-center rounded-lg px-3 py-2',
              isActive ? 'bg-background' : 'opacity-60'
            )}>
            <Text className={cn('text-sm font-semibold', isActive ? '' : 'text-muted-foreground')}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { TabKey };
