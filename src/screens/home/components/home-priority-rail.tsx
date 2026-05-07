import { Pressable, View } from 'react-native';
import { ChevronRightIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { HomePriorityItem } from '@/hooks/use-home-health-overview';
import { cn } from '@/lib/utils';

import { HomeStatusDot } from './home-status-dot';

type Props = {
  items: HomePriorityItem[];
  onPressItem: (item: HomePriorityItem) => void;
};

export function HomePriorityRail({ items, onPressItem }: Props) {
  return (
    <View className="bg-card border-border/80 overflow-hidden rounded-2xl border">
      {items.map((item, index) => {
        const disabled = !item.route;
        return (
          <Pressable
            key={item.id}
            disabled={disabled}
            onPress={() => onPressItem(item)}
            className={cn(
              'min-h-16 flex-row items-center justify-between gap-3 px-4 py-3 active:opacity-80',
              index < items.length - 1 && 'border-border/70 border-b',
              disabled && 'opacity-60'
            )}>
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <HomeStatusDot level={item.level} />
              <View className="min-w-0 flex-1">
                <Text className="font-semibold" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text variant="muted" className="mt-0.5" numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            {item.route ? (
              <Icon as={ChevronRightIcon} className="text-muted-foreground/70 size-4" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
