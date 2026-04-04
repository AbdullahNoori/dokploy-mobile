import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type Props = {
  hasFilters: boolean;
  query: string;
};

export function RequestsEmptyState({ hasFilters, query }: Props) {
  const hasSearch = query.trim().length > 0;

  return (
    <View className="items-center justify-center gap-2 px-6 py-16">
      <Text variant="h4">No requests found</Text>
      <Text variant="muted" className="text-center">
        {hasFilters || hasSearch
          ? 'Try changing your search or filters to see more request logs.'
          : 'Requests will appear here once traffic starts reaching your apps.'}
      </Text>
    </View>
  );
}
