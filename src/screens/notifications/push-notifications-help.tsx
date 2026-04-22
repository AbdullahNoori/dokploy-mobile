import { type ReactNode, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';

const PUSH_NOTIFICATION_STEPS = [
  'Add a notification provider for this device.',
  'Choose the events you want to receive.',
  'Dokploy will send matching alerts as push notifications.',
];

function PushNotificationStep({
  index,
  isLast,
  children,
}: {
  index: number;
  isLast: boolean;
  children: ReactNode;
}) {
  return (
    <View className="flex-row gap-4">
      <View className="items-center">
        <View className="border-border bg-background h-7 w-7 items-center justify-center rounded-full border">
          <Text className="text-muted-foreground text-xs font-semibold">{index}</Text>
        </View>
        {!isLast ? <View className="bg-border/70 mt-2 w-px flex-1" /> : null}
      </View>
      <Text className="flex-1 pt-0.5 pb-6 text-base leading-6">{children}</Text>
    </View>
  );
}

function NotificationsLink({ onPress }: { onPress: () => void }) {
  return (
    <Text
      accessibilityRole="link"
      onPress={onPress}
      className="text-primary text-base leading-6 font-semibold">
      Notifications
    </Text>
  );
}

export default function PushNotificationsHelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openNotificationsSetup = useCallback(() => {
    router.dismissTo('/(app)/notifications');
    requestAnimationFrame(() => {
      router.push('/(app)/modals/notification-new');
    });
  }, [router]);

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Push Notifications', headerShown: true }} />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 88 + insets.bottom }}
          scrollIndicatorInsets={{ bottom: 88 + insets.bottom }}
          showsVerticalScrollIndicator={false}>
          <View className="gap-7">
            <Text variant="muted" className="max-w-[340px] text-base leading-6">
              Allowing notifications lets this device receive alerts. To start receiving them, open{' '}
              <NotificationsLink onPress={openNotificationsSetup} /> and add a notification
              provider.
            </Text>

            <View>
              <PushNotificationStep index={1} isLast={false}>
                Open <NotificationsLink onPress={openNotificationsSetup} /> from Settings.
              </PushNotificationStep>
              {PUSH_NOTIFICATION_STEPS.map((step, index) => (
                <PushNotificationStep
                  key={step}
                  index={index + 2}
                  isLast={index === PUSH_NOTIFICATION_STEPS.length - 1}>
                  {step}
                </PushNotificationStep>
              ))}
            </View>

            <View className="border-border/70 gap-2 border-t pt-5">
              <Text className="text-sm font-semibold">Note</Text>
              <Text variant="muted" className="text-sm leading-5">
                Notification providers are tied to this device session. After you log out, the FCM
                token is cleared, so you must add a new provider after signing in again.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          className="bg-background border-border/60 shrink-0 border-t px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <Button className="h-12 rounded-xl" onPress={() => router.back()}>
            <Text>Got it</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
