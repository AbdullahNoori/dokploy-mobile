import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { useUniwind } from 'uniwind';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useContainerLogSocket } from '@/hooks/use-container-log-socket';
import { useHaptics } from '@/hooks/use-haptics';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

type Props = {
  hasLookupName: boolean;
  selectedContainerId?: string;
  isLookupLoading: boolean;
  lookupError: string | null;
  onRetryLookup: () => void;
};

const LOG_VIEWPORT_HEIGHT = 360;
const TIMESTAMP_COLUMN_WIDTH = 164;
const SEVERITY_PILL_WIDTH = 58;

type LogRowTone = 'default' | 'info' | 'debug' | 'warn' | 'error' | 'success';
type ParsedLogRow = {
  timestampLabel: string;
  message: string;
  severity: LogRowTone;
};
type LogPalette = {
  bg: string;
  surface: string;
  chrome: string;
  border: string;
  text: string;
  muted: string;
  line: string;
  warn: string;
  error: string;
  success: string;
  info: string;
  debug: string;
  statusConnected: string;
  statusConnecting: string;
  statusIdle: string;
  accentInfoBg: string;
  accentDebugBg: string;
  accentWarnBg: string;
  accentErrorBg: string;
  accentSuccessBg: string;
  accentDefaultBg: string;
  rowWarnBg: string;
  rowDebugBg: string;
  rowSuccessBg: string;
  monoFont: string;
};
type TonePresentation = {
  label: string;
  textColor: string;
  pillBackground: string;
  accentBackground: string;
  rowBackground?: string;
};

const LEADING_TIMESTAMP_PATTERN =
  /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)(?:\s+|$)(.*)$/;

function escapeMarkdownLine(value: string) {
  if (value.length === 0) {
    return '\u00A0';
  }

  return value.replace(/\\/g, '\\\\').replace(/([`*_{}\[\]()#+\-.!>|])/g, '\\$1');
}

function getLogRowTone(value: string): LogRowTone {
  const normalized = value.toLowerCase();

  if (
    normalized.includes(' debug ') ||
    normalized.startsWith('debug') ||
    normalized.includes('django version')
  ) {
    return 'debug';
  }

  if (
    normalized.includes(' info ') ||
    normalized.startsWith('info') ||
    normalized.includes('syntaxwarning') ||
    normalized.includes('system check') ||
    normalized.includes('quit the server')
  ) {
    return 'info';
  }

  if (
    normalized.includes(' error ') ||
    normalized.startsWith('error') ||
    normalized.includes('failed') ||
    normalized.includes('exception')
  ) {
    return 'error';
  }

  if (normalized.includes(' warn ') || normalized.startsWith('warn')) {
    return 'warn';
  }

  if (
    normalized.includes('ready') ||
    normalized.includes('listening') ||
    normalized.includes('passed') ||
    normalized.includes('starting asgi') ||
    normalized.includes('development server')
  ) {
    return 'success';
  }

  return 'default';
}

function formatLogTimestamp(value: string) {
  const normalized = value.endsWith('Z') ? value : `${value}Z`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(parsed);
}

function parseLogRow(line: string): ParsedLogRow {
  const match = line.match(LEADING_TIMESTAMP_PATTERN);
  const timestampLabel = match ? formatLogTimestamp(match[1]) : '';
  const message = match ? match[2].trim() || line : line;

  return {
    timestampLabel,
    message,
    severity: getLogRowTone(message),
  };
}

function getTonePresentation(tone: LogRowTone, palette: LogPalette): TonePresentation {
  switch (tone) {
    case 'info':
      return {
        label: 'info',
        textColor: palette.info,
        pillBackground: palette.accentInfoBg,
        accentBackground: palette.accentInfoBg,
      };
    case 'debug':
      return {
        label: 'debug',
        textColor: palette.debug,
        pillBackground: palette.accentDebugBg,
        accentBackground: palette.accentDebugBg,
        rowBackground: palette.rowDebugBg,
      };
    case 'warn':
      return {
        label: 'warn',
        textColor: palette.warn,
        pillBackground: palette.accentWarnBg,
        accentBackground: palette.accentWarnBg,
        rowBackground: palette.rowWarnBg,
      };
    case 'error':
      return {
        label: 'error',
        textColor: palette.error,
        pillBackground: palette.accentErrorBg,
        accentBackground: palette.accentErrorBg,
      };
    case 'success':
      return {
        label: 'ok',
        textColor: palette.success,
        pillBackground: palette.accentSuccessBg,
        accentBackground: palette.accentSuccessBg,
        rowBackground: palette.rowSuccessBg,
      };
    default:
      return {
        label: '',
        textColor: palette.line,
        pillBackground: 'transparent',
        accentBackground: palette.accentDefaultBg,
      };
  }
}

function TerminalSkeleton() {
  return (
    <View className="border-border/80 bg-card mt-4 overflow-hidden rounded-2xl border">
      <View className="border-border/70 bg-muted/25 flex-row items-center justify-between border-b px-4 py-3">
        <Skeleton className="h-3.5 w-40 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-md" />
      </View>
      <View className="bg-background px-4 py-4" style={{ minHeight: LOG_VIEWPORT_HEIGHT }}>
        <View className="gap-3">
          <Skeleton className="bg-muted/40 h-3 w-44 rounded-full" />
          {Array.from({ length: 8 }).map((_, index) => (
            <View key={index} className="flex-row items-start gap-3">
              <Skeleton className="bg-muted/35 mt-1 h-3 w-8 rounded-full" />
              <Skeleton
                className={cn(
                  'bg-muted/35 h-3 rounded-full',
                  index % 3 === 0 ? 'w-11/12' : index % 3 === 1 ? 'w-8/12' : 'w-10/12'
                )}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function TerminalEmpty({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="border-border/80 bg-card mt-4 overflow-hidden rounded-2xl border">
      <View className="border-border/70 bg-muted/25 border-b px-4 py-3">
        <Text className="text-muted-foreground font-mono text-xs tracking-[2px] uppercase">
          Logs
        </Text>
      </View>
      <View
        className="bg-background items-start justify-center px-4 py-5"
        style={{ minHeight: LOG_VIEWPORT_HEIGHT }}>
        <Text className="text-foreground font-mono text-sm">{title}</Text>
        <Text variant="muted" className="mt-2 max-w-[28rem] font-mono leading-6">
          {description}
        </Text>
        {actionLabel && onAction ? (
          <Pressable
            className="border-border/80 bg-muted/30 mt-4 rounded-md border px-3 py-2 active:opacity-80"
            onPress={onAction}>
            <Text className="font-mono text-xs tracking-[1.6px] uppercase">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function LogLine({ line, palette }: { line: string; palette: LogPalette }) {
  const row = parseLogRow(line);
  const presentation = getTonePresentation(row.severity, palette);
  const messageColor = presentation.textColor || palette.line;
  const hasTimestamp = Boolean(row.timestampLabel);
  const hasSeverity = Boolean(presentation.label);

  return (
    <View
      className="mx-4 mb-1.5 flex-row items-start gap-3 rounded-md px-0 py-0.5"
      style={{
        backgroundColor: presentation.rowBackground,
      }}>
      <View
        className="mt-1 rounded-full"
        style={{ width: 3, minHeight: 20, backgroundColor: presentation.accentBackground }}
      />
      {hasTimestamp ? (
        <Text
          className="pt-0.5 font-mono text-[11px] leading-5"
          style={{ width: TIMESTAMP_COLUMN_WIDTH, color: palette.muted }}>
          {row.timestampLabel}
        </Text>
      ) : null}
      {hasSeverity ? (
        <View
          className="mt-0.5 items-center self-start rounded-full px-2 py-1"
          style={{
            minWidth: SEVERITY_PILL_WIDTH,
            backgroundColor: presentation.pillBackground,
          }}>
          <Text
            className="font-mono text-[10px] tracking-[1.2px] uppercase"
            style={{ color: presentation.textColor }}>
            {presentation.label}
          </Text>
        </View>
      ) : null}
      <View className="flex-1 pt-0.5">
        <EnrichedMarkdownText
          markdown={escapeMarkdownLine(row.message)}
          allowTrailingMargin={false}
          selectable
          containerStyle={{ flex: 1 }}
          markdownStyle={{
            paragraph: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontSize: 12,
              lineHeight: 20,
              marginTop: 0,
              marginBottom: 0,
            },
            strong: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontWeight: 'normal',
            },
            em: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontStyle: 'normal',
            },
            code: {
              color: messageColor,
              fontFamily: palette.monoFont,
              fontSize: 12,
              backgroundColor: 'transparent',
              borderColor: 'transparent',
            },
            link: {
              color: messageColor,
              underline: false,
              fontFamily: palette.monoFont,
            },
          }}
        />
      </View>
    </View>
  );
}

export function ItemDetailLogs({
  hasLookupName,
  selectedContainerId,
  isLookupLoading,
  lookupError,
  onRetryLookup,
}: Props) {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const { impact } = useHaptics();
  const palette = useMemo(
    () => ({
      bg: THEME[resolvedTheme].background,
      surface: THEME[resolvedTheme].card,
      chrome: THEME[resolvedTheme].muted,
      border: THEME[resolvedTheme].border,
      text: THEME[resolvedTheme].foreground,
      muted: THEME[resolvedTheme].mutedForeground,
      warn: THEME[resolvedTheme].chart4,
      error: THEME[resolvedTheme].destructive,
      success: THEME[resolvedTheme].chart2,
      info: THEME[resolvedTheme].foreground,
      debug: THEME[resolvedTheme].mutedForeground,
      line: THEME[resolvedTheme].foreground,
      statusConnected: THEME[resolvedTheme].chart2,
      statusConnecting: THEME[resolvedTheme].chart4,
      statusIdle: THEME[resolvedTheme].mutedForeground,
      accentInfoBg: resolvedTheme === 'dark' ? 'hsla(0 0% 64% / 0.35)' : 'hsla(0 0% 30% / 0.18)',
      accentDebugBg: resolvedTheme === 'dark' ? 'hsla(0 0% 64% / 0.28)' : 'hsla(0 0% 30% / 0.14)',
      accentWarnBg:
        resolvedTheme === 'dark' ? 'hsla(43 74% 66% / 0.55)' : 'hsla(43 74% 42% / 0.22)',
      accentErrorBg: resolvedTheme === 'dark' ? 'hsla(0 71% 59% / 0.55)' : 'hsla(0 84% 48% / 0.22)',
      accentSuccessBg:
        resolvedTheme === 'dark' ? 'hsla(160 60% 45% / 0.5)' : 'hsla(173 58% 34% / 0.2)',
      accentDefaultBg: resolvedTheme === 'dark' ? 'hsla(0 0% 64% / 0.22)' : 'hsla(0 0% 30% / 0.12)',
      rowWarnBg: resolvedTheme === 'dark' ? 'hsla(43 74% 66% / 0.08)' : 'hsla(43 74% 66% / 0.16)',
      rowDebugBg: resolvedTheme === 'dark' ? 'hsla(0 0% 64% / 0.05)' : 'hsla(0 0% 30% / 0.05)',
      rowSuccessBg:
        resolvedTheme === 'dark' ? 'hsla(160 60% 45% / 0.07)' : 'hsla(173 58% 39% / 0.12)',
      monoFont: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
        default: 'monospace',
      }),
    }),
    [resolvedTheme]
  );

  const { lines, isConnecting, isConnected, error, reconnect, isEmpty } = useContainerLogSocket({
    containerId: selectedContainerId,
    enabled: Boolean(selectedContainerId),
  });

  const handleReconnect = () => {
    void impact();
    reconnect();
  };

  const connectionLabel = isConnected
    ? 'Live'
    : isConnecting
      ? 'Connecting'
      : error
        ? 'Interrupted'
        : 'Idle';
  const statusToneColor = isConnected
    ? palette.statusConnected
    : isConnecting
      ? palette.statusConnecting
      : error
        ? palette.error
        : palette.statusIdle;

  if (!hasLookupName) {
    return (
      <TerminalEmpty
        title="Logs unavailable"
        description="This item does not expose a lookup name for container logs yet."
      />
    );
  }

  if (isLookupLoading) {
    return <TerminalSkeleton />;
  }

  if (lookupError) {
    return (
      <TerminalEmpty
        title="Lookup failed"
        description={lookupError}
        actionLabel="Retry lookup"
        onAction={onRetryLookup}
      />
    );
  }

  if (!selectedContainerId) {
    return (
      <TerminalEmpty
        title="No containers found"
        description="No matching container IDs were returned for this service."
      />
    );
  }

  const showInlineSkeleton = isConnecting && lines.length === 0;
  const showWaitingState = isEmpty && !isConnecting && !error;

  return (
    <View
      className="mt-4 overflow-hidden rounded-2xl border"
      style={{ borderColor: palette.border, backgroundColor: palette.surface }}>
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
            {selectedContainerId}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: statusToneColor }} />
          <Text
            className="font-mono text-[11px] tracking-[1.6px] uppercase"
            style={{ color: palette.muted }}>
            {connectionLabel}
          </Text>
        </View>
      </View>

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
                onPress={handleReconnect}>
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

      <View
        className="border-t px-4 py-2"
        style={{ borderColor: palette.border, backgroundColor: palette.chrome }}>
        <Text
          className="font-mono text-[10px] tracking-[1.4px] uppercase"
          style={{ color: palette.muted }}>
          {lines.length} lines buffered
        </Text>
      </View>
    </View>
  );
}
