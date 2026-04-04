import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { ArrowDownIcon, RotateCwIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  lines: string[];
  hasLogPath: boolean;
  isEmpty: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  onReconnect: () => void;
};

const getConnectionLabel = (isConnecting: boolean, isConnected: boolean, error: string | null) => {
  if (isConnecting) {
    return 'Connecting';
  }

  if (isConnected) {
    return 'Connected';
  }

  if (error) {
    return 'Disconnected';
  }

  return 'Idle';
};

const FOLLOW_THRESHOLD_PX = 40;

export function DeploymentLogViewer({
  title,
  lines,
  hasLogPath,
  isEmpty,
  isConnecting,
  isConnected,
  error,
  onReconnect,
}: Props) {
  const scrollRef = useRef<ScrollView | null>(null);
  const previousLineCountRef = useRef(0);
  const isFollowingRef = useRef(true);
  const [isFollowing, setIsFollowing] = useState(true);
  const [hasUnseenUpdates, setHasUnseenUpdates] = useState(false);
  const connectionLabel = getConnectionLabel(isConnecting, isConnected, error);
  const statusDetail = !hasLogPath
    ? 'Log file unavailable'
    : isConnecting && isEmpty
      ? 'Opening live stream'
      : error
        ? lines.length > 0
          ? 'Connection lost. Showing recent output.'
          : 'Connection issue'
        : isEmpty
          ? 'Waiting for the first log lines'
          : hasUnseenUpdates
            ? 'New logs available'
            : 'Following latest output';
  const connectionBadgeClassName = cn(
    'rounded-full border px-2.5 py-1',
    error
      ? 'border-destructive/30 bg-destructive/10'
      : isConnected
        ? 'border-emerald-500/20 bg-emerald-500/10'
        : 'border-border/80 bg-background/80'
  );

  const setFollowingState = useCallback((nextValue: boolean) => {
    isFollowingRef.current = nextValue;
    setIsFollowing(nextValue);

    if (nextValue) {
      setHasUnseenUpdates(false);
    }
  }, []);

  const scrollToLatest = useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const nextIsFollowing = distanceFromBottom <= FOLLOW_THRESHOLD_PX;

      if (nextIsFollowing !== isFollowingRef.current) {
        setFollowingState(nextIsFollowing);
      }
    },
    [setFollowingState]
  );

  const handleJumpToLatest = useCallback(() => {
    setFollowingState(true);
    scrollToLatest(true);
  }, [scrollToLatest, setFollowingState]);

  useEffect(() => {
    if (lines.length === 0) {
      previousLineCountRef.current = 0;
      setFollowingState(true);
      return;
    }

    const previousLineCount = previousLineCountRef.current;
    previousLineCountRef.current = lines.length;

    if (previousLineCount === 0) {
      setFollowingState(true);
      scrollToLatest(false);
      return;
    }

    if (lines.length <= previousLineCount) {
      return;
    }

    if (isFollowingRef.current) {
      scrollToLatest(true);
      return;
    }

    setHasUnseenUpdates(true);
  }, [lines.length, scrollToLatest, setFollowingState]);

  return (
    <View className="gap-3">
      <View className="bg-muted/20 rounded-xl px-1 py-1">
        <View className="flex-row items-center justify-between gap-3 px-3 py-2">
          <Text className="flex-1 text-base font-medium tracking-tight" numberOfLines={1}>
            {title}
          </Text>
          <View className={connectionBadgeClassName}>
            <Text className="text-[11px] font-semibold tracking-tight">{connectionLabel}</Text>
          </View>
        </View>
        {hasLogPath && error && lines.length > 0 ? (
          <View className="items-end px-2 pb-2">
            <Button variant="ghost" size="sm" className="h-8 px-2" onPress={onReconnect}>
              <Icon as={RotateCwIcon} className="size-4" />
              <Text>Reconnect</Text>
            </Button>
          </View>
        ) : null}
      </View>

      {!hasLogPath ? (
        <View className="min-h-52 justify-center px-1 py-4">
          <Text className="text-base font-medium">Log file unavailable</Text>
          <Text variant="muted" className="mt-1">
            This deployment does not expose a log path yet.
          </Text>
        </View>
      ) : null}

      {hasLogPath && isConnecting && isEmpty ? (
        <View className="min-h-52 flex-row items-center gap-3 px-1 py-4">
          <ActivityIndicator size="small" />
          <View className="flex-1">
            <Text className="text-base font-medium">Opening live stream</Text>
            <Text variant="muted" className="mt-1">
              Waiting for the first log lines to arrive.
            </Text>
          </View>
        </View>
      ) : null}

      {hasLogPath && error && isEmpty ? (
        <View className="min-h-52 justify-center gap-4 px-1 py-4">
          <View>
            <Text className="text-destructive text-base font-semibold">Connection issue</Text>
            <Text variant="muted" className="mt-1">
              {error}
            </Text>
          </View>
          <Button variant="secondary" size="sm" className="gap-2 self-start" onPress={onReconnect}>
            <Icon as={RotateCwIcon} className="text-secondary-foreground size-4" />
            <Text>Reconnect</Text>
          </Button>
        </View>
      ) : null}

      {hasLogPath && !isConnecting && !error && isEmpty ? (
        <View className="min-h-52 justify-center px-1 py-4">
          <Text className="text-base font-medium">No log output yet</Text>
          <Text variant="muted" className="mt-1">
            The connection is open, but no log lines have been received for this deployment yet.
          </Text>
        </View>
      ) : null}

      {lines.length > 0 ? (
        <View className="relative">
          <View className="border-border/80 bg-background/70 mx-1 overflow-hidden rounded-2xl border">
            <View className="bg-muted/35 mx-3 mt-3 mb-2 h-2 rounded-full" />
            <ScrollView
              ref={scrollRef}
              className="max-h-[34rem] px-2"
              contentContainerClassName={cn('gap-2.5 px-1 py-2', !isFollowing && 'pb-16')}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator>
              {lines.map((line, index) => (
                <View
                  key={`${index}-${line}`}
                  className={cn(
                    'rounded-md border px-3 py-2',
                    index % 2 === 0
                      ? 'border-border/45 bg-background/55'
                      : 'border-border/30 bg-background/20'
                  )}>
                  <Text className="text-foreground/95 font-mono text-sm leading-7">{line}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {!isFollowing ? (
            <View className="absolute inset-x-0 bottom-0 items-end px-0 pb-2">
              <Button
                size="sm"
                variant="secondary"
                className="border-border/70 bg-background/95 gap-2 border shadow-sm shadow-black/10"
                onPress={handleJumpToLatest}>
                <Icon as={ArrowDownIcon} className="text-secondary-foreground size-4" />
                <Text>{hasUnseenUpdates ? 'New logs available' : 'Jump to latest'}</Text>
              </Button>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
