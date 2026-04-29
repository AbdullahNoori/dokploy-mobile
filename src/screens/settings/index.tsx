import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useHaptics } from '@/hooks/use-haptics';
import { THEME } from '@/lib/theme';
import { useAuthStore } from '@/store/auth-store';
import { Link, Stack, useRouter } from 'expo-router';
import {
  BellIcon,
  Building2Icon,
  ChevronRightIcon,
  ExternalLinkIcon,
  GlobeIcon,
  GithubIcon,
  LinkedinIcon,
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

type SettingsSocialLinkProps = {
  icon: typeof GithubIcon;
  label: string;
  url: string;
};

const PERSONAL_LINKS = [
  {
    icon: GithubIcon,
    label: 'Open Abdullah on GitHub',
    url: 'https://github.com/AbdullahNoori/',
  },
  {
    icon: LinkedinIcon,
    label: 'Open Abdullah on LinkedIn',
    url: 'https://www.linkedin.com/in/abdullah-noori-b8aa38354/',
  },
  {
    icon: ExternalLinkIcon,
    label: "Open Abdullah's website",
    url: 'https://abdullahnoori.vercel.app',
  },
] satisfies SettingsSocialLinkProps[];

function SettingsSectionLabel({ label }: { label: string }) {
  return (
    <Text variant="muted" className="px-1 text-xs font-medium">
      {label}
    </Text>
  );
}

function SettingsLinkRow({ href, icon, label }: SettingsLinkRowProps) {
  const { impact } = useHaptics();

  return (
    <Link href={href} asChild>
      <Pressable
        onPressIn={() => {
          void impact();
        }}
        className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Icon as={icon} className="size-5" />
          <Text className="font-semibold">{label}</Text>
        </View>
        <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
      </Pressable>
    </Link>
  );
}

function SettingsSocialLink({ icon, label, url }: SettingsSocialLinkProps) {
  const { impact, notifyError } = useHaptics();

  const openLink = useCallback(async () => {
    await impact();

    try {
      await Linking.openURL(url);
    } catch {
      await notifyError();
      toast.error('Unable to open that link right now.');
    }
  }, [impact, notifyError, url]);

  return (
    <Pressable
      onPress={openLink}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      className="active:bg-accent size-11 items-center justify-center rounded-lg">
      <Icon as={icon} className="text-muted-foreground size-4" />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const logout = useAuthStore((state) => state.logout);
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganization = useAuthStore((state) => state.activeOrganization);
  const hasOwnerAccess = useAuthStore((state) => state.hasOwnerAccess);
  const ownerAccessStatus = useAuthStore((state) => state.ownerAccessStatus);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const isDarkMode = resolvedTheme === 'dark';
  const themeMeta = THEME_META[resolvedTheme];
  const { notifyError, notifySuccess, notifyWarning, selection } = useHaptics();

  function handleThemeChange(nextChecked: boolean) {
    void selection();
    Uniwind.setTheme(nextChecked ? 'dark' : 'light');
  }

  const handleOpenOrganizations = useCallback(() => {
    void selection();
    router.push('/(app)/organizations');
  }, [router, selection]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
      await notifySuccess();
    } catch {
      await notifyError();
      toast.error('Unable to log out right now.');
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout, notifyError, notifySuccess]);

  const confirmLogout = useCallback(() => {
    if (isLoggingOut) {
      return;
    }

    void notifyWarning();
    Alert.alert(
      'Logout',
      'Remove all saved organizations and sign out of Dokploy on this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            void handleLogout();
          },
        },
      ]
    );
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
            <SettingsSectionLabel label="Organizations" />
            <Pressable
              onPress={handleOpenOrganizations}
              accessibilityRole="button"
              className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-3 pr-4">
                <Icon as={Building2Icon} className="size-5" />
                <View className="min-w-0 flex-1">
                  <Text className="font-semibold">
                    {organizations.length} saved organization{organizations.length === 1 ? '' : 's'}
                  </Text>
                  {activeOrganization ? (
                    <Text variant="muted" className="mt-0.5" numberOfLines={1}>
                      Active: {activeOrganization.name}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
            </Pressable>
          </View>

          <View className="gap-2">
            <SettingsSectionLabel label="Operations" />
            {hasOwnerAccess ? (
              <SettingsLinkRow href="/(app)/web-servers" icon={GlobeIcon} label="Web Servers" />
            ) : null}
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
            {hasOwnerAccess ? (
              <SettingsLinkRow href="/(app)/notifications" icon={BellIcon} label="Notifications" />
            ) : null}
          </View>

          <View className="gap-2 pt-2">
            <SettingsSectionLabel label="About" />
            <View className="flex-row items-center justify-between gap-3 px-1 py-1">
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-medium">Built by Abdullah Noori</Text>
                <Text variant="muted" className="mt-0.5">
                  Dokploy mobile app
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                {PERSONAL_LINKS.map((link) => (
                  <SettingsSocialLink
                    key={link.label}
                    icon={link.icon}
                    label={link.label}
                    url={link.url}
                  />
                ))}
              </View>
            </View>
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
