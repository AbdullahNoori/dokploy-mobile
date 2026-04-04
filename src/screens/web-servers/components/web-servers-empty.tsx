import { View } from 'react-native';
import { DatabaseIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type Props = {
  title: string;
  message: string;
};

export function WebServersEmptyState({ title, message }: Props) {
  return (
    <View className="items-center gap-3 px-2 py-6">
      <View className="bg-muted size-11 items-center justify-center rounded-full">
        <Icon as={DatabaseIcon} className="size-5" />
      </View>
      <View className="items-center gap-1">
        <Text variant="h4" className="text-center text-lg">
          {title}
        </Text>
        <Text variant="muted" className="text-center">
          {message}
        </Text>
      </View>
    </View>
  );
}
