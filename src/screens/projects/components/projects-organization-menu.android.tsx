import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Icon as ComposeIcon,
  IconButton,
  Text as ComposeText,
} from '@expo/ui/jetpack-compose';
import { Stack } from 'expo-router';
import { toast } from 'sonner-native';

import { useHaptics } from '@/hooks/use-haptics';
import { useAndroidComposeColors } from '@/lib/android-compose-colors';
import { useAuthStore } from '@/store/auth-store';

const MENU_ACCESSIBILITY_LABEL = 'Organizations';
const HEADER_MENU_SIZE = 48;

const MORE_ICON = require('../../../assets/android-icons/more-vert.xml');
const CHECK_ICON = require('../../../assets/android-icons/check.xml');
const BUSINESS_ICON = require('../../../assets/android-icons/business.xml');
const HOURGLASS_ICON = require('../../../assets/android-icons/hourglass-empty.xml');

type Props = {
  switchingOrganizationId: string | null;
  onSwitchingOrganizationIdChange: (organizationId: string | null) => void;
};

export function ProjectsOrganizationMenu({
  switchingOrganizationId,
  onSwitchingOrganizationIdChange,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = useAndroidComposeColors();
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganizationId = useAuthStore((state) => state.activeOrganizationId);
  const switchOrganization = useAuthStore((state) => state.switchOrganization);
  const { notifyError, notifySuccess, selection } = useHaptics();

  const handleSwitchOrganization = useCallback(
    async (organizationId: string, organizationName: string) => {
      setIsExpanded(false);

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

  const headerRight = useMemo(() => {
    if (organizations.length === 0) {
      return undefined;
    }

    return () => (
      <View className="h-12 w-12 items-end justify-center">
        <Host colorScheme={colors.resolvedTheme} matchContents style={styles.host}>
          <DropdownMenu
            expanded={isExpanded}
            onDismissRequest={() => setIsExpanded(false)}
            color={colors.popover}
            style={styles.host}>
            <DropdownMenu.Trigger>
              <IconButton
                onClick={() => {
                  if (!switchingOrganizationId) {
                    setIsExpanded((value) => !value);
                  }
                }}
                enabled={!switchingOrganizationId}
                colors={{ contentColor: colors.foreground }}>
                <ComposeIcon
                  source={MORE_ICON}
                  size={24}
                  tint={colors.foreground}
                  contentDescription={MENU_ACCESSIBILITY_LABEL}
                />
              </IconButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Items>
              {organizations.map((organization) => {
                const isActive = organization.id === activeOrganizationId;
                const isSwitching = organization.id === switchingOrganizationId;

                return (
                  <DropdownMenuItem
                    key={organization.id}
                    enabled={!isActive && !switchingOrganizationId}
                    onClick={() => {
                      void handleSwitchOrganization(organization.id, organization.name);
                    }}
                    elementColors={{
                      textColor: colors.foreground,
                      disabledTextColor: isActive ? colors.foreground : colors.mutedForeground,
                    }}>
                    <DropdownMenuItem.LeadingIcon>
                      <ComposeIcon
                        source={isSwitching ? HOURGLASS_ICON : BUSINESS_ICON}
                        size={20}
                        tint={isActive ? colors.primary : colors.mutedForeground}
                        contentDescription=""
                      />
                    </DropdownMenuItem.LeadingIcon>
                    <DropdownMenuItem.Text>
                      <ComposeText
                        color={colors.foreground}
                        maxLines={1}
                        overflow="ellipsis"
                        style={{ typography: 'bodyLarge' }}>
                        {organization.name}
                      </ComposeText>
                    </DropdownMenuItem.Text>
                    {isActive ? (
                      <DropdownMenuItem.TrailingIcon>
                        <ComposeIcon
                          source={CHECK_ICON}
                          size={20}
                          tint={colors.primary}
                          contentDescription="Current organization"
                        />
                      </DropdownMenuItem.TrailingIcon>
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenu.Items>
          </DropdownMenu>
        </Host>
      </View>
    );
  }, [
    activeOrganizationId,
    colors.foreground,
    colors.mutedForeground,
    colors.popover,
    colors.primary,
    colors.resolvedTheme,
    handleSwitchOrganization,
    isExpanded,
    organizations,
    switchingOrganizationId,
  ]);

  if (organizations.length === 0) {
    return null;
  }

  return <Stack.Screen options={{ headerRight }} />;
}

const styles = StyleSheet.create({
  host: {
    height: HEADER_MENU_SIZE,
    width: HEADER_MENU_SIZE,
  },
});
