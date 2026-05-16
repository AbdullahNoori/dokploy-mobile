import { Pressable, View } from 'react-native';

import { BellIcon, type LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';

import { SettingsLinkRow } from './settings-link-row';
import { SettingsSectionLabel } from './settings-section-label';

type PreferencesSectionProps = {
  hasOwnerAccess: boolean;
  isDarkMode: boolean;
  onThemeChange: (nextChecked: boolean) => void;
  themeIcon: LucideIcon;
};

export function PreferencesSection({
  hasOwnerAccess,
  isDarkMode,
  onThemeChange,
  themeIcon,
}: PreferencesSectionProps) {
  return (
    <View className="gap-2">
      <SettingsSectionLabel label="Preferences" />
      <Pressable
        onPress={() => onThemeChange(!isDarkMode)}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDarkMode }}
        className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
        <View className="flex-1 flex-row items-center gap-3 pr-4">
          <Icon as={themeIcon} className="size-5" />
          <Text className="font-semibold">Dark Mode</Text>
        </View>
        <Switch checked={isDarkMode} onCheckedChange={onThemeChange} />
      </Pressable>
      {hasOwnerAccess ? (
        <SettingsLinkRow href="/(app)/notifications" icon={BellIcon} label="Notifications" />
      ) : null}
    </View>
  );
}
