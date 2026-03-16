import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react-native';

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  sortOrder: 'newest' | 'oldest';
  onToggleSort: () => void;
};

export function ProjectsFilters({ query, onChangeQuery, sortOrder, onToggleSort }: Props) {
  return (
    <View className="mt-4 flex-row items-center gap-2">
      <View className="bg-card border-border/70 flex-1 flex-row items-center gap-2 rounded-xl border px-3">
        <Icon as={SearchIcon} className="text-muted-foreground size-4" />
        <Input
          className="h-11 flex-1 border-0 !bg-transparent px-0 dark:!bg-transparent"
          placeholder="Filter projects..."
          value={query}
          onChangeText={onChangeQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {/* <Pressable
        onPress={onToggleSort}
        className="bg-card border-border/70 flex-row items-center gap-2 rounded-xl border px-3 py-3">
        <Icon as={SlidersHorizontalIcon} className="text-muted-foreground size-4" />
        <Text className="text-sm">
          {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        </Text>
        <Icon as={ChevronDownIcon} className="text-muted-foreground size-4" />
      </Pressable> */}
    </View>
  );
}
