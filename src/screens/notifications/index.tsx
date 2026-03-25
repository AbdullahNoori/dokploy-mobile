import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Stack } from 'expo-router';

import { NotificationsNameCard } from './components/notifications-name-card';
import { NotificationsSectionHeader } from './components/notifications-section-header';
import { NotificationsToggleRow } from './components/notifications-toggle-row';

type NotificationToggle = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

type NotificationSection = {
  title: string;
  items: NotificationToggle[];
};

const SECTIONS: NotificationSection[] = [
  {
    title: 'Build & Deploy',
    items: [
      {
        id: 'app-deploy',
        title: 'App Deploy',
        description: 'Trigger when an app deploy completes.',
        enabled: false,
      },
      {
        id: 'build-error',
        title: 'Build Error',
        description: 'Trigger when a build fails.',
        enabled: false,
      },
    ],
  },
  {
    title: 'Data Protection',
    items: [
      {
        id: 'db-backup',
        title: 'Database Backup',
        description: 'Trigger when a database backup is created.',
        enabled: false,
      },
      {
        id: 'volume-backup',
        title: 'Volume Backup',
        description: 'Trigger when a volume backup is created.',
        enabled: false,
      },
    ],
  },
  {
    title: 'System & Maintenance',
    items: [
      {
        id: 'docker-cleanup',
        title: 'Docker Cleanup',
        description: 'Trigger after a Docker cleanup finishes.',
        enabled: false,
      },
      {
        id: 'dokploy-restart',
        title: 'Dokploy Restart',
        description: 'Trigger after the Dokploy service restarts.',
        enabled: false,
      },
    ],
  },
];

export default function NotificationsScreen() {
  const [name, setName] = React.useState('');
  const [toggles, setToggles] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of SECTIONS) {
      for (const item of section.items) {
        initial[item.id] = item.enabled;
      }
    }
    return initial;
  });

  function handleToggle(id: string, next: boolean) {
    setToggles((prev) => ({ ...prev, [id]: next }));
  }

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Notifications', headerShown: true }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-4 py-4">
        <NotificationsNameCard value={name} onChangeText={setName} />
        <View className="gap-4">
          {SECTIONS.map((section) => (
            <View key={section.title} className="gap-2">
              <NotificationsSectionHeader title={section.title} />
              <View className="gap-3">
                {section.items.map((item) => (
                  <NotificationsToggleRow
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    value={toggles[item.id]}
                    onToggle={(next) => handleToggle(item.id, next)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
