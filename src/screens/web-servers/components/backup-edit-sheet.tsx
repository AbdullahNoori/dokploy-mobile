import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import type { WebServerBackup, WebServerBackupUpdateRequest } from '@/types/web-servers';

type Props = {
  open: boolean;
  backup: WebServerBackup | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: WebServerBackupUpdateRequest) => Promise<boolean>;
};

export function BackupEditSheet({ open, backup, isSubmitting, onOpenChange, onSubmit }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [schedule, setSchedule] = useState('');
  const [prefix, setPrefix] = useState('');
  const [keepLatestCount, setKeepLatestCount] = useState('');

  useEffect(() => {
    if (!backup) {
      return;
    }

    setEnabled(backup.enabled !== false);
    setSchedule(backup.schedule);
    setPrefix(backup.prefix);
    setKeepLatestCount(
      typeof backup.keepLatestCount === 'number' ? String(backup.keepLatestCount) : ''
    );
  }, [backup]);

  const keepLatestValue = keepLatestCount.trim();
  const parsedKeepLatest =
    keepLatestValue.length === 0 ? null : Number.parseInt(keepLatestValue, 10);

  const validationMessage = (() => {
    if (!backup) {
      return 'Missing backup.';
    }

    if (!schedule.trim()) {
      return 'Schedule is required.';
    }

    if (!prefix.trim()) {
      return 'Prefix is required.';
    }

    if (
      keepLatestValue.length > 0 &&
      (parsedKeepLatest === null ||
        Number.isNaN(parsedKeepLatest) ||
        parsedKeepLatest < 0 ||
        !Number.isInteger(parsedKeepLatest))
    ) {
      return 'Keep latest must be a whole number greater than or equal to 0.';
    }

    return null;
  })();

  const isDirty =
    !!backup &&
    (enabled !== (backup.enabled !== false) ||
      schedule !== backup.schedule ||
      prefix !== backup.prefix ||
      keepLatestCount !==
        (typeof backup.keepLatestCount === 'number' ? String(backup.keepLatestCount) : ''));

  const handleSubmit = async () => {
    if (!backup || validationMessage || isSubmitting) {
      return;
    }

    const nextKeepLatestCount = keepLatestValue.length === 0 ? null : (parsedKeepLatest ?? null);

    const didSave = await onSubmit({
      backupId: backup.backupId,
      database: backup.database,
      databaseType: 'web-server',
      destinationId: backup.destinationId,
      enabled,
      keepLatestCount: nextKeepLatestCount,
      metadata: backup.metadata ?? null,
      prefix: prefix.trim(),
      schedule: schedule.trim(),
      serviceName: backup.serviceName,
    });

    if (didSave) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-4">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 pb-2"
          showsVerticalScrollIndicator={false}>
          <View className="gap-1">
            <Text variant="h3" className="text-2xl">
              Edit Backup
            </Text>
            <Text variant="muted">
              Update the backup job without leaving the web servers screen.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Destination</Text>
            <Input editable={false} value={backup?.destinationName ?? ''} />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Database</Text>
            <Input editable={false} value={backup?.database ?? ''} />
          </View>

          <View className="bg-card border-border/80 flex-row items-center justify-between rounded-2xl border p-4">
            <View className="flex-1 pr-4">
              <Text className="font-semibold">Enabled</Text>
              <Text variant="muted" className="text-xs">
                Pause the backup without deleting the saved configuration.
              </Text>
            </View>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Schedule</Text>
            <Input value={schedule} onChangeText={setSchedule} placeholder="0 0 * * 1-5" />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Prefix</Text>
            <Input value={prefix} onChangeText={setPrefix} placeholder="/dokploy" />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Keep Latest</Text>
            <Input
              value={keepLatestCount}
              onChangeText={setKeepLatestCount}
              keyboardType="number-pad"
              placeholder="2"
            />
          </View>

          {validationMessage ? (
            <Text className="text-destructive text-sm">{validationMessage}</Text>
          ) : null}

          <Button
            disabled={Boolean(validationMessage) || !isDirty || isSubmitting}
            onPress={handleSubmit}>
            <Text>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </Button>
        </ScrollView>
      </SheetContent>
    </Sheet>
  );
}
