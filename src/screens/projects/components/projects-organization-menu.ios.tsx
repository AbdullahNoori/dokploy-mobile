import { useCallback, useState } from 'react';
import { Button as MenuButton, Host, Menu } from '@expo/ui/swift-ui';
import { contentShape, frame, labelStyle, shapes } from '@expo/ui/swift-ui/modifiers';
import { toast } from 'sonner-native';

import { useHaptics } from '@/hooks/use-haptics';
import { useAuthStore } from '@/store/auth-store';

const HEADER_MENU_SIZE = 30;
const MENU_ACCESSIBILITY_LABEL = 'Organizations';

const menuTriggerModifiers = [
  labelStyle('iconOnly'),
  frame({ width: HEADER_MENU_SIZE, height: HEADER_MENU_SIZE, alignment: 'center' }),
  contentShape(shapes.rectangle()),
];

function getOrganizationIcon(isActive: boolean, isSwitching: boolean) {
  if (isSwitching) return 'hourglass';
  if (isActive) return 'checkmark';
  return 'building.2';
}

export function ProjectsOrganizationMenu() {
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const switchOrganization = useAuthStore((state) => state.switchOrganization);
  const { notifyError, notifySuccess, selection } = useHaptics();
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);

  const handleSwitchOrganization = useCallback(
    async (organizationId: string, organizationName: string) => {
      if (organizationId === activeOrganizationId || switchingOrganizationId) {
        return;
      }

      await selection();
      setSwitchingOrganizationId(organizationId);

      try {
        await switchOrganization(organizationId);
        await notifySuccess();
        toast.success(`Switched to ${organizationName}.`);
      } catch {
        await notifyError();
        toast.error('Unable to switch organization. Try again.');
      } finally {
        setSwitchingOrganizationId(null);
      }
    },
    [
      activeOrganizationId,
      notifyError,
      notifySuccess,
      selection,
      switchOrganization,
      switchingOrganizationId,
    ]
  );

  if (process.env.EXPO_OS !== 'ios' || organizations.length === 0) {
    return null;
  }

  return (
    <Host matchContents style={{ width: HEADER_MENU_SIZE, height: HEADER_MENU_SIZE }}>
      <Menu
        label={MENU_ACCESSIBILITY_LABEL}
        systemImage="ellipsis"
        modifiers={menuTriggerModifiers}>
        {organizations.map((organization) => {
          const isActive = organization.id === activeOrganizationId;
          const isSwitching = organization.id === switchingOrganizationId;

          return (
            <MenuButton
              key={organization.id}
              label={organization.name}
              systemImage={getOrganizationIcon(isActive, isSwitching)}
              onPress={() => {
                void handleSwitchOrganization(organization.id, organization.name);
              }}
            />
          );
        })}
      </Menu>
    </Host>
  );
}
