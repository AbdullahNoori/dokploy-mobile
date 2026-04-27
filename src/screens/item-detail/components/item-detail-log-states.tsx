import { Pressable, View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { cn, LOG_VIEWPORT_HEIGHT } from '@/lib/utils';

type TerminalEmptyProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function TerminalSkeleton() {
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

export function TerminalEmpty({ title, description, actionLabel, onAction }: TerminalEmptyProps) {
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
