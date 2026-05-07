import { View } from 'react-native';
import { AlertTriangleIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';

type Props = {
  message: string | null;
  onRetry: () => void;
};

export function HomeErrorState({ message, onRetry }: Props) {
  return (
    <SafeAreaView className="bg-background flex-1 px-4" edges={['left', 'right']}>
      <View className="flex-1 items-center justify-center gap-4">
        <View className="bg-card border-border/80 size-12 items-center justify-center rounded-2xl border">
          <Icon as={AlertTriangleIcon} className="text-muted-foreground size-5" />
        </View>
        <View className="items-center gap-2">
          <Text variant="h4" className="text-center">
            Unable to load Home
          </Text>
          <Text variant="muted" className="max-w-72 text-center">
            {message ?? 'Service health could not be loaded right now.'}
          </Text>
        </View>
        <Button variant="outline" onPress={onRetry}>
          <Text>Retry</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
