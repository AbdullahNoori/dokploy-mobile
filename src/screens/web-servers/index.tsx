import { useCallback } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { useWebServersScreen } from '@/hooks/use-web-servers-screen';
import type { WebServerBackup } from '@/types/web-servers';

import { buildWebServerBackupEditParams } from '../../lib/backup-edit-route';
import { BackupsSection } from './components/backups-section';
import { ServerDomainCard } from './components/server-domain-card';
import { WebServersSkeleton } from './components/web-servers-skeleton';

export default function WebServersScreen() {
  const { isInitialLoading, settings, backups } = useWebServersScreen();
  const router = useRouter();
  const { impact, notifyError, notifySuccess, notifyWarning } = useHaptics();

  const confirmDelete = useCallback(
    (backup: WebServerBackup) => {
      Alert.alert(
        'Delete Backup',
        `Remove the backup configuration for ${backup.destinationName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void backups.remove(backup.backupId);
            },
          },
        ]
      );
    },
    [backups.remove]
  );

  const handleDelete = useCallback(
    (backup: WebServerBackup) => {
      void notifyWarning();
      confirmDelete(backup);
    },
    [confirmDelete, notifyWarning]
  );

  const handleSettingsRetry = useCallback(async () => {
    await impact();
    const didRetry = await settings.retry();
    if (didRetry) {
      await notifySuccess();
    } else {
      await notifyError();
    }
  }, [impact, notifyError, notifySuccess, settings]);

  const handleSettingsSave = useCallback(() => {
    settings.save();
  }, [settings.save]);

  const handleBackupsRetry = useCallback(async () => {
    await impact();
    const didRetry = await backups.retry();
    if (didRetry) {
      await notifySuccess();
    } else {
      await notifyError();
    }
  }, [backups, impact, notifyError, notifySuccess]);

  const handleRunBackup = useCallback(
    (backupId: string) => {
      backups.run(backupId);
    },
    [backups.run]
  );

  const handleEditBackup = useCallback(
    (backup: WebServerBackup) => {
      void impact();
      router.push({
        pathname: '/(app)/modals/web-server-backup-edit',
        params: buildWebServerBackupEditParams(backup),
      });
    },
    [impact, router]
  );

  if (isInitialLoading) {
    return <WebServersSkeleton />;
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Web Servers',
          headerShown: true,
          headerTransparent: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-4 py-4"
        showsVerticalScrollIndicator={false}>
        <ServerDomainCard
          status={settings.status}
          value={settings.value}
          error={settings.error}
          validationMessage={settings.validationMessage}
          isSaving={settings.isSaving}
          canSave={settings.canSave}
          onChangeHost={settings.setHost}
          onChangeLetsEncryptEmail={settings.setLetsEncryptEmail}
          onChangeHttps={settings.setHttps}
          onChangeCertificateType={settings.setCertificateType}
          onRetry={() => {
            void handleSettingsRetry();
          }}
          onSave={handleSettingsSave}
        />

        <BackupsSection
          status={backups.status}
          error={backups.error}
          items={backups.items}
          runningBackupId={backups.runningBackupId}
          updatingBackupId={backups.updatingBackupId}
          deletingBackupId={backups.deletingBackupId}
          onRetry={() => {
            void handleBackupsRetry();
          }}
          onRun={handleRunBackup}
          onEdit={handleEditBackup}
          onDelete={handleDelete}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
