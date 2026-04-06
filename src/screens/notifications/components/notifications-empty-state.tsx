import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { BellIcon, PlusIcon } from 'lucide-react-native';

type Props = {
  onPressAdd: () => void;
};

export function NotificationsEmptyState({ onPressAdd }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <View className="bg-secondary border-border/70 mb-4 h-14 w-14 items-center justify-center rounded-full border">
        <Icon as={BellIcon} className="text-muted-foreground size-7" />
      </View>

      <Text variant="large" className="text-center">
        No notifications yet
      </Text>
      <Text variant="muted" className="mt-2 max-w-sm text-center leading-5">
        Add a provider to start receiving deployment, backup, and maintenance alerts in one place.
      </Text>

      <Button onPress={onPressAdd} className="mt-5 rounded-full px-5">
        <Icon as={PlusIcon} className="text-primary-foreground size-4" />
        <Text>Add notification</Text>
      </Button>
    </View>
  );
}
