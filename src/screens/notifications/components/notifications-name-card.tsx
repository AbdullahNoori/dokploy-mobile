import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export function NotificationsNameCard({ value, onChangeText }: Props) {
  return (
    <View className="bg-card border-border/80 gap-3 rounded-2xl border p-4">
      <View className="gap-1">
        <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
          Name
        </Text>
        <Text variant="muted">Give this provider a clear label so it is easy to spot later.</Text>
      </View>
      <Input placeholder="Notification name" value={value} onChangeText={onChangeText} />
    </View>
  );
}
