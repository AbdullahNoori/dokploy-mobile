import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useAuthStore } from '@/store/auth-store';
import { Link, Stack } from 'expo-router';
import {
  BellIcon,
  ChevronRightIcon,
  GlobeIcon,
  LogOutIcon,
  MoonStarIcon,
  ShieldIcon,
  SunIcon,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { toast } from 'sonner-native';
import { Uniwind, useUniwind } from 'uniwind';

const THEME_META = {
  light: {
    description: 'Use the light appearance across the app.',
    icon: SunIcon,
    label: 'Light',
  },
  dark: {
    description: 'Use the dark appearance across the app.',
    icon: MoonStarIcon,
    label: 'Dark',
  },
};

type SettingsLinkRowProps = {
  href: '/(app)/notifications' | '/(app)/requests' | '/(app)/web-servers';
  icon: typeof BellIcon;
  label: string;
};

function SettingsSectionLabel({ label }: { label: string }) {
  return (
    <Text variant="muted" className="px-1 text-xs font-medium">
      {label}
    </Text>
  );
}

function SettingsLinkRow({ href, icon, label }: SettingsLinkRowProps) {
  return (
    <Link href={href} asChild>
      <Pressable className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Icon as={icon} className="size-5" />
          <Text className="font-semibold">{label}</Text>
        </View>
        <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
      </Pressable>
    </Link>
  );
}

export default function SettingsScreen() {
  const { theme } = useUniwind();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const isDarkMode = resolvedTheme === 'dark';
  const themeMeta = THEME_META[resolvedTheme];

  function handleThemeChange(nextChecked: boolean) {
    Uniwind.setTheme(nextChecked ? 'dark' : 'light');
  }

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      toast.error('Unable to log out right now.');
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout]);

  const confirmLogout = useCallback(() => {
    if (isLoggingOut) {
      return;
    }

    Alert.alert('Logout', 'Remove your saved connection and sign out of Dokploy on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void handleLogout();
        },
      },
    ]);
  }, [handleLogout, isLoggingOut]);

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'top', 'right']}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 pb-8 pt-4">
        <View className="gap-6">
          <View className="gap-2">
            <SettingsSectionLabel label="Operations" />
            <SettingsLinkRow href="/(app)/web-servers" icon={GlobeIcon} label="Web Servers" />
            <SettingsLinkRow href="/(app)/requests" icon={ShieldIcon} label="Requests" />
          </View>

          <View className="gap-2">
            <SettingsSectionLabel label="Preferences" />
            <Pressable
              onPress={() => handleThemeChange(!isDarkMode)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isDarkMode }}
              className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
              <View className="flex-1 flex-row items-center gap-3 pr-4">
                <Icon as={themeMeta.icon} className="size-5" />
                <Text className="font-semibold">Dark Mode</Text>
              </View>
              <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
            </Pressable>
            <SettingsLinkRow href="/(app)/notifications" icon={BellIcon} label="Notifications" />
          </View>

          <View className="gap-2 pt-2">
            <SettingsSectionLabel label="Account" />
            <Pressable
              onPress={confirmLogout}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
