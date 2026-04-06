import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  count: number;
};

export function NotificationsListHeader({ count }: Props) {
  const countLabel = count === 1 ? '1 provider connected' : `${count} providers connected`;

  return (
    <View className="gap-3 pb-2">
      <View className="gap-1">
        <Text variant="muted">
          Manage where Dokploy sends your provider notifications and alerts.
        </Text>
      </View>

      {count > 0 ? (
        <View className="bg-secondary self-start rounded-full px-3 py-1">
          <Text variant="muted" className="text-xs font-medium">
            {countLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
