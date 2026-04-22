import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlertIcon } from 'lucide-react-native';
import { toast } from 'sonner-native';

import { updateWebServerBackup } from '@/api/web-servers';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import {
  parseWebServerBackupEditParams,
  type WebServerBackupEditRouteParams,
} from '@/lib/backup-edit-route';
import { HttpError } from '@/lib/http-error';
import { isErrorResponse } from '@/lib/utils';
import type { WebServerBackupUpdateRequest } from '@/types/web-servers';

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.message ?? fallback;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

const SCHEDULE_OPTIONS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every weekday at midnight', value: '0 0 * * 1-5' },
  { label: 'Every Sunday at midnight', value: '0 0 * * 0' },
  { label: 'Every month on the 1st at midnight', value: '0 0 1 * *' },
] as const;

function formatScheduleOption(option: { label: string; value: string }) {
  return `${option.label} (${option.value})`;
}

export default function WebServerBackupEditScreen() {
  const params = useLocalSearchParams<WebServerBackupEditRouteParams>();
  const router = useRouter();

  const routeValues = useMemo(() => parseWebServerBackupEditParams(params), [params]);
  const [initialValues, setInitialValues] = useState(routeValues);
  const [enabled, setEnabled] = useState(routeValues.enabled);
  const [schedule, setSchedule] = useState(routeValues.schedule);
  const [prefix, setPrefix] = useState(routeValues.prefix);
  const [keepLatestCount, setKeepLatestCount] = useState(routeValues.keepLatestCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { impact, notifyError, notifySuccess, selection } = useHaptics();

  const scheduleOptions = useMemo(() => {
    const current = initialValues.schedule.trim();
    if (!current || SCHEDULE_OPTIONS.some((option) => option.value === current)) {
      return SCHEDULE_OPTIONS.map((option) => ({
        label: formatScheduleOption(option),
        value: option.value,
      }));
    }

    return [
      { label: `Current custom schedule (${current})`, value: current },
      ...SCHEDULE_OPTIONS.map((option) => ({
        label: formatScheduleOption(option),
        value: option.value,
      })),
    ];
  }, [initialValues.schedule]);

  useEffect(() => {
    if (routeValues.backupId === initialValues.backupId) {
      return;
    }

    setInitialValues(routeValues);
    setEnabled(routeValues.enabled);
    setSchedule(routeValues.schedule);
    setPrefix(routeValues.prefix);
    setKeepLatestCount(routeValues.keepLatestCount);
  }, [initialValues.backupId, routeValues]);

  const keepLatestValue = keepLatestCount.trim();
  const parsedKeepLatest =
    keepLatestValue.length === 0 ? null : Number.parseInt(keepLatestValue, 10);

  const validationMessage = useMemo(() => {
    if (!initialValues.backupId) {
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
  }, [initialValues.backupId, keepLatestValue.length, parsedKeepLatest, prefix, schedule]);

  const isDirty = useMemo(
    () =>
      enabled !== initialValues.enabled ||
      schedule !== initialValues.schedule ||
      prefix !== initialValues.prefix ||
      keepLatestCount !== initialValues.keepLatestCount,
    [enabled, initialValues, keepLatestCount, prefix, schedule]
  );

  const handleSubmit = async () => {
    if (validationMessage || isSubmitting || !isDirty) {
      if (validationMessage) {
        await notifyError();
      }
      return;
    }

    await impact();
    setIsSubmitting(true);

    const payload: WebServerBackupUpdateRequest = {
      backupId: initialValues.backupId,
      database: initialValues.database,
      databaseType: 'web-server',
      destinationId: initialValues.destinationId,
      enabled,
      keepLatestCount: keepLatestValue.length === 0 ? null : (parsedKeepLatest ?? null),
      metadata: initialValues.metadata,
      prefix: prefix.trim(),
      schedule: schedule.trim(),
      serviceName: initialValues.serviceName,
    };

    try {
      const result = await updateWebServerBackup(payload);
      if (isErrorResponse(result)) {
        await notifyError();
        toast.error(result.message ?? result.error ?? 'Unable to update backup.');
        return;
      }

      await notifySuccess();
      toast.success('Backup updated.');
      router.back();
    } catch (error) {
      await notifyError();
      toast.error(resolveErrorMessage(error, 'Unable to update backup.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnabledChange = (nextValue: boolean) => {
    void selection();
    setEnabled(nextValue);
  };

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Edit Backup',
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: 'height', android: 'height' })}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-4 py-4"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}>
          <View className="gap-2">
            <Text className="text-sm font-semibold">Destination</Text>
            <Input editable={false} value={initialValues.destinationName} />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Database</Text>
            <Input editable={false} value={initialValues.database} />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold">Schedule</Text>
              <Icon as={CircleAlertIcon} className="text-muted-foreground size-4" />
            </View>
            <Select
              value={schedule}
              onValueChange={setSchedule}
              options={scheduleOptions}
              placeholder="Select a predefined schedule"
            />
            <Text variant="muted" className="text-xs">
              Choose from the supported backup schedules.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Prefix Destination</Text>
            <Input
              value={prefix}
              onChangeText={setPrefix}
              placeholder="/dokploy"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text variant="muted" className="text-xs">
              Use if you want to back up in a specific path of your destination or bucket.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-sm font-semibold">Keep the latest</Text>
            <Input
              value={keepLatestCount}
              onChangeText={setKeepLatestCount}
              keyboardType="number-pad"
              placeholder="2"
            />
            <Text variant="muted" className="text-xs">
              Optional. If provided, only keeps the latest N backups in the cloud.
            </Text>
          </View>

          <View className="bg-background border-border/70 flex-row items-center justify-between rounded-2xl border p-4">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-semibold">Enabled</Text>
              <Text variant="muted" className="text-xs">
                Enable or disable the backup.
              </Text>
            </View>
            <Switch
              checked={enabled}
              onCheckedChange={handleEnabledChange}
              accessibilityLabel="Enabled"
            />
          </View>

          {validationMessage ? (
            <Text className="text-destructive text-sm">{validationMessage}</Text>
          ) : null}

          <Button
            disabled={Boolean(validationMessage) || !isDirty || isSubmitting}
            onPress={handleSubmit}
            className="mt-2">
            <Text>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
