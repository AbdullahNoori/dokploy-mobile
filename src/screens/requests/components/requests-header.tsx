import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export function RequestsHeader({ totalCount }: { totalCount: number }) {
  return (
    <View className="gap-1">
      <Text className="text-xl font-semibold">Requests</Text>
      <Text variant="muted">Incoming traffic that passes through Traefik</Text>
      <Text variant="muted" className="pt-1 text-xs font-medium tracking-wide uppercase">
        {new Intl.NumberFormat('en-US').format(totalCount)} total
      </Text>
    </View>
  );
}
