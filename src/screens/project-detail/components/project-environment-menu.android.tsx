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

import { useHaptics } from '@/hooks/use-haptics';
import { useAndroidComposeColors } from '@/lib/android-compose-colors';
import type { ProjectAllEnvironment } from '@/types/projects';

const MENU_ACCESSIBILITY_LABEL = 'Environments';
const HEADER_MENU_SIZE = 48;

const EXPAND_ICON = require('../../../assets/android-icons/expand-more.xml');
const CHECK_ICON = require('../../../assets/android-icons/check.xml');

type Props = {
  environments: ProjectAllEnvironment[];
  activeEnvironmentId: string | null;
  activeEnvironmentName?: string | null;
  onSelectEnvironment: (environmentId: string) => void;
};

export function ProjectEnvironmentMenu({
  environments,
  activeEnvironmentId,
  activeEnvironmentName,
  onSelectEnvironment,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selection } = useHaptics();
  const colors = useAndroidComposeColors();

  const handleSelectEnvironment = useCallback(
    async (environmentId: string) => {
      setIsExpanded(false);

      if (environmentId === activeEnvironmentId) {
        return;
      }

      await selection();
      onSelectEnvironment(environmentId);
    },
    [activeEnvironmentId, onSelectEnvironment, selection]
  );

  const headerRight = useMemo(() => {
    if (environments.length <= 1) {
      return undefined;
    }

    return () => (
      <View className="h-12 w-12 justify-center">
        <Host colorScheme={colors.resolvedTheme} matchContents style={styles.host}>
          <DropdownMenu
            expanded={isExpanded}
            onDismissRequest={() => setIsExpanded(false)}
            color={colors.popover}
            style={styles.host}>
            <DropdownMenu.Trigger>
              <IconButton
                onClick={() => setIsExpanded((value) => !value)}
                colors={{ contentColor: colors.foreground }}>
                <ComposeIcon
                  source={EXPAND_ICON}
                  size={24}
                  tint={colors.foreground}
                  contentDescription={
                    activeEnvironmentName
                      ? `Select environment, current ${activeEnvironmentName}`
                      : MENU_ACCESSIBILITY_LABEL
                  }
                />
              </IconButton>
            </DropdownMenu.Trigger>

            <DropdownMenu.Items>
              {environments.map((environment) => {
                const isActive = environment.environmentId === activeEnvironmentId;

                return (
                  <DropdownMenuItem
                    key={environment.environmentId}
                    enabled={!isActive}
                    onClick={() => {
                      void handleSelectEnvironment(environment.environmentId);
                    }}
                    elementColors={{
                      textColor: colors.foreground,
                      disabledTextColor: colors.foreground,
                    }}>
                    <DropdownMenuItem.Text>
                      <ComposeText
                        color={colors.foreground}
                        maxLines={1}
                        overflow="ellipsis"
                        style={{ typography: 'bodyLarge' }}>
                        {environment.name}
                      </ComposeText>
                    </DropdownMenuItem.Text>
                    {isActive ? (
                      <DropdownMenuItem.TrailingIcon>
                        <ComposeIcon
                          source={CHECK_ICON}
                          size={20}
                          tint={colors.primary}
                          contentDescription="Current environment"
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
    activeEnvironmentId,
    activeEnvironmentName,
    colors.foreground,
    colors.popover,
    colors.primary,
    colors.resolvedTheme,
    environments,
    handleSelectEnvironment,
    isExpanded,
  ]);

  if (environments.length <= 1) {
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
