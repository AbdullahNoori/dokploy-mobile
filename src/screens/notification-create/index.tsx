import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { useNotificationCreateScreen } from '@/hooks/use-notification-create-screen';

import { NotificationsNameCard } from '../notifications/components/notifications-name-card';
import { NotificationsSectionHeader } from '../notifications/components/notifications-section-header';
import { NotificationsToggleRow } from '../notifications/components/notifications-toggle-row';

export default function NotificationCreateScreen() {
  const insets = useSafeAreaInsets();
  const {
    canSubmit,
    errorMessage,
    handleNameChange,
    handleSubmit,
    hasPushToken,
    isSubmitting,
    name,
    nameError,
    sections,
    toggles,
    toggleItem,
  } = useNotificationCreateScreen();

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Add Notification', headerShown: true }} />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-6 px-4 pt-6"
          contentContainerStyle={{ paddingBottom: 70 + insets.bottom }}
          scrollIndicatorInsets={{ bottom: 96 + insets.bottom }}
          showsVerticalScrollIndicator={false}>
          <NotificationsNameCard
            value={name}
            onChangeText={handleNameChange}
            errorMessage={nameError}
          />

          {!hasPushToken ? (
            <View className="bg-secondary border-border/80 gap-2 rounded-lg border p-4">
              <Text className="text-sm font-semibold">Push token unavailable</Text>
              <Text variant="muted" className="text-sm leading-5">
                Enable push notifications on this device before creating a custom notification.
              </Text>
            </View>
          ) : null}

          {errorMessage && !nameError ? (
            <View className="bg-destructive/10 border-destructive/20 gap-2 rounded-lg border p-4">
              <Text className="text-destructive text-sm font-semibold">Unable to create</Text>
              <Text className="text-destructive/90 text-sm leading-5">{errorMessage}</Text>
            </View>
          ) : null}

          <View className="gap-6">
            {sections.map((section) => {
              const enabledInSection = section.items.filter((item) => toggles[item.id]).length;

              return (
                <View key={section.title} className="gap-3">
                  <NotificationsSectionHeader
                    title={section.title}
                    detail={`${enabledInSection}/${section.items.length}`}
                  />
                  <View className="gap-3">
                    {section.items.map((item) => (
                      <NotificationsToggleRow
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        value={toggles[item.id]}
                        onToggle={(next) => toggleItem(item.id, next)}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View
          className="bg-background border-border/60 shrink-0 border-t px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <Button disabled={!canSubmit} onPress={handleSubmit} className="h-12 rounded-md">
            <Text>{isSubmitting ? 'Creating notification...' : 'Create notification'}</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
