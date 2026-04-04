import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import {
  DEFAULT_REQUESTS_DATE_PRESET,
  REQUESTS_DATE_PRESETS,
  REQUESTS_STATUS_OPTIONS,
  type RequestsDatePreset,
  cn,
} from '@/lib/utils';
import type { SettingsRequestStatusFamily } from '@/types/settings';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datePreset: RequestsDatePreset;
  statuses: SettingsRequestStatusFamily[];
  onApply: (next: {
    datePreset: RequestsDatePreset;
    statuses: SettingsRequestStatusFamily[];
  }) => void;
};

function OptionChip({
  label,
  active,
  onPress,
  activeClassName,
  activeTextClassName,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeClassName?: string;
  activeTextClassName?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-full border px-3 py-2 active:opacity-90',
        active ? (activeClassName ?? 'border-zinc-200/80 bg-zinc-50') : 'border-border bg-secondary'
      )}>
      <Text
        className={cn(
          'text-xs font-medium',
          active ? (activeTextClassName ?? 'text-zinc-950') : 'text-secondary-foreground'
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

export function RequestsFilterSheet({ open, onOpenChange, datePreset, statuses, onApply }: Props) {
  const [draftDatePreset, setDraftDatePreset] = useState<RequestsDatePreset>(datePreset);
  const [draftStatuses, setDraftStatuses] = useState<SettingsRequestStatusFamily[]>(statuses);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftDatePreset(datePreset);
    setDraftStatuses(statuses);
  }, [datePreset, open, statuses]);

  const toggleStatus = (status: SettingsRequestStatusFamily) => {
    setDraftStatuses((prev) =>
      prev.includes(status) ? prev.filter((current) => current !== status) : [...prev, status]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-6 pb-2">
            <View className="gap-1">
              <Text className="text-lg font-semibold">Filters</Text>
              <Text variant="muted">Choose a date range and status families.</Text>
            </View>

            <View className="gap-3">
              <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
                Date Range
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {REQUESTS_DATE_PRESETS.map((preset) => (
                  <OptionChip
                    key={preset.value}
                    label={preset.label}
                    active={draftDatePreset === preset.value}
                    onPress={() => setDraftDatePreset(preset.value)}
                  />
                ))}
              </View>
            </View>

            <View className="gap-3">
              <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
                Status
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {REQUESTS_STATUS_OPTIONS.map((status) => (
                  <OptionChip
                    key={status.value}
                    label={status.label}
                    active={draftStatuses.includes(status.value)}
                    onPress={() => toggleStatus(status.value)}
                    activeClassName={status.activeChipClassName}
                    activeTextClassName={status.activeChipTextClassName}
                  />
                ))}
              </View>
            </View>

            <View className="flex-row gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => {
                  setDraftDatePreset(DEFAULT_REQUESTS_DATE_PRESET);
                  setDraftStatuses([]);
                }}>
                <Text>Reset</Text>
              </Button>
              <Button
                className="flex-1"
                onPress={() => {
                  onApply({
                    datePreset: draftDatePreset,
                    statuses: draftStatuses,
                  });
                  onOpenChange(false);
                }}>
                <Text>Apply</Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </SheetContent>
    </Sheet>
  );
}
