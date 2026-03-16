import { View } from 'react-native';

import { Text } from '@/components/ui/text';

export function ProjectDetailEmptyState() {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-6">
      <Text variant="h4">No applications found</Text>
      <Text variant="muted" className="text-center">
        This project doesn’t have any applications yet.
      </Text>
    </View>
  );
}
