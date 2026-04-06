import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { BellOffIcon, RotateCcwIcon } from 'lucide-react-native';

type Props = {
  message: string;
  onRetry: () => void;
};

export function NotificationsErrorState({ message, onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <View className="bg-secondary border-border/70 mb-4 h-14 w-14 items-center justify-center rounded-full border">
        <Icon as={BellOffIcon} className="text-muted-foreground size-7" />
      </View>

      <Text variant="large" className="text-center">
        Unable to load notifications
      </Text>
      <Text variant="muted" className="mt-2 max-w-sm text-center leading-5">
        {message}
      </Text>

      <Button variant="outline" onPress={onRetry} className="mt-5 rounded-full px-5">
        <Icon as={RotateCcwIcon} className="size-4" />
        <Text>Try again</Text>
      </Button>
    </View>
  );
}
