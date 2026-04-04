import { Pressable, View } from 'react-native';
import { SearchIcon, SlidersHorizontalIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  onPressFilters: () => void;
  activeFilterCount: number;
};

export function RequestsSearchBar({
  query,
  onChangeQuery,
  onPressFilters,
  activeFilterCount,
}: Props) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="bg-card flex-1 flex-row items-center gap-2 rounded-xl border border-zinc-800 px-3">
        <Icon as={SearchIcon} className="text-muted-foreground size-4" />
        <Input
          className="h-11 flex-1 border-0 !bg-transparent px-0 dark:!bg-transparent"
          placeholder="Search host or path"
          value={query}
          onChangeText={onChangeQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
      <Pressable
        onPress={onPressFilters}
        className="bg-card h-11 flex-row items-center gap-2 rounded-xl border border-zinc-800 px-3 active:opacity-90">
        <Icon as={SlidersHorizontalIcon} className="text-muted-foreground size-4" />
        {/* <Text className="text-sm font-medium">Filters</Text> */}
        {activeFilterCount > 0 ? (
          <View className="min-w-5 items-center rounded-full border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5">
            <Text className="text-xs font-semibold text-zinc-950">{activeFilterCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
