import { Pressable, View } from 'react-native';
import { XIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  DEFAULT_REQUESTS_DATE_PRESET,
  REQUESTS_STATUS_OPTIONS,
  cn,
  type RequestsDatePreset,
} from '@/lib/utils';
import type { SettingsRequestStatusFamily } from '@/types/settings';

type Props = {
  datePreset: RequestsDatePreset;
  statuses: SettingsRequestStatusFamily[];
  onRemoveDatePreset: () => void;
  onRemoveStatus: (status: SettingsRequestStatusFamily) => void;
};

function FilterChip({
  label,
  onPress,
  className,
  textClassName,
}: {
  label: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-1 rounded-full border px-3 py-1.5 active:opacity-90',
        className ?? 'border-zinc-200/70 bg-zinc-50'
      )}>
      <Text className={cn('text-xs font-medium', textClassName ?? 'text-zinc-950')}>{label}</Text>
      <Icon as={XIcon} className={cn('size-3.5', textClassName ?? 'text-zinc-950')} />
    </Pressable>
  );
}

export function RequestsActiveFilters({
  datePreset,
  statuses,
  onRemoveDatePreset,
  onRemoveStatus,
}: Props) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {datePreset !== DEFAULT_REQUESTS_DATE_PRESET ? (
        <FilterChip label={datePreset} onPress={onRemoveDatePreset} />
      ) : null}
      {statuses.map((status) => {
        const option = REQUESTS_STATUS_OPTIONS.find((item) => item.value === status);

        return (
          <FilterChip
            key={status}
            label={option?.label ?? status}
            onPress={() => onRemoveStatus(status)}
            className={option?.activeChipClassName}
            textClassName={option?.activeChipTextClassName}
          />
        );
      })}
    </View>
  );
}
