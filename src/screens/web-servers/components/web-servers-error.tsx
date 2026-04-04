import { View } from 'react-native';
import { LockIcon, TriangleAlertIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type Props = {
  kind?: 'error' | 'unauthorized';
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function WebServersErrorState({
  kind = 'error',
  title,
  message,
  actionLabel = 'Retry',
  onAction,
}: Props) {
  return (
    <View className="items-center gap-3 px-2 py-6">
      <View className="bg-muted size-11 items-center justify-center rounded-full">
        <Icon as={kind === 'unauthorized' ? LockIcon : TriangleAlertIcon} className="size-5" />
      </View>
      <View className="items-center gap-1">
        <Text variant="h4" className="text-center text-lg">
          {title ?? (kind === 'unauthorized' ? 'Access required' : 'Something went wrong')}
        </Text>
        <Text variant="muted" className="text-center">
          {message}
        </Text>
      </View>
      {onAction ? (
        <Button variant={kind === 'unauthorized' ? 'outline' : 'default'} onPress={onAction}>
          <Text>{actionLabel}</Text>
        </Button>
      ) : null}
    </View>
  );
}
