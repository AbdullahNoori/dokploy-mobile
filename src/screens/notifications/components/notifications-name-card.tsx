import { View } from 'react-native';

import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  errorMessage?: string | null;
};

export function NotificationsNameCard({ value, onChangeText, errorMessage }: Props) {
  return (
    <View className="gap-3 rounded-2xl border bg-transparent p-0">
      <View className="gap-1">
        <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
          Name
        </Text>
      </View>
      <Input
        placeholder="Notification name"
        value={value}
        onChangeText={onChangeText}
        className={cn(errorMessage ? 'border-destructive' : undefined)}
      />
      {errorMessage ? (
        <Text className="text-destructive text-xs leading-5">{errorMessage}</Text>
      ) : null}
    </View>
  );
}
