import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { BellIcon, ChevronRightIcon } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
      <View className="flex-1 px-4 pt-4">
        <View className="mt-4 gap-2">
          <Link href="/(app)/(settings)/notifications" asChild>
            <Pressable className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Icon as={BellIcon} className="size-5" />
                <Text className="font-semibold">Notifications</Text>
              </View>
              <Icon as={ChevronRightIcon} className="text-muted-foreground size-5" />
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
