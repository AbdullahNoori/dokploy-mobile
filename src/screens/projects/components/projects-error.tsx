import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type Props = {
  onRetry: () => Promise<void> | void;
};

export function ProjectsErrorState({ onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <Text variant="h4">Unable to load projects</Text>
      <Text variant="muted" className="text-center">
        Please check your connection and try again.
      </Text>
      <Button onPress={() => void onRetry()}>
        <Text>Retry</Text>
      </Button>
    </View>
  );
}
