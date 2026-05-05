import { memo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import {
  REQUESTS_STATUS_OPTIONS,
  cn,
  formatCompactRelativeTime,
  formatRequestDuration,
  formatRequestStatus,
  getRequestHost,
  getRequestMethod,
  getRequestPath,
  getRequestStatusFamily,
} from '@/lib/utils';
import type { SettingsRequestLogEntry } from '@/types/settings';

const DEFAULT_META_CHIP_CLASS =
  'rounded-full border border-border/80 bg-muted px-2.5 py-1 dark:border-zinc-700/80 dark:bg-zinc-800';
const DEFAULT_META_TEXT_CLASS = 'text-muted-foreground dark:text-zinc-100';
const HOST_CHIP_CLASS =
  'rounded-full border border-border/80 bg-muted px-2.5 py-1 dark:border-zinc-700/70 dark:bg-zinc-800/90';
const HOST_TEXT_CLASS = 'text-foreground dark:text-zinc-50';
const UNKNOWN_STATUS_CHIP_CLASS =
  'border-border/80 bg-muted dark:border-zinc-700/80 dark:bg-zinc-800';
const UNKNOWN_STATUS_TEXT_CLASS = 'text-muted-foreground dark:text-zinc-100';

function MetaChip({
  label,
  className,
  textClassName,
}: {
  label: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <View className={cn(DEFAULT_META_CHIP_CLASS, className)}>
      <Text className={`${textClassName ?? DEFAULT_META_TEXT_CLASS} text-xs font-medium`}>
        {label}
      </Text>
    </View>
  );
}

type Props = {
  request: SettingsRequestLogEntry;
};

export const RequestLogCard = memo(function RequestLogCard({ request }: Props) {
  const statusFamily = getRequestStatusFamily(request.DownstreamStatus) ?? 'unknown';
  const statusOption = REQUESTS_STATUS_OPTIONS.find((option) => option.value === statusFamily);

  return (
    <View className="bg-card border-border/80 rounded-2xl border px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/90">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-foreground text-sm font-bold tracking-wide dark:text-zinc-50">
            {getRequestMethod(request)}
          </Text>
          <View className={`${HOST_CHIP_CLASS} max-w-[78%]`}>
            <Text className={`${HOST_TEXT_CLASS} text-xs font-medium`} numberOfLines={1}>
              {getRequestHost(request)}
            </Text>
          </View>
        </View>
        <Text className="text-muted-foreground pt-0.5 text-xs dark:text-zinc-400">
          {formatCompactRelativeTime(request.StartUTC ?? request.time)}
        </Text>
      </View>

      <Text className="text-foreground pt-2 text-sm dark:text-zinc-100" numberOfLines={2}>
        {getRequestPath(request)}
      </Text>

      <View className="flex-row flex-wrap gap-2 pt-3">
        <MetaChip
          label={formatRequestStatus(request.DownstreamStatus)}
          className={statusOption?.badgeClassName ?? UNKNOWN_STATUS_CHIP_CLASS}
          textClassName={statusOption?.badgeTextClassName ?? UNKNOWN_STATUS_TEXT_CLASS}
        />
        <MetaChip label={formatRequestDuration(request.Duration)} />
        <MetaChip label={request.ClientAddr || 'Unknown IP'} />
      </View>
    </View>
  );
});
