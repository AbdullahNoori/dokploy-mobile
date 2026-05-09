import { useCallback } from 'react';
import { Stack } from 'expo-router';

import { useHaptics } from '@/hooks/use-haptics';
import type { ProjectAllEnvironment } from '@/types/projects';

type Props = {
  environments: ProjectAllEnvironment[];
  activeEnvironmentId: string | null;
  activeEnvironmentName?: string | null;
  onSelectEnvironment: (environmentId: string) => void;
};

const MENU_ACCESSIBILITY_LABEL = 'Environments';
const MENU_TRIGGER_ICON = 'chevron.down';

export function ProjectEnvironmentMenu({
  environments,
  activeEnvironmentId,
  activeEnvironmentName,
  onSelectEnvironment,
}: Props) {
  const { selection } = useHaptics();

  const handleSelectEnvironment = useCallback(
    async (environmentId: string) => {
      if (environmentId === activeEnvironmentId) {
        return;
      }

      await selection();
      onSelectEnvironment(environmentId);
    },
    [activeEnvironmentId, onSelectEnvironment, selection]
  );

  if (process.env.EXPO_OS !== 'ios' || environments.length <= 1) {
    return null;
  }

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu accessibilityLabel={MENU_ACCESSIBILITY_LABEL}>
        <Stack.Toolbar.Icon sf={MENU_TRIGGER_ICON} />
        {environments.map((environment) => {
          const isActive = environment.environmentId === activeEnvironmentId;

          return (
            <Stack.Toolbar.MenuAction
              key={environment.environmentId}
              icon="square.stack.3d.up"
              isOn={isActive}
              onPress={() => {
                void handleSelectEnvironment(environment.environmentId);
              }}>
              {environment.name}
            </Stack.Toolbar.MenuAction>
          );
        })}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
