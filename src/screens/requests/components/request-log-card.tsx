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

const DEFAULT_META_CHIP_CLASS = 'rounded-full border border-zinc-700/80 bg-zinc-800 px-2.5 py-1';
const DEFAULT_META_TEXT_CLASS = 'text-zinc-100';
const HOST_CHIP_CLASS = 'rounded-full border border-zinc-700/70 bg-zinc-800/90 px-2.5 py-1';
const HOST_TEXT_CLASS = 'text-zinc-50';
const UNKNOWN_STATUS_CHIP_CLASS = 'border-zinc-700/80 bg-zinc-800';
const UNKNOWN_STATUS_TEXT_CLASS = 'text-zinc-100';

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
    <View className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-sm font-bold tracking-wide text-zinc-50">
            {getRequestMethod(request)}
          </Text>
          <View className={`${HOST_CHIP_CLASS} max-w-[78%]`}>
            <Text className={`${HOST_TEXT_CLASS} text-xs font-medium`} numberOfLines={1}>
              {getRequestHost(request)}
            </Text>
          </View>
        </View>
        <Text className="pt-0.5 text-xs text-zinc-400">
          {formatCompactRelativeTime(request.StartUTC ?? request.time)}
        </Text>
      </View>

      <Text className="pt-2 text-sm text-zinc-100" numberOfLines={2}>
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
