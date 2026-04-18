import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { BellIcon, ChevronRightIcon, GlobeIcon, MoonStarIcon, ShieldIcon, SunIcon } from 'lucide-react-native';
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

export default function SettingsScreen() {
  const { theme } = useUniwind();
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const isDarkMode = resolvedTheme === 'dark';
  const themeMeta = THEME_META[resolvedTheme];

  function handleThemeChange(nextChecked: boolean) {
    Uniwind.setTheme(nextChecked ? 'dark' : 'light');
  }

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
        <View className="gap-2">
          <Pressable
            onPress={() => handleThemeChange(!isDarkMode)}
            accessibilityRole="switch"
            accessibilityState={{ checked: isDarkMode }}
            className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
            <View className="flex-1 flex-row items-center gap-3 pr-4">
              <Icon as={themeMeta.icon} className="size-5" />
              <View className="flex-1">
                <Text className="font-semibold">Dark Mode</Text>
                <Text variant="muted" className="text-sm">
                  {themeMeta.description}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <Text variant="muted" className="text-sm">
                {themeMeta.label}
              </Text>
              <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
            </View>
          </Pressable>
          <Link href="/(app)/requests" asChild>
            <Pressable className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Icon as={ShieldIcon} className="size-5" />
                <Text className="font-semibold">Requests</Text>
              </View>
              <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
            </Pressable>
          </Link>
          <Link href="/(app)/web-servers" asChild>
            <Pressable className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Icon as={GlobeIcon} className="size-5" />
                <Text className="font-semibold">Web Servers</Text>
              </View>
              <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
            </Pressable>
          </Link>
          <Link href="/(app)/notifications" asChild>
            <Pressable className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Icon as={BellIcon} className="size-5" />
                <Text className="font-semibold">Notifications</Text>
              </View>
              <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
