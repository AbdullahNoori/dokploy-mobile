import { useCallback } from 'react';
import { Stack } from 'expo-router';
import { toast } from 'sonner-native';

import { useHaptics } from '@/hooks/use-haptics';
import { useAuthStore } from '@/store/auth-store';

const MENU_ACCESSIBILITY_LABEL = 'Organizations';
const MENU_TRIGGER_ICON = 'ellipsis';

type Props = {
  switchingOrganizationId: string | null;
  onSwitchingOrganizationIdChange: (organizationId: string | null) => void;
};

function getOrganizationIcon(isActive: boolean, isSwitching: boolean) {
  if (isSwitching) return 'hourglass';
  return 'building.2';
}

export function ProjectsOrganizationMenu({
  switchingOrganizationId,
  onSwitchingOrganizationIdChange,
}: Props) {
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const switchOrganization = useAuthStore((state) => state.switchOrganization);
  const { notifyError, notifySuccess, selection } = useHaptics();

  const handleSwitchOrganization = useCallback(
    async (organizationId: string, organizationName: string) => {
      if (organizationId === activeOrganizationId || switchingOrganizationId) {
        return;
      }

      await selection();
      onSwitchingOrganizationIdChange(organizationId);

      try {
        await switchOrganization(organizationId);
        await notifySuccess();
        toast.success(`Switched to ${organizationName}.`);
      } catch {
        await notifyError();
        toast.error('Unable to switch organization. Try again.');
      } finally {
        onSwitchingOrganizationIdChange(null);
      }
    },
    [
      activeOrganizationId,
      notifyError,
      notifySuccess,
      onSwitchingOrganizationIdChange,
      selection,
      switchOrganization,
      switchingOrganizationId,
    ]
  );

  if (process.env.EXPO_OS !== 'ios' || organizations.length === 0) {
    return null;
  }

  return (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Menu
        accessibilityLabel={MENU_ACCESSIBILITY_LABEL}
        title={MENU_ACCESSIBILITY_LABEL}>
        <Stack.Toolbar.Icon sf={MENU_TRIGGER_ICON} />
        {organizations.map((organization) => {
          const isActive = organization.id === activeOrganizationId;
          const isSwitching = organization.id === switchingOrganizationId;

          return (
            <Stack.Toolbar.MenuAction
              key={organization.id}
              icon={getOrganizationIcon(isActive, isSwitching)}
              isOn={isActive}
              onPress={() => {
                void handleSwitchOrganization(organization.id, organization.name);
              }}>
              {organization.name}
            </Stack.Toolbar.MenuAction>
          );
        })}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
