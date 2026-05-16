import { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';

import { Stack, useRouter } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { toast } from 'sonner-native';
import { Uniwind, useUniwind } from 'uniwind';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useHaptics } from '@/hooks/use-haptics';
import { useAuthStore } from '@/store/auth-store';

import { AboutSection } from './components/about-section';
import { AccountSection } from './components/account-section';
import { OperationsSection } from './components/operations-section';
import { OrganizationsSection } from './components/organizations-section';
import { PreferencesSection } from './components/preferences-section';

const THEME_ICON = {
  dark: MoonStarIcon,
  light: SunIcon,
};

const SCREEN_EDGES = Platform.select({
  android: ['left', 'right'] as const,
  default: ['left', 'top', 'right'] as const,
});

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useUniwind();
  const logout = useAuthStore((state) => state.logout);
  const organizations = useAuthStore((state) => state.organizations);
  const activeOrganization = useAuthStore((state) => state.activeOrganization);
  const hasOwnerAccess = useAuthStore((state) => state.hasOwnerAccess);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const isDarkMode = resolvedTheme === 'dark';
  const { notifyError, notifySuccess, notifyWarning, selection } = useHaptics();

  const handleThemeChange = useCallback(
    (nextChecked: boolean) => {
      void selection();
      Uniwind.setTheme(nextChecked ? 'dark' : 'light');
    },
    [selection]
  );

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
  }, [handleLogout, isLoggingOut, notifyWarning]);

  return (
    <SafeAreaView className="bg-background flex-1" edges={SCREEN_EDGES}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerTransparent: Platform.OS === 'ios',
          headerShadowVisible: false,
          headerStyle: Platform.select({
            ios: { backgroundColor: 'transparent' },
            default: undefined,
          }),
        }}
      />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="px-4 pb-8 pt-4">
        <View className="gap-6">
          <OrganizationsSection
            organizationCount={organizations.length}
            activeOrganizationName={activeOrganization?.name}
            onPress={handleOpenOrganizations}
          />
          <OperationsSection hasOwnerAccess={hasOwnerAccess} />
          <PreferencesSection
            hasOwnerAccess={hasOwnerAccess}
            isDarkMode={isDarkMode}
            themeIcon={THEME_ICON[resolvedTheme]}
            onThemeChange={handleThemeChange}
          />
          <AboutSection />
          <AccountSection
            isLoggingOut={isLoggingOut}
            resolvedTheme={resolvedTheme}
            onPressLogout={confirmLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
