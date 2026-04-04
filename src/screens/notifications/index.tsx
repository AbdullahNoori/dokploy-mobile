import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';

import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useNotificationsScreen } from '@/hooks/use-notifications-screen';

import { NotificationsNameCard } from './components/notifications-name-card';
import { NotificationsSectionHeader } from './components/notifications-section-header';
import { NotificationsToggleRow } from './components/notifications-toggle-row';

export default function NotificationsScreen() {
  const { name, setName, sections, toggles, toggleItem } = useNotificationsScreen();

  return (
    <SafeAreaView className="bg-background flex-1" edges={['left', 'right']}>
      <Stack.Screen options={{ title: 'Notifications', headerShown: true }} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-4 py-4">
        <NotificationsNameCard value={name} onChangeText={setName} />
        <View className="gap-4">
          {sections.map((section) => (
            <View key={section.title} className="gap-2">
              <NotificationsSectionHeader title={section.title} />
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
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
