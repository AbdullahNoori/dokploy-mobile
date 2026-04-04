import { Pressable, Switch, View } from 'react-native';
import { Text } from '@/components/ui/text';

type Props = {
  title: string;
  description: string;
  value: boolean;
  onToggle: (next: boolean) => void;
};

export function NotificationsToggleRow({ title, description, value, onToggle }: Props) {
  return (
    <View className="bg-card border-border/80 rounded-lg border px-4 py-3">
      <View className="flex-row items-center justify-between gap-3">
        <Pressable className="flex-1 gap-1" onPress={() => onToggle(!value)}>
          <Text className="font-semibold">{title}</Text>
          <Text variant="muted">{description}</Text>
        </Pressable>
        <Switch value={value} onValueChange={onToggle} accessibilityLabel={title} />
      </View>
    </View>
  );
}
