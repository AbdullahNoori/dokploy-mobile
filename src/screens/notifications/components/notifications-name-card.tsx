import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export function NotificationsNameCard({ value, onChangeText }: Props) {
  return (
    <View className="bg-card border-border/80 rounded-lg border p-4">
      <Text variant="muted" className="text-xs font-semibold uppercase tracking-wide">
        Name
      </Text>
      <Input placeholder="Notification name" className="mt-3" value={value} onChangeText={onChangeText} />
    </View>
  );
}
