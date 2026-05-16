import { useCallback } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { EaseView, type AnimateProps, type Transition } from 'react-native-ease/uniwind';
import { Stack, useRouter } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useWebServersScreen } from '@/hooks/use-web-servers-screen';
import type { WebServerBackup } from '@/types/web-servers';

import { buildWebServerBackupEditParams } from '../../lib/backup-edit-route';
import { BackupsSection } from './components/backups-section';
import { ServerDomainCard } from './components/server-domain-card';
import { WebServersSkeleton } from './components/web-servers-skeleton';

const WEB_SERVERS_PANEL_ANIMATION: AnimateProps = { opacity: 1, translateY: 0 };
const WEB_SERVERS_PANEL_INITIAL_ANIMATION: AnimateProps = { opacity: 0, translateY: 10 };
const WEB_SERVERS_ENTER_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getWebServersTransition(delay: number, isReducedMotionEnabled: boolean): Transition {
  if (isReducedMotionEnabled) {
    return { type: 'none' };
  }

  return {
    type: 'timing',
    duration: 240,
    easing: WEB_SERVERS_ENTER_EASING,
    delay,
  };
}

export default function WebServersScreen() {
  const { isInitialLoading, settings, backups } = useWebServersScreen();
  const router = useRouter();
  const { impact, notifyError, notifySuccess, notifyWarning } = useHaptics();
  const isReducedMotionEnabled = useReducedMotion();

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
          headerTransparent: Platform.OS === 'ios',
          headerStyle: Platform.select({
            ios: { backgroundColor: 'transparent' },
            default: undefined,
          }),
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-4 py-4"
        showsVerticalScrollIndicator={false}>
        <EaseView
          initialAnimate={
            isReducedMotionEnabled
              ? WEB_SERVERS_PANEL_ANIMATION
              : WEB_SERVERS_PANEL_INITIAL_ANIMATION
          }
          animate={WEB_SERVERS_PANEL_ANIMATION}
          transition={getWebServersTransition(0, isReducedMotionEnabled)}>
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
        </EaseView>

        <EaseView
          initialAnimate={
            isReducedMotionEnabled
              ? WEB_SERVERS_PANEL_ANIMATION
              : WEB_SERVERS_PANEL_INITIAL_ANIMATION
          }
          animate={WEB_SERVERS_PANEL_ANIMATION}
          transition={getWebServersTransition(70, isReducedMotionEnabled)}>
          <BackupsSection
            status={backups.status}
            error={backups.error}
            items={backups.items}
            runningBackupId={backups.runningBackupId}
            updatingBackupId={backups.updatingBackupId}
            deletingBackupId={backups.deletingBackupId}
            isReducedMotionEnabled={isReducedMotionEnabled}
            onRetry={() => {
              void handleBackupsRetry();
            }}
            onRun={handleRunBackup}
            onEdit={handleEditBackup}
            onDelete={handleDelete}
          />
        </EaseView>
      </ScrollView>
    </SafeAreaView>
  );
}
