import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarRangeIcon, CheckIcon, SparklesIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import {
  parseRequestsFilterRouteParams,
  setPendingRequestsFilters,
} from '@/lib/requests-filter-route';
import {
  DEFAULT_REQUESTS_DATE_PRESET,
  REQUESTS_DATE_PRESETS,
  REQUESTS_STATUS_OPTIONS,
  cn,
} from '@/lib/utils';
import type { SettingsRequestStatusFamily } from '@/types/settings';

const STATUS_COPY: Record<
  SettingsRequestStatusFamily,
  {
    title: string;
    description: string;
  }
> = {
  info: {
    title: 'Informational',
    description: '1xx responses',
  },
  success: {
    title: 'Successful',
    description: '2xx responses',
  },
  redirect: {
    title: 'Redirected',
    description: '3xx responses',
  },
  client: {
    title: 'Client errors',
    description: '4xx responses',
  },
  server: {
    title: 'Server errors',
    description: '5xx responses',
  },
};

function SurfaceCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={cn('bg-card border-border/80 rounded-2xl border p-4', className)}>
      {children}
    </View>
  );
}

function DatePresetSegment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn(
        'min-h-12 flex-1 items-center justify-center rounded-xl px-3 py-2 active:opacity-90',
        active ? 'bg-background' : 'bg-transparent'
      )}>
      <Text
        className={cn(
          'text-sm font-semibold tracking-tight',
          active ? 'text-foreground' : 'text-muted-foreground'
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

function StatusRow({
  label,
  title,
  description,
  active,
  onPress,
  badgeClassName,
  badgeTextClassName,
}: {
  label: string;
  title: string;
  description: string;
  active: boolean;
  onPress: () => void;
  badgeClassName: string;
  badgeTextClassName: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={cn(
        'border-border/80 min-h-16 flex-row items-center gap-3 rounded-xl border px-4 py-3 active:opacity-90',
        active ? 'bg-secondary/60' : 'bg-background'
      )}>
      <View className={cn('rounded-lg px-2.5 py-1', badgeClassName)}>
        <Text className={cn('text-xs font-semibold', badgeTextClassName)}>{label}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-semibold">{title}</Text>
        <Text variant="muted" className="mt-0.5 text-xs">
          {description}
        </Text>
      </View>

      <View
        className={cn(
          'border-border/80 h-6 w-6 items-center justify-center rounded-full border',
          active ? 'bg-primary border-primary' : 'bg-transparent'
        )}>
        {active ? <Icon as={CheckIcon} className="text-primary-foreground size-3.5" /> : null}
      </View>
    </Pressable>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ComponentProps<typeof Icon>['as'];
  title: string;
  description: string;
}) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-2">
        <View className="bg-secondary rounded-full p-2">
          <Icon as={icon} className="text-muted-foreground size-4" />
        </View>
        <Text className="text-base font-semibold">{title}</Text>
      </View>
      <Text variant="muted" className="pl-10 text-sm">
        {description}
      </Text>
    </View>
  );
}

export default function RequestsFilterSheetScreen() {
  const params = useLocalSearchParams<{
    datePreset?: string;
    statuses?: string;
  }>();
  const router = useRouter();
  const routeDatePresetParam = params.datePreset;
  const routeStatusesParam = params.statuses;

  const routeValues = useMemo(
    () =>
      parseRequestsFilterRouteParams({
        datePreset: routeDatePresetParam,
        statuses: routeStatusesParam,
      }),
    [routeDatePresetParam, routeStatusesParam]
  );
  const [draftDatePreset, setDraftDatePreset] = useState(routeValues.datePreset);
  const [draftStatuses, setDraftStatuses] = useState<SettingsRequestStatusFamily[]>(
    routeValues.statuses
  );
  const { impact, notifySuccess, selection } = useHaptics();
  const isDefaultState =
    draftDatePreset === DEFAULT_REQUESTS_DATE_PRESET && draftStatuses.length === 0;

  useEffect(() => {
    setDraftDatePreset(routeValues.datePreset);
    setDraftStatuses(routeValues.statuses);
  }, [routeValues.datePreset, routeValues.statuses]);

  const toggleStatus = (status: SettingsRequestStatusFamily) => {
    void selection();
    setDraftStatuses((prev) =>
      prev.includes(status) ? prev.filter((current) => current !== status) : [...prev, status]
    );
  };

  const handleReset = () => {
    void selection();
    setDraftDatePreset(DEFAULT_REQUESTS_DATE_PRESET);
    setDraftStatuses([]);
  };

  const handleApply = async () => {
    await impact();
    setPendingRequestsFilters({
      datePreset: draftDatePreset,
      statuses: draftStatuses,
    });
    await notifySuccess();
    router.back();
  };

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Filters',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-6 px-4 pb-6 pt-6"
          contentContainerStyle={{ paddingBottom: 96 }}
          scrollIndicatorInsets={{ bottom: 88 }}
          showsVerticalScrollIndicator={false}>
          <View className="gap-3">
            <SectionHeader
              icon={CalendarRangeIcon}
              title="Time window"
              description="Choose how far back the request feed should look."
            />
            <SurfaceCard className="bg-secondary/60 gap-0 p-1">
              <View className="flex-row gap-1">
                {REQUESTS_DATE_PRESETS.map((preset) => (
                  <DatePresetSegment
                    key={preset.value}
                    label={preset.label}
                    active={draftDatePreset === preset.value}
                    onPress={() => {
                      void selection();
                      setDraftDatePreset(preset.value);
                    }}
                  />
                ))}
              </View>
            </SurfaceCard>
          </View>

          <View className="gap-3">
            <SectionHeader
              icon={SparklesIcon}
              title="Response families"
              description="Focus the request feed on the status ranges you want to inspect."
            />
            <View className="gap-3">
              {REQUESTS_STATUS_OPTIONS.map((status) => (
                <StatusRow
                  key={status.value}
                  label={status.label}
                  title={STATUS_COPY[status.value].title}
                  description={STATUS_COPY[status.value].description}
                  active={draftStatuses.includes(status.value)}
                  onPress={() => toggleStatus(status.value)}
                  badgeClassName={status.badgeClassName}
                  badgeTextClassName={status.badgeTextClassName}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View
          className="bg-background border-border/60 shrink-0 border-t px-4 pt-3"
          style={{ paddingBottom: 12 }}>
          <View className="flex-row gap-3">
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl"
              onPress={handleReset}
              disabled={isDefaultState}>
              <Text>{isDefaultState ? 'All clear' : 'Reset'}</Text>
            </Button>
            <Button
              className="h-12 flex-[1.25] rounded-xl"
              onPress={() => {
                void handleApply();
              }}>
              <Text>Apply filters</Text>
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
