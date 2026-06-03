import { ActivityIndicator, Pressable, View } from 'react-native';

import { ChevronRightIcon, LogOutIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

import { SettingsSectionLabel } from './settings-section-label';

type AccountSectionProps = {
  isLoggingOut: boolean;
  onPressLogout: () => void;
  resolvedTheme: 'dark' | 'light';
};

export function AccountSection({
  isLoggingOut,
  onPressLogout,
  resolvedTheme,
}: AccountSectionProps) {
  return (
    <View className="gap-2 pt-2">
      <SettingsSectionLabel label="Account" />
      <Pressable
        onPress={onPressLogout}
        disabled={isLoggingOut}
        accessibilityRole="button"
        className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Icon as={LogOutIcon} className="text-destructive size-5" />
          <Text className="text-destructive font-semibold">Logout</Text>
        </View>
        {isLoggingOut ? (
          <ActivityIndicator size="small" color={THEME[resolvedTheme].destructive} />
        ) : (
          <Icon as={ChevronRightIcon} className="text-destructive size-5" />
        )}
      </Pressable>
    </View>
  );
}
