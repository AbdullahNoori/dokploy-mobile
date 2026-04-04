import { Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useWebServersScreen } from '@/hooks/use-web-servers-screen';
import type { WebServerBackup } from '@/types/web-servers';

import { BackupsSection } from './components/backups-section';
import { ServerDomainCard } from './components/server-domain-card';
import { WebServersHeader } from './components/web-servers-header';
import { WebServersSkeleton } from './components/web-servers-skeleton';

export default function WebServersScreen() {
  const { isInitialLoading, settings, backups } = useWebServersScreen();

  const handleDelete = (backup: WebServerBackup) => {
    Alert.alert('Delete Backup', `Remove the backup configuration for ${backup.destinationName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void backups.remove(backup.backupId);
        },
      },
    ]);
  };

  const handleSettingsRetry = () => {
    void settings.retry();
  };

  const handleSettingsSave = () => {
    void settings.save();
  };

  const handleBackupsRetry = () => {
    void backups.retry();
  };

  const handleRunPrimary = () => {
    void backups.runPrimary();
  };

  const handleRunBackup = (backupId: string) => {
    void backups.run(backupId);
  };

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
        <WebServersHeader />

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
          onRetry={handleSettingsRetry}
          onSave={handleSettingsSave}
        />

        <BackupsSection
          status={backups.status}
          error={backups.error}
          items={backups.items}
          primaryBackupId={backups.primaryBackupId}
          runningBackupId={backups.runningBackupId}
          updatingBackupId={backups.updatingBackupId}
          deletingBackupId={backups.deletingBackupId}
          onRetry={handleBackupsRetry}
          onRunPrimary={handleRunPrimary}
          onRun={handleRunBackup}
          onSave={backups.save}
          onDelete={handleDelete}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
