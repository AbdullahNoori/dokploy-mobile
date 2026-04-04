import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Props = {
  message: string;
  onRetry: () => void;
};

export function RequestsErrorState({ message, onRetry }: Props) {
  return (
    <View className="items-center justify-center gap-3 px-6 py-16">
      <Text variant="h4">Unable to load requests</Text>
      <Text variant="muted" className="text-center">
        {message}
      </Text>
      <Button onPress={onRetry}>
        <Text>Retry</Text>
      </Button>
    </View>
  );
}
