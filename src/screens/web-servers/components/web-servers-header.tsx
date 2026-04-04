import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export function WebServersHeader() {
  return (
    <View className="gap-1">
      <Text variant="h3">Web Servers</Text>
      <Text variant="muted">
        Server domain configuration and backup management in one focused mobile-first admin surface.
      </Text>
    </View>
  );
}
