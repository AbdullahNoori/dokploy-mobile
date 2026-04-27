import { Pressable, ScrollView, View } from 'react-native';

import { Select, type SelectOption } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  cn,
  LOG_VIEWPORT_HEIGHT,
  SEVERITY_PILL_WIDTH,
  TIMESTAMP_COLUMN_WIDTH,
  type LogPalette,
} from '@/lib/utils';

import { LogLine } from './item-detail-log-line';

type HeaderProps = {
  detail: string;
  palette: LogPalette;
};

type SourceSelectProps = {
  value: string;
  options: SelectOption[];
  onValueChange: (containerId: string) => void;
  palette: LogPalette;
};

type ViewportProps = {
  lines: string[];
  isConnecting: boolean;
  isEmpty: boolean;
  error: string | null;
  onReconnect: () => void;
  palette: LogPalette;
};

export function LogPanelHeader({ detail, palette }: HeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between gap-3 border-b px-4 py-3"
      style={{ borderColor: palette.border, backgroundColor: palette.chrome }}>
      <View className="min-w-0 flex-1">
        <Text
          className="font-mono text-[11px] tracking-[2px] uppercase"
          style={{ color: palette.muted }}>
          Container logs
        </Text>
        <Text
          className="mt-1 font-mono text-[12px]"
          style={{ color: palette.text }}
          numberOfLines={1}>
          {detail}
        </Text>
      </View>
    </View>
  );
}

export function LogSourceSelect({ value, options, onValueChange, palette }: SourceSelectProps) {
  return (
    <View
      className="gap-2 border-b px-3.5 pt-0 pb-3"
      style={{ borderColor: palette.border, backgroundColor: palette.chrome }}>
      <Select
        value={value}
        onValueChange={onValueChange}
        options={options}
        placeholder="Select a container"
      />
    </View>
  );
}

export function LogViewport({
  lines,
  isConnecting,
  isEmpty,
  error,
  onReconnect,
  palette,
}: ViewportProps) {
  const showInlineSkeleton = isConnecting && lines.length === 0;
  const showWaitingState = isEmpty && !isConnecting && !error;

  return (
    <View
      style={{
        minHeight: LOG_VIEWPORT_HEIGHT,
        maxHeight: LOG_VIEWPORT_HEIGHT,
        backgroundColor: palette.bg,
      }}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}>
        <View className="flex-row justify-end gap-2 px-4 pb-2">
          {error ? (
            <Pressable
              className="rounded-md border px-2 py-1 active:opacity-80"
              style={{ borderColor: palette.border, backgroundColor: palette.chrome }}
              onPress={onReconnect}>
              <Text
                className="font-mono text-[10px] tracking-[1.4px] uppercase"
                style={{ color: palette.text }}>
                Reconnect
              </Text>
            </Pressable>
          ) : null}
        </View>

        {showInlineSkeleton ? (
          <View className="gap-3 px-4 py-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <View key={index} className="flex-row items-start gap-3">
                <Skeleton className="bg-muted/30 mt-1 h-7 w-3 rounded-full" />
                <Skeleton
                  className="bg-muted/30 mt-1 h-3 rounded-full"
                  style={{ width: TIMESTAMP_COLUMN_WIDTH }}
                />
                <Skeleton
                  className="bg-muted/30 mt-1 h-6 rounded-full"
                  style={{ width: SEVERITY_PILL_WIDTH }}
                />
                <Skeleton
                  className={cn(
                    'bg-muted/30 h-3 rounded-full',
                    index % 3 === 0 ? 'w-10/12' : index % 3 === 1 ? 'w-7/12' : 'w-9/12'
                  )}
                />
              </View>
            ))}
          </View>
        ) : null}

        {lines.map((line, index) => (
          <LogLine key={`${index}-${line}`} line={line} palette={palette} />
        ))}

        {showWaitingState ? (
          <View className="px-4 py-6">
            <Text className="font-mono text-sm" style={{ color: palette.text }}>
              Waiting for output…
            </Text>
            <Text className="mt-2 font-mono text-xs leading-5" style={{ color: palette.muted }}>
              The connection is open, but this container has not emitted any log lines yet.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View className="px-4 py-3">
            <Text className="font-mono text-xs leading-5" style={{ color: palette.error }}>
              {error}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
