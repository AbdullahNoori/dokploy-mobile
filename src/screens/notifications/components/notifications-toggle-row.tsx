import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react-native';

type Props = {
  title: string;
  description: string;
  value: boolean;
  onToggle: (next: boolean) => void;
};

export function NotificationsToggleRow({ title, description, value, onToggle }: Props) {
  const { selection } = useHaptics();

  return (
    <Pressable
      onPress={() => {
        void selection();
        onToggle(!value);
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      className={cn(
        'rounded-2xl border px-4 py-4 active:opacity-95',
        value ? 'border-primary/35 bg-primary/10' : 'bg-card border-border/80'
      )}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text className="font-semibold">{title}</Text>
          <Text variant="muted" className="leading-5">
            {description}
          </Text>
        </View>

        <View
          className={cn(
            'mt-0.5 h-7 w-7 items-center justify-center rounded-full border',
            value ? 'border-primary bg-primary' : 'border-border/80 bg-secondary'
          )}>
          {value ? <Icon as={CheckIcon} className="text-primary-foreground size-4" /> : null}
        </View>
      </View>
    </Pressable>
  );
}
