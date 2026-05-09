import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  environmentName?: string | null;
};

export function ProjectDetailEmptyState({ environmentName }: Props) {
  const title = environmentName ? `No services in ${environmentName}` : 'No services found';

  return (
    <View className="flex-1 items-center justify-center gap-2 px-6">
      <Text variant="h4">{title}</Text>
      <Text variant="muted" className="text-center">
        This environment doesn’t have any applications, compose services, or databases yet.
      </Text>
    </View>
  );
}
