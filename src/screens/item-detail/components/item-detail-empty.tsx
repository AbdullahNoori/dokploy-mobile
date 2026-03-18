import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  title: string;
  description: string;
};

export function ItemDetailEmptyState({ title, description }: Props) {
  return (
    <View className="bg-card border-border/80 mt-4 rounded-2xl border p-4">
      <Text className="text-base font-semibold">{title}</Text>
      <Text variant="muted" className="mt-2">
        {description}
      </Text>
    </View>
  );
}
