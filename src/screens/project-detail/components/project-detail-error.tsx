import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Props = {
  onRetry: () => void;
};

export function ProjectDetailErrorState({ onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <Text variant="h4">Unable to load project</Text>
      <Text variant="muted" className="text-center">
        Please check your connection and try again.
      </Text>
      <Button onPress={onRetry}>
        <Text>Retry</Text>
      </Button>
    </View>
  );
}
