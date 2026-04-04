import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { WebServerBackup } from '@/types/web-servers';

type Props = {
  backup: WebServerBackup;
  onRun: (backupId: string) => void;
  onEdit: (backup: WebServerBackup) => void;
  onDelete: (backup: WebServerBackup) => void;
  isRunning: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  disableActions: boolean;
};

function getStatusLabel(enabled: boolean | null) {
  if (enabled === true) {
    return 'Active';
  }

  if (enabled === false) {
    return 'Paused';
  }

  return 'Unknown';
}

export function BackupCard({
  backup,
  onRun,
  onEdit,
  onDelete,
  isRunning,
  isDeleting,
  isUpdating,
  disableActions,
}: Props) {
  return (
    <View className="border-border/70 bg-background rounded-2xl border p-4">
      <View className="mb-4 flex-row items-center gap-2">
        <View
          className={
            backup.enabled === false
              ? 'bg-muted-foreground size-2.5 rounded-full'
              : 'bg-primary size-2.5 rounded-full'
          }
        />
        <Text variant="muted" className="text-sm">
          {getStatusLabel(backup.enabled)}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-4">
        <View className="w-[47%] gap-1">
          <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
            Destination
          </Text>
          <Text className="font-semibold">{backup.destinationName}</Text>
        </View>
        <View className="w-[47%] gap-1">
          <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
            Database
          </Text>
          <Text className="font-semibold">{backup.database}</Text>
        </View>
        <View className="w-[47%] gap-1">
          <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
            Schedule
          </Text>
          <Text className="font-semibold">{backup.schedule || 'Not set'}</Text>
        </View>
        <View className="w-[47%] gap-1">
          <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
            Prefix
          </Text>
          <Text className="font-semibold">{backup.prefix}</Text>
        </View>
        <View className="w-[47%] gap-1">
          <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
            Keep Latest
          </Text>
          <Text className="font-semibold">
            {typeof backup.keepLatestCount === 'number' ? backup.keepLatestCount : 'Not set'}
          </Text>
        </View>
        <View className="w-[47%] gap-1">
          <Text variant="muted" className="text-xs font-semibold tracking-wide uppercase">
            Type
          </Text>
          <Text className="font-semibold">{backup.databaseType}</Text>
        </View>
      </View>

      <View className="border-border/70 mt-5 gap-2 border-t pt-4">
        <Button
          size="default"
          disabled={disableActions}
          onPress={() => onRun(backup.backupId)}
          className="w-full">
          <Text>{isRunning ? 'Running...' : 'Run Backup'}</Text>
        </Button>
        <View className="flex-row gap-2">
          <Button
            size="default"
            variant="outline"
            disabled={disableActions}
            onPress={() => onEdit(backup)}
            className="flex-1">
            <Text>{isUpdating ? 'Saving...' : 'Edit'}</Text>
          </Button>
          <Button
            size="default"
            variant="destructive"
            disabled={disableActions}
            onPress={() => onDelete(backup)}
            className="flex-1">
            <Text>{isDeleting ? 'Deleting...' : 'Delete'}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
