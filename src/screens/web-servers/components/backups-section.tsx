import { useState } from 'react';
import { View } from 'react-native';
import { DatabaseIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import type { WebServerBackup, WebServerBackupUpdateRequest } from '@/types/web-servers';

import { BackupCard } from './backup-card';
import { BackupEditSheet } from './backup-edit-sheet';
import { WebServersEmptyState } from './web-servers-empty';
import { WebServersErrorState } from './web-servers-error';

type Props = {
  status: 'loading' | 'ready' | 'error' | 'unauthorized';
  error: {
    kind: 'error' | 'unauthorized';
    message: string;
  } | null;
  items: WebServerBackup[];
  primaryBackupId: string | null;
  runningBackupId: string | null;
  updatingBackupId: string | null;
  deletingBackupId: string | null;
  onRetry: () => void;
  onRunPrimary: () => void;
  onRun: (backupId: string) => void;
  onSave: (payload: WebServerBackupUpdateRequest) => Promise<boolean>;
  onDelete: (backup: WebServerBackup) => void;
};

export function BackupsSection({
  status,
  error,
  items,
  primaryBackupId,
  runningBackupId,
  updatingBackupId,
  deletingBackupId,
  onRetry,
  onRunPrimary,
  onRun,
  onSave,
  onDelete,
}: Props) {
  const [editingBackup, setEditingBackup] = useState<WebServerBackup | null>(null);
  const disableSectionActions = Boolean(runningBackupId || updatingBackupId || deletingBackupId);

  return (
    <>
      <View className="bg-card border-border/80 overflow-hidden rounded-3xl border">
        <View className="border-border/70 gap-3 border-b px-4 py-4">
          <View className="flex-row items-start gap-3">
            <View className="mt-0.5 size-10 items-center justify-center rounded-2xl bg-transparent">
              <Icon as={DatabaseIcon} className="size-5" />
            </View>
            <View className="flex-1 gap-1">
              <Text variant="h3" className="text-2xl">
                Backups
              </Text>
              <Text variant="muted">
                Inspect web-server backup jobs and run supported actions without leaving settings.
              </Text>
            </View>
          </View>
          <Button
            size="default"
            variant="outline"
            disabled={!primaryBackupId || disableSectionActions}
            onPress={onRunPrimary}
            className="w-full">
            <Text>{runningBackupId === primaryBackupId ? 'Running...' : 'Run Backup Now'}</Text>
          </Button>
        </View>

        {status === 'loading' ? (
          <View className="gap-3 p-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <View
                key={`web-server-backup-inline-skeleton-${index}`}
                className="border-border/70 gap-3 rounded-2xl border p-4">
                <Skeleton className="h-4 w-20 rounded" />
                <View className="flex-row flex-wrap gap-3">
                  <Skeleton className="h-12 w-[48%] rounded-xl" />
                  <Skeleton className="h-12 w-[48%] rounded-xl" />
                  <Skeleton className="h-12 w-[48%] rounded-xl" />
                  <Skeleton className="h-12 w-[48%] rounded-xl" />
                </View>
                <View className="border-border/70 gap-2 border-t pt-4">
                  <Skeleton className="h-10 rounded-md" />
                  <View className="flex-row gap-2">
                    <Skeleton className="h-10 flex-1 rounded-md" />
                    <Skeleton className="h-10 flex-1 rounded-md" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : status === 'error' || status === 'unauthorized' ? (
          <View className="p-4">
            <WebServersErrorState
              kind={error?.kind}
              message={error?.message ?? 'Unable to load backups.'}
              onAction={onRetry}
            />
          </View>
        ) : items.length === 0 ? (
          <View className="p-4">
            <WebServersEmptyState
              title="No backups yet"
              message="Backups will appear here once a web-server backup job is available."
            />
          </View>
        ) : (
          <View className="gap-3 p-4">
            {items.map((backup) => (
              <BackupCard
                key={backup.backupId}
                backup={backup}
                onRun={onRun}
                onEdit={setEditingBackup}
                onDelete={onDelete}
                isRunning={runningBackupId === backup.backupId}
                isDeleting={deletingBackupId === backup.backupId}
                isUpdating={updatingBackupId === backup.backupId}
                disableActions={disableSectionActions}
              />
            ))}
          </View>
        )}
      </View>

      <BackupEditSheet
        open={Boolean(editingBackup)}
        backup={editingBackup}
        isSubmitting={Boolean(editingBackup && updatingBackupId === editingBackup.backupId)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBackup(null);
          }
        }}
        onSubmit={onSave}
      />
    </>
  );
}
