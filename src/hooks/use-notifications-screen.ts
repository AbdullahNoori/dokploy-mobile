import { useState } from 'react';

export type NotificationToggleId =
  | 'app-deploy'
  | 'build-error'
  | 'db-backup'
  | 'volume-backup'
  | 'docker-cleanup'
  | 'dokploy-restart';

export type NotificationToggleState = Record<NotificationToggleId, boolean>;

type NotificationToggle = {
  id: NotificationToggleId;
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

export function useNotificationsScreen() {
  const [name, setName] = useState('');
  const [toggles, setToggles] = useState<NotificationToggleState>(() => {
    const initial = {} as NotificationToggleState;

    for (const section of SECTIONS) {
      for (const item of section.items) {
        initial[item.id] = item.enabled;
      }
    }

    return initial;
  });

  const toggleItem = (id: NotificationToggleId, next: boolean) => {
    setToggles((current) => ({ ...current, [id]: next }));
  };

  return {
    name,
    setName,
    sections: SECTIONS,
    toggles,
    toggleItem,
  };
}
