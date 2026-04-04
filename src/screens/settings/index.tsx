import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';

import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { ActivityIcon, BellIcon, ChevronRightIcon, ShieldIcon } from 'lucide-react-native';

import { readSettingsStats } from '@/api/settings';
import { HttpError } from '@/lib/http-error';

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    return error.message ?? fallback;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
  }

  return fallback;
};

export default function SettingsScreen() {
  const [isReadingStats, setIsReadingStats] = useState(false);

  const handleReadStats = async () => {
    if (isReadingStats) {
      return;
    }

    setIsReadingStats(true);

    try {
      const response = await readSettingsStats();
      console.log('settings.readStatsLogs response', JSON.stringify(response, null, 2));
      toast.success('Settings stats fetched.');
    } catch (error) {
      console.error('Unable to fetch settings stats', error);
      toast.error(resolveErrorMessage(error, 'Unable to fetch settings stats.'));
    } finally {
      setIsReadingStats(false);
    }
  };

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Settings', headerShown: true, headerTransparent: false }} />
      <View className="flex-1 px-4 pt-0">
        <View className="mt-4 gap-2">
          <Link href="/(app)/requests" asChild>
            <Pressable className="bg-card border-border/80 flex-row items-center justify-between rounded-lg border px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Icon as={ShieldIcon} className="size-5" />
                <Text className="font-semibold">Requests</Text>
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
      </View>
    </SafeAreaView>
  );
}
